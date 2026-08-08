/*
========================================
BookAku
Dropbox Engine v2.2.0
========================================
*/

const DropboxEngine = {

    token: "",

    root: "",

    init() {

        this.token = localStorage.getItem("dropbox_token") || "";

        this.root = CONFIG.DROPBOX.ROOT_FOLDER;

    },

    isConnected() {

        return this.token !== "";

    },

    saveToken(token) {

        this.token = token;

        localStorage.setItem("dropbox_token", token);

    },

    logout() {

        this.token = "";

        localStorage.removeItem("dropbox_token");

    }

};

DropboxEngine.init();