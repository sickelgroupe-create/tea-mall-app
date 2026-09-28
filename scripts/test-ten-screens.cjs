const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const { parse } = require('@vue/compiler-dom');
const root = path.resolve(__dirname, '..');
const source = p => fs.readFileSync(path.join(root, p), 'utf8');
const results = [];
const check = (name, fn) => { fn(); results.push({ name, status: 'PASS' }); };
function moduleAt(file) {
  const code = esbuild.buildSync({ entryPoints: [path.join(root, file)], bundle: true, platform: 'node', format: 'cjs', write: false }).outputFiles[0].text;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require, Uint8Array, TextEncoder: undefined });
  return module.exports;
}
async function main() {
  const qr = moduleAt('shared/qr-code.js');
  check('UTF-8: ASCII/中文/emoji/孤立代理项，不依赖 TextEncoder', () => {
    for (const value of ['abc', '茶叶分享', '茶🍵友', '\ud800', '\udc00', 'https://chaye.okam.top/#/pages/login/login?scene=茶友'])
      assert.deepEqual(Array.from(qr.utf8Bytes(value)), Array.from(Buffer.from(value)));
  });
  check('移除 TextEncoder 后真实 qrcode 库仍可生成相同字节二维码', () => {
    const value = 'https://chaye.okam.top/#/pages/login/login?scene=茶🍵友';
    const result = qr.createInviteQr(value);
    const reference = require('qrcode').create([{ data: Buffer.from(value), mode: 'byte' }], { errorCorrectionLevel: 'M' });
    assert.deepEqual(Array.from(result.modules.data), Array.from(reference.modules.data));
  });
  check('合伙人中文字段校验，保留地址最小长度', () => {
    const { partnerValidationError } = moduleAt('shared/partner-validation.js');
    const form = { realName: '测试', idNo: '110101199001010011', region: '北京', address: '街道', phone: '13800000000', reason: '测试申请理由', agreed: true };
    assert.equal(partnerValidationError(form), '详细地址长度需为3-255个字符');
    form.address = '街道一号'; assert.equal(partnerValidationError(form), '');
    form.agreed = false; assert.match(partnerValidationError(form), /协议/);
  });
  const pages = JSON.parse(source('pages.json')).pages;
  let vertical = 0, horizontal = 0;
  check('全部注册页面：只有直接纵向滚动区使用 viewport flex 标记', () => {
    for (const page of pages) {
      function walk(n, parent) {
        if (n.type === 1 && n.tag === 'scroll-view') {
          const cls = n.props.find(p => p.name === 'class')?.value?.content || '';
          const isY = n.props.some(p => p.name === 'scroll-y');
          const shell = parent?.props?.find(p => p.name === 'class')?.value?.content || '';
          if (isY && shell.split(/\s+/).includes('phone-shell')) { assert.match(cls, /shell-scroll-viewport/, page.path); vertical++; }
          if (!isY) { assert.doesNotMatch(cls, /shell-scroll-viewport/, page.path); horizontal++; }
        }
        for (const c of n.children || []) walk(c, n);
      }
      walk(parse(source(page.path + '.vue')), null);
    }
    assert.ok(vertical >= pages.length - 4);
    assert.doesNotMatch(source('styles/responsive-system.css'), /\.phone-shell\s*>\s*scroll-view\s*\{/);
  });
  const cats = [{ id: 1, categoryCode: 'TEA_SCIENCE', categoryName: '科普' }, { id: 2, parentId: 1, categoryCode: 'GREEN', categoryName: '绿茶知识' }];
  let articlePromises = [];
  const sfc = source('pages/tea-science/tea-science.vue').match(/<script>([\s\S]*?)<\/script>/)[1];
  const script = sfc.replace(/^import .*;\r?\n/gm, '').replace('export default', 'globalThis.component =');
  const context = { StatusBar: {}, TopBar: {}, mallPage: {}, mallApi: { contentCategories: async () => cats, contentArticles: () => new Promise(resolve => articlePromises.push(resolve)) } };
  vm.runInNewContext(script, context);
  const page = Object.assign(context.component.data(), context.component.methods);
  const first = page.load();
  articlePromises.shift()([{ title: 'first' }]); await first;
  page.categories = [{ name: '商品分类' }];
  check('科普首次加载后商城 bootstrap 覆盖商品 categories 不影响科普分类', () => {
    assert.deepEqual(Array.from(page.scienceCategories, x => x.categoryName), ['全部', '绿茶知识']);
  });
  const slow = page.load(), fast = page.load();
  const slowResolve = articlePromises.shift(), fastResolve = articlePromises.shift();
  fastResolve([{ title: '最新分类' }]); await fast;
  slowResolve([{ title: '旧分类' }]); await slow;
  check('科普分类快速切换忽略迟到请求', () => assert.equal(page.articles[0].title, '最新分类'));
  check('未申请显示立即申请，不改变其他状态', () => assert.match(source('pages/partner-status/partner-status.vue'), /status === '未申请' \? '立即申请' : '修改并重新申请'/));
  check('客服电话按钮调用拨号API，号码为空或读取中不可拨号', () => {
    const script = source('components/SupportPhone.vue').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?\n/gm, '').replace('export default', 'globalThis.component =');
    const calls = [];
    const ctx = { mallApi: {}, uni: { makePhoneCall: options => { calls.push(options.phoneNumber); options.complete(); }, showToast: () => {} } };
    vm.runInNewContext(script, ctx);
    const model = Object.assign(ctx.component.data(), ctx.component.methods);
    model.loading = false; model.dial(); assert.equal(calls.length, 0);
    model.phone = '010-12345678'; model.dial(); assert.deepEqual(calls, ['01012345678']);
    model.loading = true; model.dial(); assert.equal(calls.length, 1);
  });
  const report = { results, registeredPages: pages.length, verticalPageScrollers: vertical, horizontalOrOtherScrollers: horizontal, scope: '源代码与隔离单元测试，不是真机视觉验收' };
  const out = path.join(root, 'docs/ten-screens-20260903'); fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'source-tests.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
