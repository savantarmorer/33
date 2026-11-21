// Testa o preview: verifica os 300 textos, roda rodadas reais e tira prints.
// Uso: node tools/testar-preview.js [pasta-de-saida]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const saida = process.argv[2] || path.join(__dirname, '..', 'testes');
  fs.mkdirSync(saida, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 980 } });
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  await p.goto('file://' + path.join(__dirname, '..', 'preview', 'preview.html'));
  await p.waitForFunction(() => window.previewPronto === true, null, { timeout: 20000 });
  const fonteOk = await p.evaluate(() => document.fonts.check('900 46px "Montserrat"'));
  const r = await p.evaluate(() => window.verificar());
  console.log('Montserrat carregada:', fonteOk);
  console.log('Verificação:', r.ok ? 'OK' : 'FALHOU', '| problemas:', r.problemas.length,
    '| título', r.linhasTitulo, 'linhas @', r.fonteTitulo, 'px | menor fonte resultado', r.menorFonte, 'px');
  r.problemas.slice(0, 20).forEach((x) => console.log('  -', x));
  console.log('Mais apertados:', r.piores.map((x) => x.fonte + 'px ' + x.txt).join(' | '));
  const tela = p.locator('canvas');
  await p.evaluate(() => window.mostrarLongos());
  await p.check('#cZonas'); await p.check('#cCaixas');
  await p.waitForTimeout(200);
  await tela.screenshot({ path: path.join(saida, 'longos-zonas.png') });
  await p.uncheck('#cZonas'); await p.uncheck('#cCaixas');
  await p.waitForTimeout(200);
  await tela.screenshot({ path: path.join(saida, 'longos.png') });
  // rodadas reais em tempo real
  for (let i = 1; i <= 3; i++) {
    await p.click('#bReiniciar');
    await tela.click();
    await p.waitForTimeout(i === 1 ? 2000 : 0);
    if (i === 1) await tela.screenshot({ path: path.join(saida, 'girando.png') });
    await p.waitForTimeout(i === 1 ? 7200 : 9200);
    if (i === 1) await tela.screenshot({ path: path.join(saida, 'meio.png') });
    await p.waitForTimeout(14500);
    await tela.screenshot({ path: path.join(saida, 'rodada-' + i + '.png') });
  }
  console.log('Erros de JS:', erros.length ? erros : 'nenhum');
  await b.close();
  process.exit(r.ok && !erros.length ? 0 : 1);
})();
