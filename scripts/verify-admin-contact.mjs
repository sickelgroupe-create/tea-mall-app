import { chromium } from 'file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:19083';
const root = path.resolve('../若依/若依/RuoYi-Vue3/dist');
const out = path.resolve('docs/ten-screens-20260903');
const username = 'phoneui_' + randomBytes(4).toString('hex'), password = randomBytes(8).toString('hex');
const hash = execFileSync('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe', ['-c','import sys,bcrypt; print(bcrypt.hashpw(sys.stdin.buffer.read(),bcrypt.gensalt()).decode())'], {input:password,encoding:'utf8'}).trim();
execFileSync('C:/Program Files/MySQL/MySQL Server 8.4/bin/mysql.exe', ['--no-defaults','--host=127.0.0.1','--port=3308','--user=root','--database=tea_integration_20260903','--execute',`INSERT INTO sys_user(user_name,nick_name,password,status,del_flag) VALUES('${username}','phone ui test','${hash}','0','0'); SET @phone_user=LAST_INSERT_ID(); INSERT INTO sys_role(role_name,role_key,role_sort,status,del_flag) VALUES('${username}','${username}',100,'0','0'); SET @phone_role=LAST_INSERT_ID(); INSERT INTO sys_user_role VALUES(@phone_user,@phone_role); INSERT INTO sys_role_menu SELECT @phone_role,menu_id FROM sys_menu WHERE perms IN ('mall:ticket:list','mall:ticket:edit'); INSERT IGNORE INTO sys_role_menu SELECT @phone_role,parent_id FROM sys_menu WHERE perms IN ('mall:ticket:list','mall:ticket:edit') AND parent_id>0; INSERT IGNORE INTO sys_role_menu SELECT @phone_role,parent_id FROM sys_menu WHERE menu_id IN (SELECT menu_id FROM sys_role_menu WHERE role_id=@phone_role) AND parent_id>0;`],{stdio:['ignore','ignore','pipe']});
let token, browser, server, original, page;
const report={scope:'本地隔离库与真实管理后台构建',checks:[]};
async function api(p,method='GET',body) {
 const r=await fetch(base+p,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)}); const j=await r.json();assert.equal(j.code,200,j.msg);return j;
}
try {
 token=(await api('/login','POST',{username,password})).token;
 original=(await api('/mall/admin/support/contact')).data.phone;
 const routers=(await api('/getRouters')).data;
 let target='';
 function walk(rows,parent='') { for(const r of rows) { const p=r.path.startsWith('/')?r.path:parent+'/'+r.path;if(r.component==='mall/ticket/index')target=p;walk(r.children||[],p); } }
 walk(routers);assert.ok(target,'客服菜单路由未返回');
 server=createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep))file=path.join(root,'index.html');let data;try{data=await readFile(file)}catch{file=path.join(root,'index.html');data=await readFile(file)}const type={'.js':'application/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});res.end(data);}catch{res.writeHead(500);res.end();}});
 await new Promise(r=>server.listen(19085,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const context=await browser.newContext({viewport:{width:1366,height:900}});
 await context.addCookies([{name:'Admin-Token',value:token,url:'http://127.0.0.1:19085'}]);
 page=await context.newPage();
 // Match the deployed same-origin reverse proxy: the isolated upstream owns Host/Origin.
 await page.route('**/prod-api/**',async route=>{const q=route.request();const headers={...q.headers()};delete headers.origin;delete headers.host;const r=await fetch(base+q.url().split('/prod-api')[1],{method:q.method(),headers,body:['GET','HEAD'].includes(q.method())?undefined:q.postDataBuffer()});await route.fulfill({status:r.status,contentType:r.headers.get('content-type')||'application/json',body:Buffer.from(await r.arrayBuffer())});});
 await page.goto('http://127.0.0.1:19085'+target,{waitUntil:'networkidle'});
 const card=page.locator('.support-contact-card');await card.waitFor();
 await card.locator('input').fill('010-12345678');
 await card.getByRole('button',{name:'保存客服电话'}).click();
 const saveResponse=page.waitForResponse(r=>r.url().includes('/mall/admin/support/contact') && r.request().method()==='PUT');
 await page.locator('.el-message-box').getByRole('button',{name:'确定',exact:true}).click();
 const saveResult=await (await saveResponse).json();assert.equal(saveResult.code,200,saveResult.msg);
 assert.equal((await api('/mall/support/contact')).data.phone,'010-12345678');
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await card.locator('input').inputValue(),'010-12345678');
 await page.screenshot({path:path.join(out,'admin-contact.png'),fullPage:true});
 report.checks.push({name:'客服工单内编辑、二次确认、Java落库、刷新回显、商城接口同步',status:'PASS',route:target});
}catch(e){report.error=e.message;if(page){await page.screenshot({path:path.join(out,'admin-contact-failure.png'),fullPage:true}).catch(()=>{});report.pageText=(await page.locator('body').innerText()).slice(-1500);}process.exitCode=1;console.error(e.message)}
finally{if(token && original!==undefined)await api('/mall/admin/support/contact','PUT',{phone:original});if(browser)await browser.close();if(server)server.close();await mkdir(out,{recursive:true});await writeFile(path.join(out,'admin-contact-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
