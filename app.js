fetch('books.json').then(r=>r.json()).then(data=>{
const c=document.getElementById('books');
const s=document.getElementById('search');
function render(q=''){
c.innerHTML='';
data.filter(b=>b.title.toLowerCase().includes(q.toLowerCase())).forEach(b=>{
const d=document.createElement('div');
d.className='book';
d.innerHTML=`<b>${b.title}</b><br>${b.author}<br><a href="${b.url}" target="_blank">📖 Baca</a>`;
c.appendChild(d);
});
}
render();
s.oninput=e=>render(e.target.value);
});