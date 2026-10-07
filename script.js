const canvas=document.getElementById('water'),ctx=canvas.getContext('2d');
let W,H,dpr=1,t=0;
const state={quality:38,life:28,care:0,recycle:0,save:0,pollute:0,actions:0,bossHP:1000,bossMaxHP:1000,bossPhase:1,dead:false,paint:0};
const actions={
 care:{q:10,l:7,msg:'El agua responde: una zona contaminada comienza a recuperarse.'},
 recycle:{q:5,l:3,msg:'Los residuos comienzan a desaparecer y la vida regresa.'},
 save:{q:5,l:4,msg:'El agua recupera su transparencia y vuelve a circular.'},
 pollute:{q:-15,l:-12,msg:'El agua guarda esta huella. La contaminación permanece.'}
};
const particles=[];
function resize(){
 dpr=Math.min(devicePixelRatio||1,2); W=canvas.clientWidth;H=canvas.clientHeight;
 canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize',resize); resize();

function level(){
 const q=state.quality;
 if(q>=80)return ['Agua viva','El ecosistema respira.'];
 if(q>=60)return ['Alteración','Las primeras huellas empiezan a aparecer.'];
 if(q>=40)return ['Contaminación','La memoria comienza a pesar.'];
 if(q>=20)return ['Crisis','La vida se retira y el agua se oscurece.'];
 return ['Memoria perdida','El agua recuerda nuestras decisiones.'];
}
function draw(){
 t+=.012;
 const q=state.quality, bad=1-q/100;
 ctx.clearRect(0,0,W,H);
 // water gradient
 const g=ctx.createLinearGradient(0,0,0,H);
 g.addColorStop(0,`rgba(${25+80*bad},${145-90*bad},${190-150*bad},.98)`);
 g.addColorStop(1,`rgba(${3+45*bad},${65-45*bad},${85-70*bad},1)`);
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 // moving waves
 for(let j=0;j<7;j++){
   ctx.beginPath();
   const y=H*(.25+j*.11);
   for(let x=0;x<=W;x+=8){
     const yy=y+Math.sin(x*.012+t*(1.2-j*.08)+j)* (5+bad*7);
     if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
   }
   ctx.strokeStyle=`rgba(180,245,255,${.10+.06*(1-bad)})`;ctx.lineWidth=1.5;ctx.stroke();
 }
 // plants
 const plants=Math.floor(5+(1-bad)*13);
 for(let i=0;i<plants;i++){
   const x=(i+1)*W/(plants+1)+Math.sin(i*4)*8, base=H*.91, h=35+(1-bad)*75;
   ctx.strokeStyle=`rgba(80,210,145,${.3+.5*(1-bad)})`;ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(x,base);ctx.quadraticCurveTo(x-12,base-h*.55,x,base-h);ctx.stroke();
   for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(x+(k%2?10:-10),base-h*(.3+.2*k),8,3,k%2?-.5:.5,0,Math.PI*2);ctx.fillStyle='rgba(80,190,145,.35)';ctx.fill();}
 }
 // fish
 const fish=Math.floor((1-bad)*9);
 for(let i=0;i<fish;i++){
   const x=((i*173+t*70)% (W+80))-40, y=H*(.45+.25*Math.sin(i*2.3));
   ctx.fillStyle='rgba(225,250,255,.7)';ctx.beginPath();ctx.ellipse(x,y,10,5,0,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x-18,y-6);ctx.lineTo(x-18,y+6);ctx.closePath();ctx.fill();
 }
 // visible contamination: oil slicks, plastic fragments and murky bubbles
 if(bad>.18){
   for(let i=0;i<Math.floor(4+bad*12);i++){
     const x=(i*137+t*8)%W, y=H*(.38+((i*71)%45)/100);
     ctx.fillStyle=`rgba(25,28,25,${.16+bad*.22})`;
     ctx.beginPath();ctx.ellipse(x,y,28+bad*35,6+bad*8,Math.sin(i),0,Math.PI*2);ctx.fill();
   }
   for(let i=0;i<Math.floor(5+bad*18);i++){
     const x=(i*83+t*12)%W, y=(i*47)%H;
     ctx.strokeStyle=`rgba(220,220,190,${.25+bad*.25})`;ctx.lineWidth=2;
     ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+9,y+7);ctx.lineTo(x+3,y+14);ctx.stroke();
   }
 }
 // pollution / luminous particles
 const count=25+Math.floor(bad*80);
 for(let i=0;i<count;i++){
   const x=(i*97+Math.sin(t+i)*18)%W,y=(i*53+t*25*(.5+bad))%H;
   const r=1+((i*7)%4);
   ctx.fillStyle=bad>.45?`rgba(150,120,90,${.18+bad*.35})`:`rgba(210,250,255,.18)`;
   ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 }
 // generative branches based on memory
 ctx.save();ctx.translate(W/2,H*.86);ctx.strokeStyle=`rgba(170,245,210,${.18+.55*(1-bad)})`;ctx.lineWidth=1.2;
 branch(0,0,70*(1-bad),-Math.PI/2,Math.min(5,2+Math.floor(state.care/2)),0);
 ctx.restore();
 requestAnimationFrame(draw);
}
function branch(x,y,len,a,depth,seed){
 if(depth<=0||len<3)return;
 const nx=x+Math.cos(a)*len,ny=y+Math.sin(a)*len;
 ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();
 branch(nx,ny,len*.7,a-.42,depth-1,seed+1);
 branch(nx,ny,len*.68,a+.48,depth-1,seed+2);
}
draw();


let villainTimer=null, dialogueTimer=null;
const villainLines=[
 "“Cada siete segundos, otra parte de este mar será mía.”",
 "“No puedes salvar lo que yo ya contaminé.”",
 "“¡Mira cómo se oscurece el agua!”",
 "“La basura es mi ejército.”",
 "“El mar está perdiendo su memoria.”",
 "“Sigue intentando repararlo… yo volveré.”"
];
const repairLines=[
 "“¡No! ¡Esa zona estaba bajo mi control!”",
 "“¡Deja de limpiar mi océano!”",
 "“La vida está regresando… esto no puede ser.”",
 "“¡Tu pequeña acción no será suficiente!”"
];
const bossDialogues = {
  1: {
    hit:["“¿Crees que unas plantas podrán detenerme?”","“Mira cómo cubro el agua de residuos.”","“Todavía controlo este océano.”"],
    phase:"FASE 1 · LA INVASIÓN", avatar:"🦑"
  },
  2: {
    hit:["“¡No! ¡La vida está regresando!”","“Entonces tendré que contaminar todavía más.”","“¡No permitiré que recuperes el mar!”"],
    phase:"FASE 2 · EL CONTRAATAQUE", avatar:"👹"
  },
  3: {
    hit:["“¡Mi contaminación se está desvaneciendo!”","“¡No puedes borrar todo lo que hice!”","“¡El océano no debería poder vencerme!”"],
    phase:"FASE 3 · ÚLTIMA RESISTENCIA", avatar:"☠️"
  }
};
document.getElementById("startButton").onclick=()=>{document.getElementById("startScreen").style.opacity="0";document.getElementById("startScreen").style.visibility="hidden";startVillain();};
function showBubble(text,side){
  const el=document.getElementById(side==='left'?'bubbleLeft':'bubbleRight');
  el.textContent=text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),3000);
}
function triggerGameOver(){
  if(state.dead && document.getElementById('gameover').classList.contains('show')) return;
  state.dead=true;
  clearInterval(villainTimer); clearInterval(dialogueTimer);
  document.getElementById('villain').classList.add('dying');
  document.getElementById('deathText').textContent='La contaminación alcanzó el 100%. El mar perdió toda su calidad.';
  document.getElementById('gameover').classList.add('show');
}
function resetBattle(newVillain=false){
  state.quality=38; state.life=28; state.care=0; state.recycle=0; state.save=0; state.pollute=0;
  state.actions=0; state.paint=0; state.bossHP=1000; state.bossMaxHP=1000; state.bossPhase=1; state.dead=false;
  strokes.length=0; pctx.clearRect(0,0,paintCanvas.clientWidth,paintCanvas.clientHeight);
  document.getElementById('bossPanel').classList.remove('dead');
  document.getElementById('villain').className='villain';
  document.getElementById('villain').style.transform='';
  document.getElementById('villain').style.filter='';
  document.getElementById('bossPhase').textContent='FASE 1 · LA INVASIÓN';
  document.getElementById('bossAvatar').textContent=newVillain?'👿':'🦑';
  document.getElementById('bossDialogue').textContent=newVillain?'“¡Un nuevo contaminador ha llegado!”':'“Este mar me pertenece. Convertiré cada gota en basura.”';
  document.getElementById('bossHp').style.width='100%';
  document.getElementById('gameover').classList.remove('show');
  document.getElementById('paintHint').classList.remove('hide');
  startVillain();
  update();
}
function startVillain(){
  if(villainTimer) clearInterval(villainTimer);
  if(dialogueTimer) clearInterval(dialogueTimer);
  villainTimer=setInterval(()=>{
    if(state.dead) return;
    state.quality=Math.max(0,state.quality-10);
    state.life=Math.max(0,state.life-7);
    document.getElementById('sceneTitle').textContent='¡Néxus ha contaminado el mar otra vez!';
    document.getElementById('sceneText').textContent='Cada siete segundos deja una nueva huella de contaminación.';
    showBubble(villainLines[Math.floor(Math.random()*villainLines.length)],Math.random()<.5?'left':'right');
    update();
    if(state.quality<=0) triggerGameOver();
  },4000);
  dialogueTimer=setInterval(()=>{
    if(state.dead) return;
    showBubble(villainLines[Math.floor(Math.random()*villainLines.length)],Math.random()<.5?'left':'right');
  },2200+Math.floor(Math.random()*1500));
}
startVillain();

function bossUpdate(k){
  if(state.dead) return;
  const damage = {care:0,recycle:0,save:0,pollute:0,paint:8}[k] || 0;
  state.bossHP=Math.max(0,Math.min(state.bossMaxHP,state.bossHP-damage));
  if(k==='pollute') state.bossHP=Math.min(100,state.bossHP+4);
  if(k!=='pollute' && !state.dead && k!=='paint'){
    const v=document.getElementById('villain');
    v.classList.remove('taking-hit'); void v.offsetWidth; v.classList.add('taking-hit');
    showBubble(repairLines[Math.floor(Math.random()*repairLines.length)],Math.random()<.5?'left':'right');
  }

  const hpPercent=state.bossHP/state.bossMaxHP*100;
  const nextPhase = hpPercent<=25 ? 3 : hpPercent<=60 ? 2 : 1;
  if(nextPhase!==state.bossPhase){
    state.bossPhase=nextPhase;
    const villain=document.getElementById('villain');
    villain.dataset.phase=nextPhase;
    if(nextPhase===2){ villain.style.transform='scale(1.18)'; villain.style.filter='drop-shadow(0 0 28px rgba(255,50,30,.55))'; }
    if(nextPhase===3){ villain.style.transform='scale(1.28)'; villain.style.filter='drop-shadow(0 0 36px rgba(255,180,70,.65))'; }
    const d=bossDialogues[nextPhase];
    document.getElementById('bossPhase').textContent=d.phase;
    document.getElementById('bossAvatar').textContent=d.avatar;
    document.getElementById('bossDialogue').textContent=d.hit[0];
    repairAnimation(true);
  } else {
    const d=bossDialogues[state.bossPhase];
    const arr=d.hit;
    document.getElementById('bossDialogue').textContent=arr[Math.floor(Math.random()*arr.length)];
  }
  if(state.bossHP<=0){
    state.dead=true;
    clearInterval(villainTimer); clearInterval(dialogueTimer);
    document.getElementById('villain').classList.add('dying');
    document.getElementById('bossPanel').classList.add('dead');
    document.getElementById('bossDialogue').textContent="“No… el mar… ha recuperado su memoria…”";
    document.getElementById('bossPhase').textContent="DERROTADO · EL MAR HA SIDO LIBERADO";
    document.getElementById('sceneTitle').textContent="Lo lograste. La vida vuelve al mar.";
    repairAnimation(true);
  }
  document.getElementById('bossHp').style.width=(state.bossHP/state.bossMaxHP*100)+'%';
}


const paintCanvas=document.getElementById('paintCanvas');
const pctx=paintCanvas.getContext('2d');
let painting=false,lastX=0,lastY=0,brushSize=20,paintMode='paint';
const strokes=[];
function resizePaint(){
  const r=paintCanvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
  paintCanvas.width=r.width*d;paintCanvas.height=r.height*d;pctx.setTransform(d,0,0,d,0,0);
}
window.addEventListener('resize',resizePaint); resizePaint();

function paintAt(x,y){
  const colors={care:[130,210,115],recycle:[55,170,255],save:[75,225,245],pollute:[225,70,55]};
  const c=colors[paintMode]||colors.save;
  const alpha=paintMode==='pollute'?.28:.42;
  strokes.push({x,y,size:brushSize,color:c,a:alpha,life:1});
  state.paint++;
  if(state.paint%12===0 && !state.dead){
    const effect=paintMode==='pollute'?-1.5:1.2;
    state.quality=Math.max(0,Math.min(100,state.quality+effect));
    state.life=Math.max(0,Math.min(100,state.life+(paintMode==='pollute'?-1.1:.9)));
    if(paintMode!=='pollute') bossUpdate('paint');
    update();
  }
}
function renderStrokes(){
  pctx.clearRect(0,0,paintCanvas.clientWidth,paintCanvas.clientHeight);
  for(let i=strokes.length-1;i>=0;i--){
    const s=strokes[i];
    s.life-=0.0018;
    if(s.life<=0){strokes.splice(i,1);continue}
    const [r,g,b]=s.color;
    const grad=pctx.createRadialGradient(s.x,s.y,1,s.x,s.y,s.size*2);
    grad.addColorStop(0,`rgba(${r},${g},${b},${s.a*s.life})`);
    grad.addColorStop(.45,`rgba(${r},${g},${b},${s.a*s.life*.45})`);
    grad.addColorStop(1,`rgba(${r},${g},${b},0)`);
    pctx.fillStyle=grad;pctx.beginPath();pctx.arc(s.x,s.y,s.size*2,0,Math.PI*2);pctx.fill();
  }
  requestAnimationFrame(renderStrokes);
}
renderStrokes();
function handlePaint(x,y){
  if(paintMode==='erase'){
    for(let i=strokes.length-1;i>=0;i--){
      if(Math.hypot(strokes[i].x-x,strokes[i].y-y)<brushSize*2.2) strokes.splice(i,1);
    }
  }else paintAt(x,y);
}
function pointerPos(e){
  const r=paintCanvas.getBoundingClientRect();
  return [e.clientX-r.left,e.clientY-r.top];
}
paintCanvas.addEventListener('pointerdown',e=>{
  painting=true;paintCanvas.setPointerCapture(e.pointerId);
  [lastX,lastY]=pointerPos(e); handlePaint(lastX,lastY);
  document.getElementById('paintHint').classList.add('hide');
});
paintCanvas.addEventListener('pointermove',e=>{
  if(!painting)return;
  const [x,y]=pointerPos(e);
  const dist=Math.hypot(x-lastX,y-lastY),steps=Math.max(1,Math.ceil(dist/7));
  for(let i=1;i<=steps;i++) handlePaint(lastX+(x-lastX)*i/steps,lastY+(y-lastY)*i/steps);
  lastX=x;lastY=y;
});
paintCanvas.addEventListener('pointerup',()=>painting=false);
paintCanvas.addEventListener('pointercancel',()=>painting=false);

function update(){
 state.quality=Math.max(0,Math.min(100,state.quality));
 state.life=Math.max(0,Math.min(100,state.life));
 const [s,txt]=level();
 document.getElementById('quality').textContent=Math.round(state.quality);
 document.getElementById('life').textContent=Math.round(state.life);
 document.getElementById('qualityBar').style.width=state.quality+'%';
 document.getElementById('state').textContent=s;
 document.getElementById('sceneText').textContent=txt;
 ['care','recycle','save','pollute'].forEach(k=>document.getElementById(k+'Count').textContent=state[k]);
}
function repairAnimation(){
 const fx=document.getElementById('repairFx');
 fx.innerHTML='<div class="repair-ring"></div>';
 for(let i=0;i<14;i++){
   const s=document.createElement('div');s.className='repair-spark';
   s.style.setProperty('--dx',`${Math.cos(i*Math.PI*2/14)*180}px`);
   s.style.setProperty('--dy',`${Math.sin(i*Math.PI*2/14)*110}px`);
   fx.appendChild(s);
 }
 fx.classList.remove('active'); void fx.offsetWidth; fx.classList.add('active');
 setTimeout(()=>fx.classList.remove('active'),1000);
}

document.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>{
 const k=btn.dataset.action,a=actions[k];
 state.quality+=a.q;state.life+=a.l;state[k]++;state.actions++;
 document.getElementById('sceneTitle').textContent=a.msg;
 bossUpdate(k);
 if(k!=='pollute') repairAnimation();
 update();
});
document.querySelectorAll('.brush').forEach(btn=>btn.onclick=()=>{
  brushSize=Number(btn.dataset.brush); paintMode='paint';
  document.querySelectorAll('.brush,.erase').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
});
document.getElementById('erase').onclick=()=>{
  paintMode='erase';
  document.querySelectorAll('.brush,.erase').forEach(b=>b.classList.remove('active'));
  document.getElementById('erase').classList.add('active');
};
document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
  if(btn.dataset.action==='care') paintMode='care';
  if(btn.dataset.action==='recycle') paintMode='recycle';
  if(btn.dataset.action==='save') paintMode='save';
  if(btn.dataset.action==='pollute') paintMode='pollute';
}));
document.getElementById('reset').onclick=()=>resetBattle(false);
document.getElementById('newVillain').onclick=()=>resetBattle(true);
document.getElementById('restartDeath').onclick=()=>resetBattle(false);

let audioCtx,master,noise;
document.getElementById('sound').onclick=()=>{
 if(!audioCtx){
   audioCtx=new (window.AudioContext||window.webkitAudioContext)();
   master=audioCtx.createGain();master.gain.value=.045;master.connect(audioCtx.destination);
   const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
   osc.type='sine';osc.frequency.value=110;gain.gain.value=.12;osc.connect(gain).connect(master);osc.start();
   noise=osc;
 }
 if(audioCtx.state==='suspended')audioCtx.resume();
 document.getElementById('sound').textContent='🔊 Sonido activo';
};

function show(title,body){
 document.getElementById('overlayTitle').textContent=title;
 document.getElementById('overlayBody').innerHTML=body;
 document.getElementById('overlay').classList.add('show');
}
document.getElementById('close').onclick=()=>document.getElementById('overlay').classList.remove('show');
document.getElementById('ods').onclick=()=>show('ODS 6 — Agua limpia y saneamiento',`
<p>La obra toma como eje el <strong>ODS 6</strong> y convierte la relación con el agua en una experiencia visual y sonora.</p>
<p>También dialoga con los ODS 12, 13, 14 y 15 mediante decisiones sobre consumo, contaminación, clima y biodiversidad.</p>
<p><em>El código es el material artístico: datos → algoritmo → color → composición.</em></p>`);
document.getElementById('final').onclick=()=>{
 const q=Math.round(state.quality), positive=state.care+state.recycle+state.save;
 show('TU MEMORIA DEL AGUA',`
 <p><strong>${positive}</strong> decisiones sostenibles · <strong>${state.pollute}</strong> decisiones contaminantes.</p>
 <p><strong>Néxus:</strong> ${state.bossHP<=0?'derrotado. El contaminador ha desaparecido.':'sigue luchando. Aún queda trabajo por hacer.'}</p>
 <p><strong>${q}%</strong> de calidad del agua · <strong>${Math.round(state.life)}%</strong> de biodiversidad.</p>
 <p>${q>=80?'Tu composición conserva una gran diversidad de ondas, ramas, peces y luz.':q>=40?'Tu composición mezcla señales de vida con huellas de contaminación.':'Tu composición quedó fragmentada y oscura: la memoria de tus decisiones permanece.'}</p>
 <p><em>“El agua recuerda nuestras acciones.”</em></p>`);
};
update();
