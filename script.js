/*DATA CONFIG */
const THEMES = [
    { id: 'wisdom', label: 'Wisdom' },
    { id: 'inspirational', label: 'Inspiration' },
    { id: 'life', label: 'Life' },
    { id: 'love', label: 'Love' },
    { id: 'death', label: 'Death' },
    { id: 'success', label: 'Success' },
    { id: 'courage', label: 'Courage' },
    { id: 'freedom', label: 'Freedom' },
];

const LENGHT_RANGES = {
    short: [0, 80],
    medium: [81, 160],
    long: [161, 999],
};

/*CREATION DYNAMIQUE DES THEMES */
const themeRow = document.getElementById('theme-row');

THEMES.forEach(function (theme) {
    const div = document.createElement('div');
    div.className = 'chip';

    div.innerHTML = `
        <input type="checkbox" id="theme-${theme.id}" value="${theme.id}" />
        <label for="theme-${theme.id}">${theme.label}</label>
    `;
    themeRow.appendChild(div);
});

/*Fonction utilitaire*/
function getCheckedValues(prefix) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][id^="${prefix}-"]:checked`);
    return Array.from(checkboxes).map(el => el.value);
}

/*Configuration API*/
const API_KEY = "TON_API_KEY_ICI"; // ⚠️ pense à la cacher plus tard
const API_BASE_RANDOM = "https://api.api-ninjas.com/v2/randomquotes";

/*Paramètres API*/
function buildApiNinjaParams() {
    const selectedLenghts = getCheckedValues('len');
    const selectedThemes = getCheckedValues('theme');
    const keyword = document.getElementById('keyword').value.trim();

    const params = new URLSearchParams();

    if (selectedThemes.length > 0) {
        params.set("categories", selectedThemes.join(","));
    }

    if (keyword) {
        params.set("keyword", keyword);
    }

    return {
        queryString: params.toString(),
        selectedLenghts,
        keyword
    };
}

/* Vérifie si une citation match les filtres */
function matchesFilters(q, selectedLenghts, keyword) {
    const len = q.quote.length;

    const matchLength =
        selectedLenghts.length === 0 ||
        selectedLenghts.some(lenKey => {
            const [min, max] = LENGHT_RANGES[lenKey];
            return len >= min && len <= max;
        });

    const matchKeyword =
        !keyword || q.quote.toLowerCase().includes(keyword.toLowerCase());

    return matchLength && matchKeyword;
}

/* Affichage */
function renderQuote(quote) {
    const output = document.getElementById('output');

    output.innerHTML = `
        <div class="quote-card">
            <p class="quote-text">"${quote.content}"</p>
            <p class="quote-author">- ${quote.author}</p>
        </div>
    `;
}

/* MAIN */
async function generateQuote() {
    const btn = document.getElementById('btn-generate');
    const output = document.getElementById('output');

    btn.disabled = true;
    output.innerHTML = `<div class="message"><div class="spinner"></div></div>`;

    try {
        const { queryString, selectedLenghts, keyword } = buildApiNinjaParams();
        const apiUrl = `${API_BASE_RANDOM}?${queryString}`;

        const response = await fetch(apiUrl, {
            headers: { "X-Api-Key": API_KEY }
        });

        const data = await response.json();
        const quotes = Array.isArray(data) ? data : [];

        if (quotes.length === 0) {
            output.innerHTML = "Pas de citation 😢";
            return;
        }

        const q = quotes[0]; // 👉 on prend juste la première

        renderQuote({
            content: q.quote,
            author: q.author,
            tags: q.categories || []
        });

    } catch (error) {
        console.error(error);
        output.innerHTML = "Erreur 😢";
    } finally {
        btn.disabled = false;
    }
}

/* Event */
document.getElementById("btn-generate")
    .addEventListener("click", generateQuote);