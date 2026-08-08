/*
==================================================
BOOKAKU LIBRARY
Search + Progress
==================================================
*/


let allBooks = [];


/* ==================================================
   GET BOOK PROGRESS
================================================== */

function getBookProgress(book) {

    if (!book || !book.id) {
        return 0;
    }


    let progress = 0;


    if (
        String(book.type).toLowerCase() === "pdf"
    ) {

        progress =
            parseFloat(
                localStorage.getItem(
                    "bookaku_pdf_percent_" + book.id
                )
            ) || 0;

    } else {

        progress =
            parseFloat(
                localStorage.getItem(
                    "bookaku_epub_percent_" + book.id
                )
            ) || 0;

    }


    progress =
        Math.max(
            0,
            Math.min(
                1,
                progress
            )
        );


    return Math.round(
        progress * 100
    );

}


/* ==================================================
   DISPLAY BOOKS
================================================== */

function displayBooks(books) {

    const container =
        document.getElementById("books");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !books ||
        books.length === 0
    ) {

        container.innerHTML =
            "<p>Tiada buku dijumpai.</p>";

        return;

    }


    books.forEach(book => {

        const card =
            document.createElement("div");


        card.className =
            "book";


        const progress =
            getBookProgress(book);


        const progressHTML = `

            <div class="progress-container">

                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width: ${progress}%"
                    ></div>

                </div>

                <small>
                    ${progress}% selesai
                </small>

            </div>

        `;


        card.innerHTML = `

            <h3>
                ${book.title || book.name || "Tanpa tajuk"}
            </h3>

            <p>
                ${book.author || "Dropbox"}
            </p>

            <small>
                ${String(
                    book.type || ""
                ).toUpperCase()}
            </small>

            ${progressHTML}

            <br>

            <a
                class="btn"
                href="reader.html?id=${encodeURIComponent(book.id)}"
            >
                📖 ${
                    progress > 0
                    ? "Sambung membaca"
                    : "Baca"
                }
            </a>

        `;


        container.appendChild(card);

    });

}


/* ==================================================
   SEARCH
================================================== */

function setupSearch() {

    const search =
        document.getElementById("search");


    if (!search) {

        console.error(
            "Input #search tidak dijumpai."
        );

        return;

    }


    console.log(
        "Search siap."
    );


    search.addEventListener(
        "input",
        function(event) {

            const query =
                event.target.value
                    .trim()
                    .toLowerCase();


            console.log(
                "Search:",
                query
            );


            if (!query) {

                displayBooks(
                    allBooks
                );

                return;

            }


            const filtered =
                allBooks.filter(
                    function(book) {

                        const title =
                            String(
                                book.title ||
                                book.name ||
                                ""
                            )
                                .toLowerCase();


                        const author =
                            String(
                                book.author ||
                                ""
                            )
                                .toLowerCase();


                        const type =
                            String(
                                book.type ||
                                ""
                            )
                                .toLowerCase();


                        return (
                            title.includes(query) ||
                            author.includes(query) ||
                            type.includes(query)
                        );

                    }
                );


            displayBooks(
                filtered
            );

        }
    );

}


/* ==================================================
   LOAD LIBRARY
================================================== */

async function loadLibrary() {

    try {

        /*
        Tunggu Dropbox jika tersedia
        */

        if (
            DropboxEngine.ready
        ) {

            await DropboxEngine.ready;

        }


        let books;


        /* ==========================
           DROPBOX
        ========================== */

        if (
            DropboxEngine.isConnected()
        ) {

            books =
                await DropboxEngine.getBooks();

        }


        /* ==========================
           LOCAL LIBRARY
        ========================== */

        else {

            const response =
                await fetch(
                    CONFIG.STORAGE.LIBRARY
                );


            if (!response.ok) {

                throw new Error(
                    "Gagal membaca library."
                );

            }


            const library =
                await response.json();


            books =
                library.books || [];

        }


        /* ==========================
           SAVE BOOKS
        ========================== */

        allBooks =
            Array.isArray(books)
            ? books
            : [];


        window.bookakuBooks =
            allBooks;


        /* ==========================
           DISPLAY
        ========================== */

        displayBooks(
            allBooks
        );


        console.log(
            "Library loaded:",
            allBooks.length,
            "books"
        );


    } catch (error) {

        console.error(
            "LOAD LIBRARY ERROR:",
            error
        );


        const container =
            document.getElementById("books");


        if (container) {

            container.innerHTML = `
                <p>Gagal memuatkan buku.</p>
                <small>
                    ${error.message}
                </small>
            `;

        }

    }

}


/* ==================================================
   START
================================================== */

/*
Pasang search dahulu.
*/

setupSearch();

/* ==================================================
   DROPBOX BUTTON
================================================== */

function setupDropboxButton() {

    const button =
        document.getElementById("dropboxBtn");

    if (!button) {
        return;
    }

    function updateButton() {

        if (
            DropboxEngine.isConnected()
        ) {

            button.textContent =
                "☁️ Dropbox Disambung";

        } else {

            button.textContent =
                "☁️ Sambung Dropbox";

        }

    }

    button.addEventListener(
        "click",
        async function() {

            try {

                if (
                    DropboxEngine.isConnected()
                ) {

                    return;

                }

                await DropboxEngine.authorize();

            } catch (error) {

                console.error(
                    "Dropbox authorize error:",
                    error
                );

                alert(
                    "Gagal menyambung Dropbox."
                );

            }

        }
    );

    updateButton();

}
/*
Kemudian load buku.
*/

loadLibrary();
