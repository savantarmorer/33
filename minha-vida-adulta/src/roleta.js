/*
 * Minha vida adulta de acordo com o filtro — motor da roleta.
 *
 * JavaScript puro, sem DOM e sem API do Effect House: so recebe o tempo
 * (dt em segundos) e devolve o estado. O preview (preview/) e o script do
 * Effect House usam este mesmo arquivo; cada um so desenha o estado.
 *
 * Uso:
 *   const r = Roleta.criar(dados);          // dados = resultados.json
 *   r.iniciar();                            // ao gravar / tocar na tela
 *   a cada frame: r.atualizar(dt); const e = r.estado();
 *     e.bola      -> posicao da bolinha em "linhas" (-1 = topo da linha,
 *                    0 = 1a categoria, 5 = 6a categoria). null antes de iniciar.
 *     e.linhas[i] -> { texto, estado: 'vazio' | 'girando' | 'final' }
 *     e.fase      -> 'parado' | 'descendo' | 'girando' | 'segurando' | 'fim'
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Roleta = fabrica();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Tempos em segundos.
  var TEMPOS = {
    primeiraDescida: 0.8, // do topo da linha ate a 1a categoria
    descida: 0.55,        // de uma categoria ate a proxima
    roleta: 1.7,          // troca rapida desacelerando
    trocaMin: 0.05,       // intervalo entre trocas no inicio da roleta
    trocaMax: 0.34,       // intervalo entre trocas no fim da roleta
    pausa: 1.5            // segura o resultado antes de descer
  };

  // Layout de referencia em pixels numa tela 1080 x 1920 (9:16).
  // Para o Effect House, divida por 1080 (x) e 1920 (y) para coordenadas
  // normalizadas. Ja respeita a zona segura do TikTok:
  //   topo 0-210 (abas), base 1460-1920 (legenda/musica),
  //   direita 940-1080 entre y 560 e 1460 (botoes curtir/comentar/...).
  var LAYOUT = {
    largura: 1080,
    altura: 1920,
    titulo: { centroX: 540, topo: 236, larguraMax: 860, fonte: 66, fonteMin: 44, linhasMax: 2, entrelinha: 1.08 },
    linha: { x: 318, yTopo: 470, yBase: 1410, espessura: 8 },
    linhas: { yPrimeira: 560, espaco: 168 },   // 6 categorias: 560, 728, ..., 1400
    circulo: { raio: 24, borda: 6 },
    bola: { raio: 19 },
    nome: { direita: 272, larguraMax: 232, fonte: 46, fonteMin: 30 },
    resultado: { esquerda: 364, larguraMax: 566, fonte: 46, fonteMin: 30, linhasMax: 2, entrelinha: 1.06 },
    contorno: 0.24,                               // largura do traco do contorno = fonte * 0.24
    cores: { texto: '#FFFFFF', contorno: '#000000', linha: '#FFFFFF', circulo: '#8A8A8A', bola: '#FFC800' }
  };

  function mulberry32(semente) {
    var a = semente >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function suave(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

  function criar(dados, opcoes) {
    opcoes = opcoes || {};
    var cats = dados.categorias;
    var t = {};
    var k;
    for (k in TEMPOS) t[k] = TEMPOS[k];
    if (opcoes.tempos) for (k in opcoes.tempos) t[k] = opcoes.tempos[k];
    var rng = opcoes.rng || Math.random;

    var fase, idx, tFase, bola, de, para, linhas, finais, proximaTroca, ultimoSorteio;

    function sortear(n, evitar) {
      if (n <= 1) return 0;
      var i;
      do { i = Math.floor(rng() * n); } while (i === evitar);
      return i;
    }

    function reiniciar() {
      fase = 'parado';
      idx = 0;
      tFase = 0;
      bola = null;
      linhas = cats.map(function () { return { texto: '', estado: 'vazio' }; });
      finais = [];
      ultimoSorteio = -1;
    }

    function iniciar() {
      if (fase !== 'parado') return false;
      finais = cats.map(function (c) { return sortear(c.resultados.length, -1); });
      fase = 'descendo';
      idx = 0;
      tFase = 0;
      de = -1;
      para = 0;
      bola = -1;
      return true;
    }

    function atualizar(dt) {
      if (!(dt > 0)) return;
      if (dt > 0.25) dt = 0.25; // evita pular etapas se o app travar
      var resto = dt;
      var guarda = 0;
      while (resto > 0 && guarda++ < 50) {
        if (fase === 'parado' || fase === 'fim') return;
        if (fase === 'descendo') {
          var dur = idx === 0 ? t.primeiraDescida : t.descida;
          var usa = Math.min(resto, dur - tFase);
          tFase += usa; resto -= usa;
          bola = de + (para - de) * suave(Math.min(1, tFase / dur));
          if (tFase >= dur - 1e-9) {
            bola = para;
            fase = 'girando'; tFase = 0; proximaTroca = 0; ultimoSorteio = -1;
            linhas[idx].estado = 'girando';
          }
        } else if (fase === 'girando') {
          var usaG = Math.min(resto, t.roleta - tFase);
          tFase += usaG; resto -= usaG;
          var lista = cats[idx].resultados;
          while (proximaTroca <= tFase && proximaTroca < t.roleta) {
            ultimoSorteio = sortear(lista.length, ultimoSorteio);
            linhas[idx].texto = lista[ultimoSorteio];
            var p = proximaTroca / t.roleta;
            proximaTroca += t.trocaMin + (t.trocaMax - t.trocaMin) * p * p;
          }
          if (tFase >= t.roleta - 1e-9) {
            linhas[idx].texto = lista[finais[idx]];
            linhas[idx].estado = 'final';
            fase = 'segurando'; tFase = 0;
          }
        } else if (fase === 'segurando') {
          var usaS = Math.min(resto, t.pausa - tFase);
          tFase += usaS; resto -= usaS;
          if (tFase >= t.pausa - 1e-9) {
            if (idx < cats.length - 1) {
              de = idx; idx += 1; para = idx;
              fase = 'descendo'; tFase = 0;
            } else {
              fase = 'fim';
            }
          }
        }
      }
    }

    function estado() {
      return {
        fase: fase,
        indice: idx,
        bola: bola,
        linhas: linhas.map(function (l) { return { texto: l.texto, estado: l.estado }; })
      };
    }

    reiniciar();
    return { iniciar: iniciar, atualizar: atualizar, estado: estado, reiniciar: reiniciar };
  }

  // Duracao total de uma rodada completa (para conferir que cabe no video).
  function duracaoTotal(nCategorias, tempos) {
    var t = tempos || TEMPOS;
    return t.primeiraDescida + (nCategorias - 1) * t.descida + nCategorias * (t.roleta + t.pausa);
  }

  return { criar: criar, TEMPOS: TEMPOS, LAYOUT: LAYOUT, mulberry32: mulberry32, duracaoTotal: duracaoTotal };
});
