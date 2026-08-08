/*
========================================
BookAku
Version : 2.2.0 Alpha
File    : dropbox.js
========================================
*/

const DropboxEngine = {

    accessToken: "",

    rootFolder: "/Apps/PocketBook e-reader",

    setToken(token) {

        this.accessToken = token;

    },

    async api(endpoint, body) {

        const response = await fetch(
            "https://api.dropboxapi.com/2/" + endpoint,
            {
                method: "POST",

                headers: {

                    "Authorization":
                    "Bearer " + this.accessToken,

                    "Content-Type":
                    "application/json"

                },

                body: JSON.stringify(body)

            }
        );

        return await response.json();

    },

    async scanFolder(path = this.rootFolder) {

        return await this.api(

            "files/list_folder",

            {

                path: path,

                recursive: true

            }

        );

    }

};