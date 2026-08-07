/*
========================================
BookAku
Version : 2.1.1 Alpha
File    : storage.js
========================================
*/

const Storage = {

    library: null,

    async init() {

        const response = await fetch("data/library.json");

        this.library = await response.json();

        console.log("Library Loaded");

    },

    getBooks() {

        if (!this.library) return [];

        return this.library.books;

    },

    getBook(id) {

        if (!this.library) return null;

        return this.library.books.find(book => book.id == id);

    }

};