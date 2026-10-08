import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111b);
scene.fog = new THREE.FogExp2(0x07111b, 0.012);

const camera = new THREE.PerspectiveCamera(62, innerWidth/innerHeight, .1, 700);
camera.position.set(0, 7, 16);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0x9fd9ff,0x172014,1.5); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2ad,2.4);
sun.position.set(-70,100,50); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-120; sun.shadow.camera.right=120; sun.shadow.camera.top=120; sun.shadow.camera.bottom=-120;
scene.add(sun);

const world = new THREE.Group(); scene.add(world);
const colliders=[];
const locations=[];
const roadLines=[];

function box(w,h,d,color,x,y,z, opts={}){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.7,metalness:opts.metal||0}));
  m.position.set(x,y,z); m.castShadow=opts.shadow!==false; m.receiveShadow=true; world.add(m); return m;
}
function cyl(r,h,color,x,y,z,segments=20){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),new THREE.MeshStandardMaterial({color,roughness:.75}));
  m.position.set(x,y,z);m.castShadow=true;world.add(m);return m;
}
function label(text,pos,color="#bff7ff"){
  const c=document.createElement("canvas"); c.width=512;c.height=128;
  const ctx=c.getContext("2d");ctx.clearRect(0,0,512,128);ctx.font="700 34px Orbitron,Arial";ctx.textAlign="center";ctx.fillStyle=color;ctx.shadowColor="#000";ctx.shadowBlur=12;ctx.fillText(text,256,72);
  const tex=new THREE.CanvasTexture(c); const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  spr.position.copy(pos);spr.scale.set(8,2,1);world.add(spr);return spr;
}

const ground=box(220,1,220,0x10231f,0,-.5,0,{shadow:false});
const grid=new THREE.GridHelper(210,42,0x28534b,0x18382f);grid.position.y=.03;world.add(grid);

function road(w,d,x,z){
  const r=box(w,.12,d,0x1c2227,x,.08,z,{shadow:false});
  for(let i=-w/2+5;i<w/2-3;i+=8) box(.15,.14,2.4,0xd8b34d,x+i,.16,z,{shadow:false});
}
road(18,220,0,0); road(220,18,0,0); road(12,150,-55,0); road(150,12,0,-55); road(12,150,55,0); road(150,12,0,55);

function building(name,x,z,color,size=[14,8,12],desc){
  const [w,h,d]=size;
  box(w,h,d,color,x,h/2,z);
  box(w+.5,.3,d+.5,0x111820,x,h+.15,z,{shadow:false});
  for(let yy=2;yy<h;yy+=2.4) for(let xx=-w/2+1.7;xx<w/2-1;xx+=2.7)
    box(.9,1.1,.08,0x65dfff,x+xx,yy,z-d/2-.05,{shadow:false,metal:.2});
  label(name,new THREE.Vector3(x,h+5,z));
  const glow=cyl(2.5,.25,0x65dfff,x,.35,z,32);glow.material.emissive=new THREE.Color(0x12495b);
  locations.push({name,x,z,desc});
}
building("ABOUT ME",-32,-28,0x18344a,[16,10,14],"Md Ihsan Ahmad — Junior Digital Professional focused on Graphic Design, Web Design and Digital Services.");
building("MY SERVICES",32,-28,0x3b2947,[16,11,14],"Graphic Design, Website Design, Canva Design, branding materials and digital support.");
building("PROJECT ZONE",-32,30,0x203f34,[18,9,15],"Explore selected work including Freelancer Ihsan, Future Skills Academy and Osmani Karate Club.");
building("CONTACT HQ",32,30,0x4b3820,[16,8,13],"Email: mdihsanahmad815@gmail.com | WhatsApp: 01922889616");

for(let i=0;i<18;i++){
  const x=-95+(i%9)*24, z=-92+Math.floor(i/9)*184;
  cyl(.8,7,0x183a2d,x,3.5,z,10); cyl(2.8,.35,0x22523c,x,7,z,10);
}
for(let i=0;i<14;i++){
  const x=-90+(i%7)*30, z=-65+Math.floor(i/7)*130;
  if(Math.abs(x)<20||Math.abs(z)<20) continue;
  cyl(.55,5,0x624936,x,2.5,z,8); cyl(2.3,.28,0x315e43,x,5,z,9);
}

function portal(x,z,color){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(4,.22,12,48),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2}));
  ring.rotation.x=Math.PI/2; ring.position.set(x,.5,z);world.add(ring);
  locations.push({name:"NEXT ZONE",x,z,desc:"You found a hidden zone. More projects can be added here later."});
}
portal(0,-82,0xffd66b); portal(0,82,0x65dfff);

const car=new THREE.Group();
const body=box(2.8,.75,5.2,0x151d25,0,1,0,{metal:.5});
body.parent=car;
const cabin=box(2.15,.75,2.3,0x182f40,0,1.65,-.15,{metal:.7});
cabin.parent=car;
for(const x of [-1.18,1.18]) for(const z of [-1.55,1.55]){
  const wh=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.35,20),new THREE.MeshStandardMaterial({color:0x050609,roughness:.5}));
  wh.rotation.z=Math.PI/2;wh.position.set(x,.58,z);wh.parent=car;
}
const light1=box(.45,.22,.1,0xffe7a1,-.75,1.05,-2.62,{shadow:false});light1.parent=car;
const light2=box(.45,.22,.1,0xffe7a1,.75,1.05,-2.62,{shadow:false});light2.parent=car;
car.position.set(0,.02,45);car.rotation.y=Math.PI;scene.add(car);

const keys={};
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key==="e"||e.key==="E") interact();});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
document.querySelectorAll("#mobile-controls [data-key]").forEach(b=>{
  const k=b.dataset.key;
  const on=e=>{e.preventDefault();keys[k]=true}; const off=e=>{e.preventDefault();keys[k]=false};
  b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointercancel",off);b.addEventListener("pointerleave",off);
});

let running=false, speed=0, targetSpeed=0, nearest=null;
const joystick=document.getElementById("joystick");
const stick=joystick?.querySelector(".stick");
let joyActive=false;
function joyMove(ev){ if(!joyActive)return; const r=joystick.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2; let dx=ev.clientX-cx, dy=ev.clientY-cy; const max=r.width*.32; const len=Math.hypot(dx,dy)||1; const scale=Math.min(1,max/len); dx*=scale;dy*=scale; stick.style.transform=`translate(${dx}px,${dy}px)`; keys.w=dy<-12;keys.s=dy>12;keys.a=dx<-12;keys.d=dx>12; }
function joyEnd(){joyActive=false;stick.style.transform="translate(0,0)";keys.w=keys.s=keys.a=keys.d=false;}
if(joystick){joystick.addEventListener("pointerdown",e=>{joyActive=true;joystick.setPointerCapture(e.pointerId);joyMove(e)});joystick.addEventListener("pointermove",joyMove);joystick.addEventListener("pointerup",joyEnd);joystick.addEventListener("pointercancel",joyEnd);}
const interactBtn=document.getElementById("interactBtn"); if(interactBtn) interactBtn.addEventListener("pointerdown",e=>{e.preventDefault();interact();interactBtn.classList.add("active")}); if(interactBtn) interactBtn.addEventListener("pointerup",()=>interactBtn.classList.remove("active"));
const menuBtn=document.getElementById("menuBtn"); if(menuBtn) menuBtn.onclick=()=>{menu.style.display="grid";running=false};

const menu=document.getElementById("menu");
document.getElementById("startBtn").onclick=()=>{running=true;menu.style.display="none";toast("WORLD ONLINE — EXPLORE FREELANCER IHSAN");};
document.getElementById("closePanel").onclick=()=>document.getElementById("info-panel").classList.add("hidden");

function toast(t){const el=document.getElementById("toast");el.textContent=t;el.style.opacity=1;setTimeout(()=>el.style.opacity=0,2200)}
function interact(){
 if(!nearest)return;
 const p=document.getElementById("panel-content");
 const service = nearest.name==="MY SERVICES";
 const projects = nearest.name==="PROJECT ZONE";
 let extra=service?`<div class="cards">
 <div class="mini-card"><b>GRAPHIC DESIGN</b><small>Social posts, posters, logos and branding.</small></div>
 <div class="mini-card"><b>WEB DESIGN</b><small>Responsive websites for businesses and organizations.</small></div>
 <div class="mini-card"><b>CANVA DESIGN</b><small>Beginner-friendly professional design workflow.</small></div>
 <div class="mini-card"><b>DIGITAL SUPPORT</b><small>Creative and office/digital assistance.</small></div>
 </div>`:"";
 let projectExtra=projects?`<div class="cards">
 <div class="mini-card"><b>FREELANCER IHSAN</b><small>Personal freelance portfolio website.</small></div>
 <div class="mini-card"><b>FUTURE SKILLS ACADEMY</b><small>Education and skills platform concept.</small></div>
 <div class="mini-card"><b>OSMANI KARATE CLUB</b><small>Modern sports club website experience.</small></div>
 </div>`:"";
 p.innerHTML=`<div class="tag">LOCATION DISCOVERED</div><h2>${nearest.name}</h2><p>${nearest.desc}</p>${extra}${projectExtra}`;
 document.getElementById("info-panel").classList.remove("hidden");
}

const map=document.getElementById("mapCanvas"),ctx=map.getContext("2d");
function drawMap(){
 ctx.clearRect(0,0,180,180);ctx.fillStyle="#09141d";ctx.fillRect(0,0,180,180);
 ctx.strokeStyle="#203c45";ctx.lineWidth=8;ctx.strokeRect(14,14,152,152);
 ctx.strokeStyle="#27343a";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(90,0);ctx.lineTo(90,180);ctx.moveTo(0,90);ctx.lineTo(180,90);ctx.stroke();
 locations.forEach((l,i)=>{let mx=90+l.x*.7,my=90+l.z*.7;ctx.fillStyle=i%2?"#ffd66b":"#65dfff";ctx.beginPath();ctx.arc(mx,my,3,0,Math.PI*2);ctx.fill()});
 const mx=90+car.position.x*.7,my=90+car.position.z*.7;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(mx,my,4,0,Math.PI*2);ctx.fill();
}
function updateHint(){
 nearest=null;let best=12;
 locations.forEach(l=>{const d=Math.hypot(car.position.x-l.x,car.position.z-l.z);if(d<best){best=d;nearest=l}});
 const h=document.getElementById("hint");
 h.style.opacity=nearest?"1":"0";
 h.innerHTML=nearest?`Near <b>${nearest.name}</b> — press <b>E</b> to enter`:"";
}

const clock=new THREE.Clock();
let fpsTimer=0,fpsFrames=0;
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05); fpsTimer+=dt; fpsFrames++; if(fpsTimer>.5){const f=Math.round(fpsFrames/fpsTimer);const fe=document.getElementById("fps");if(fe)fe.textContent=f;fpsTimer=0;fpsFrames=0;}
 if(running){
   const forward=keys.w||keys.arrowup, back=keys.s||keys.arrowdown;
   const left=keys.a||keys.arrowleft, right=keys.d||keys.arrowright;
   targetSpeed=(forward?1:0)-(back?1:0);
   const boost=keys[" "];
   speed=THREE.MathUtils.lerp(speed,targetSpeed*(boost?15:8),dt*5);
   if(Math.abs(speed)>.15){
     car.translateZ(-speed*dt);
     if(left) car.rotation.y += 1.7*dt*(speed>0?1:-1);
     if(right) car.rotation.y -= 1.7*dt*(speed>0?1:-1);
   }
   car.position.x=THREE.MathUtils.clamp(car.position.x,-100,100);
   car.position.z=THREE.MathUtils.clamp(car.position.z,-100,100);
 }
 const camTarget=new THREE.Vector3(0,3,8).applyQuaternion(car.quaternion).add(car.position);
 camera.position.lerp(camTarget,1-Math.pow(.001,dt));
 const look=new THREE.Vector3(0,1,0).applyQuaternion(car.quaternion).add(car.position);
 camera.lookAt(look);
 updateHint();drawMap();
 renderer.render(scene,camera);
}
animate();

setTimeout(()=>{document.getElementById("loading").style.opacity=0;setTimeout(()=>document.getElementById("loading").remove(),700)},900);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
