
import {
    WORDLIST_URL,
    MAX_RESULTS,
    HIGHLIGHT_SUBSTRING
} from "./settings.js";

const searchInput = document.getElementById("search");
const resultsElement = document.getElementById("results");
const countElement = document.getElementById("word-count");

let words = [];


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

        countElement.textContent =
            `${words.length.toLocaleString()} words`;

    } catch (error) {
        console.error(error);
        countElement.textContent =
            "failed to load wordlist";
    }
}


// ================================
// SEARCH
// ================================

function search(query) {
    query = query.trim().toLowerCase();

    if (!query) {
        resultsElement.innerHTML = "";
        return;
    }

    const matches = [];

    for (const word of words) {
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
// DISPLAY
// ================================

function displayResults(matches, query) {
    resultsElement.innerHTML = "";

    if (matches.length === 0) {
        resultsElement.textContent = "no matches";
        return;
    }

    for (const word of matches) {
        const element = document.createElement("div");

        element.className = "result";

        if (HIGHLIGHT_SUBSTRING) {
            element.innerHTML = highlight(word, query);
        } else {
            element.textContent = word;
        }

        resultsElement.appendChild(element);
    }
}


// ================================
// HIGHLIGHT
// ================================

function highlight(word, query) {
    const lowerWord = word.toLowerCase();
    const index = lowerWord.indexOf(query);

    if (index === -1) {
        return escapeHTML(word);
    }

    return (
        escapeHTML(word.slice(0, index)) +
        `<mark>${escapeHTML(
            word.slice(index, index + query.length)
        )}</mark>` +
        escapeHTML(word.slice(index + query.length))
    );
}


// ================================
// HTML SAFETY
// ================================

function escapeHTML(text) {
    const element = document.createElement("div");
    element.textContent = text;
    return element.innerHTML;
}


// ================================
// INPUT
// ================================

searchInput.addEventListener("input", () => {
    search(searchInput.value);
});


// ================================
// START
// ================================

loadWordlist();
