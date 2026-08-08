/*
========================================
BookAku
Dropbox Engine v2.2.0
File : dropbox.js
========================================
*/

const DropboxEngine = {

    token: "",

    root: "",

    init() {

        this.token =
            localStorage.getItem("dropbox_token") || "";

        this.root =
            CONFIG.DROPBOX.ROOT_FOLDER || "";

    },


    isConnected() {

        return this.token !== "";

    },


    async api(endpoint, data) {

        if (!this.isConnected()) {

            throw new Error(
                "Dropbox belum disambungkan."
            );

        }

        const response = await fetch(
            "https://api.dropboxapi.com/2/" + endpoint,
            {

                method: "POST",

                headers: {

                    "Authorization":
                        "Bearer " + this.token,

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(data)

            }
        );


        const result = await response.json();


        if (!response.ok) {

            console.error(
                "Dropbox API Error:",
                result
            );

            throw new Error(
                result.error_summary ||
                "Dropbox API error"
            );

        }


        return result;

    },


    async scanFolder() {

        const books = [];

        let result = await this.api(
            "files/list_folder",
            {

                path: this.root,

                recursive: true,

                include_deleted: false,

                include_non_downloadable_files: false

            }
        );


        this.processEntries(
            result.entries,
            books
        );


        while (result.has_more) {

            result = await this.api(
                "files/list_folder/continue",
                {

                    cursor: result.cursor

                }
            );


            this.processEntries(
                result.entries,
                books
            );

        }


        return books;

    },


    processEntries(entries, books) {

        entries.forEach(entry => {

            if (entry[".tag"] !== "file") {
                return;
            }


            const name =
                entry.name || "";

            const extension =
                name
                    .split(".")
                    .pop()
                    .toLowerCase();


            if (
                extension !== "epub" &&
                extension !== "pdf"
            ) {

                return;

            }


            books.push({

                id: entry.id,

                name: entry.name,

                path: entry.path_display,

                size: entry.size,

                modified:
                    entry.server_modified,

                type: extension

            });

        });

    },


    async getBooks() {

    return await this.scanFolder();

},

async getDownloadLink(path) {

    const result = await this.api(
        "files/get_temporary_link",
        {
            path: path
        }
    );

    return result.link;

},

async getBookBlob(path) {

    const response = await fetch(
        "https://content.dropboxapi.com/2/files/download",
        {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + this.token,
                "Dropbox-API-Arg": JSON.stringify({
                    path: path
                })
            }
        }
    );

    if (!response.ok) {
        throw new Error("Gagal memuat turun EPUB");
    }

    return await response.blob();

},

logout() {

    this.token = "";

    localStorage.removeItem("dropbox_token");

}

};

DropboxEngine.init();