/**
 * Affiche une légende dans un élément SVG avec des codes couleurs pour différents types d'éléments.
 * Chaque item de la légende est représenté par un rectangle coloré et un label textuel.
 *
 * @param {d3.Selection} svg - La sélection D3 de l'élément SVG dans lequel la légende doit être insérée.
 */
function displayLegend(svg) {
    // Création du groupe contenant la légende, positionné avec une translation
    const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(10, 10)");

    // Données de la légende : couleurs (récupérées via des variables CSS) et labels
    const legendData = [
        { color: getCssVariable("--project-color"), label: "Projet" },
        { color: getCssVariable("--education-color"), label: "Formation" },
        { color: getCssVariable("--experience-color"), label: "Expérience" },
    ];

    const rectWidth = 15;
    const rectHeight = 15;

    // Pour chaque élément de la légende, on crée un groupe contenant un rectangle et un texte
    legendData.forEach((item, index) => {
        const legendItem = legend
            .append("g")
            .attr("transform", `translate(0, ${index * 20})`);

        // Rectangle coloré représentant l'élément
        legendItem
            .append("rect")
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("fill", item.color);

        // Texte descriptif aligné verticalement avec le rectangle
        legendItem
            .append("text")
            .attr("x", rectWidth + rectWidth / 2)
            .attr("y", rectHeight / 2)
            .text(item.label)
            .style("font-size", "0.85em")
            .style("alignment-baseline", "middle");
    });
}
