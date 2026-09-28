const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const front=path.resolve(__dirname,'..'),root=path.dirname(front);
const java=path.join(root,'若依/若依/RuoYi-Vue');
const output=path.join(front,'docs/upload-spec-20260903');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const changed=[
  [path.join(front,'shared/build-info.js'),'build-info.js'],
  [path.join(front,'manifest.json'),'manifest.json'],
  [path.join(java,'ruoyi-admin/src/main/java/com/ruoyi/web/controller/mall/MallPartnerContentController.java'),'MallPartnerContentController.java'],
  [path.join(front,'pages/aftersale-apply/aftersale-apply.vue'),'aftersale-apply.vue'],
  [path.join(front,'pages/aftersale-detail/aftersale-detail.vue'),'aftersale-detail.vue'],
  [path.join(front,'shared/product-label.js'),null],
  [path.join(java,'ruoyi-admin/src/test/java/com/ruoyi/web/service/mall/MallImageUploadContractTest.java'),null],
  [path.join(front,'scripts/test-upload-spec.cjs'),null],
].map(([file,before])=>({file,beforeSha256:before?sha(path.join(root,'_local_backups/20260903-upload-spec',before)):null,afterSha256:sha(file)}));
const tests=fs.readdirSync(path.join(java,'ruoyi-admin/target/surefire-reports')).filter(x=>x.startsWith('TEST-')&&x.endsWith('.xml')).map(name=>{
  const text=fs.readFileSync(path.join(java,'ruoyi-admin/target/surefire-reports',name),'utf8');
  const attrs=text.match(/<testsuite\b[^>]+>/)[0];
  const out={file:name};
  for(const key of ['tests','failures','errors','skipped'])out[key]=Number(attrs.match(new RegExp(`\\b${key}="(\\d+)"`))[1]);
  return out;
});
if(tests.reduce((n,t)=>n+t.tests,0)!==34||tests.some(t=>t.failures||t.errors||t.skipped))throw Error('Java tests not green');
const artifacts=[];
for(const [label,dir]of [['H5','dist/build/h5'],['MP','dist/upload/mp-weixin-ready']]){
  const directory=path.join(front,dir),files=[];
  function visit(d){for(const entry of fs.readdirSync(d,{withFileTypes:true})){const file=path.join(d,entry.name);if(entry.isDirectory())visit(file);else if(entry.name!=='project.private.config.json')files.push({path:path.relative(directory,file).replaceAll('\\','/'),sha256:sha(file),bytes:fs.statSync(file).size});}}
  visit(directory);files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
  artifacts.push({label,directory,fileCount:files.length,manifestSha256:crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex'),files});
}
const jar=path.join(java,'ruoyi-admin/target/ruoyi-admin.jar');
artifacts.push({label:'JAVA',file:jar,sha256:sha(jar)});
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'evidence.json'),JSON.stringify({checkedAt:new Date().toISOString(),changes:changed,javaTests:tests,artifacts,deployed:false,miniProgramUploaded:false,physicalDeviceVerified:false},null,2));
console.log(JSON.stringify({javaTests:tests.reduce((n,t)=>n+t.tests,0),sourceFiles:changed.length,artifacts:artifacts.map(({files,...a})=>a)},null,2));
