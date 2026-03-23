/*DATA CONFIG */
//Liste des theme dispo
const THEMES = [
    { id: 'wisdom', label: 'Wisdom' },
    { id: 'inspirational', label: 'Inspiration' },
    { id: 'life', label: 'Life' },
    { id: 'love', label: 'Love' },
    { id: 'death', label: 'Death' },
    { id: 'success', label: 'Success' },
    { id: 'courage', label: 'Courage' },
    { id: 'freedom', label: 'Freedom' },
]

const LENGHT_RANGES = {
    short: [0, 80],
    medium: [81, 160],
    long: [161, 999],
}

/*CREATION DYNAMIQUE DES THEMES */

//recuperation du conteneur HTML
const themeRow = document.getElementById('theme-row');

//On boucle sur chaque theme du tableau
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
    //[id^="prefix-"] signifie "id qui commence par..."
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][id^="${prefix}-"]:checked`);

    return Array.from(checkboxes).map(function (el) {
        return el.value;
    })
}

/*Configuration de l'API */
const API_KEY = "0D7QGQ1wY6MNy9yHx4OeHojziY0q7bJmjgDbhdiX";
const API_BASE_RANDOM = "https://api.api-ninjas.com/v2/randomquotes";

//contruction des parametre API

function buildApiNinjaParams() {
    const selectedLenghts = getCheckedValues('len');
    const selectedThemes = getCheckedValues('theme');
    const keyword = document.getElementById('keyword').value.trim();

    const params = new URLSearchParams();

    //joindre les catégories selectionné par virgule comme l'accepte l'api
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

function renderQuote(quote) {
    const output = document.getElementById('output');

    output.innerHTML = `
        <div class="quote-card">
            <p class="quote-text">"${quote.content}"</p>
            <p class="quote-author">- ${quote.author}</p>
        </div>
    `;
}

/* Appel API + Filtrage local*/

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

        if (!response.ok) {
            throw new Error("API Error : " + response.status);
        }

        const data = await response.json();

        //data est un tableau de citations
        //variable filtered = Si data est un tableau mets data dedans sinon mets tableau vide
        let filtered = Array.isArray(data) ? data : [];
        // filtrer par longeur
        if (selectedLenghts.length > 0) {
            filtered = filtered.filter(q => {
                const len = q.quote.length;
                return selectedLenghts.some(lenKey => {
                    const [min, max] = LENGHT_RANGES[lenKey];
                    return len >= min && len <= max
                });
            });
        }
        // filtrer par mot clé 
        if (keyword) {
            filtered = filtered.filter(q =>
                q.quote.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        if (filtered.length === 0) {
            output.innerHTML = `
        <div class="message">
         Pas de citations trouvé avec ces filtres<br>
          Essayez de modifier votre selection !
        </div>
      `;
            return;
        }

        const randomIndex = Math.floor(Math.random() * filtered.length);
        const selectedQuote = filtered[randomIndex];

        // On normalise au format attendu par la fonctoin render
        const normalizedQuote = {
            content: selectedQuote.quote,
            author: selectedQuote.author,
            tags: selectedQuote.categories || []
        };

        renderQuote(normalizedQuote);
    } catch (error) {
        console.error("Erreur :", error);
        output.innerHTML = `
      <div class="message">
        Could not load a quote. Please try again.
      </div>
    `;
    } finally {
        btn.disabled = false;
    }
}

document.getElementById("btn-generate").addEventListener("click", generateQuote);