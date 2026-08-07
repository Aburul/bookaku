/*
========================================
BookAku
Version : 2.1.1 Alpha
File    : reader.js
========================================
*/

let book = null;
let rendition = null;

const viewer = document.getElementById("viewer");
const loading = document.getElementById("loading");

const title = document.getElementById("bookTitle");
const author = document.getElementById("bookAuthor");

const params = new URLSearchParams(window.location.search);

const bookId = params.get("id");

console.log("Book ID :", bookId);

// sementara tunggu library.json
title.textContent = "BookAku";
author.textContent = "EPUB Reader";

loading.style.display = "flex";

document
.getElementById("backButton")
.onclick = () => {

    history.back();

};

document
.getElementById("prevPage")
.onclick = () => {

    if(rendition){

        rendition.prev();

    }

};

document
.getElementById("nextPage")
.onclick = () => {

    if(rendition){

        rendition.next();

    }

};

document
.getElementById("increaseFont")
.onclick = () => {

    console.log("Increase Font");

};

document
.getElementById("decreaseFont")
.onclick = () => {

    console.log("Decrease Font");

};

document
.getElementById("themeButton")
.onclick = () => {

    console.log("Theme");

};

document
.getElementById("chapterButton")
.onclick = () => {

    console.log("Chapter");

};