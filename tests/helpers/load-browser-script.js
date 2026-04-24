const fs = require('fs');
const vm = require('vm');
const path = require('path');

function loadBrowserScript(relativePath, globals = {}, exportNames = []) {
  const scriptPath = path.join(process.cwd(), relativePath);
  let code = fs.readFileSync(scriptPath, 'utf-8');
  if (exportNames.length > 0) {
    const exportObject = exportNames
      .map((name) => `${name}: typeof ${name} !== 'undefined' ? ${name} : undefined`)
      .join(', ');
    code += `\n;globalThis.__scriptExports = { ${exportObject} };`;
  }

  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    URL,
    ...globals,
  });

  vm.runInContext(code, context, { filename: scriptPath });
  if (context.__scriptExports) {
    context.__exports = context.__scriptExports;
  }
  return context;
}

module.exports = {
  loadBrowserScript,
};
