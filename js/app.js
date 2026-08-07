fetch('data/library.json').then(r=>r.json()).then(lib=>{
const list=lib.books;
const out=document.getElementById('books');
const s=document.getElementById('search');
function draw(q=''){
out.innerHTML='';
list.filter(b=>(b.title+' '+b.author).toLowerCase().includes(q.toLowerCase())).forEach(b=>{
out.innerHTML+=`<div class="card"><h3>${b.title}</h3><div class="meta">${b.author} • ${b.type}</div><a class="btn" href="reader.html">📖 Baca</a></div>`;
});
}
draw();
s.oninput=e=>draw(e.target.value);
});