
const WORDLIST = "/wl/test.txt";

const countElement = document.getElementById("word-count");

async function loadWordlistInfo() {
    try {
        const response = await fetch(WORDLIST);

        if (!response.ok) {
            throw new Error("wordlist could not be loaded");
        }

        const text = await response.text();

        const lines = text
            .split(/\r?\n/)
            .filter(line => line.trim().length > 0);

        countElement.textContent =
            `${lines.length.toLocaleString()} words loaded`;

    } catch (error) {
        console.error(error);
        countElement.textContent = "could not load wordlist";
    }
}

loadWordlistInfo();