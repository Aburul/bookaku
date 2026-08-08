/*
========================================
BookAku
Version : 2.1.3 Alpha
File    : reader.js
========================================
*/

let book = null;
let rendition = null;
let pdfDocument = null;

let pdfPageNumber = 1;
let pdfRendering = false;

const viewer = document.getElementById("viewer");
const loading = document.getElementById("loading");

const title = document.getElementById("bookTitle");
const author = document.getElementById("bookAuthor");

const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");


/* ==========================
   PDF.JS
========================== */

if (typeof pdfjsLib !== "undefined") {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "vendor/pdf/pdf.worker.min.js";

}


/* ==========================
   OPEN EPUB
========================== */

async function openEPUB(book) {

    let epubBook;

    if (DropboxEngine.isConnected()) {

        const blob =
            await DropboxEngine.getBookBlob(book.path);

        console.log("EPUB Blob:", blob);
        console.log("Type:", blob.type);
        console.log("Size:", blob.size);

        epubBook = ePub(blob);

    } else {

        epubBook = ePub(book.path);

    }

    console.log("EPUB object:", epubBook);

    rendition = epubBook.renderTo("viewer", {

        width: CONFIG.READER.WIDTH,

        height: CONFIG.READER.HEIGHT,

        flow: CONFIG.READER.FLOW,

        spread: CONFIG.READER.SPREAD

    });

   rendition.on(
    "relocated",
    (location) => {

        saveEPUBProgress(location);

    }
);

    const savedLocation =
    loadEPUBProgress();

if (savedLocation) {

    console.log(
        "EPUB Resume:",
        savedLocation
    );

    await rendition.display(
        savedLocation
    );

} else {

    await rendition.display();

}

loading.style.display = "none";

    console.log("EPUB Loaded");

}

/* ==========================
   EPUB PROGRESS 1
========================== */

function saveEPUBProgress(location) {

    if (!book || !location) {
        return;
    }

    const cfi =
        location.start.cfi;

    if (!cfi) {
        return;
    }

    localStorage.setItem(
        "bookaku_epub_progress_" + book.id,
        cfi
    );

    console.log(
        "EPUB Progress Saved:",
        cfi
    );

}

function loadEPUBProgress() {

    if (!book) {
        return null;
    }

    return localStorage.getItem(
        "bookaku_epub_progress_" + book.id
    );

}

/* ==========================
   OPEN PDF
========================== */

async function openPDF(book) {

    console.log("PDF:", book);

    if (typeof pdfjsLib === "undefined") {

        throw new Error(
            "PDF.js tidak dimuatkan."
        );

    }

    let blob;

    if (DropboxEngine.isConnected()) {

        blob =
            await DropboxEngine.getBookBlob(book.path);

    } else {

        const response =
            await fetch(book.path);

        blob =
            await response.blob();

    }

    console.log("PDF Blob:", blob);
    console.log("PDF Type:", blob.type);
    console.log("PDF Size:", blob.size);

    const arrayBuffer =
        await blob.arrayBuffer();

    const loadingTask =
        pdfjsLib.getDocument({
            data: arrayBuffer
        });

    pdfDocument =
        await loadingTask.promise;

    console.log(
        "PDF Loaded:",
        pdfDocument.numPages,
        "pages"
    );

    pdfPageNumber = loadPDFProgress();

await renderPDFPage(pdfPageNumber);

    loading.style.display = "none";

    console.log("PDF Reader Loaded");

}

/* ==========================
   Render 1 1 page
========================== */

async function renderPDFPage(pageNumber) {

    if (!pdfDocument) {
        return;
    }

    if (pdfRendering) {
        return;
    }

    if (
        pageNumber < 1 ||
        pageNumber > pdfDocument.numPages
    ) {
        return;
    }

    pdfRendering = true;

    try {

        const page =
            await pdfDocument.getPage(pageNumber);

        const viewerWidth =
            viewer.clientWidth || 800;

        const baseViewport =
            page.getViewport({
                scale: 1
            });

        const scale =
            viewerWidth /
            baseViewport.width;

        const viewport =
            page.getViewport({
                scale: scale
            });

        viewer.innerHTML = "";

        const canvas =
            document.createElement("canvas");

        const context =
            canvas.getContext("2d");

        canvas.width =
            viewport.width;

        canvas.height =
            viewport.height;

        canvas.style.display =
            "block";

        canvas.style.width =
            "100%";

        canvas.style.height =
            "auto";

        viewer.appendChild(canvas);

        await page.render({

            canvasContext: context,

            viewport: viewport

        }).promise;

        pdfPageNumber = pageNumber;

savePDFProgress();

console.log(
    "PDF Page:",
    pdfPageNumber,
    "/",
    pdfDocument.numPages
);

    } finally {

        pdfRendering = false;

    }

}

/* ==========================
   PDF PROGRESS
========================== */

function savePDFProgress() {

    if (!book || !pdfDocument) {
        return;
    }

    localStorage.setItem(
        "bookaku_progress_" + book.id,
        String(pdfPageNumber)
    );

}


function loadPDFProgress() {

    if (!book) {
        return 1;
    }

    const saved =
        localStorage.getItem(
            "bookaku_progress_" + book.id
        );

    if (!saved) {
        return 1;
    }

    const page =
        parseInt(saved, 10);

    if (
        isNaN(page) ||
        page < 1
    ) {
        return 1;
    }

    return page;

}

/* ==========================
   INIT READER
========================== */

async function initReader() {

    try {

        if (DropboxEngine.isConnected()) {

            const books =
                await DropboxEngine.getBooks();

            book =
                books.find(
                    b => b.id === bookId
                );

        } else {

            const success =
                await Storage.loadLibrary();

            if (!success) {

                loading.innerHTML =
                    "Gagal membaca library.";

                return;

            }

            book =
                Storage.getBook(bookId);

        }


        if (!book) {

            loading.innerHTML =
                "Buku tidak dijumpai.";

            return;

        }


        title.textContent =
            book.title || book.name;

        author.textContent =
            book.author || "Dropbox";


        console.log("BOOK:", book);


        /*
        ==============================
        PILIH READER
        ==============================
        */

        if (book.type === "pdf") {

            await openPDF(book);

        } else {

            await openEPUB(book);

        }


    } catch (error) {

        console.error(
            "READER ERROR:",
            error
        );

        loading.innerHTML =
            "Gagal membuka buku.";

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
.onclick = async () => {

    if (pdfDocument) {

        await renderPDFPage(
            pdfPageNumber - 1
        );

        return;

    }

    if (rendition) {

        rendition.prev();

    }

};

document
.getElementById("nextBtn")
.onclick = async () => {

    if (pdfDocument) {

        await renderPDFPage(
            pdfPageNumber + 1
        );

        return;

    }

    if (rendition) {

        rendition.next();

    }

};


document
.getElementById("menuBtn")
.onclick = () => {

    alert(
        "Menu akan ditambah pada v2.1.3"
    );

};
