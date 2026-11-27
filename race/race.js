/* ---------- a corrida ----------
   Os números vêm do bloco CORRIDA abaixo, que é regravado a cada atualização (pixel do Meta por anúncio,
   somando todas as campanhas). As fotos vêm da lista do time, pelo nome. */
var CORRIDA=/*CORRIDA-INICIO*/{"atualizadoEm":null,"dias":[],"pessoas":[]}/*CORRIDA-FIM*/;
var DEMO={dias:["01/12","02/12","03/12","04/12","05/12","06/12","07/12","08/12"],gente:[
  ["Ana Souza",[0,180,420,700,1050,1420,1800,2150]],
  ["Bruno Lima",[0,260,520,760,980,1260,1640,1980]],
  ["Carla Mendes",[0,120,300,560,820,1020,1260,1480]],
  ["Diego Rocha",[0,220,380,520,700,860,980,1120]],
  ["Elisa Prado",[0,90,200,330,450,620,760,890]],
  ["Felipe Tavares",[0,60,150,240,330,410,520,610]]]};
function membroDoTime(nome){
  var q=norm(nome),t=time.filter(function(x){return norm(x.nome)===q})[0];
  if(!t){var p=q.split(/\s+/);t=time.filter(function(x){var n=norm(x.nome);return n.indexOf(p[0])===0&&(p.length<2||n.indexOf(p[p.length-1])>-1)})[0]}
  if(!t)return{nome:nome};
  var part=parts.filter(function(x){return x.pessoa===t.id})[0]||null;
  return{nome:t.nome,id:part?part.id:(t.uid||("t-"+t.id)),recorteId:t.recorteId||(part&&part.recorteId),fotoId:part&&part.fotoId};
}
function rotulo(nomes){return nomes.length>1?nomes.map(primeiro).join(" & "):nomes[0]}
function dadosCorrida(){
  var temReal=CORRIDA&&CORRIDA.pessoas&&CORRIDA.pessoas.length;
  if(previa||!temReal)return{demo:true,dias:DEMO.dias,rows:DEMO.gente.map(function(g,i){return{id:"d"+i,demo:true,nomes:[g[0]],nome:g[0],membros:[{nome:g[0]}],serie:g[1].map(function(v){return Math.round(v/2)})}})};
  return{demo:false,dias:CORRIDA.dias||[],rows:CORRIDA.pessoas.map(function(p){
    var membros=p.nomes.map(membroDoTime);
    return{id:p.id,nomes:p.nomes,nome:rotulo(membros.map(function(m){return m.nome})),membros:membros,ads:p.ads,serie:(p.serie||[]).map(Number)};
  })};
}
function rostoDe(r){
  if(r.membros&&r.membros.length>1)return '<span class="dupla">'+r.membros.map(function(m){return rostoHtml({nome:m.nome,id:m.id,recorteId:m.recorteId,fotoId:m.fotoId,demo:!m.id})}).join("")+'</span>';
  var m=(r.membros&&r.membros[0])||{nome:r.nome};
  return rostoHtml({nome:m.nome,id:m.id,recorteId:m.recorteId,fotoId:m.fotoId,demo:!m.id});
}
var pista={lanes:{},rodando:false,timer:null,todos:false},LH=92,VISIVEIS=12;
var CORES_CAV=["#FFCD00","#FF8E42","#6A98FF","#00BF63","#F742A1","#2AA0A7","#f2f2f2","#C49A00"];
function hashId(id){var h=0;String(id).split("").forEach(function(c){h=(h*31+c.charCodeAt(0))>>>0});return h}
function corCavalo(id){return CORES_CAV[hashId(id)%CORES_CAV.length]}
// cavalo de desenho animado: pelagem (corpo, sombra, crina, focinho) varia por pessoa; a manta leva a cor da pessoa
var PELAGENS=[["#9A5B2E","#7A4521","#3B2414","#C98A5E"],["#B5713A","#8E5528","#4A2C16","#E0A878"],["#6B4226","#53321C","#24160C","#9C6B4A"],
  ["#3A2B22","#2A1F18","#0F0B08","#6A5548"],["#EDE3D3","#CDBFA9","#8A7A66","#F7EFE3"],["#C9A27A","#A9845F","#5C4430","#E6C7A5"]];
function cavaloSvg(cor,id){
  var P=PELAGENS[(hashId(id||cor)>>>3)%PELAGENS.length],c=P[0],s=P[1],m=P[2],f=P[3];
  var perna=function(cls,x1,y1,x2,y2,tom){return '<g class="'+cls+'"><path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="'+tom+'" stroke-width="5.5" stroke-linecap="round"/><rect x="'+(x2-3.4)+'" y="'+(y2-1)+'" width="6.8" height="4" rx="1.6" fill="#1c1c1c"/></g>'};
  return '<svg class="eq" viewBox="0 0 100 70" aria-hidden="true">'+
    '<path d="M25 31 C11 27 6 42 11 55 C13 47 17 42 22 41 C19 47 20 52 23 56 C25 47 26 40 29 36 Z" fill="'+m+'"/>'+   // rabo
    perna("p4",30,44,27,62,s)+perna("p2",58,44,61,62,s)+                                                              // pernas de trás (longe)
    '<ellipse cx="46" cy="37" rx="25" ry="12.5" fill="'+c+'"/>'+                                                        // corpo
    '<ellipse cx="44" cy="30" rx="15" ry="3.2" fill="#fff" opacity=".16"/>'+                                            // brilho
    '<path d="M60 33 L69 11 Q76 4 83 9 L75 41 Z" fill="'+c+'"/>'+                                                       // pescoço
    '<path d="M71 9 Q80 1 90 9 Q97 15 94 21 Q91 24 85 22 L76 19 Z" fill="'+c+'"/>'+                                    // cabeça
    '<ellipse cx="91.5" cy="18.5" rx="4.6" ry="3.6" fill="'+f+'"/><circle cx="92.8" cy="17.6" r=".9" fill="'+m+'"/>'+   // focinho
    '<path d="M74 7 L75.5 -1 L80 6 Z" fill="'+c+'"/><path d="M75.4 5.6 L76 1.4 L78.2 5.2 Z" fill="'+f+'"/>'+            // orelha
    '<path d="M70.5 5 Q62 13 59 31 L65 29 Q67 18 72 12 Q71 9 76 6 Z" fill="'+m+'"/>'+                                   // crina
    '<path d="M74 5 Q78 1 82 4 Q78 4 77 8 Z" fill="'+m+'"/>'+                                                           // topete
    '<circle cx="82.5" cy="11.5" r="2.5" fill="#fff"/><circle cx="83.3" cy="11.8" r="1.4" fill="#111"/><circle cx="83.7" cy="11.2" r=".45" fill="#fff"/>'+ // olho
    '<path d="M33 25.5 H59 Q61.5 25.5 61.5 28 V43.5 Q61.5 46 59 46 H33 Q30.5 46 30.5 43.5 V28 Q30.5 25.5 33 25.5 Z" fill="'+cor+'"/>'+ // manta
    '<rect x="30.5" y="39.5" width="31" height="2.6" fill="#fff" opacity=".75"/><rect x="30.5" y="25.5" width="31" height="3" fill="#000" opacity=".12"/>'+
    perna("p3",35,45,33,63,c)+perna("p1",63,43,65,63,c)+                                                              // pernas da frente (perto)
    '</svg>';
}
function valorEm(r,k){if(k==null)return r.ult;if(!r.serie.length)return 0;return Number(r.serie[Math.min(k,r.serie.length-1)])||0}
function ordenar(rows,k){return rows.map(function(r){return{r:r,v:valorEm(r,k)}}).sort(function(a,b){return b.v-a.v||String(a.r.nome).localeCompare(String(b.r.nome),"pt-BR")})}
function desenharMarcas(meta){
  $("marcas").innerHTML=[.25,.5,.75,1].map(function(f){return '<span style="left:calc((100% - 100px) * '+f+' + 50px)">'+(f===1?"🏁 "+mil(meta):mil(meta*f))+'</span>'}).join("");
}
function desenharPodio(vs,meta){
  var top=vs.slice(0,3);
  $("podio").innerHTML=top.map(function(x,i){
    var r=x.r,p=Math.min(1,x.v/meta),ganhou=x.v>=meta;
    return '<div class="pod p'+(i+1)+(ganhou?' ganhou':'')+'"><span class="pos">'+(i+1)+'º</span><div class="rosto">'+rostoDe(r)+'</div><b>'+esc(r.nome)+'</b>'+
      '<span class="num">'+mil(x.v)+'<small>leitores</small></span><span class="barra"><i style="width:'+(p*100).toFixed(1)+'%"></i></span>'+
      '<span class="falta">'+(ganhou?'bateu a meta ✓ garantiu as latas':'faltam '+mil(meta-x.v))+'</span></div>';
  }).join("");
}
function desenharPista(rows,meta,k,dias){
  var box=$("faixas");if(!box)return;
  var vs=ordenar(rows,k);
  var vis=(pista.todos||pista.rodando)?vs:vs.slice(0,VISIVEIS),ids={};
  $("pista").style.height=(vis.length*LH)+"px";
  $("pista-dia").textContent=k==null?"":"dia "+(dias[k]||(k+1));
  var bt=$("ver-todos");
  if(vs.length>VISIVEIS&&!pista.rodando){bt.hidden=false;bt.textContent=pista.todos?"mostrar só o top "+VISIVEIS:"ver todo mundo ("+vs.length+")";bt.onclick=function(){pista.todos=!pista.todos;renderCorrida()}}else bt.hidden=true;
  vis.forEach(function(x,i){
    var r=x.r,id=String(r.id);ids[id]=1;
    var L=pista.lanes[id];
    if(!L){
      var el=document.createElement("div");el.className="pf";el.style.setProperty("--lh",LH+"px");
      var cor=corCavalo(id);
      el.innerHTML='<div class="nome"><span class="n"></span><b></b><i></i></div><div class="trilho">'+
        [.25,.5,.75].map(function(f){return '<span class="guia" style="left:calc((100% - 100px) * '+f+' + 50px)"></span>'}).join("")+
        '<span class="rastro" style="--cor:'+cor+'"></span><div class="cav" style="--p:0"><span class="piloto"></span>'+cavaloSvg(cor,id)+'</div></div>';
      el.style.transform="translateY("+(i*LH)+"px)";
      box.appendChild(el);
      L={el:el,n:el.querySelector(".nome .n"),nome:el.querySelector(".nome b"),pts:el.querySelector(".nome i"),cav:el.querySelector(".cav"),rastro:el.querySelector(".rastro"),piloto:el.querySelector(".piloto"),foto:"",p:-1,t:null};
      pista.lanes[id]=L;
    }
    L.el.style.transform="translateY("+(i*LH)+"px)";
    L.el.classList.toggle("lider",i===0&&x.v>0);
    L.el.classList.toggle("ganhou",x.v>=meta);
    L.n.textContent=(i+1);
    L.nome.textContent=r.nome;L.nome.title=r.nome;
    L.pts.textContent=mil(x.v)+(x.v>=meta?" ✓ bateu":" leitores");
    var h=rostoDe(r);if(h!==L.foto){L.piloto.innerHTML=h;L.foto=h}
    var p=Math.min(1,x.v/meta);
    if(Math.abs(p-L.p)>0.0005){
      var anim=L.p>=0;L.p=p;
      if(anim){L.cav.classList.add("correndo");clearTimeout(L.t);L.t=setTimeout(function(){L.cav.classList.remove("correndo")},1100)}
      (function(L,p){requestAnimationFrame(function(){requestAnimationFrame(function(){L.cav.style.setProperty("--p",p);L.rastro.style.setProperty("--p",p)})})})(L,p);
    }
  });
  Object.keys(pista.lanes).forEach(function(id){if(!ids[id]){pista.lanes[id].el.remove();delete pista.lanes[id]}});
  return vs;
}
function linhas(D){return D.rows.map(function(r){r.ult=r.serie.length?r.serie[r.serie.length-1]:0;return r})}
function reverCorrida(){
  var D=dadosCorrida(),meta=CONFIG.meta||1000,dias=D.dias,rows=linhas(D);
  var n=rows.reduce(function(m,r){return Math.max(m,r.serie.length)},0);
  if(pista.rodando){pararReplay();return}
  if(n<2)return;
  pista.rodando=true;var k=0;
  renderCorrida();
  desenharPodio(desenharPista(rows,meta,0,dias),meta);
  pista.timer=setInterval(function(){k++;if(k>=n){pararReplay();return}desenharPodio(desenharPista(rows,meta,k,dias),meta)},1100);
}
function pararReplay(){clearInterval(pista.timer);pista.rodando=false;renderCorrida()}
function renderCorrida(){
  if(!$("faixas"))return;
  var D=dadosCorrida(),meta=CONFIG.meta||1000,dias=D.dias,rows=linhas(D);
  var semDados=!D.demo&&!rows.some(function(r){return r.ult>0});
  var ph=[];
  if(D.demo)ph.push('<span class="selo">prévia com dados de exemplo</span>');
  else if(semDados)ph.push('<span class="selo">aguardando a largada</span>');
  else ph.push('<span class="vivo">ao vivo</span>');
  if(!D.demo&&CORRIDA.atualizadoEm){
    // a rotina republica no minuto 40 de cada hora e leva ~2-5 min: a próxima versão chega por volta do minuto 45
    var prox=new Date();prox.setMinutes(45,0,0);if(prox<=new Date())prox.setHours(prox.getHours()+1);
    var fimCorrida=dia(CONFIG.fim);if(fimCorrida)fimCorrida.setHours(23,59,59,0);
    ph.push('<span>atualizado em '+esc(new Date(CORRIDA.atualizadoEm).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}))+
      (fimCorrida&&new Date()>fimCorrida?'':' · próxima atualização por volta das '+esc(prox.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})))+'</span>');
  }
  if(CORRIDA&&CORRIDA.pessoas&&CORRIDA.pessoas.length&&!semDados)ph.push('<button id="bt-previa">'+(previa?"voltar para a corrida real":"ver prévia")+'</button>');
  var nDias=rows.reduce(function(m,r){return Math.max(m,r.serie.length)},0);
  if(nDias>1)ph.push('<button id="bt-replay">'+(pista.rodando?"■ parar":"▶ rever a corrida")+'</button>');
  $("placar").innerHTML=ph.join("");
  var b=$("bt-previa");if(b)b.onclick=function(){previa=!previa;pista.lanes={};$("faixas").innerHTML="";renderCorrida()};
  var rp=$("bt-replay");if(rp)rp.onclick=reverCorrida;
  desenharMarcas(meta);
  if(!pista.rodando){var vs=desenharPista(rows,meta,null,dias);if(semDados)$("podio").innerHTML="";else desenharPodio(vs,meta)}
  var bateram=rows.filter(function(r){return r.ult>=meta}).length,total=rows.reduce(function(a,r){return a+r.ult},0);
  $("resumo").innerHTML='<div><b>'+mil(total)+'</b><span>leitores trazidos pelo time</span></div><div><b>'+bateram+'</b><span>'+(bateram===1?"pessoa já bateu":"pessoas já bateram")+' a meta</span></div><div><b>'+rows.length+'</b><span>'+(rows.length===1?"corredor":"corredores")+' na pista</span></div>';
}

