fetch('data/*
========================================
BookAku
Version : 2.1.1 Alpha
File    : app.js
========================================
*/

async function loadLibrary() {

    const response = await fetch(CONFIG.STORAGE.LIBRARY);

    const library = await response.json();

    const books = library.books;

    const container = document.getElementById("books");

    container.innerHTML = "";

    books.forEach(book => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `

            <h3>${book.title}</h3>

            <p>${book.author}</p>

            <small>${book.type.toUpperCase()}</small>

            <br><br>

            <a class="btn"
               href="reader.html?id=${book.id}">
               📖 Baca
            </a>

        `;

        container.appendChild(card);

    });

}

loadLibrary();/library.json').then(r=>r.json()).then(lib=>{
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