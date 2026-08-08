/*
    BOOKAKU - DROPBOX ENGINE
    OAuth 2 PKCE
*/

const DropboxEngine = {

    token: "",
    refreshToken: "",
    tokenExpiresAt: 0,

    root: "",

    /*
    ==========================
    INIT
    ==========================
    */

    async init() {

        this.root =
            CONFIG.DROPBOX.ROOT_FOLDER || "";

        /*
        Load saved authentication
        */

        this.token =
            localStorage.getItem(
                "dropbox_token"
            ) || "";

        this.refreshToken =
            localStorage.getItem(
                "dropbox_refresh_token"
            ) || "";

        this.tokenExpiresAt =
            parseInt(
                localStorage.getItem(
                    "dropbox_token_expires_at"
                ) || "0",
                10
            );


        /*
        Check OAuth callback
        */

        const params =
            new URLSearchParams(
                window.location.search
            );

        const code =
            params.get("code");

        const state =
            params.get("state");

        const savedState =
            sessionStorage.getItem(
                "dropbox_oauth_state"
            );


        if (code) {

            if (
                !state ||
                state !== savedState
            ) {

                throw new Error(
                    "OAuth state tidak sah."
                );

            }


            console.log(
                "Dropbox OAuth code diterima."
            );


            await this.exchangeCode(
                code
            );


            /*
            Buang ?code=... dari URL
            */

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );

        }

    },


    /*
    ==========================
    CONNECTED
    ==========================
    */

    isConnected() {

        return this.token !== "";

    },


    /*
    ==========================
    AUTHORIZE
    ==========================
    */

    async authorize() {

        const appKey =
            CONFIG.DROPBOX.APP_KEY;

        const redirectUri =
            CONFIG.DROPBOX.REDIRECT_URI;


        if (!appKey) {

            throw new Error(
                "DROPBOX.APP_KEY belum diisi."
            );

        }


        /*
        Generate PKCE verifier
        */

        const codeVerifier =
            this.generateCodeVerifier();


        const codeChallenge =
            await this.generateCodeChallenge(
                codeVerifier
            );


        /*
        Generate state
        */

        const state =
            this.generateState();


        /*
        Simpan untuk callback
        */

        sessionStorage.setItem(
            "dropbox_code_verifier",
            codeVerifier
        );

        sessionStorage.setItem(
            "dropbox_oauth_state",
            state
        );


        /*
        Dropbox OAuth URL
        */

        const params =
            new URLSearchParams({

                client_id:
                    appKey,

                response_type:
                    "code",

                redirect_uri:
                    redirectUri,

                state:
                    state,

                code_challenge:
                    codeChallenge,

                code_challenge_method:
                    "S256",

                token_access_type:
                    "offline",

                scope:
                    "files.metadata.read files.content.read"

            });


        const authUrl =
            "https://www.dropbox.com/oauth2/authorize?" +
            params.toString();


        console.log(
            "Dropbox Authorize:",
            authUrl
        );


        window.location.href =
            authUrl;

    },


    /*
    ==========================
    PKCE VERIFIER
    ==========================
    */

    generateCodeVerifier() {

        const bytes =
            new Uint8Array(64);

        crypto.getRandomValues(bytes);


        return this.base64UrlEncode(
            bytes
        );

    },


    /*
    ==========================
    PKCE CHALLENGE
    ==========================
    */

    async generateCodeChallenge(
        verifier
    ) {

        const data =
            new TextEncoder().encode(
                verifier
            );


        const digest =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );


        return this.base64UrlEncode(
            new Uint8Array(digest)
        );

    },


    /*
    ==========================
    STATE
    ==========================
    */

    generateState() {

        const bytes =
            new Uint8Array(32);

        crypto.getRandomValues(bytes);


        return this.base64UrlEncode(
            bytes
        );

    },


    /*
    ==========================
    BASE64 URL
    ==========================
    */

    base64UrlEncode(bytes) {

        let binary = "";

        bytes.forEach(
            byte => {
                binary +=
                    String.fromCharCode(
                        byte
                    );
            }
        );


        return btoa(binary)

            .replace(/\+/g, "-")

            .replace(/\//g, "_")

            .replace(/=/g, "");

    },


    /*
    ==========================
    EXCHANGE CODE
    ==========================
    */

    async exchangeCode(code) {

        const verifier =
            sessionStorage.getItem(
                "dropbox_code_verifier"
            );


        if (!verifier) {

            throw new Error(
                "PKCE code verifier tidak dijumpai."
            );

        }


        const body =
            new URLSearchParams({

                code:
                    code,

                grant_type:
                    "authorization_code",

                client_id:
                    CONFIG.DROPBOX.APP_KEY,

                redirect_uri:
                    CONFIG.DROPBOX.REDIRECT_URI,

                code_verifier:
                    verifier

            });


        const response =
            await fetch(
                "https://api.dropboxapi.com/oauth2/token",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded"

                    },

                    body:
                        body.toString()

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            console.error(
                "Dropbox OAuth Error:",
                result
            );

            throw new Error(
                result.error_description ||
                result.error_summary ||
                "Dropbox OAuth gagal."
            );

        }


        console.log(
            "Dropbox OAuth berjaya."
        );


        /*
        Save token
        */

        this.token =
            result.access_token || "";


        this.refreshToken =
            result.refresh_token || "";


        /*
        expires_in = seconds
        */

        this.tokenExpiresAt =
            Date.now() +
            (
                (result.expires_in || 14400)
                * 1000
            );


        localStorage.setItem(
            "dropbox_token",
            this.token
        );


        if (this.refreshToken) {

            localStorage.setItem(
                "dropbox_refresh_token",
                this.refreshToken
            );

        }


        localStorage.setItem(
            "dropbox_token_expires_at",
            String(
                this.tokenExpiresAt
            )
        );


        /*
        Verifier hanya digunakan sekali
        */

        sessionStorage.removeItem(
            "dropbox_code_verifier"
        );

        sessionStorage.removeItem(
            "dropbox_oauth_state"
        );

    },


    /*
    ==========================
    REFRESH TOKEN
    ==========================
    */

    async refreshAccessToken() {

        if (!this.refreshToken) {

            console.warn(
                "Tiada refresh token."
            );

            return false;

        }


        console.log(
            "Refresh Dropbox access token..."
        );


        const body =
            new URLSearchParams({

                refresh_token:
                    this.refreshToken,

                grant_type:
                    "refresh_token",

                client_id:
                    CONFIG.DROPBOX.APP_KEY

            });


        const response =
            await fetch(
                "https://api.dropboxapi.com/oauth2/token",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded"

                    },

                    body:
                        body.toString()

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            console.error(
                "Refresh Token Error:",
                result
            );


            /*
            Refresh token sudah tidak sah
            */

            if (
                result.error ===
                "invalid_grant"
            ) {

                this.logout();

            }


            return false;

        }


        this.token =
            result.access_token;


        this.tokenExpiresAt =
            Date.now() +
            (
                (result.expires_in || 14400)
                * 1000
            );


        localStorage.setItem(
            "dropbox_token",
            this.token
        );


        localStorage.setItem(
            "dropbox_token_expires_at",
            String(
                this.tokenExpiresAt
            )
        );


        console.log(
            "Dropbox token berjaya diperbaharui."
        );


        return true;

    },


    /*
    ==========================
    CHECK TOKEN
    ==========================
    */

    async ensureToken() {

        if (!this.token) {

            throw new Error(
                "Dropbox belum disambungkan."
            );

        }


        /*
        Refresh sedikit awal
        */

        const buffer =
            60 * 1000;


        if (
            this.tokenExpiresAt &&
            Date.now() >
            (
                this.tokenExpiresAt -
                buffer
            )
        ) {

            const refreshed =
                await this.refreshAccessToken();


            if (!refreshed) {

                throw new Error(
                    "Dropbox access token telah tamat."
                );

            }

        }

    },


    /*
    ==========================
    API
    ==========================
    */

    async api(
        endpoint,
        data,
        retry = true
    ) {

        await this.ensureToken();


        const response =
            await fetch(
                "https://api.dropboxapi.com/2/" +
                endpoint,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            this.token,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(data)

                }
            );


        const result =
            await response.json();


        /*
        Token expired
        */

        if (
            response.status === 401 &&
            retry
        ) {

            console.log(
                "Dropbox 401. Cuba refresh token..."
            );


            const refreshed =
                await this.refreshAccessToken();


            if (refreshed) {

                return await this.api(
                    endpoint,
                    data,
                    false
                );

            }

        }


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


    /*
    ==========================
    SCAN FOLDER
    ==========================
    */

    async scanFolder() {

        const books = [];


        let result =
            await this.api(
                "files/list_folder",
                {

                    path:
                        this.root,

                    recursive:
                        true,

                    include_deleted:
                        false,

                    include_non_downloadable_files:
                        false

                }
            );


        this.processEntries(
            result.entries,
            books
        );


        while (result.has_more) {

            result =
                await this.api(
                    "files/list_folder/continue",
                    {

                        cursor:
                            result.cursor

                    }
                );


            this.processEntries(
                result.entries,
                books
            );

        }


        return books;

    },


    /*
    ==========================
    PROCESS FILES
    ==========================
    */

    processEntries(
        entries,
        books
    ) {

        entries.forEach(
            entry => {

                if (
                    entry[".tag"] !==
                    "file"
                ) {

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

                    id:
                        entry.id,

                    name:
                        entry.name,

                    path:
                        entry.path_display,

                    size:
                        entry.size,

                    modified:
                        entry.server_modified,

                    type:
                        extension

                });

            }
        );

    },


    /*
    ==========================
    GET BOOKS
    ==========================
    */

    async getBooks() {

        return await this.scanFolder();

    },


    /*
    ==========================
    DOWNLOAD LINK
    ==========================
    */

    async getDownloadLink(
        path
    ) {

        const result =
            await this.api(
                "files/get_temporary_link",
                {

                    path:
                        path

                }
            );


        return result.link;

    },


    /*
    ==========================
    GET BOOK BLOB
    ==========================
    */

    async getBookBlob(
        path
    ) {

        await this.ensureToken();


        let response =
            await fetch(
                "https://content.dropboxapi.com/2/files/download",
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            this.token,

                        "Dropbox-API-Arg":
                            JSON.stringify({
                                path:
                                    path
                            })

                    }

                }
            );


        /*
        Token expired
        */

        if (
            response.status === 401
        ) {

            const refreshed =
                await this.refreshAccessToken();


            if (refreshed) {

                response =
                    await fetch(
                        "https://content.dropboxapi.com/2/files/download",
                        {

                            method: "POST",

                            headers: {

                                "Authorization":
                                    "Bearer " +
                                    this.token,

                                "Dropbox-API-Arg":
                                    JSON.stringify({
                                        path:
                                            path
                                    })

                            }

                        }
                    );

            }

        }


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Dropbox Download Error:",
                errorText
            );


            throw new Error(
                "Gagal memuat turun buku dari Dropbox."
            );

        }


        return await response.blob();

    },


    /*
    ==========================
    LOGOUT
    ==========================
    */

    logout() {

        this.token = "";

        this.refreshToken = "";

        this.tokenExpiresAt = 0;


        localStorage.removeItem(
            "dropbox_token"
        );

        localStorage.removeItem(
            "dropbox_refresh_token"
        );

        localStorage.removeItem(
            "dropbox_token_expires_at"
        );


        console.log(
            "Dropbox telah logout."
        );

    }

};


/*
==========================
START
==========================
*/

DropboxEngine.init()
    .then(() => {

        console.log(
            "DropboxEngine ready."
        );

    })
    .catch(error => {

        console.error(
            "Dropbox init error:",
            error
        );

    });
