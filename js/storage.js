
import {
    WORDLIST_URL,
    MAX_RESULTS,
    HIGHLIGHT_SUBSTRING
} from "./settings.js";

import {
    loadUsedWords,
    addUsedWord,
    takeBackWord,
    takeBackAll
} from "./storage.js";


const searchInput = document.getElementById("search");
const resultsElement = document.getElementById("results");
const countElement = document.getElementById("word-count");

let words = [];
let availableWords = [];
let usedWords = [];


// ================================
// LOAD WORDLIST
// ================================

async function loadWordlist() {
    try {
        const response = await fetch(WORDLIST_URL);

        if (!response.ok) {
            throw new Error("Failed to load wordlist");
        }

        const text = await response.text();

        words = [
            ...new Set(
                text
                    .split(/\r?\n/)
                    .map(word => word.trim())
                    .filter(Boolean)
            )
        ];

        usedWords = loadUsedWords();

        availableWords = words.filter(
            word => !usedWords.includes(word)
        );

        updateCount();
        displayUsedWords();

    } catch (error) {
        console.error(error);

        countElement.textContent =
            "failed to load wordlist";
    }
}


// ================================
// SEARCH
// ================================

function search() {
    const query =
        searchInput.value.trim().toLowerCase();

    if (!query) {
        resultsElement.innerHTML = "";
        return;
    }

    const matches = [];

    for (const word of availableWords) {
        if (word.toLowerCase().includes(query)) {
            matches.push(word);

            if (matches.length >= MAX_RESULTS) {
                break;
            }
        }
    }

    displayResults(matches, query);
}


// ================================
// DISPLAY RESULTS
// ================================

function displayResults(matches, query) {
    resultsElement.innerHTML = "";

    if (matches.length === 0) {
        resultsElement.textContent = "no matches";
        return;
    }

    for (const word of matches) {
        const element =
            document.createElement("div");

        element.className = "result";

        if (HIGHLIGHT_SUBSTRING) {
            element.innerHTML =
                highlight(word, query);
        } else {
            element.textContent = word;
        }

        resultsElement.appendChild(element);

        // Clicking a result uses it.
        element.addEventListener("click", () => {
            useWord(word);
        });
    }
}


// ================================
// USE WORD
// ================================

function useWord(word) {
    const index =
        availableWords.indexOf(word);

    if (index === -1) {
        return;
    }

    // Remove from available pool.
    availableWords.splice(index, 1);

    // Put into used bag.
    addUsedWord(word, usedWords);

    displayUsedWords();
    updateCount();

    // Clear current result.
    resultsElement.innerHTML = "";
}


// ================================
// TAKE ONE WORD BACK
// ================================

function takeBack(word) {
    const removed =
        takeBackWord(word, usedWords);

    if (!removed) {
        return;
    }

    if (!availableWords.includes(word)) {
        availableWords.push(word);
    }

    displayUsedWords();
    updateCount();
}


// ================================
// TAKE ALL WORDS BACK
// ================================

function takeBackEverything() {
    for (const word of usedWords) {
        if (!availableWords.includes(word)) {
            availableWords.push(word);
        }
    }

    takeBackAll(usedWords);

    displayUsedWords();
    updateCount();
}


// ================================
// USED WORD DISPLAY
// ================================

function displayUsedWords() {
    const container =
        document.getElementById("used-words");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    for (const word of usedWords) {
        const element =
            document.createElement("div");

        element.className = "used-word";

        const text =
            document.createElement("span");

        text.textContent = word;

        const button =
            document.createElement("button");

        button.textContent = "↩";

        button.title = "put word back";

        button.addEventListener(
            "click",
            () => takeBack(word)
        );

        element.appendChild(text);
        element.appendChild(button);

        container.appendChild(element);
    }
}


// ================================
// WORD COUNT
// ================================

function updateCount() {
    countElement.textContent =
        `${availableWords.length.toLocaleString()} words available`;
}


// ================================
// HIGHLIGHT
// ================================

function highlight(word, query) {
    const lowerWord =
        word.toLowerCase();

    const index =
        lowerWord.indexOf(query);

    if (index === -1) {
        return escapeHTML(word);
    }

    return (
        escapeHTML(
            word.slice(0, index)
        ) +

        `<mark>${escapeHTML(
            word.slice(
                index,
                index + query.length
            )
        )}</mark>` +

        escapeHTML(
            word.slice(index + query.length)
        )
    );
}


// ================================
// HTML SAFETY
// ================================

function escapeHTML(text) {
    const element =
        document.createElement("div");

    element.textContent = text;

    return element.innerHTML;
}


// ================================
// ENTER = SEARCH
// ================================

searchInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            event.preventDefault();
            search();
        }
    }
);


// ================================
// NUMBER = SEARCH IN FOCUS MODE
// ================================

document.addEventListener(
    "keydown",
    event => {

        // Never steal number keys from text inputs.
        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }

        // 0-9 triggers search.
        if (/^[0-9]$/.test(event.key)) {
            search();
        }
    }
);


// ================================
// TAKE ALL BACK BUTTON
// ================================

const takeBackAllButton =
    document.getElementById("take-back-all");

if (takeBackAllButton) {
    takeBackAllButton.addEventListener(
        "click",
        takeBackEverything
    );
}


// ================================
// START
// ================================

loadWordlist();
