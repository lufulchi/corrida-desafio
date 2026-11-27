// Monta a página do desafio com a corrida nova: challenge.html (fonte publicada) + race.css/section/js,
// e grava os números de corrida.json no bloco CORRIDA. Saída: ../challenge-race.html (é o que se publica).
// Uso: node montar.mjs [--menu]   (--menu também põe a aba "corrida" no menu; sem ele, só abre por #corrida)
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
h = h.replace('var ABAS=["premio","funciona","briefing","participar","time"]', 'var ABAS=["premio","funciona","briefing","participar","time","corrida"]');
if (process.argv.includes('--menu'))
  h = h.replace('<a href="#time">o time</a>', '<a href="#time">o time</a>\n  <a href="#corrida">a corrida 🏁</a>');
const dados = fs.existsSync(path.join(aqui, '../corrida.json')) ? ler('../corrida.json').trim() : '{"atualizadoEm":null,"dias":[],"pessoas":[]}';
JSON.parse(dados);
h = h.replace(/\/\*CORRIDA-INICIO\*\/[\s\S]*?\/\*CORRIDA-FIM\*\//, () => '/*CORRIDA-INICIO*/' + dados + '/*CORRIDA-FIM*/');
fs.writeFileSync(path.join(aqui, '../challenge-race.html'), h);
console.log('ok:', path.join(aqui, '../challenge-race.html'), (h.length / 1024).toFixed(0) + ' KB');
