// Gera preview/preview.html (arquivo unico, abre com duplo clique) a partir de
// preview/template.html + src/roleta.js + dados/resultados.json.
// Rode de novo depois de editar as listas:  node tools/build-preview.js
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const ler = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');

const dados = JSON.parse(ler('dados/resultados.json'));
dados.categorias.forEach((c) => {
  if (!c.nome || !Array.isArray(c.resultados) || c.resultados.length === 0) {
    throw new Error('Categoria invalida: ' + JSON.stringify(c.nome));
  }
});

const html = ler('preview/template.html')
  .replace('/*@@ROLETA@@*/', () => ler('src/roleta.js'))
  .replace('/*@@DADOS@@*/', () => JSON.stringify(dados).replace(/</g, '\\u003c'));
fs.writeFileSync(path.join(raiz, 'preview/preview.html'), html);
console.log('preview/preview.html gerado (' + dados.categorias.length + ' categorias, ' +
  dados.categorias.reduce((n, c) => n + c.resultados.length, 0) + ' resultados)');
