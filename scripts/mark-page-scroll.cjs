// Mechanical source migration: never apply vertical flex growth to navigation.
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('@vue/compiler-dom');
const root = path.resolve(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(root, 'pages.json'), 'utf8')).pages;
let count = 0;
for (const page of pages) {
  const file = path.join(root, page.path + '.vue');
  const source = fs.readFileSync(file, 'utf8');
  const ast = parse(source);
  const edits = [];
  const walk = (node, parent) => {
    if (node.type === 1 && node.tag === 'scroll-view' && parent?.tag === 'view') {
      const shell = parent.props?.find(p => p.name === 'class')?.value?.content || '';
      if (shell.split(/\s+/).includes('phone-shell') && node.props.some(p => p.name === 'scroll-y')) {
        const cls = node.props.find(p => p.name === 'class');
        if (!cls?.value) throw new Error('Page scroller lacks static class: ' + file);
        if (!cls.value.content.includes('shell-scroll-viewport')) edits.push(cls.value.loc.start.offset + 1);
      }
    }
    for (const child of node.children || []) walk(child, node);
  };
  walk(ast, null);
  let next = source;
  for (const offset of edits.sort((a,b) => b-a)) next = next.slice(0,offset) + 'shell-scroll-viewport ' + next.slice(offset);
  if (next !== source) { fs.writeFileSync(file, next); count += edits.length; }
}
console.log('Marked vertical page scrollers: ' + count);
