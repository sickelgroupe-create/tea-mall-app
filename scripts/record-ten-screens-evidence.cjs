const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const frontend = path.resolve(__dirname, '..');
const root = path.resolve(frontend, '..');
const java = path.join(root, '若依/若依/RuoYi-Vue');
const admin = path.join(root, '若依/若依/RuoYi-Vue3');
const out = path.join(frontend, 'docs/ten-screens-20260903');
const baseline = path.join(root, '_local_backups/20260903-ten-screens');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const changes = [];
for (const name of ['App.vue','pages.json','pages','components','shared','styles']) {
  const current = path.join(frontend,name);
  const files = fs.statSync(current).isDirectory() ? walk(current) : [current];
  for (const file of files) {
    const relative = path.relative(frontend,file), old = path.join(baseline,relative);
    const nowHash = sha(fs.readFileSync(file)), oldHash = fs.existsSync(old) ? sha(fs.readFileSync(old)) : null;
    if (nowHash !== oldHash) changes.push({ file, change: oldHash ? 'modified' : 'added', beforeSha256: oldHash, afterSha256: nowHash });
  }
}
const otherFiles = [
  ...['MallAdminController.java','MallPublicController.java'].map(n=>path.join(java,'ruoyi-admin/src/main/java/com/ruoyi/web/controller/mall',n)),
  ...['MallSupportContactService.java','MallPartnerContentService.java'].map(n=>path.join(java,'ruoyi-admin/src/main/java/com/ruoyi/web/service/mall',n)),
  path.join(java,'ruoyi-admin/src/test/java/com/ruoyi/web/service/mall/MallSupportContactServiceTest.java'),
  path.join(java,'sql/20260903_08_support_contact.sql'),
  path.join(java,'sql/20260903_08_support_contact.rollback.md'),
  ...['src/api/mall/index.js','src/views/mall/ticket/index.vue','src/views/mall/components/MallManager.vue'].map(n=>path.join(admin,n)),
  ...['mark-page-scroll.cjs','test-ten-screens.cjs','verify-ten-screens.mjs','verify-admin-contact.mjs','record-ten-screens-evidence.cjs'].map(n=>path.join(frontend,'scripts',n)),
];
for (const file of otherFiles) changes.push({file,afterSha256:sha(fs.readFileSync(file)),note:'本轮涉及文件；Java/后台同时保留原有用户改动，不把整个 Git diff 算作本轮修改'});
const artifacts = [];
for (const [label,dir] of [['H5',path.join(frontend,'dist/build/h5')],['MP',path.join(frontend,'dist/upload/mp-weixin-ready')],['ADMIN',path.join(admin,'dist')]]) {
  const files = walk(dir).filter(f=>!f.endsWith('project.private.config.json')).map(file=>({path:path.relative(dir,file).replaceAll('\\','/'),sha256:sha(fs.readFileSync(file)),bytes:fs.statSync(file).size})).sort((a,b)=>a.path.localeCompare(b.path,'en'));
  artifacts.push({label,directory:dir,fileCount:files.length,bytes:files.reduce((s,f)=>s+f.bytes,0),manifestSha256:sha(JSON.stringify(files)),files});
}
const jar = path.join(java,'ruoyi-admin/target/ruoyi-admin.jar');
artifacts.push({label:'JAVA',file:jar,sha256:sha(fs.readFileSync(jar)),bytes:fs.statSync(jar).size});
const javaTests = walk(path.join(java,'ruoyi-admin/target/surefire-reports')).filter(f=>path.basename(f).startsWith('TEST-')&&f.endsWith('.xml')).map(file=>{
  const attrs=fs.readFileSync(file,'utf8').match(/<testsuite\s[^>]+>/)[0];
  const value=n=>attrs.match(new RegExp(n+'="([^"]*)"'))?.[1];
  return {suite:value('name'),tests:Number(value('tests')),failures:Number(value('failures')),errors:Number(value('errors')),skipped:Number(value('skipped'))};
});
const productionScan = JSON.parse(execFileSync(process.execPath,[path.join(frontend,'scripts/verify-production-build.cjs')],{encoding:'utf8'}));
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'change-and-build-evidence.json'),JSON.stringify({recordedAt:new Date().toISOString(),sourceBaseline:baseline,productionModified:false,miniProgramUploaded:false,realPaymentCalled:false,changes,javaTests,productionScan,artifacts},null,2));
console.log(JSON.stringify({changes:changes.length,javaTests,productionScan,artifacts:artifacts.map(({files,...summary})=>summary)},null,2));
