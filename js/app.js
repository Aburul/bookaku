/*
*/

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


/* ==========================
   LOAD LIBRARY
========================== */

async function loadLibrary() {

    try {

        /*
        Tunggu Dropbox OAuth selesai
        */

        if (DropboxEngine.ready) {

            await DropboxEngine.ready;

        }


        let books;


        /* ==========================
           LOAD BOOKS
        ========================== */

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


            if (!response.ok) {

                throw new Error(
                    "Gagal membaca library.json"
                );

            }


            const library =
                await response.json();


            books =
                library.books || [];

        }


        /* ==========================
           CONTAINER
        ========================== */

        const container =
            document.getElementById("books");


        container.innerHTML = "";


        /* ==========================
           BOOK CARDS
        ========================== */

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


        console.log(
            "Library loaded:",
            books.length,
            "books"
        );


    } catch (error) {

        console.error(
            "LOAD LIBRARY ERROR:",
            error
        );


        const container =
            document.getElementById("books");


        container.innerHTML = `

            <p>
                Gagal memuatkan buku.
            </p>

            <small>
                ${error.message}
            </small>

        `;

    }

}


loadLibrary();
