const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const source = path.join(projectRoot, 'static', 'images')
const target = path.join(projectRoot, 'dist', 'build', 'h5', 'static', 'images')

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.cpSync(source, target, { recursive: true, force: true })

// uni-app injects a delayed preload request to DCloud's shadow image into the
// H5 base stylesheet. It is decorative only, but an unavailable third-party
// CDN creates a red Console error on otherwise healthy pages. Keep the
// animation contract while making the preload self-contained.
const assets = path.join(projectRoot, 'dist', 'build', 'h5', 'assets')
const inlinePixel = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
if (fs.existsSync(assets)) {
  for (const filename of fs.readdirSync(assets)) {
    if (!filename.endsWith('.css')) continue
    const file = path.join(assets, filename)
    const css = fs.readFileSync(file, 'utf8')
    const updated = css.replaceAll('https://cdn.dcloud.net.cn/img/shadow-grey.png', inlinePixel)
    if (updated !== css) fs.writeFileSync(file, updated, 'utf8')
  }
}
console.log(`Copied stable H5 product images to ${target}`)
