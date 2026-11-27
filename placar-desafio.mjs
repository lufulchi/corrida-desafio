// Placar da corrida do Super Team Creator Challenge.
// Conta as conversões do pixel (offsite_conversion.fb_pixel_custom = inscrição) de cada anúncio do desafio,
// em QUALQUER campanha da conta (o número do AD no nome é a chave), dia a dia desde a largada, e soma por pessoa.
// Escolha da Luiza em 26/11/2026: pixel do Meta por anúncio (o Neon não grava utm_content).
// Uso: node placar-desafio.mjs   → grava corrida.json (série ACUMULADA por pessoa). Depois: node race/montar.mjs --menu
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries((process.env.META_ACCESS_TOKEN ? '' : fs.readFileSync(path.join(aqui, '../.env'), 'utf8')).split(/\r?\n/)
  .filter(l => /^[A-Z_]+=/.test(l)).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
const TK = process.env.META_ACCESS_TOKEN || env.META_ACCESS_TOKEN, ACT = 'act_' + (process.env.META_AD_ACCOUNT_ID || env.META_AD_ACCOUNT_ID || 'act_1010212779716757').replace(/^act_/, '');
const LARGADA = '2026-11-26', ACAO = 'offsite_conversion.fb_pixel_custom';

// nomes EXATOS da aba "o time" (é por eles que a página acha a foto)
const PESSOAS = [
  ['amanda', ['Amanda'], [1203]],
  ['ana-maria', ['Ana Maria'], [1221]],
  ['bela-bicalho', ['Bela Bicalho'], [1211, 1228]],
  ['belinha-e-caio', ['Belinha Assis', 'Caio Batista'], [1220]],
  ['bia-junqueira', ['Bia Junqueira'], [1227, 1230, 1231, 1232]],
  ['bia-schuab', ['Bia Schuab'], [1204]],
  ['carol-ciocci', ['Carol Ciocci'], [1202]],
  ['eduardo-kaloustian', ['Eduardo Kaloustian'], [1197, 1199, 1201]],
  ['gabi-busse', ['Gabi Busse'], [1210]],
  ['gi-guimaraes', ['Gi Guimarães'], [1196, 1198]],
  ['gui-brandao', ['Gui Brandão'], [1217]],
  ['gustavo-gomes', ['Gustavão'], [1218]],
  ['gustavo-maroca', ['Gustavo Maroca'], [1207, 1208, 1209]],
  ['gustavo-paulista', ['Gustavo Paulista'], [1206]],
  ['hernane', ['Hernane'], [1212]],
  ['joao-pedro-nogueira', ['João Pedro Nogueira'], [1229]],
  ['leo-cruz', ['Leo Cruz'], [1205]],
  ['mauricio-mendes', ['Maurício Mendes'], [1215]],
  ['nina-von-sohsten', ['Nina von Sohsten'], [1194]],
  ['pedro-money', ['Pedro Money'], [1214]],
  ['rafa-chantre', ['Rafa Chantre'], [1219]],
  ['rafael-mizrahy', ['Rafael Mizrahy'], [1213]],
  ['samuel-vasconcelos', ['Samuel Vasconcelos'], [1195, 1200]],
  ['tchela', ['Tchela'], [1216]],
];
const dono = {}; for (const [id, , ads] of PESSOAS) for (const n of ads) dono[n] = id;

const hojeBR = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const dias = []; for (let d = new Date(LARGADA + 'T12:00:00Z'); d.toISOString().slice(0, 10) <= hojeBR; d.setUTCDate(d.getUTCDate() + 1)) dias.push(d.toISOString().slice(0, 10));

let url = `https://graph.facebook.com/v23.0/${ACT}/insights?` + new URLSearchParams({
  level: 'ad', fields: 'ad_name,actions', time_increment: '1', limit: '500',
  time_range: JSON.stringify({ since: LARGADA, until: hojeBR }), access_token: TK });
const porDia = {};   // pessoa -> dia -> conversões
const vistos = {};
while (url) {
  const j = await (await fetch(url)).json();
  if (j.error) throw new Error(j.error.message);
  for (const r of j.data || []) {
    const n = +((/^AD\s*(\d{3,4})(?!\d)/i.exec(r.ad_name || '') || [])[1]);
    const p = dono[n]; if (!p) continue;
    const conv = +((r.actions || []).find(a => a.action_type === ACAO)?.value || 0);
    ((porDia[p] ||= {})[r.date_start] ||= 0); porDia[p][r.date_start] += conv;
    vistos[r.ad_name] = (vistos[r.ad_name] || 0) + conv;
  }
  url = j.paging?.next || null;
}
const pessoas = PESSOAS.map(([id, nomes, ads]) => {
  let acc = 0; const serie = dias.map(d => (acc += (porDia[id]?.[d] || 0)));
  return { id, nomes, ads, serie };
});
const saida = { atualizadoEm: new Date().toISOString(), dias: dias.map(d => d.slice(8, 10) + '/' + d.slice(5, 7)), pessoas };
fs.writeFileSync(path.join(aqui, 'corrida.json'), JSON.stringify(saida));
console.log('corrida.json:', dias.length, 'dia(s)');
for (const p of pessoas.slice().sort((a, b) => b.serie.at(-1) - a.serie.at(-1))) console.log(String(p.serie.at(-1)).padStart(6), p.nomes.join(' & '));
console.log('\nanúncios com entrega:', Object.keys(vistos).length ? Object.entries(vistos).map(([k, v]) => `${k}=${v}`).join(', ') : 'nenhum ainda');
