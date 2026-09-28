const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const root = path.resolve(__dirname,'..');
const results=[];
function load(file,globals={}) {
  const module={exports:{}};
  const code=esbuild.buildSync({entryPoints:[path.join(root,file)],bundle:true,platform:'node',format:'cjs',write:false,define:{'import.meta.env':'{}'}}).outputFiles[0].text;
  vm.runInNewContext(code,{module,exports:module.exports,require,Uint8Array,setTimeout,...globals});
  return module.exports;
}
async function test(name,fn) {await fn();results.push({name,status:'PASS'});}
(async()=>{
  const {productLabel,additionalProductSpec}=load('shared/product-label.js');
  await test('商品名称已有规格只显示一次，保留不同规格和缺失值',()=>{
    assert.equal(productLabel('明前西湖龙井 100g','100g'),'明前西湖龙井 100g');
    assert.equal(productLabel('明前西湖龙井','100g'),'明前西湖龙井 100g');
    assert.equal(productLabel('明前西湖龙井 1100g','100g'),'明前西湖龙井 1100g 100g');
    assert.equal(productLabel('明前西湖龙井 50g','100g'),'明前西湖龙井 50g 100g');
    assert.equal(additionalProductSpec('龙井（100g）','100g'),'');
    assert.equal(additionalProductSpec('Tea 100 G','100g'),'');
    assert.equal(additionalProductSpec('龙井(100g)','100g'),'');
    assert.equal(additionalProductSpec('龙井 100g×2','100g'),'100g');
    assert.equal(productLabel(null,'100g'),'100g');
    assert.equal(productLabel('龙井',null),'龙井');
  });
  let response, captured;
  const api=load('shared/mall-api.js',{uni:{getStorageSync:()=> 'test-session',setStorageSync:()=>{},uploadFile:options=>{captured=options;options.success(response);}}}).default;
  await test('售后和社区公共上传都读取后端 data 路径',async()=>{
    response={statusCode:200,data:JSON.stringify({code:200,msg:'上传成功',data:'/profile/upload/2026/09/03/evidence.png'})};
    for(const method of ['uploadAftersaleEvidence','uploadCommunityImage']) {
      assert.equal(await api[method]('test-local-path'),'/profile/upload/2026/09/03/evidence.png');
      assert.ok(captured.url.endsWith('/mall/community/images'));
      assert.equal(captured.header['X-Mall-Session'],'test-session');
      assert.equal(captured.filePath,'test-local-path');
    }
  });
  await test('不会把消息字段或上传失败误当图片地址',async()=>{
    response={statusCode:200,data:JSON.stringify({code:200,msg:'操作成功'})};
    await assert.rejects(api.uploadAftersaleEvidence('test'),/未返回图片地址/);
    response={statusCode:400,data:JSON.stringify({code:400,msg:'单张图片不能超过5MB'})};
    await assert.rejects(api.uploadAftersaleEvidence('test'),/不能超过5MB/);
    response={statusCode:502,data:'<html>Bad gateway</html>'};
    await assert.rejects(api.uploadAftersaleEvidence('test'),/响应格式错误/);
  });
  await test('售后模板使用规格去重而不是修改业务字段',()=>{
    const apply=fs.readFileSync(path.join(root,'pages/aftersale-apply/aftersale-apply.vue'),'utf8');
    const detail=fs.readFileSync(path.join(root,'pages/aftersale-detail/aftersale-detail.vue'),'utf8');
    assert.match(apply,/additionalProductSpec\(item.name, item.spec\)/);
    assert.match(detail,/productLabel\(detail.productName, detail.spec\)/);
    assert.doesNotMatch(detail,/detail\.productName\s*}}\s*{{\s*detail\.spec/);
  });
  const directory=path.join(root,'docs/upload-spec-20260903');
  fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(path.join(directory,'source-tests.json'),JSON.stringify({status:'PASS',results},null,2));
  console.log(JSON.stringify({status:'PASS',results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
