// Charger les données JSON
d3.json("data.json").then((graphData) => {
    const NODE_WIDTH = 160;
    const NODE_HEIGHT = 160;
    const SCALE_FACTOR = 250;

    const graph = document.querySelector("#graph");
    const width = graph.clientWidth;
    const height = graph.clientHeight;

    const svg = d3
        .select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(
            d3.zoom().on("zoom", function (event) {
                g.attr("transform", event.transform);
            })
        );

    const g = svg.append("g");

    displayLegend(svg);

    const nodesById = {};
    graphData.nodes.forEach((node) => {
        node.x *= SCALE_FACTOR;
        node.y *= SCALE_FACTOR;
        nodesById[node.id] = node;
    });

    // Dessiner les liens (flèches simples uniquement)
    const links = g
        .selectAll(".link")
        .data(graphData.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", (d) => generateLink(d.source, d.target))
        .attr("marker-end", "url(#arrowhead)");

    // Ajouter le marqueur de flèche simple
    svg.append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("class", "arrow")
        .attr("d", "M0,-5L10,0L0,5");

    // Créer les groupes de nœuds
    const nodes = g
        .selectAll(".node")
        .data(graphData.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
        .on("click", function (event, d) {
            d3.selectAll(".node").classed("node-selected", false);
            d3.select(this).classed("node-selected", true);
            showDetails(event, d);
        });

    // Ajouter des rectangles pour les nœuds
    nodes
        .append("rect")
        .attr("class", (d) => `node-rect ${d.type}`)
        .attr("width", NODE_WIDTH)
        .attr("height", NODE_HEIGHT)
        .attr("rx", 5)
        .attr("ry", 5);

    // Constantes pour la mise en page
    const ICON_SIZE = 40; // Taille fixe de l'icône
    const ICON_MARGIN_TOP = 15; // Marge en haut pour l'icône
    const TEXT_START_Y = NODE_HEIGHT * 0.5 + 5; // Le texte commence à la moitié de la hauteur
    const LINE_HEIGHT = 15;
    const PADDING = 10;
    const MAX_TITLE_LINES = 2;
    const EFFECTIVE_WIDTH = NODE_WIDTH - PADDING * 2; // Largeur effective pour le texte

    // Créer un élément temporaire pour mesurer la largeur du texte
    const textMeasurer = svg
        .append("text")
        .attr("id", "text-measurer")
        .style("visibility", "hidden")
        .style("font-size", "1.05em") // Doit correspondre à la taille de police utilisée
        .style("font-weight", "bold");

    // Ajouter les icônes
    nodes
        .append("image")
        .attr("x", (NODE_WIDTH - ICON_SIZE) / 2) // Centré horizontalement
        .attr("y", ICON_MARGIN_TOP) // Positionnement en haut avec une marge
        .attr("width", ICON_SIZE)
        .attr("height", ICON_SIZE)
        .attr("xlink:href", (d) => (d.icon ? `assets/icons/${d.icon}` : ""));

    // Ajouter les textes (titre et date)
    nodes.each(function (d) {
        const node = d3.select(this);

        // Titre
        const titleText = node
            .append("text")
            .attr("class", "node-text node-title")
            .attr("x", NODE_WIDTH / 2)
            .attr("y", TEXT_START_Y)
            .attr("text-anchor", "middle");

        // répartir le texte sur les lignes
        const titleLines = truncateTextToFit(
            d.titre_court || "",
            EFFECTIVE_WIDTH,
            MAX_TITLE_LINES,
            true
        );

        // Afficher titre
        titleLines.forEach((line, i) => {
            titleText
                .append("tspan")
                .attr("x", NODE_WIDTH / 2)
                .attr("dy", i === 0 ? 0 : LINE_HEIGHT)
                .text(line);
        });

        // Date
        const titleHeight = titleLines.length * LINE_HEIGHT;
        const dateY = TEXT_START_Y + titleHeight + PADDING / 2;

        const dateText = node
            .append("text")
            .attr("class", "node-text node-date")
            .attr("x", NODE_WIDTH / 2)
            .attr("y", dateY)
            .attr("text-anchor", "middle");

        if (d.date) {
            // Limiter au nombre de lignes qui peuvent tenir dans l'espace restant
            const remainingHeight = NODE_HEIGHT - (dateY + PADDING);
            const maxDateLines = Math.floor(remainingHeight / LINE_HEIGHT);
            const dateLines = truncateTextToFit(
                d.date,
                EFFECTIVE_WIDTH,
                maxDateLines,
                false
            );

            // Afficher date
            dateLines.forEach((line, i) => {
                dateText
                    .append("tspan")
                    .attr("x", NODE_WIDTH / 2)
                    .attr("dy", i === 0 ? 0 : LINE_HEIGHT)
                    .text(line);
            });
        }
    });

    // Supprimer l'élément temporaire après utilisation
    textMeasurer.remove();

    // Calculer les limites du graphe
    const xExtent = d3.extent(graphData.nodes, (d) => d.x);
    const yExtent = d3.extent(graphData.nodes, (d) => d.y);

    // Appliquer la transformation initiale pour placer le coin supérieur gauche du graphe en (20,20)
    const initialTranslateX = -xExtent[0] + 20;
    const initialTranslateY = -yExtent[0] + 20;

    // Appliquer la transformation
    const initialTransform = d3.zoomIdentity
        .translate(initialTranslateX, initialTranslateY)
        .scale(1);

    svg.call(d3.zoom().transform, initialTransform);
    g.attr("transform", initialTransform);

    /**
     * Calcule la largeur d’un texte en pixels, en utilisant un élément SVG temporaire.
     *
     * @param {string} text - Le texte dont on veut mesurer la largeur.
     * @returns {number} La largeur du texte en pixels.
     */
    function getTextWidth(text) {
        textMeasurer.text(text);
        return textMeasurer.node().getComputedTextLength();
    }

    /**
     * Tronque et répartit un texte sur plusieurs lignes en respectant une largeur et un nombre de lignes maximum.
     * Peut ajouter des points de suspension ("...") si le texte dépasse l’espace disponible.
     *
     * @param {string} text - Le texte à afficher.
     * @param {number} maxWidth - La largeur maximale (en pixels) autorisée pour chaque ligne.
     * @param {number} maxLines - Le nombre maximal de lignes autorisé.
     * @param {boolean} addEllipsis - Indique s’il faut ajouter "..." à la fin si le texte est tronqué.
     * @returns {string[]} Un tableau contenant les lignes de texte formatées.
     */
    function truncateTextToFit(text, maxWidth, maxLines, addEllipsis) {
        if (!text) return [""];

        const words = text.split(" ");
        const lines = [];
        let currentLine = "";
        let currentLineWidth = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordWithSpace = (currentLine ? " " : "") + word;
            const wordWidth = getTextWidth(wordWithSpace);

            // Si la ligne dépasse la largeur
            if (currentLineWidth + wordWidth > maxWidth) {
                if (!currentLine) {
                    // Couper un mot trop long
                    let j = 0;
                    while (
                        j < word.length &&
                        getTextWidth(word.substring(0, j)) < maxWidth
                    ) {
                        j++;
                    }
                    j = Math.max(0, j - 1);

                    const partialWord =
                        word.substring(0, j) + (addEllipsis ? "..." : "");
                    lines.push(partialWord);

                    if (lines.length >= maxLines) break;

                    currentLine = word.substring(j);
                    currentLineWidth = getTextWidth(currentLine);
                } else {
                    // Ajouter la ligne complète
                    lines.push(currentLine);

                    if (lines.length >= maxLines) {
                        // Ajouter "..." si nécessaire
                        if (addEllipsis && i < words.length) {
                            const lastLine = lines[lines.length - 1];
                            const lastWords = lastLine.split(" ");
                            if (lastWords.length > 1) {
                                const shortenedLine =
                                    lastWords.slice(0, -1).join(" ") + "...";
                                if (getTextWidth(shortenedLine) <= maxWidth) {
                                    lines[lines.length - 1] = shortenedLine;
                                }
                            }
                        }
                        break;
                    }

                    // Démarrer une nouvelle ligne
                    currentLine = word;
                    currentLineWidth = getTextWidth(word);
                }
            } else {
                // Ajouter le mot à la ligne
                currentLine += wordWithSpace;
                currentLineWidth += wordWidth;
            }
        }

        // Ajouter la dernière ligne si possible
        if (currentLine && lines.length < maxLines) {
            lines.push(currentLine);
        }

        return lines;
    }

    /**
     * Générer un lien entre deux noeuds.
     *
     * @param {Object} source - Le nœud source, contenant les coordonnées {x, y}.
     * @param {Object} target - Le nœud cible, contenant les coordonnées {x, y}.
     * @returns {string} Le chemin SVG à utiliser dans l'attribut "d" d'un élément <path>.
     */
    function generateLink(source, target) {
        const sourceNode = nodesById[source];
        const targetNode = nodesById[target];

        const sourceCenterX = sourceNode.x + NODE_WIDTH / 2;
        const sourceCenterY = sourceNode.y + NODE_HEIGHT / 2;
        const targetCenterX = targetNode.x + NODE_WIDTH / 2;
        const targetCenterY = targetNode.y + NODE_HEIGHT / 2;

        // Direction du lien
        const dx = targetCenterX - sourceCenterX;
        const dy = targetCenterY - sourceCenterY;
        const angle = Math.atan2(dy, dx);

        // Forcer l'attachement sur les bords (haut, bas, gauche, droite)
        function getEdgeOffset(angle, width, height) {
            const absCos = Math.abs(Math.cos(angle));
            const absSin = Math.abs(Math.sin(angle));

            if (absCos > absSin) {
                // Horizontal dominant
                return {
                    x: (width / 2) * Math.sign(Math.cos(angle)),
                    y: 0,
                };
            } else {
                // Vertical dominant
                return {
                    x: 0,
                    y: (height / 2) * Math.sign(Math.sin(angle)),
                };
            }
        }

        const sourceOffset = getEdgeOffset(angle, NODE_WIDTH, NODE_HEIGHT);
        const targetOffset = getEdgeOffset(
            angle + Math.PI,
            NODE_WIDTH,
            NODE_HEIGHT
        );

        const startX = sourceCenterX + sourceOffset.x;
        const startY = sourceCenterY + sourceOffset.y;
        const LINK_SHORTENING = 3.5; // Distance pour raccourcir le lien
        const endX =
            targetCenterX + targetOffset.x - LINK_SHORTENING * Math.cos(angle);
        const endY =
            targetCenterY + targetOffset.y - LINK_SHORTENING * Math.sin(angle);

        // Contrôle de la courbe (tu peux ajuster le facteur ici)
        const curveOffset = 0.3 * Math.sqrt(dx * dx + dy * dy);

        const controlPoint1X = startX + curveOffset * Math.cos(angle);
        const controlPoint1Y = startY + curveOffset * Math.sin(angle);
        const controlPoint2X = endX - curveOffset * Math.cos(angle);
        const controlPoint2Y = endY - curveOffset * Math.sin(angle);

        return `M${startX},${startY} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${endX},${endY}`;
    }
});
