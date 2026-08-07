/*
========================================
BookAku
Version : 2.1.1 Alpha
File    : storage.js
========================================
*/

const Storage = {

    library: null,

    async loadLibrary() {

        try {

            const response = await fetch("data/library.json");

            if (!response.ok) {
                throw new Error("Gagal membaca library.json");
            }

            this.library = await response.json();

            console.log("Library Loaded");

            return true;

        } catch (error) {

            console.error(error);

            return false;

        }

    },

    getBooks() {

        if (!this.library) return [];

        return this.library.books || [];

    },

    getBook(id) {

        if (!this.library) return null;

        return this.library.books.find(book => book.id === id);

    },

    saveHistory(bookId, location) {

        console.log("History");

    },

    loadHistory(bookId) {

        return null;

    },

    saveBookmark(bookId, cfi) {

        console.log("Bookmark");

    },

    loadBookmark(bookId) {

        return null;

    }

};