/*
========================================
BookAku
Version : 2.1.1 Alpha
File    : reader.js
========================================
*/

let book = null;
let rendition = null;

const viewer = document.getElementById("viewer");
const loading = document.getElementById("loading");

const title = document.getElementById("bookTitle");
const author = document.getElementById("bookAuthor");

const params = new URLSearchParams(window.location.search);

const bookId = params.get("id");

async function initReader() {

    const success = await Storage.loadLibrary();

    if (!success) {

        loading.innerHTML = "Gagal membaca library.";

        return;

    }

    book = Storage.getBook(bookId);

    if (!book) {

        loading.innerHTML = "Buku tidak dijumpai.";

        return;

    }

    title.textContent = book.title;

    author.textContent = book.author;

    console.log(book);

    loading.style.display = "none";

    // EPUB akan dibuka pada FAIL 6

}

initReader();

/* ==========================
   BUTTON
========================== */

document
.getElementById("backBtn")
.onclick = () => {

    history.back();

};

document
.getElementById("prevBtn")
.onclick = () => {

    if (rendition) {

        rendition.prev();

    }

};

document
.getElementById("nextBtn")
.onclick = () => {

    if (rendition) {

        rendition.next();

    }

};

document
.getElementById("menuBtn")
.onclick = () => {

    alert("Menu akan ditambah pada v2.1.2");

};