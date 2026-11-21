# Minha vida adulta de acordo com o filtro

Efeito do TikTok no estilo "barrinha que desce": uma bolinha amarela desce por
6 categorias e sorteia um resultado em cada uma, com roleta desacelerando.

## O que tem aqui

| Pasta / arquivo | O que é |
|---|---|
| `dados/resultados.json` | Título, 6 categorias e 50 resultados em cada uma. **Edite aqui** para trocar textos. |
| `src/roleta.js` | Lógica do efeito (tempos, sorteio, roleta, layout). JavaScript puro, sem dependências. Usado pelo preview e pelo script do Effect House. |
| `preview/preview.html` | Preview que abre no navegador com duplo clique. Tem câmera frontal, zonas seguras do TikTok, teste com os textos mais longos e verificação automática dos 300 textos. |
| `icone/icone-512.png`, `icone-1024.png`, `icone.svg` | Ícone: bolinha amarela na linha branca. |
| `testes/` | Prints dos testes. |
| `tools/` | `build-preview.js` regera o preview depois de editar o JSON; `testar-preview.js` roda os testes (Playwright). |

### Tempos de uma rodada

Descida até a 1ª categoria: 0,8 s. Roleta: 1,7 s. Pausa: 1,5 s. Descida entre categorias: 0,55 s.
**Total: cerca de 23 s**, então cabe num vídeo de 30 s. Para mudar, ajuste `TEMPOS` em `src/roleta.js`.

### Layout (tela 1080 × 1920, valores em `LAYOUT` no `src/roleta.js`)

- Título no topo (y 236), em até 2 linhas, centralizado.
- Linha branca vertical em x = 318, com categorias em y = 560, 728, 896, 1064, 1232 e 1400.
- Nomes alinhados à direita, terminando em x = 272. Resultados começam em x = 364, com no máximo
  566 px de largura e 2 linhas. A fonte começa em 46 px e só diminui quando o texto não cabe; o menor
  tamanho usado foi 34 px.
- Fica fora das zonas do TikTok: topo 0–210 (abas), direita 940–1080 (botões) e base 1460–1920 (legenda).
- Texto branco, fonte Montserrat Black (900), contorno preto.

Verificação feita: todos os 300 resultados, em cada categoria, cabem em 2 linhas sem sair da tela,
sem invadir zonas do TikTok e sem encostar na linha vizinha. Também rodei 2.000 rodadas simuladas,
todas sem erro e com os 50 resultados de cada categoria aparecendo.

---

## Montar no Effect House (no seu Mac ou PC com Windows)

O Effect House e o EffectHouse AI só rodam no seu computador (macOS 13 ou mais recente, ou Windows x64).
Faça assim:

1. Instale o **Effect House** (effecthouse.tiktok.com) e entre com a sua conta do TikTok.
2. Instale o **Claude Code** (app do Claude, aba Code) nesse computador.
3. Baixe esta pasta (`minha-vida-adulta`) do GitHub para o computador e abra a pasta no Claude Code.
4. Instale o plugin colando o prompt de instalação do EffectHouse AI que está em
   https://github.com/tiktok/effect-house-agent-plugins#install
5. Depois de instalado, cole o prompt abaixo.

### Prompt para colar no Claude Code (com EffectHouse AI instalado)

```text
Use o EffectHouse AI para montar o efeito "Minha vida adulta de acordo com o filtro"
a partir desta pasta. Tudo já está especificado e testado aqui:

- dados/resultados.json: título, 6 categorias e 50 resultados em cada uma. Importe como
  arquivo de dados do projeto (não copie os textos para dentro do script).
- src/roleta.js: a lógica pronta (sorteio, roleta desacelerando, tempos e LAYOUT em pixels
  de 1080x1920). Reaproveite essa lógica no script do Effect House: crie a roleta com
  Roleta.criar(dados), chame iniciar() quando o usuário começar a gravar (use o evento de
  início de gravação se existir; senão, toque na tela), chame atualizar(dt) a cada frame
  e desenhe estado(): bola (posição em linhas, -1 = topo da linha), linhas[i].texto e
  linhas[i].estado ('vazio' | 'girando' | 'final').
- preview/preview.html: referência visual. O resultado no Effect House deve ficar igual.

Cena:
- Câmera frontal em tela cheia (Camera + Face, sem filtros).
- Título fixo no topo, linha branca vertical, 6 círculos cinza (#8A8A8A) com borda branca,
  nomes à esquerda e resultados à direita, com as posições do LAYOUT convertidas para
  coordenadas normalizadas.
- Bolinha amarela #FFC800 com contorno preto. O círculo fica amarelo quando o resultado
  para. O resultado final fica visível até o fim do vídeo.
- Texto branco, fonte bold e grossa (Montserrat Black ou a mais grossa disponível),
  contorno preto, quebrando em até 2 linhas, com auto-ajuste de tamanho entre 46 e 30 px
  de referência.
- Ícone: icone/icone-512.png.
- Dica do efeito: "Toque para começar" (ou "Grave para descobrir").

Teste no preview do Effect House com várias rodadas e com os textos mais longos de cada
categoria (ex.: "R$ 9 mil em corrida de app pra ir num trampo de R$ 1.500" e
"Noivo de uma mulher que conheceu no grupo de oração"). Confira que nada sai da área
segura do TikTok nem se sobrepõe. Depois me ajude a testar no celular e a enviar o efeito
para publicação.
```

## Publicar no TikTok (passo a passo final)

1. **Teste no Effect House:** rode o preview várias vezes e use a sobreposição de zona segura do TikTok, se houver.
2. **Teste no celular:** use a opção do Effect House de enviar o preview para o celular (QR code no app do
   TikTok). Grave 2 ou 3 vídeos de teste e confira a roleta, os tempos e a leitura dos textos.
3. **Preencha os dados do efeito:**
   - **Nome:** "Minha vida adulta de acordo com o filtro". Se o TikTok recusar por tamanho, use
     "Minha vida adulta" ou "Vida adulta do filtro".
   - **Ícone:** `icone/icone-512.png` (ou o 1024, se pedirem maior).
   - **Dica na tela:** "Toque para começar".
   - **Vídeo de demonstração:** se pedirem, grave um com o próprio efeito.
4. **Envie para revisão** (Submit / Publish). O TikTok revisa o efeito antes de liberar; o prazo varia.
   Evite marcas, nomes de pessoas reais ou conteúdo que fira as diretrizes, que são os motivos de recusa
   mais comuns. "Pokémon", "Robux", "iFood", "BBB", "LinkedIn" e "Faria Lima" aparecem nos textos.
   Se o efeito for recusado por marca registrada, troque esses itens em `dados/resultados.json`.
5. **Aprovado:** o efeito aparece no seu perfil, na aba de efeitos, e qualquer pessoa pode usar.

## Editar os textos depois

1. Altere `dados/resultados.json` (pode ter mais ou menos de 50 itens por categoria).
2. Rode `node tools/build-preview.js` e abra `preview/preview.html`.
3. Clique em **Verificar os 300 textos**. Se algum texto não couber, encurte esse item.
4. Atualize o arquivo de dados no projeto do Effect House e envie a nova versão.
