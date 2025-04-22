/**
 * Crée un élément HTML, lui applique diverses options (texte, classes, attributs, styles, etc.)
 * puis l'ajoute à un parent existant dans le DOM.
 *
 * @param {string} tag - Le nom de la balise HTML à créer (ex : 'div', 'span', 'button', etc.).
 * @param {HTMLElement} parent - L'élément DOM parent auquel ajouter le nouvel élément.
 * @param {Object} [options={}] - Un objet contenant les options de configuration de l'élément.
 * @param {string} [options.text] - Texte brut à insérer dans l'élément (incompatible avec `html`).
 * @param {string} [options.html] - Contenu HTML à insérer dans l'élément (écrase `text` si les deux sont fournis).
 * @param {string|string[]} [options.class] - Classe(s) CSS à ajouter à l'élément.
 * @param {string} [options.id] - Identifiant unique à attribuer à l'élément.
 * @param {Object} [options.attributes] - Attributs HTML personnalisés à ajouter à l'élément.
 * @param {Object} [options.styles] - Styles CSS à appliquer à l'élément (clés en camelCase ou syntaxe CSS standard).
 *
 * @returns {HTMLElement} L'élément HTML nouvellement créé et ajouté au DOM.
 */
function createElement(tag, parent, options = {}) {
    let element = document.createElement(tag);

    if (options.text)
        element.appendChild(document.createTextNode(options.text));

    if (options.html) element.innerHTML = options.html;

    if (options.class) {
        if (Array.isArray(options.class)) {
            element.classList.add(...options.class);
        } else {
            element.classList.add(options.class);
        }
    }

    if (options.id) element.id = options.id;

    if (options.attributes) {
        for (let attr in options.attributes) {
            if (options.attributes.hasOwnProperty(attr)) {
                element.setAttribute(attr, options.attributes[attr]);
            }
        }
    }

    if (options.styles) {
        for (let style in options.styles) {
            if (options.styles.hasOwnProperty(style)) {
                element.style[style] = options.styles[style];
            }
        }
    }

    parent.appendChild(element);

    return element;
}

/**
 * Récupère la valeur d'une variable CSS définie au niveau de l'élément racine (:root).
 *
 * @param {string} varName - Le nom de la variable CSS à récupérer (doit inclure le préfixe '--', ex : '--main-color').
 * @returns {string} La valeur de la variable CSS, sans espaces superflus.
 */
function getCssVariable(varName) {
    // Utilise getComputedStyle pour obtenir les styles calculés de l'élément <html> (document.documentElement)
    // puis extrait la valeur de la variable CSS spécifiée.
    return getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
}
