const slides=[...document.querySelectorAll('.slide')];
const pageText=document.querySelector('#pageText');
const titleText=document.querySelector('#slideTitle');
let current=0;

function show(index){
  current=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===current));
  pageText.textContent=`${current+1} / ${slides.length}`;
  titleText.textContent=slides[current].dataset.title||'';
  history.replaceState(null,'',`#${current+1}`);
}

document.querySelector('#prevButton').addEventListener('click',()=>show(current-1));
document.querySelector('#nextButton').addEventListener('click',()=>show(current+1));
document.querySelector('#printButton').addEventListener('click',()=>window.print());
document.addEventListener('keydown',event=>{
  if(['ArrowRight','PageDown',' '].includes(event.key)) show(current+1);
  if(['ArrowLeft','PageUp'].includes(event.key)) show(current-1);
  if(event.key==='Home') show(0);
  if(event.key==='End') show(slides.length-1);
});

const initial=Number(location.hash.replace('#',''))-1;
show(Number.isInteger(initial)&&initial>=0?initial:0);
