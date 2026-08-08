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

    if (DropboxEngine.isConnected()) {

    const books = await DropboxEngine.getBooks();
    book = books.find(b => b.id === bookId);

} else {

    const success = await Storage.loadLibrary();

    if (!success) {
        loading.innerHTML = "Gagal membaca library.";
        return;
    }

    book = Storage.getBook(bookId);

}

if (!book) {
    loading.innerHTML = "Buku tidak dijumpai.";
    return;
}

    title.textContent = book.title;

    author.textContent = book.author;

    console.log(book);

    try {

    let bookUrl = book.path;

if (DropboxEngine.isConnected()) {
    bookUrl = await DropboxEngine.getDownloadLink(book.path);
}

const epubBook = ePub(bookUrl);

    rendition = epubBook.renderTo("viewer", {

        width: CONFIG.READER.WIDTH,

        height: CONFIG.READER.HEIGHT,

        flow: CONFIG.READER.FLOW,

        spread: CONFIG.READER.SPREAD

    });

    await rendition.display();

    loading.style.display = "none";

    console.log("EPUB Loaded");

} catch (error) {

    console.error(error);

    loading.innerHTML = "Gagal membuka EPUB.";

}

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