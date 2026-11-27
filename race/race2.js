/* ---------- prévia #nova (bloco separado: se falhar, a corrida atual não é afetada) ----------
   Pista única com todo mundo: zoom no líder (a régua vai até um pouco à frente de quem lidera; a chegada
   aparece quando alguém se aproxima de 1.000) e pelotão (quem tem números parecidos vai para outra fileira).
   Usa as variáveis da página: CORRIDA, CONFIG, time, parts, membroDoTime, rostoHtml, esc, mil, hashId, PELAGENS. */
(function(){
var MAXES=[100,150,200,250,300,400,500,600,750,1000];
function escalaMax(lider,meta){var alvo=Math.max(80,lider*1.2);for(var i=0;i<MAXES.length;i++)if(MAXES[i]>=alvo)return Math.min(MAXES[i],meta);return meta}
function cavalo2(cor,id){
  var P=PELAGENS[(hashId(id)>>>3)%PELAGENS.length],c=P[0],s=P[1],m=P[2],f=P[3];
  var perna=function(cls,x,tom){return '<g class="'+cls+'"><rect x="'+(x-3)+'" y="58" width="6" height="22" rx="3" fill="'+tom+'"/><rect x="'+(x-4.2)+'" y="77" width="8.4" height="5" rx="2" fill="#1a1a1a"/></g>'};
  return '<svg viewBox="0 0 100 90" aria-hidden="true"><g class="eq2">'+
    '<path d="M22 46 C8 42 4 58 10 72 C13 63 16 58 21 57 C18 64 20 70 24 74 C25 64 26 56 29 52 Z" fill="'+m+'"/>'+        // rabo
    perna("pb",31,s)+perna("pa",58,s)+                                                                                  // pernas de trás
    '<ellipse cx="45" cy="54" rx="25" ry="14" fill="'+c+'"/>'+                                                         // corpo
    '<path d="M24 46 Q45 36 66 46 L66 60 Q45 70 24 60 Z" fill="'+cor+'"/>'+                                             // camisa
    '<path d="M24 46 Q45 36 66 46 L66 49 Q45 40 24 49 Z" fill="#fff" opacity=".35"/>'+                                  // gola/brilho
    '<path d="M58 47 Q64 34 70 26 L80 30 Q72 42 66 56 Z" fill="'+c+'"/>'+                                               // pescoço
    perna("pa",36,c)+perna("pb",63,c)+                                                                                  // pernas da frente
    // cabeça de frente (olhando para quem vê)
    '<path d="M64 4 L67 15 L72 11 Z" fill="'+c+'"/><path d="M65.5 7 L67.4 13.5 L70.4 11.2 Z" fill="'+f+'"/>'+         // orelha esq.
    '<path d="M92 4 L89 15 L84 11 Z" fill="'+c+'"/><path d="M90.5 7 L88.6 13.5 L85.6 11.2 Z" fill="'+f+'"/>'+         // orelha dir.
    '<ellipse cx="78" cy="20" rx="13.5" ry="13" fill="'+c+'"/>'+                                                       // testa
    '<path d="M71 9 Q74 2 78 7 Q81 1 85 8 Q82 9 80 12 Q78 9 76 12 Q74 9 71 9 Z" fill="'+m+'"/>'+                        // topete
    '<ellipse cx="78" cy="32" rx="11.5" ry="8.5" fill="'+f+'"/>'+                                                      // focinho
    '<ellipse cx="73.5" cy="30" rx="1.4" ry="1" fill="'+m+'"/><ellipse cx="82.5" cy="30" rx="1.4" ry="1" fill="'+m+'"/>'+ // narinas
    '<path d="M71 33.5 Q78 41 85 33.5 Q78 36.5 71 33.5 Z" fill="#5a1f1f"/>'+                                            // boca sorrindo
    '<rect x="75.6" y="34.6" width="2.3" height="3" rx=".6" fill="#fff"/><rect x="78.1" y="34.6" width="2.3" height="3" rx=".6" fill="#fff"/>'+ // dentões
    '<circle cx="72.5" cy="18" r="4.6" fill="#fff"/><circle cx="83.5" cy="18" r="4.6" fill="#fff"/>'+                   // olhos
    '<circle cx="73.2" cy="18.8" r="2.4" fill="#111"/><circle cx="82.8" cy="18.8" r="2.4" fill="#111"/>'+
    '<circle cx="73.9" cy="17.9" r=".8" fill="#fff"/><circle cx="83.5" cy="17.9" r=".8" fill="#fff"/>'+
    '<ellipse cx="68" cy="25" rx="2.2" ry="1.3" fill="#ff7a7a" opacity=".45"/><ellipse cx="88" cy="25" rx="2.2" ry="1.3" fill="#ff7a7a" opacity=".45"/>'+ // bochechas
    '</g></svg>';
}
var nos={},rolouInicio=false,arrastoLigado=false;
// posição com empate dividido (18, 18, 18 ficam todos na mesma casa): ninguém "sobe" por ordem alfabética
function posicoes(lista,campo){var r={};lista.forEach(function(x){var acima=0;lista.forEach(function(y){if(y[campo]>x[campo])acima++});r[x.id]=acima+1});return r}
function ligarArrasto(sc){
  if(arrastoLigado)return;arrastoLigado=true;
  var ini=null;
  sc.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse"||e.button!==0)return;ini={x:e.clientX,s:sc.scrollLeft};sc.classList.add("arrastando")});
  window.addEventListener("pointermove",function(e){if(!ini)return;sc.scrollLeft=ini.s-(e.clientX-ini.x)});
  window.addEventListener("pointerup",function(){if(!ini)return;ini=null;sc.classList.remove("arrastando")});
  sc.addEventListener("keydown",function(e){if(e.key==="ArrowRight")sc.scrollLeft+=200;else if(e.key==="ArrowLeft")sc.scrollLeft-=200});
}
function fotoDe(x){
  var m=x.membros[0];
  return x.membros.length>1?'<span class="dupla">'+x.membros.map(function(mm){return rostoHtml({nome:mm.nome,id:mm.id,recorteId:mm.recorteId,fotoId:mm.fotoId,demo:!mm.id})}).join("")+'</span>':rostoHtml({nome:m.nome,id:m.id,recorteId:m.recorteId,fotoId:m.fotoId,demo:!m.id});
}
function renderNova(){
  var bando=document.getElementById("n-bando");if(!bando||!CORRIDA||!CORRIDA.pessoas||!CORRIDA.pessoas.length)return;
  var meta=CONFIG.meta||1000;
  var rows=CORRIDA.pessoas.map(function(p){
    var membros=p.nomes.map(membroDoTime),s=(p.serie||[]).map(Number),v=s.length?s[s.length-1]:0,ontem=s.length>1?s[s.length-2]:null;
    return{id:p.id,membros:membros,nome:membros.length>1?membros.map(function(m){return primeiro(m.nome)}).join(" & "):membros[0].nome,v:v,ontem:ontem};
  }).sort(function(a,b){return b.v-a.v||a.nome.localeCompare(b.nome,"pt-BR")});
  var pos=posicoes(rows,"v"),temOntem=rows.some(function(x){return x.ontem!=null}),posOntem=temOntem?posicoes(rows,"ontem"):null;
  // placar
  var ph=['<span class="vivo">ao vivo</span>'];
  if(CORRIDA.atualizadoEm){
    // a rotina republica no minuto 40 de cada hora e leva ~2-5 min: a próxima versão chega por volta do minuto 45
    var prox=new Date();prox.setMinutes(45,0,0);if(prox<=new Date())prox.setHours(prox.getHours()+1);
    var fimC=dia(CONFIG.fim);if(fimC)fimC.setHours(23,59,59,0);
    ph.push('<span>atualizado em '+esc(new Date(CORRIDA.atualizadoEm).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}))+
      (fimC&&new Date()>fimC?'':' · próxima atualização por volta das '+esc(prox.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})))+'</span>');
  }
  document.getElementById("n-placar").innerHTML=ph.join("");
  // pista inteira, de 0 a 1.000, em escala fixa: arrasta para os lados para ver todo mundo
  var sc=document.getElementById("n-scroll"),turfe=document.getElementById("n-turfe"),vw=sc.clientWidth,visivel=vw>0;
  if(!visivel)vw=900;
  var cel=vw<600,cw=cel?72:104,ch=cw*.9,FILAS=cel?8:7,filaH=cel?56:82,topo=cel?28:36;
  var ppl=cel?7:10;                                   // pixels por leitor
  var compr=cw+meta*ppl+(cel?120:160);
  turfe.style.width=compr+"px";
  var H=topo+FILAS*filaH+ch-filaH+30;turfe.style.setProperty("--th",H+"px");
  var xDe=function(v){return Math.min(v,meta)*ppl},bico=cw*.62;
  var marcas=[];for(var m=100;m<meta;m+=100)marcas.push(m);
  document.getElementById("n-marcas").innerHTML=marcas.map(function(m){return '<span style="left:'+(xDe(m)+bico)+'px"><b>'+mil(m)+'</b></span>'}).join("");
  var cheg=document.getElementById("n-chegada");cheg.className="turfe-chegada";cheg.style.left=(xDe(meta)+bico)+"px";cheg.innerHTML='<b>🏁 '+mil(meta)+' = 3 latas</b>';
  document.getElementById("n-escala").innerHTML='<span class="dica">↔ arraste a pista para os lados</span> para ver todo mundo, da largada até a chegada';
  document.getElementById("n-meta").textContent="🏁 "+mil(meta)+" leitores = 3 latas";
  ligarArrasto(sc);
  // pelotão: cada cavalo vai para a fileira onde fica mais longe do último cavalo daquela fileira
  var ultimo=[],gap=cel?cw*1.15:140;for(var r=0;r<FILAS;r++)ultimo.push(-1e9);
  var vivos={},placas=[];
  rows.forEach(function(x,i){
    var px=xDe(x.v),melhor=0,dist=-1;
    for(var r=0;r<FILAS;r++){var d=Math.abs(ultimo[r]-px);if(d>=gap){melhor=r;dist=1e9;break}if(d>dist){dist=d;melhor=r}}
    ultimo[melhor]=px;
    var esc_=.84+.16*(melhor/(FILAS-1)),y=topo+melhor*filaH;
    var el=nos[x.id];
    if(!el){
      el=document.createElement("div");el.className="ch";el.tabIndex=0;
      el.innerHTML=cavalo2(corCavalo(x.id),x.id)+'<span class="escudo"></span><span class="placa"></span>';
      el.style.transform="translate(0px,"+y+"px) scale("+esc_+")";
      bando.appendChild(el);nos[x.id]=el;
      requestAnimationFrame(function(){requestAnimationFrame(function(){el.style.transform=el.dataset.t})});
    }
    el.style.setProperty("--cw",cw+"px");
    el.style.zIndex=(i<5?60:10)+melhor;
    el.dataset.t="translate("+px+"px,"+y+"px) scale("+esc_+")";
    el.style.transform=el.dataset.t;
    el.classList.toggle("top",i<5);el.classList.toggle("top1",i===0&&x.v>0);
    var foto=fotoDe(x),esc0=el.querySelector(".escudo");if(esc0.dataset.f!==foto){esc0.innerHTML=foto;esc0.dataset.f=foto}
    el.querySelector(".placa").innerHTML=esc(x.nome)+'<i>'+mil(x.v)+'</i>';
    el.setAttribute("aria-label",x.nome+": "+mil(x.v)+" leitores");
    if(i<5)placas.push('<span class="placa-fixa'+(i===0&&x.v>0?' p1':'')+'" style="transform:translate('+(px+cw/2)+'px,'+(y+ch*esc_+2)+'px) translateX(-50%)">'+esc(x.nome)+'<i>'+mil(x.v)+'</i></span>');
    vivos[x.id]=1;
  });
  Object.keys(nos).forEach(function(id){if(!vivos[id]){nos[id].remove();delete nos[id]}});
  var camada=document.getElementById("n-placas");
  if(!camada){camada=document.createElement("div");camada.id="n-placas";camada.className="turfe-placas";turfe.appendChild(camada)}
  camada.innerHTML=placas.join("");
  // na primeira vez que a pista aparece, ela abre mostrando o líder perto da direita (o resto fica para trás, arrastando)
  if(visivel&&!rolouInicio){rolouInicio=true;sc.scrollLeft=Math.max(0,xDe(rows[0].v)+cw+40-vw*.8)}
  // lista com todo mundo + setinhas em relação ao fim de ontem
  var lista=document.getElementById("n-lista");lista.style.setProperty("--linhas",Math.ceil(rows.length/2));
  lista.innerHTML=rows.map(function(x){
    var mov='<span class="mov"></span>';
    if(posOntem&&x.ontem!=null){var d=posOntem[x.id]-pos[x.id];
      mov=d>0?'<span class="mov sobe" title="subiu '+d+' '+(d===1?'casa':'casas')+' desde ontem">▲'+d+'</span>':d<0?'<span class="mov desce" title="desceu '+(-d)+' '+(d===-1?'casa':'casas')+' desde ontem">▼'+(-d)+'</span>':'<span class="mov igual" title="mesma posição de ontem">–</span>'}
    return '<li><span class="n">'+pos[x.id]+'</span><span class="r">'+fotoDe(x)+'</span><span class="q"><b>'+esc(x.nome)+'</b><span class="bar"><i style="width:'+(Math.min(1,x.v/meta)*100).toFixed(1)+'%"></i></span></span>'+
      mov+'<span class="v"><b>'+mil(x.v)+'</b><span>'+(x.v>=meta?'bateu a meta ✓':'faltam '+mil(meta-x.v))+'</span></span></li>';
  }).join("");
  var total=rows.reduce(function(a,x){return a+x.v},0);
  document.getElementById("n-total").innerHTML=esc(rows.length+" corredores · "+mil(total)+" leitores no total")+(posOntem?' <span class="leg">▲▼ posição em relação ao fim de ontem</span>':'');
}
window.renderNova=renderNova;
var original=renderCorrida;
renderCorrida=function(){original.apply(this,arguments);try{renderNova()}catch(e){}};
try{renderNova()}catch(e){}
var t=null;window.addEventListener("resize",function(){clearTimeout(t);t=setTimeout(function(){try{renderNova()}catch(e){}},150)});
window.addEventListener("hashchange",function(){if(!location.hash||location.hash==="#corrida"||location.hash==="#nova")setTimeout(function(){try{renderNova()}catch(e){}},30)});
})();
