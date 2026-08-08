/*
========================================
BookAku
Version : 2.1.1 Alpha
File    : app.js
========================================
*/

async function loadLibrary() {

    let books;

if (DropboxEngine.isConnected()) {

    books = await DropboxEngine.getBooks();

} else {

    const response =
        await fetch(CONFIG.STORAGE.LIBRARY);

    const library =
        await response.json();

    books = library.books;

}

    const container = document.getElementById("books");

    container.innerHTML = "";

    books.forEach(book => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `

            <h3>${book.title || book.name}</h3>

            <p>${book.author || "Dropbox"}</p>

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

loadLibrary();