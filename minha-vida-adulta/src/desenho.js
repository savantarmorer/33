/*
 * Desenho do efeito num <canvas> 2D (referencia 1080 x 1920).
 * Usado pelo preview e pela pagina de gravacao. Precisa de src/roleta.js.
 *
 *   const d = Desenho.criar(ctx, dados);
 *   d.sobreposicao(roleta.estado());   // desenha titulo, linha, bolinha e textos
 *   d.verificar(zonas)                 // confere os textos de todas as categorias
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Desenho = fabrica();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var FAMILIA = '"Montserrat", "Arial Black", "Inter", sans-serif';

  function criar(ctx, dados, opcoes) {
    opcoes = opcoes || {};
    var L = (opcoes.layout || (typeof Roleta !== 'undefined' && Roleta.LAYOUT));
    var N = dados.categorias.length;
    var api = { mostrarCaixas: false };

    function fonte(px) { return '900 ' + px + 'px ' + FAMILIA; }

    // Quebra o texto em ate linhasMax linhas, diminuindo a fonte se precisar.
    function ajustar(texto, larguraMax, fMax, fMin, linhasMax) {
      for (var f = fMax; f >= fMin; f -= 1) {
        ctx.font = fonte(f);
        var util = larguraMax - f * L.contorno;
        var palavras = texto.split(/\s+/), linhas = [], atual = '', cabe = true;
        for (var i = 0; i < palavras.length; i++) {
          var teste = atual ? atual + ' ' + palavras[i] : palavras[i];
          if (ctx.measureText(teste).width <= util) atual = teste;
          else {
            if (!atual) { cabe = false; break; }
            linhas.push(atual); atual = palavras[i];
            if (ctx.measureText(atual).width > util) { cabe = false; break; }
          }
        }
        if (atual) linhas.push(atual);
        if (cabe && linhas.length <= linhasMax) {
          var larg = 0;
          for (var j = 0; j < linhas.length; j++) larg = Math.max(larg, ctx.measureText(linhas[j]).width);
          return { fonte: f, linhas: linhas, largura: larg + f * L.contorno, cabe: true };
        }
      }
      ctx.font = fonte(fMin);
      return { fonte: fMin, linhas: [texto], largura: ctx.measureText(texto).width + fMin * L.contorno, cabe: false };
    }

    // Caixa ocupada (x0,y0,x1,y1) por um bloco de texto.
    function caixa(aj, ancora, x, yCentro, entrelinha) {
      var h = aj.fonte * entrelinha * aj.linhas.length + aj.fonte * L.contorno;
      var x0 = ancora === 'esq' ? x : ancora === 'dir' ? x - aj.largura : x - aj.largura / 2;
      return { x0: x0, x1: x0 + aj.largura, y0: yCentro - h / 2, y1: yCentro + h / 2 };
    }

    function texto(aj, ancora, x, yCentro, entrelinha) {
      ctx.font = fonte(aj.fonte);
      ctx.textAlign = ancora === 'esq' ? 'left' : ancora === 'dir' ? 'right' : 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.miterLimit = 2;
      ctx.lineWidth = aj.fonte * L.contorno;
      ctx.strokeStyle = L.cores.contorno; ctx.fillStyle = L.cores.texto;
      var lh = aj.fonte * entrelinha, n = aj.linhas.length;
      var dx = ancora === 'esq' ? aj.fonte * L.contorno / 2 : ancora === 'dir' ? -aj.fonte * L.contorno / 2 : 0;
      for (var i = 0; i < n; i++) {
        var y = yCentro + (i - (n - 1) / 2) * lh;
        ctx.strokeText(aj.linhas[i], x + dx, y);
        ctx.fillText(aj.linhas[i], x + dx, y);
      }
      if (api.mostrarCaixas) {
        var b = caixa(aj, ancora, x, yCentro, entrelinha);
        ctx.save(); ctx.strokeStyle = aj.cabe ? '#00e5ff' : '#ff3030'; ctx.lineWidth = 2;
        ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); ctx.restore();
      }
    }

    function yLinha(i) { return L.linhas.yPrimeira + i * L.linhas.espaco; }
    function yBola(b) { return b < 0 ? L.linha.yTopo + (b + 1) * (L.linhas.yPrimeira - L.linha.yTopo) : yLinha(b); }
    function titulo() { return ajustar(dados.titulo, L.titulo.larguraMax, L.titulo.fonte, L.titulo.fonteMin, L.titulo.linhasMax); }
    function yTitulo(aj) { var t = L.titulo; return t.topo + (aj.fonte * t.entrelinha * aj.linhas.length + aj.fonte * L.contorno) / 2; }
    function ajustarNome(i) { return ajustar(dados.categorias[i].nome, L.nome.larguraMax, L.nome.fonte, L.nome.fonteMin, 1); }
    function ajustarResultado(t) { return ajustar(t, L.resultado.larguraMax, L.resultado.fonte, L.resultado.fonteMin, L.resultado.linhasMax); }

    // Desenha tudo que fica por cima da camera.
    function sobreposicao(e) {
      var tj = titulo();
      texto(tj, 'centro', L.titulo.centroX, yTitulo(tj), L.titulo.entrelinha);

      ctx.fillStyle = L.cores.linha;
      ctx.fillRect(L.linha.x - L.linha.espessura / 2, L.linha.yTopo, L.linha.espessura, L.linha.yBase - L.linha.yTopo);

      for (var i = 0; i < N; i++) {
        var y = yLinha(i), l = e.linhas[i];
        ctx.beginPath(); ctx.arc(L.linha.x, y, L.circulo.raio, 0, Math.PI * 2);
        ctx.fillStyle = l.estado === 'final' ? L.cores.bola : L.cores.circulo; ctx.fill();
        ctx.lineWidth = L.circulo.borda; ctx.strokeStyle = L.cores.linha; ctx.stroke();
        texto(ajustarNome(i), 'dir', L.nome.direita, y, 1.06);
        if (l.texto) texto(ajustarResultado(l.texto), 'esq', L.resultado.esquerda, y, L.resultado.entrelinha);
      }

      if (e.bola !== null && e.fase !== 'fim') {
        ctx.beginPath(); ctx.arc(L.linha.x, yBola(e.bola), L.bola.raio, 0, Math.PI * 2);
        ctx.fillStyle = L.cores.bola; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.stroke();
      }
    }

    function sobrepoe(a, b) { return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1; }
    function foraDaTela(b) { return b.x0 < 36 || b.x1 > L.largura - 36 || b.y0 < 0 || b.y1 > L.altura; }

    // Confere titulo, nomes e TODOS os resultados contra a tela, as zonas e as linhas vizinhas.
    function verificar(zonas) {
      zonas = zonas || [];
      var problemas = [], menorFonte = 99, todos = [];
      var zonaCaixa = function (z) { return { x0: z.x, x1: z.x + z.w, y0: z.y, y1: z.y + z.h }; };
      var tj = titulo(), bt = caixa(tj, 'centro', L.titulo.centroX, yTitulo(tj), L.titulo.entrelinha);
      if (!tj.cabe) problemas.push('Título não cabe em 2 linhas');
      if (bt.y1 > L.linha.yTopo - L.bola.raio - 10) problemas.push('Título encosta na linha/bolinha');
      zonas.forEach(function (z) { if (sobrepoe(bt, zonaCaixa(z))) problemas.push('Título invade zona: ' + z.nome); });
      if (foraDaTela(bt)) problemas.push('Título sai da tela');

      var metade = L.linhas.espaco / 2, folga = 6;
      for (var i = 0; i < N; i++) {
        var y = yLinha(i), cat = dados.categorias[i];
        var faixa = { y0: y - metade + folga, y1: y + metade - folga };
        var nj = ajustarNome(i), bn = caixa(nj, 'dir', L.nome.direita, y, 1.06);
        if (!nj.cabe) problemas.push('Nome "' + cat.nome + '" não cabe');
        if (bn.x1 > L.linha.x - L.circulo.raio - 8) problemas.push('Nome "' + cat.nome + '" encosta no círculo');
        if (foraDaTela(bn)) problemas.push('Nome "' + cat.nome + '" sai da tela');
        cat.resultados.forEach(function (txt) {
          var rj = ajustarResultado(txt), b = caixa(rj, 'esq', L.resultado.esquerda, y, L.resultado.entrelinha);
          menorFonte = Math.min(menorFonte, rj.fonte);
          todos.push({ txt: txt, fonte: rj.fonte, linhas: rj.linhas.length });
          var p = [];
          if (!rj.cabe) p.push('não cabe em 2 linhas');
          if (b.y0 < faixa.y0 || b.y1 > faixa.y1) p.push('invade a linha vizinha');
          if (b.x0 < L.linha.x + L.circulo.raio + 6) p.push('encosta no círculo');
          if (foraDaTela(b)) p.push('sai da tela');
          zonas.forEach(function (z) { if (sobrepoe(b, zonaCaixa(z))) p.push('invade zona ' + z.nome); });
          if (sobrepoe(b, bt)) p.push('sobrepõe o título');
          if (p.length) problemas.push(cat.nome + ': "' + txt + '" → ' + p.join(', '));
        });
      }
      todos.sort(function (a, b) { return a.fonte - b.fonte || b.txt.length - a.txt.length; });
      return { ok: problemas.length === 0, problemas: problemas, menorFonte: menorFonte, fonteTitulo: tj.fonte,
        linhasTitulo: tj.linhas.length, piores: todos.slice(0, 6), total: todos.length };
    }

    // Estado com o resultado mais apertado de cada categoria (pior caso de layout).
    function estadoLongos() {
      return {
        fase: 'fim', indice: N - 1, bola: null,
        linhas: dados.categorias.map(function (c) {
          var maior = c.resultados.slice().sort(function (a, b) {
            return ajustarResultado(a).fonte - ajustarResultado(b).fonte || b.length - a.length;
          })[0];
          return { texto: maior, estado: 'final' };
        })
      };
    }

    api.fonte = fonte;
    api.sobreposicao = sobreposicao;
    api.verificar = verificar;
    api.estadoLongos = estadoLongos;
    return api;
  }

  return { criar: criar, FAMILIA: FAMILIA };
});
