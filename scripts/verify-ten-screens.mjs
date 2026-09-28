// Real local Java/DB + compiled H5/MP. Never sends writes to production.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const require = createRequire(import.meta.url);
const root = path.resolve('.');
const dir = path.join(root, 'docs/ten-screens-20260903');
const backend = 'http://127.0.0.1:19083';
const site = 'http://127.0.0.1:19084';
const report = { environment: { backend, site, productionWrites: false }, api: [], h5: [], mp: [], errors: [] };
await mkdir(dir, { recursive: true });
async function api(url, method = 'GET', data, token, admin = false) {
  const response = await fetch(backend + url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { [admin ? 'Authorization' : 'X-Mall-Session']: admin ? 'Bearer ' + token : token } : {}) }, body: data === undefined ? undefined : JSON.stringify(data) });
  return response.json();
}
function ok(r) { assert.equal(r.code, 200, r.msg); return r.data; }
let browser, mini, session, contactAdminToken, contactOriginal;
try {
  ok(await api('/mall/health'));
  const adminName = 'layout_' + randomBytes(5).toString('hex');
  const adminPassword = randomBytes(8).toString('hex');
  const hash = execFileSync('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe', ['-c', 'import sys,bcrypt; print(bcrypt.hashpw(sys.stdin.buffer.read(),bcrypt.gensalt()).decode())'], { input: adminPassword, encoding: 'utf8' }).trim();
  // Dedicated test admin, in the explicitly named isolated database only. No password resets.
  execFileSync('C:/Program Files/MySQL/MySQL Server 8.4/bin/mysql.exe', ['--no-defaults', '--host=127.0.0.1', '--port=3308', '--user=root', '--database=tea_integration_20260903', '--execute', `INSERT INTO sys_user(user_name,nick_name,password,status,del_flag,create_by,create_time) VALUES('${adminName}','layout test','${hash}','0','0','isolated-test',NOW()); SET @layout_user=LAST_INSERT_ID(); INSERT INTO sys_role(role_name,role_key,role_sort,status,del_flag) VALUES('${adminName}','${adminName}',100,'0','0'); SET @layout_role=LAST_INSERT_ID(); INSERT INTO sys_user_role(user_id,role_id) VALUES(@layout_user,@layout_role); INSERT INTO sys_role_menu(role_id,menu_id) SELECT @layout_role,menu_id FROM sys_menu WHERE perms IN ('mall:ticket:list','mall:ticket:edit');`], { stdio: ['ignore','ignore','pipe'] });
  const admin = await api('/login', 'POST', { username: adminName, password: adminPassword });
  if (admin.code === 200 && admin.token) {
    const original = ok(await api('/mall/admin/support/contact', 'GET', undefined, admin.token, true)).phone;
    try {
      assert.notEqual((await api('/mall/admin/support/contact', 'PUT', { phone: '010-12345678' })).code, 200);
      report.api.push({ name: '匿名写入客服电话被拒绝', status: 'PASS' });
      ok(await api('/mall/admin/support/contact', 'PUT', { phone: '010-12345678' }, admin.token, true));
      assert.equal(ok(await api('/mall/support/contact')).phone, '010-12345678');
      report.api.push({ name: '后台保存后商城公开接口读取数据库最新号码', status: 'PASS' });
      assert.notEqual((await api('/mall/admin/support/contact', 'PUT', { phone: 'tel:12345678' }, admin.token, true)).code, 200);
      assert.equal(ok(await api('/mall/support/contact')).phone, '010-12345678');
      ok(await api('/mall/admin/support/contact', 'PUT', { phone: '' }, admin.token, true));
      assert.equal(ok(await api('/mall/support/contact')).phone, '');
      report.api.push({ name: '非法号码拒绝且原值不变、清空真实保存', status: 'PASS' });
    } finally { ok(await api('/mall/admin/support/contact', 'PUT', { phone: original }, admin.token, true)); }
    contactAdminToken = admin.token; contactOriginal = original;
    ok(await api('/mall/admin/support/contact', 'PUT', { phone: '010-12345678' }, admin.token, true));
  } else report.api.push({ name: '后台联系电话 HTTP 闭环', status: 'BLOCKED', reason: admin.msg });
  const phone = '139' + Date.now().toString().slice(-8);
  const password = 'Layout' + randomBytes(8).toString('hex') + '!';
  ok(await api('/mall/session/sms/request', 'POST', { phone, purpose: 'REGISTER' }));
  const guest = 'layout_guest_' + randomBytes(20).toString('hex');
  const guestState = ok(await api('/mall/bootstrap', 'GET', undefined, guest));
  session = ok(await api('/mall/session/register', 'POST', { phone, password, code: process.env.CHAYE_LOCAL_SMS_CODE }, guestState.sessionToken || guest));
  assert.ok(session.authenticated && session.sessionToken);
  report.api.push({ name: '隔离库真实验证码注册并签发会话', status: 'PASS' });
  const token = session.sessionToken;
  const rewardId = session.rewards?.find(r => Number(r.stock) > 0)?.id;
  assert.ok(rewardId, '隔离库需要可用的真实积分奖品才能验证兑换详情');
  const targets = ['category', 'product-list', 'one-click-invite', 'invite-records', 'tea-science', 'partner-status', 'partner-apply', 'share', 'exchange-detail', 'settings'];
  const widths = process.env.CHAYE_VERIFY_MP_ONLY ? [] : [320, 360, 375, 390, 414, 430];
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: width === 320 ? 568 : 844 } });
    await page.addInitScript(token => {
      localStorage.setItem('teaMallSessionToken', JSON.stringify({ type: 'string', data: token }));
      localStorage.setItem('teaSession', JSON.stringify({ type: 'object', data: { authenticated: true } }));
    }, token);
    await page.route('**/api/mall/**', async route => {
      const r = route.request();
      const suffix = r.url().split('/api/mall')[1];
      const response = await fetch(backend + '/mall' + suffix, { method: r.method(), headers: r.headers(), body: ['GET','HEAD'].includes(r.method()) ? undefined : r.postDataBuffer() });
      await route.fulfill({ status: response.status, contentType: response.headers.get('content-type') || 'application/json', body: Buffer.from(await response.arrayBuffer()) });
    });
    page.on('pageerror', e => report.errors.push({ platform: 'H5', width, message: e.message }));
    for (const name of targets) {
      await page.goto(`${site}/#/pages/${name}/${name}${name === 'exchange-detail' ? '?id=' + rewardId : name === 'settings' ? '?panel=在线客服' : ''}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const actualRoute = new URL(page.url()).hash;
      assert.ok(actualRoute.includes(`/pages/${name}/`), 'Unexpected login redirect: ' + actualRoute);
      const measure = await page.evaluate(async () => {
        const shell = document.querySelector('.phone-shell');
        const scroll = shell?.querySelector('.shell-scroll-viewport');
        const inner = scroll ? [...scroll.querySelectorAll('.uni-scroll-view')].find(e => ['auto','scroll'].includes(getComputedStyle(e).overflowY)) : null;
        // Lazy images and platform scroll events can change the layout after the first frame.
        // Exercise scrolling until its content height is stable, then measure the actual end.
        if (inner) {
          let previous = -1, stable = 0;
          for (let attempt = 0; attempt < 20 && stable < 3; attempt++) {
            inner.scrollTop = inner.scrollHeight;
            await new Promise(r => setTimeout(r, 100));
            stable = inner.scrollHeight === previous ? stable + 1 : 0;
            previous = inner.scrollHeight;
          }
        }
        const rect = e => e ? { x: e.getBoundingClientRect().x, y: e.getBoundingClientRect().y, width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height, bottom: e.getBoundingClientRect().bottom } : null;
        return { shell: rect(shell), scroll: rect(scroll), nav: rect(shell?.querySelector('.bottom-nav')), tabs: rect(shell?.querySelector('.catalog-list-tabs')), scroller: inner ? { top: inner.scrollTop, height: inner.clientHeight, full: inner.scrollHeight, paddingBottom: getComputedStyle(scroll).paddingBottom } : null, categories: [...document.querySelectorAll('.science-tab')].map(e => e.textContent), horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      const failures = [];
      if (!measure.scroll || measure.scroll.height <= 0) failures.push('滚动区高度无效');
      if (!measure.scroller) failures.push('未定位到真实滚动容器');
      if (measure.horizontalOverflow) failures.push('水平溢出');
      if (measure.nav && measure.scroll && Math.abs(measure.nav.y - measure.scroll.bottom) > 2) failures.push('滚动区与底栏间隙或重叠');
      if (measure.tabs && measure.tabs.height > 80) failures.push('横向分类导航异常撑高');
      if (name === 'tea-science' && (!measure.categories.length || measure.categories.some(c => !c.trim()))) failures.push('科普分类文字缺失');
      if (measure.scroller && measure.scroller.full - measure.scroller.top - measure.scroller.height > 2) failures.push('无法滚到末尾');
      if (name === 'settings' && !(await page.locator('.support-phone-dial').innerText()).includes('010-12345678')) failures.push('客服弹窗未显示后台保存的电话');
      if (name === 'exchange-detail') {
        await page.evaluate(() => {
          let component = document.querySelector('.phone-shell')?.__vueParentComponent;
          while (component) {
            if (component.proxy && 'confirmOpen' in component.proxy) { component.proxy.confirmOpen = true; return; }
            component = component.parent;
          }
          throw new Error('Exchange Vue component not found');
        });
        await page.waitForTimeout(120);
        const dialog = await page.locator('.phase-confirm').boundingBox();
        if (dialog) {
          measure.confirmDialog = dialog;
          if (Math.abs(dialog.x - (width - dialog.x - dialog.width)) > 2) failures.push('确认兑换卡片左右偏移');
        } else failures.push('未能打开确认弹窗进行测量');
      }
      const result = { width, route: name, ...measure, failures, status: failures.length ? 'FAIL' : 'PASS' };
      report.h5.push(result);
      if (width === 390 || failures.length) await page.screenshot({ path: path.join(dir, `h5-${width}-${name}.png`) });
      console.log(`H5 ${width} ${name}: ${result.status} ${failures.join(',')}`);
    }
    await page.close();
  }
  await browser.close(); browser = null;
  const automator = require('../../_tools/mp-automation/node_modules/miniprogram-automator');
  mini = await automator.connect({ wsEndpoint: 'ws://127.0.0.1:' + (process.env.CHAYE_MP_AUTO_PORT || '19420') });
  mini.on('exception', e => report.errors.push({ platform: 'MP', message: String(e.message || e.description || 'runtime exception') }));
  await mini.evaluate((token) => {
    const app = getApp();
    app.__tenScreensPrevious = { token: wx.getStorageSync('teaMallSessionToken'), session: wx.getStorageSync('teaSession'), request: wx.request };
    app.__tenScreensNetwork = [];
    const original = wx.request;
    wx.request = function(options) {
      const url = options.url.replace('https://chaye.okam.top/api/mall', 'http://127.0.0.1:19083/mall');
      if (!url.startsWith('http://127.0.0.1:19083/mall')) throw new Error('拒绝测试访问非隔离API');
      const entry = { url, tokenLength: String(options.header?.['X-Mall-Session'] || '').length };
      app.__tenScreensNetwork.push(entry);
      const success = options.success, fail = options.fail;
      return original({ ...options, url, success: r => { entry.status = r.statusCode; entry.code = r.data?.code; entry.authenticated = r.data?.data?.authenticated; success && success(r); }, fail: e => { entry.error = e.errMsg; fail && fail(e); } });
    };
    wx.setStorageSync('teaMallSessionToken', token);
    wx.setStorageSync('teaSession', { authenticated: true });
  }, token);
  // Real DevTools app; only its transport is routed to the isolated Java server above.
  report.mpDevice = await mini.systemInfo();
  for (const name of targets) {
    const page = await mini.reLaunch(`/pages/${name}/${name}${name === 'exchange-detail' ? '?id=' + rewardId : name === 'settings' ? '?panel=在线客服' : ''}`);
    await page.waitFor(600);
    const current = await mini.currentPage();
    if (current.path !== `pages/${name}/${name}`) { report.mp.push({ route: name, status: 'FAIL', reason: '意外跳转', actual: current.path, requests: await mini.evaluate(() => getApp().__tenScreensNetwork) }); break; }
    const scroll = await page.$('.shell-scroll-viewport');
    const rect = async e => e ? { ...await e.offset(), ...await e.size() } : null;
    const dataCheck = await mini.evaluate(() => {
      const v = getCurrentPages().slice(-1)[0].$vm;
      return { products: v.products?.length || 0, categories: v.scienceCategories?.map(c => c.categoryName) || [], error: v.catalogError || '', selectedReward: v.selectedExchange?.id || null, qrCells: v.qrCells?.length || 0, supportPhone: v.$refs.supportPhone?.phone || '' };
    });
    // Query inside the real custom component. SDK descendant selectors can return the page root.
    const navRect = await mini.evaluate(() => new Promise(resolve => {
      const v = getCurrentPages().slice(-1)[0].$vm;
      const c = v.$children.find(child => child.$options.name === 'BottomNav');
      if (!c) return resolve(null);
      c.$scope.createSelectorQuery().select('.bottom-nav').boundingClientRect().exec(rows => resolve(rows[0]));
    }));
    const measure = { route: name, scroll: await rect(scroll), nav: navRect, dataCheck };
    if (scroll) { await scroll.scrollTo(0, 999999); await page.waitFor(150); measure.scrollHeight = await scroll.scrollHeight(); measure.scrollTop = await scroll.property('scrollTop'); }
    if (name === 'share') {
      measure.lastCard = await mini.evaluate(() => new Promise(resolve => {
        const c = getCurrentPages().slice(-1)[0].$vm.$children.find(child => child.$options.name === 'InvitationClub');
        if (!c) return resolve(null);
        c.$scope.createSelectorQuery().select('.invitation-club').boundingClientRect().exec(rows => resolve(rows[0]));
      }));
    }
    if (name === 'exchange-detail') {
      await mini.evaluate(() => { getCurrentPages().slice(-1)[0].$vm.confirmOpen = true; });
      await page.waitFor(200); measure.confirmDialog = await rect(await page.$('.phase-confirm'));
    }
    const failures = [];
    if (!dataCheck.products) failures.push('未加载到隔离后端的真实商品数据');
    if (name === 'tea-science' && (!dataCheck.categories.length || dataCheck.categories.some(c => !c))) failures.push('科普分类文字缺失');
    if (name === 'exchange-detail' && !dataCheck.selectedReward) failures.push('未加载真实奖品');
    if (name === 'share' && !dataCheck.qrCells) failures.push('分享页未生成真实邀请链接的二维码');
    if (name === 'settings' && dataCheck.supportPhone !== '010-12345678') failures.push('小程序客服未读取后台保存的电话');
    if (!measure.scroll || Number(measure.scroll.height) <= 0) failures.push('滚动区无有效高度');
    if (name === 'share' && (!measure.lastCard || measure.lastCard.bottom > report.mpDevice.safeArea.bottom + 1)) failures.push('分享页末尾图片进入手势安全区');
    if (['category','product-list','one-click-invite','invite-records'].includes(name) && !measure.nav) failures.push('未测量到真实底部导航');
    if (scroll && Number(measure.scrollHeight) - Number(measure.scrollTop) - Number(measure.scroll.height) > 2) failures.push('无法滚动到内容末尾');
    if (measure.nav && Math.abs(Number(measure.nav.top) - Number(measure.scroll.top) - Number(measure.scroll.height)) > 2) failures.push('底栏与正文间隙/重叠');
    if (name === 'product-list' && Number(measure.scroll.top) - 95 > 80) failures.push('商品上方导航区域异常撑高');
    if (measure.confirmDialog && Math.abs(Number(measure.confirmDialog.left) * 2 + Number(measure.confirmDialog.width) - Number(report.mpDevice.windowWidth)) > 2) failures.push('兑换弹窗左右偏移');
    measure.failures = failures; measure.status = failures.length ? 'FAIL' : 'MEASURED';
    report.mp.push(measure);
    await mini.screenshot({ path: path.join(dir, `mp-${name}.png`) });
    console.log(`MP ${name}: ${measure.status} ${failures.join(',')}`);
  }
} catch (e) {
  report.errors.push({ message: e.message, stack: e.stack?.split('\n').slice(0, 4) });
  console.error(e.message); process.exitCode = 1;
} finally {
  if (contactAdminToken && contactOriginal !== undefined) {
    try { ok(await api('/mall/admin/support/contact', 'PUT', { phone: contactOriginal }, contactAdminToken, true)); }
    catch (e) { report.errors.push({ message: '隔离库测试电话恢复失败: ' + e.message }); }
  }
  if (mini) {
    await mini.evaluate(() => {
      const app = getApp(), saved = app.__tenScreensPrevious;
      if (saved) { wx.request = saved.request; wx.setStorageSync('teaMallSessionToken', saved.token); wx.setStorageSync('teaSession', saved.session); delete app.__tenScreensPrevious; delete app.__tenScreensNetwork; }
    }).catch(() => {});
    mini.disconnect();
  }
  if (browser) await browser.close();
  if (report.errors.length || report.h5.some(x => x.status === 'FAIL') || report.mp.some(x => x.status === 'FAIL')) process.exitCode = 1;
  await writeFile(path.join(dir, process.env.CHAYE_VERIFY_MP_ONLY ? 'mp-verification.json' : 'live-verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ api: report.api, h5: report.h5.length, mp: report.mp.length, errors: report.errors.length }));
}
