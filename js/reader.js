/*
==================================================
BOOKAKU READER
EPUB + PDF
Progress + Resume
==================================================
*/


let book = null;
let rendition = null;
let epubBook = null;

let pdfDocument = null;
let pdfPageNumber = 1;
let pdfRendering = false;


const viewer =
    document.getElementById("viewer");

const loading =
    document.getElementById("loading");

const title =
    document.getElementById("bookTitle");

const author =
    document.getElementById("bookAuthor");


const params =
    new URLSearchParams(
        window.location.search
    );

const bookId =
    params.get("id");


/* ==================================================
   PDF.JS
================================================== */

if (
    typeof pdfjsLib !== "undefined"
) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "vendor/pdf/pdf.worker.min.js";

}


/* ==================================================
   OPEN EPUB
================================================== */

async function openEPUB(book) {

    console.log(
        "Opening EPUB:",
        book
    );


    /* ==========================
       LOAD EPUB
    ========================== */

    if (
        DropboxEngine.isConnected()
    ) {

        const blob =
            await DropboxEngine.getBookBlob(
                book.path
            );


        console.log(
            "EPUB Blob:",
            blob
        );


        console.log(
            "EPUB Type:",
            blob.type
        );


        console.log(
            "EPUB Size:",
            blob.size
        );


        epubBook =
            ePub(blob);


    } else {

        epubBook =
            ePub(book.path);

    }


    console.log(
        "EPUB object:",
        epubBook
    );


    /* ==========================
       WAIT EPUB READY
    ========================== */

    await epubBook.ready;


    console.log(
        "EPUB ready"
    );


    /* ==========================
       GENERATE LOCATIONS
    ========================== */

    console.log(
        "Generating EPUB locations..."
    );


    await epubBook.locations.generate(
        1000
    );


    console.log(
        "EPUB locations generated:",
        epubBook.locations.total
    );


    /* ==========================
       RENDER
    ========================== */

    rendition =
        epubBook.renderTo(
            "viewer",
            {

                width:
                    CONFIG.READER.WIDTH,

                height:
                    CONFIG.READER.HEIGHT,

                flow:
                    CONFIG.READER.FLOW,

                spread:
                    CONFIG.READER.SPREAD

            }
        );


    /* ==========================
       SAVE PROGRESS EVENT
    ========================== */

    rendition.on(
        "relocated",
        function(location) {

            saveEPUBProgress(
                location
            );

        }
    );


    /* ==========================
       LOAD SAVED LOCATION
    ========================== */

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


    loading.style.display =
        "none";


    console.log(
        "EPUB Loaded"
    );

}


/* ==================================================
   SAVE EPUB PROGRESS
================================================== */

function saveEPUBProgress(
    location
) {

    if (
        !book ||
        !location ||
        !epubBook
    ) {

        return;

    }


    if (
        !location.start
    ) {

        return;

    }


    const cfi =
        location.start.cfi;


    if (!cfi) {

        return;

    }


    let percentage = 0;


    /* ==========================
       CONVERT CFI → PERCENTAGE
    ========================== */

    if (
        epubBook.locations &&
        epubBook.locations.total
    ) {

        percentage =
            epubBook.locations
                .percentageFromCfi(
                    cfi
                );

    }


    /* ==========================
       SAFETY
    ========================== */

    if (
        typeof percentage !== "number" ||
        isNaN(percentage)
    ) {

        percentage = 0;

    }


    percentage =
        Math.max(
            0,
            Math.min(
                1,
                percentage
            )
        );


    /* ==========================
       SAVE PERCENTAGE
    ========================== */

    localStorage.setItem(
        "bookaku_epub_percent_" +
        book.id,
        String(percentage)
    );


    /* ==========================
       SAVE CFI
    ========================== */

    localStorage.setItem(
        "bookaku_epub_progress_" +
        book.id,
        cfi
    );


    console.log(
        "EPUB Progress Saved:",
        Math.round(
            percentage * 100
        ) + "%",
        cfi
    );

}


/* ==================================================
   LOAD EPUB PROGRESS
================================================== */

function loadEPUBProgress() {

    if (!book) {

        return null;

    }


    return localStorage.getItem(
        "bookaku_epub_progress_" +
        book.id
    );

}


/* ==================================================
   OPEN PDF
================================================== */

async function openPDF(book) {

    console.log(
        "PDF:",
        book
    );


    /* ==========================
       CHECK PDF.JS
    ========================== */

    if (
        typeof pdfjsLib === "undefined"
    ) {

        throw new Error(
            "PDF.js tidak dimuatkan."
        );

    }


    let blob;


    /* ==========================
       LOAD PDF
    ========================== */

    if (
        DropboxEngine.isConnected()
    ) {

        blob =
            await DropboxEngine.getBookBlob(
                book.path
            );


    } else {

        const response =
            await fetch(
                book.path
            );


        if (!response.ok) {

            throw new Error(
                "Gagal memuatkan PDF."
            );

        }


        blob =
            await response.blob();

    }


    console.log(
        "PDF Blob:",
        blob
    );


    console.log(
        "PDF Type:",
        blob.type
    );


    console.log(
        "PDF Size:",
        blob.size
    );


    /* ==========================
       ARRAY BUFFER
    ========================== */

    const arrayBuffer =
        await blob.arrayBuffer();


    /* ==========================
       PDF.JS
    ========================== */

    const loadingTask =
        pdfjsLib.getDocument(
            {
                data:
                    arrayBuffer
            }
        );


    pdfDocument =
        await loadingTask.promise;


    console.log(
        "PDF Loaded:",
        pdfDocument.numPages,
        "pages"
    );


    /* ==========================
       LOAD SAVED PAGE
    ========================== */

    pdfPageNumber =
        loadPDFProgress();


    /* ==========================
       RENDER PAGE
    ========================== */

    await renderPDFPage(
        pdfPageNumber
    );


    loading.style.display =
        "none";


    console.log(
        "PDF Reader Loaded"
    );

}


/* ==================================================
   RENDER PDF PAGE
================================================== */

async function renderPDFPage(
    pageNumber
) {

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

        /* ==========================
           GET PAGE
        ========================== */

        const page =
            await pdfDocument.getPage(
                pageNumber
            );


        /* ==========================
           VIEWER WIDTH
        ========================== */

        const viewerWidth =
            viewer.clientWidth ||
            800;


        const baseViewport =
            page.getViewport(
                {
                    scale: 1
                }
            );


        const scale =
            viewerWidth /
            baseViewport.width;


        const viewport =
            page.getViewport(
                {
                    scale:
                        scale
                }
            );


        /* ==========================
           CLEAR VIEWER
        ========================== */

        viewer.innerHTML =
            "";


        /* ==========================
           CANVAS
        ========================== */

        const canvas =
            document.createElement(
                "canvas"
            );


        const context =
            canvas.getContext(
                "2d"
            );


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


        viewer.appendChild(
            canvas
        );


        /* ==========================
           RENDER
        ========================== */

        await page.render(
            {

                canvasContext:
                    context,

                viewport:
                    viewport

            }
        ).promise;


        /* ==========================
           SAVE PAGE
        ========================== */

        pdfPageNumber =
            pageNumber;


        savePDFProgress();


        console.log(
            "PDF Page:",
            pdfPageNumber,
            "/",
            pdfDocument.numPages
        );


    } finally {

        pdfRendering =
            false;

    }

}


/* ==================================================
   SAVE PDF PROGRESS
================================================== */

function savePDFProgress() {

    if (
        !book ||
        !pdfDocument
    ) {

        return;

    }


    /* ==========================
       SAVE PAGE
    ========================== */

    localStorage.setItem(
        "bookaku_progress_" +
        book.id,
        String(
            pdfPageNumber
        )
    );


    /* ==========================
       CALCULATE PERCENTAGE
    ========================== */

    let percentage = 0;


    if (
        pdfDocument.numPages > 1
    ) {

        percentage =
            (
                pdfPageNumber - 1
            ) /
            (
                pdfDocument.numPages - 1
            );

    } else {

        percentage = 1;

    }


    percentage =
        Math.max(
            0,
            Math.min(
                1,
                percentage
            )
        );


    /* ==========================
       SAVE PERCENTAGE
    ========================== */

    localStorage.setItem(
        "bookaku_pdf_percent_" +
        book.id,
        String(
            percentage
        )
    );


    console.log(
        "PDF Progress Saved:",
        Math.round(
            percentage * 100
        ) + "%"
    );

}


/* ==================================================
   LOAD PDF PROGRESS
================================================== */

function loadPDFProgress() {

    if (!book) {

        return 1;

    }


    const saved =
        localStorage.getItem(
            "bookaku_progress_" +
            book.id
        );


    if (!saved) {

        return 1;

    }


    const page =
        parseInt(
            saved,
            10
        );


    if (
        isNaN(page) ||
        page < 1
    ) {

        return 1;

    }


    return page;

}


/* ==================================================
   INIT READER
================================================== */

async function initReader() {

    try {

        /* ==========================
           LOAD BOOK
        ========================== */

        if (
            DropboxEngine.isConnected()
        ) {

            const books =
                await DropboxEngine.getBooks();


            book =
                books.find(
                    function(b) {

                        return b.id === bookId;

                    }
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
                Storage.getBook(
                    bookId
                );

        }


        /* ==========================
           CHECK BOOK
        ========================== */

        if (!book) {

            loading.innerHTML =
                "Buku tidak dijumpai.";

            return;

        }


        /* ==========================
           TITLE
        ========================== */

        title.textContent =
            book.title ||
            book.name;


        /* ==========================
           AUTHOR
        ========================== */

        author.textContent =
            book.author ||
            "Dropbox";


        console.log(
            "BOOK:",
            book
        );


        /* ==========================
           SELECT READER
        ========================== */

        if (
            String(book.type)
                .toLowerCase() ===
            "pdf"
        ) {

            await openPDF(
                book
            );


        } else {

            await openEPUB(
                book
            );

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


/* ==================================================
   START
================================================== */

initReader();


/* ==================================================
   BACK BUTTON
================================================== */

document
    .getElementById(
        "backBtn"
    )
    .onclick =
    function() {

        history.back();

    };


/* ==================================================
   PREVIOUS BUTTON
================================================== */

document
    .getElementById(
        "prevBtn"
    )
    .onclick =
    async function() {

        /* ==========================
           PDF
        ========================== */

        if (pdfDocument) {

            await renderPDFPage(
                pdfPageNumber - 1
            );

            return;

        }


        /* ==========================
           EPUB
        ========================== */

        if (rendition) {

            await rendition.prev();

        }

    };


/* ==================================================
   NEXT BUTTON
================================================== */

document
    .getElementById(
        "nextBtn"
    )
    .onclick =
    async function() {

        /* ==========================
           PDF
        ========================== */

        if (pdfDocument) {

            await renderPDFPage(
                pdfPageNumber + 1
            );

            return;

        }


        /* ==========================
           EPUB
        ========================== */

        if (rendition) {

            await rendition.next();

        }

    };


/* ==================================================
   MENU BUTTON
================================================== */

document
    .getElementById(
        "menuBtn"
    )
    .onclick =
    function() {

        alert(
            "Menu akan ditambah pada v2.1.3"
        );

    };
