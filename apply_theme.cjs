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
      
      // Backgrounds
      content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-bg');
      content = content.replace(/bg-slate-50 dark:bg-slate-800/g, 'bg-card');
      content = content.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-card');
      
      // Text colors
      content = content.replace(/text-slate-900 dark:text-slate-100/g, 'text-text-main');
      content = content.replace(/text-slate-800 dark:text-slate-100/g, 'text-text-main');
      content = content.replace(/text-slate-700 dark:text-slate-200/g, 'text-text-main');
      content = content.replace(/text-slate-600 dark:text-slate-300/g, 'text-text-muted');
      content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-text-muted');
      content = content.replace(/text-slate-400 dark:text-slate-500/g, 'text-text-muted');
      
      content = content.replace(/text-primary dark:text-white/g, 'text-primary');
      
      // Borders
      content = content.replace(/border-slate-100 dark:border-slate-800/g, 'border-border-main');
      content = content.replace(/border-slate-200 dark:border-slate-700/g, 'border-border-main');
      content = content.replace(/border-slate-150 dark:border-slate-800/g, 'border-border-main');
      
      // Hover states for backgrounds
      content = content.replace(/hover:bg-slate-50 dark:hover:bg-slate-800/g, 'hover:bg-card');
      content = content.replace(/hover:bg-slate-50 dark:hover:bg-slate-700\/50/g, 'hover:bg-card');
      content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-700/g, 'hover:bg-card');
      content = content.replace(/active:bg-slate-100 dark:active:bg-slate-700/g, 'active:bg-card');
      
      // Background modifiers like /50
      content = content.replace(/bg-slate-50\/50 dark:bg-slate-800\/50/g, 'bg-card/50');
      content = content.replace(/bg-white\/50 dark:bg-slate-900\/50/g, 'bg-bg/50');
      content = content.replace(/bg-slate-900\/5/g, 'bg-text-main/5');
      content = content.replace(/bg-slate-800\/5/g, 'bg-text-main/5');

      // Standalone cases that might have been missed by previous replace
      content = content.replace(/bg-white/g, 'bg-bg');
      content = content.replace(/bg-slate-50/g, 'bg-card');
      content = content.replace(/bg-slate-100/g, 'bg-card');
      content = content.replace(/text-slate-900/g, 'text-text-main');
      content = content.replace(/text-slate-800/g, 'text-text-main');
      content = content.replace(/text-slate-700/g, 'text-text-main');
      content = content.replace(/text-slate-600/g, 'text-text-muted');
      content = content.replace(/text-slate-500/g, 'text-text-muted');
      content = content.replace(/border-slate-200/g, 'border-border-main');
      content = content.replace(/border-slate-100/g, 'border-border-main');
      content = content.replace(/dark:bg-slate-900/g, 'bg-bg');
      content = content.replace(/dark:bg-slate-800/g, 'bg-card');
      content = content.replace(/dark:text-slate-100/g, 'text-text-main');
      content = content.replace(/dark:text-slate-200/g, 'text-text-main');
      content = content.replace(/dark:text-slate-300/g, 'text-text-muted');
      content = content.replace(/dark:text-slate-400/g, 'text-text-muted');
      content = content.replace(/dark:border-slate-800/g, 'border-border-main');
      content = content.replace(/dark:border-slate-700/g, 'border-border-main');
      
      content = content.replace(/hover:bg-bg dark:hover:bg-card/g, 'hover:bg-card');
      content = content.replace(/hover:bg-bg/g, 'hover:bg-card');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done mapping themes');
