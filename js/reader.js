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

    await rendition.display();

    loading.style.display = "none";

    console.log("EPUB Loaded");

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

    viewer.innerHTML = "";

    for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber++
    ) {

        const page =
            await pdfDocument.getPage(pageNumber);

        const viewport =
            page.getViewport({
                scale: 1.5
            });

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

        canvas.style.marginBottom =
            "20px";

        viewer.appendChild(canvas);

        await page.render({

            canvasContext: context,

            viewport: viewport

        }).promise;

    }

    loading.style.display = "none";

    console.log("PDF Reader Loaded");

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

    alert(
        "Menu akan ditambah pada v2.1.3"
    );

};
