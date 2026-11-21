/* About page: "Interest" split-scroll photo gallery (two columns reveal in opposite directions as you scroll). */
(function(){
/* put your photos in assets/images/Interest/ and list them here */
var PATH="assets/images/interest/";
var PHOTOS=[
{file:"1.jpg",title:"Photo 01",year:2012},
{file:"2.jpg",title:"Photo 02",year:2020},
{file:"3.jpg",title:"Photo 03",year:2003},
{file:"4.jpg",title:"Photo 04",year:2018},
{file:"5.jpg",title:"Photo 05",year:2007},
{file:"6.jpg",title:"Photo 06",year:2024}
];
var N=PHOTOS.length,sec=document.getElementById("pg");
sec.style.setProperty("--n",N);
var still=matchMedia("(prefers-reduced-motion:reduce)").matches;
function build(col,order){
  var arr=[];
  order.forEach(function(pi){
    var img=new Image();img.alt=PHOTOS[pi].title;img.draggable=false;img.src=PATH+PHOTOS[pi].file;
    img.onerror=function(){
      var ph=document.createElement("div");ph.className="pg-ph";ph.textContent=String(pi+1).padStart(2,"0");
      ph.style.background="hsl("+(pi*47%360)+" 14% "+(24+(pi%3)*7)+"%)";
      img.replaceWith(ph);arr[arr.indexOf(img)]=ph;draw();
    };
    col.appendChild(img);arr.push(img);
  });
  return arr;
}
var L=build(document.getElementById("pgL"),PHOTOS.map(function(_,i){return i;}));
var R=build(document.getElementById("pgR"),PHOTOS.map(function(_,i){return N-1-i;}));
var pos=0,target=0;
function draw(){
  var base=Math.min(Math.floor(pos),N-1),f=pos-base,i1=Math.min(base+1,N-1);
  [L,R].forEach(function(arr,c){
    arr.forEach(function(el){el.style.visibility="hidden";el.style.clipPath="none";el.style.zIndex=0;});
    arr[base].style.visibility="visible";arr[base].style.zIndex=1;
    if(f>0.0005&&i1!==base){
      var b=arr[i1],rest=((1-f)*100).toFixed(3)+"%";
      b.style.visibility="visible";b.style.zIndex=2;
      b.style.clipPath=c===0?"inset(0 0 "+rest+" 0)":"inset("+rest+" 0 0 0)";
    }
  });
  var idx=Math.max(0,Math.min(N-1,Math.round(pos)));
  document.getElementById("pgTL").textContent=PHOTOS[idx].title;
  document.getElementById("pgTR").textContent=PHOTOS[N-1-idx].title;
  document.getElementById("pgY").textContent=PHOTOS[idx].year;
  document.getElementById("pgC").textContent=String(idx+1).padStart(2,"0")+" / "+String(N).padStart(2,"0");
}
function tick(){
  var r=sec.getBoundingClientRect();
  if(r.bottom>0&&r.top<innerHeight){
    var span=r.height-innerHeight;
    target=Math.max(0,Math.min(1,-r.top/span))*(N-1);
    var d=target-pos;
    if(still)pos=target;else if(Math.abs(d)>0.0002)pos+=d*0.1;else pos=target;
    draw();
  }
  requestAnimationFrame(tick);
}
draw();tick();
})();
