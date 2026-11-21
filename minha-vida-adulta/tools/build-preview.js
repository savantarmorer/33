// Gera preview/preview.html e gravar/gravar.html (arquivos unicos) a partir dos
// templates + src/roleta.js + src/desenho.js + dados/resultados.json.
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

const montar = (modelo, destino) => {
  const html = ler(modelo)
    .replace('/*@@ROLETA@@*/', () => ler('src/roleta.js'))
    .replace('/*@@DESENHO@@*/', () => ler('src/desenho.js'))
    .replace('/*@@DADOS@@*/', () => JSON.stringify(dados).replace(/</g, '\\u003c'));
  fs.writeFileSync(path.join(raiz, destino), html);
  console.log(destino + ' gerado');
};
montar('preview/template.html', 'preview/preview.html');
montar('gravar/template.html', 'gravar/gravar.html');
montar('camera/template.html', 'camera/index.html');
console.log('(' + dados.categorias.length + ' categorias, ' +
  dados.categorias.reduce((n, c) => n + c.resultados.length, 0) + ' resultados)');
