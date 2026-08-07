Promise.all([
fetch('data/library.json').then(r=>r.json()),
fetch('data/settings.json').then(r=>r.json()).catch(()=>({}))
]).then(([lib])=>{
const list=lib.books||[];
const box=document.getElementById('books');
const s=document.getElementById('search');
function render(q=''){
box.innerHTML='';
list.filter(b=>(b.title+' '+b.author).toLowerCase().includes(q.toLowerCase())).forEach(b=>{
box.innerHTML+=`<div class="card"><h3>${b.title}</h3><div class="meta">${b.author} • ${b.type}</div><a class="btn" href="${b.url}">📖 Baca</a></div>`;
});
}
render();
s.oninput=e=>render(e.target.value);
});