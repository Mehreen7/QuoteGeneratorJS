/* DATA CONFIG */
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

const LENGTH_RANGES = {
    short: [0, 80],
    medium: [81, 160],
    long: [161, 999],
};

/* CRÉATION DYNAMIQUE DES THÈMES */
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

/* Fonction utilitaire */
function getCheckedValues(prefix) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][id^="${prefix}-"]:checked`);
    return Array.from(checkboxes).map(el => el.value);
}

/* Configuration API */
const API_KEY = "0D7QGQ1wY6MNy9yHx4OeHojziY0q7bJmjgDbhdiX";
const API_BASE_QUOTE = "https://api.api-ninjas.com/v2/quotes";

/* Paramètres API */
function buildApiNinjaParams() {
    const selectedLengths = getCheckedValues('len');
    const selectedThemes = getCheckedValues('theme');

    const params = new URLSearchParams();
    if (selectedThemes.length > 0) {
        params.set("categories", selectedThemes.join(","));
    }

    return { queryString: params.toString(), selectedLengths };
}

/* Vérifie si une citation matche les filtres */
function matchesFilters(q, selectedLengths) {
    const len = q.quote.length;
    console.log("Test longueur :", len);
    const matchLength =
        selectedLengths.length === 0 ||
        selectedLengths.some(lenKey => {
            const [min, max] = LENGTH_RANGES[lenKey];
            return len >= min && len <= max;
        });
    console.log("Résultat match :", matchLength);
    return matchLength;
}

/* Affichage */
function renderQuote(quote) {
    const output = document.getElementById('output');
    output.innerHTML = `
        <div class="quote-card">
            <p class="quote-text">"${quote.content}"</p>
            <p class="quote-author">— ${quote.author}</p>
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
        const { queryString, selectedLengths} = buildApiNinjaParams();
        console.log("=== PARAMS ===");
        console.log("queryString :", queryString);
        console.log("selectedLengths :", selectedLengths);
        const apiUrl = `${API_BASE_QUOTE}?${queryString}`;
        console.log("=== API URL ===");
        console.log(apiUrl);
        const response = await fetch(apiUrl, {
            headers: { "X-Api-Key": API_KEY }
        });
        const data = await response.json();
        console.log("=== RÉPONSE API ===");
        console.log(data);
        console.log("Nombre de quotes :", data.length);
        const quotes = Array.isArray(data) ? data : [];
        console.log("=== DÉTAIL DES QUOTES ===");
        quotes.forEach(q => {
            console.log(q.quote, "| longueur :", q.quote.length);
        });
        const filtered = quotes.filter(q => matchesFilters(q, selectedLengths, keyword));
        console.log("=== FILTRAGE ===");
        console.log("quotes reçues :", quotes.length);
        console.log("quotes filtrées :", filtered.length);
        if (filtered.length === 0) {

            // fallback sans filtre longueur
            const q = quotes[Math.floor(Math.random() * quotes.length)];
            renderQuote({
                content: q.quote,
                author: q.author
            });
            return;
        }

        // Choisit une citation au hasard parmi les résultats filtrés
        const q = filtered[Math.floor(Math.random() * filtered.length)];

        renderQuote({
            content: q.quote,
            author: q.author,
            tags: q.categories || []
        });

    } catch (error) {
        console.error(error);
        output.innerHTML = `<p class="message">Erreur lors de la récupération 😢</p>`;
    } finally {
        btn.disabled = false;
    }


}

/* Event */
document.getElementById("btn-generate").addEventListener("click", generateQuote);