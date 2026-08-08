/*
==================================================
BOOKAKU LIBRARY
Search + Progress
==================================================
*/


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


    container.innerHTML = "";


    if (!books || books.length === 0) {

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
                ${book.title || book.name}
            </h3>

            <p>
                ${book.author || "Dropbox"}
            </p>

            <small>
                ${String(book.type).toUpperCase()}
            </small>

            ${progressHTML}

            <br>

            <a
                class="btn"
                href="reader.html?id=${book.id}"
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
   LOAD LIBRARY
================================================== */

async function loadLibrary() {

    let books;


    if (
        DropboxEngine.isConnected()
    ) {

        books =
            await DropboxEngine.getBooks();

    } else {

        const response =
            await fetch(
                CONFIG.STORAGE.LIBRARY
            );


        const library =
            await response.json();


        books =
            library.books;

    }


    /* ==========================
       SAVE BOOKS
       FOR SEARCH
    ========================== */

    window.bookakuBooks =
        books;


    displayBooks(
        books
    );


    /* ==========================
       SEARCH
    ========================== */

    const search =
        document.getElementById("search");


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function() {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                displayBooks(
                    window.bookakuBooks
                );

                return;

            }


            const filtered =
                window.bookakuBooks.filter(
                    function(book) {

                        const title =
                            String(
                                book.title ||
                                book.name ||
                                ""
                            ).toLowerCase();


                        const author =
                            String(
                                book.author ||
                                ""
                            ).toLowerCase();


                        return (
                            title.includes(query) ||
                            author.includes(query)
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
   START
================================================== */

loadLibrary();
