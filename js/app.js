import {
    DEFAULT_MAX_RESULTS,
    DEFAULT_HIGHLIGHT_SUBSTRING
} from "./config.js";

const WORDLIST = "/wl/test.txt";

const searchInput = document.getElementById("search");
const resultsElement = document.getElementById("results");
const countElement = document.getElementById("word-count");

const maxResultsInput =
    document.getElementById("max-results");

const highlightInput =
    document.getElementById("highlight-substring");

let words = [];


// ================================
// SETTINGS
// ================================

maxResultsInput.value = DEFAULT_MAX_RESULTS;
highlightInput.checked = DEFAULT_HIGHLIGHT_SUBSTRING;


// ================================
// LOAD WORDLIST
// ================================

async function loadWordlist() {
    try {
        const response = await fetch(WORDLIST);

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

    const maxResults =
        Math.max(
            1,
            Number(maxResultsInput.value) || 1
        );

    const matches = [];

    for (const word of words) {
        if (word.toLowerCase().includes(query)) {
            matches.push(word);

            if (matches.length >= maxResults) {
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
        const element = document.createElement("div");

        element.className = "result";

        if (highlightInput.checked) {
            element.innerHTML =
                highlight(word, query);
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

    const before =
        word.slice(0, index);

    const match =
        word.slice(
            index,
            index + query.length
        );

    const after =
        word.slice(index + query.length);

    return (
        escapeHTML(before) +
        `<mark>${escapeHTML(match)}</mark>` +
        escapeHTML(after)
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
// INPUT
// ================================

searchInput.addEventListener("input", () => {
    search(searchInput.value);
});

maxResultsInput.addEventListener("input", () => {
    search(searchInput.value);
});

highlightInput.addEventListener("change", () => {
    search(searchInput.value);
});


// ================================
// START
// ================================

loadWordlist();