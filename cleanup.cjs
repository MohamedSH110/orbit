const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Cleanup duplicates
      content = content.replace(/text-text-muted text-text-muted/g, 'text-text-muted');
      content = content.replace(/text-text-main text-text-main/g, 'text-text-main');
      content = content.replace(/text-text-main dark:text-white/g, 'text-text-main');
      content = content.replace(/text-primary dark:text-white/g, 'text-primary');
      
      // dark hover fix
      content = content.replace(/hover:bg-card dark:hover:bg-slate-800/g, 'hover:bg-card');
      content = content.replace(/hover:bg-card dark:hover:bg-slate-700/g, 'hover:bg-card');
      content = content.replace(/hover:text-primary dark:hover:text-white/g, 'hover:text-primary');
      content = content.replace(/text-primary dark:text-white/g, 'text-primary');
      content = content.replace(/dark:text-white/g, 'text-text-main'); // Just as a fallback for unhandled
      
      content = content.replace(/text-text-main text-text-main/g, 'text-text-main'); // another pass

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Cleanup done');
