// Monta a página do desafio com a corrida nova: challenge.html (fonte publicada) + race.css/section/js,
// e grava os números de corrida.json no bloco CORRIDA. Saída: ../challenge-race.html (é o que se publica).
// Uso: node montar.mjs   (o --menu antigo é ignorado: a página agora tem 2 abas, "a corrida" e "o desafio")
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const ler = f => fs.readFileSync(path.join(aqui, f), 'utf8');
let h = ler('../challenge.html');
const trocar = (ini, fim, novo, nome) => {
  const a = h.indexOf(ini), b = h.indexOf(fim, a + 1);
  if (a < 0 || b < 0) throw new Error('não achei o bloco ' + nome);
  h = h.slice(0, a) + novo + h.slice(b);
};
if (!h.includes('/*CORRIDA-INICIO*/')) {
  trocar('.corrida{background:var(--soft)}', '\n.org table', ler('race.css'), 'css');
  trocar('<section class="corrida"', '\n\n\n\n<footer>', ler('race-section.html').trimEnd(), 'section');
  trocar('/* ---------- a apuração', '/* ---------- formulário', ler('race.js'), 'js');
} else throw new Error('challenge.html já tem a corrida nova — monte a partir da fonte original');
// ---- 2 abas (pedido da Luiza, 27/11): "a corrida" é a principal e abre direto nas pessoas, sem o topo;
// "o desafio" junta o topo e todas as explicações (prêmio, como funciona, briefing, como participar, o time).
// Os links antigos (#premio, #briefing, #time, #inscricao...) abrem "o desafio" e rolam até a seção.
const sub = (de, para, nome) => { if (!h.includes(de)) throw new Error('não achei ' + nome); h = h.replace(de, para); };
trocar('<nav class="abas" aria-label="seções"><div class="wrap">', '</div></nav>',
  '<nav class="abas" aria-label="seções"><div class="wrap">\n  <a href="#corrida">a corrida 🏁</a>\n  <a href="#desafio">o desafio</a>\n', 'abas');
sub('<a class="btn main" href="#inscricao">quero participar</a>', '', 'botão do topo');   // inscrições já fecharam
sub('<div class="hero" id="inicio">', '<div class="hero" id="inicio" data-aba="desafio">', 'topo');
for (const s of ['premio', 'funciona', 'briefing', 'participar', 'time'])
  sub(`id="${s}" data-aba="${s}"`, `id="${s}" data-aba="desafio"`, 'seção ' + s);
sub('</style>', '.hero[data-aba]:not(.ativa){display:none!important}\n.hero[data-aba].ativa{display:flex}\n.corrida{padding-top:40px}\n@media(max-width:759px){.corrida{padding-top:24px}}\n</style>', 'estilo das abas');
trocar('var primeiraAba=true;', 'window.addEventListener("hashchange",mostrar);mostrar();',
  'var ABAS=["corrida","desafio"],SECOES={premio:1,funciona:1,briefing:1,participar:1,time:1,inscricao:1,inicio:1};\n' +
  'function mostrar(){\n' +
  '  var h=decodeURIComponent(location.hash.slice(1)),aba=h==="nova"?"nova":(h==="desafio"||SECOES[h])?"desafio":"corrida";\n' +
  '  Array.prototype.forEach.call(document.querySelectorAll("[data-aba]"),function(el){el.classList.toggle("ativa",el.getAttribute("data-aba")===aba)});\n' +
  '  Array.prototype.forEach.call(document.querySelectorAll(".abas a"),function(a){if(a.getAttribute("href")==="#"+aba)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});\n' +
  '  var el=SECOES[h]&&h!=="inicio"?$(h):null;\n' +
  '  if(el)requestAnimationFrame(function(){el.scrollIntoView({block:"start"})});else window.scrollTo(0,0);\n' +
  '  if(aba==="corrida")renderCorrida();\n' +
  '}\n', 'navegação');
// ---- prévia #nova (27/11, para a Luiza aprovar): fora do menu, só abre por #nova. Script em bloco próprio.
if (fs.existsSync(path.join(aqui, 'race2.js'))) {
  sub('<footer>', ler('race2-section.html').trimEnd() + '\n\n<footer>', 'prévia: seção');
  sub('</style>', ler('race2.css') + '</style>', 'prévia: estilo');
  const fimBody = h.lastIndexOf('</body>');
  h = h.slice(0, fimBody) + '<script>\n' + ler('race2.js') + '</script>\n' + h.slice(fimBody);
}
const dados = fs.existsSync(path.join(aqui, '../corrida.json')) ? ler('../corrida.json').trim() : '{"atualizadoEm":null,"dias":[],"pessoas":[]}';
JSON.parse(dados);
h = h.replace(/\/\*CORRIDA-INICIO\*\/[\s\S]*?\/\*CORRIDA-FIM\*\//, () => '/*CORRIDA-INICIO*/' + dados + '/*CORRIDA-FIM*/');
fs.writeFileSync(path.join(aqui, '../challenge-race.html'), h);
console.log('ok:', path.join(aqui, '../challenge-race.html'), (h.length / 1024).toFixed(0) + ' KB');
