/**
 * Afficher les détails d'un élément du pipeline.
 *
 * @param {Event} event - L'événement de la souris
 * @param {Object} d - Les données de l'élément du pipeline
 */
function showDetails(event, d) {
    const details = document.querySelector("#details");
    details.innerHTML = "";

    // img
    createElement("div", details, {
        id: "details__logo",
        html: `<img src="assets/logos/${d.logo}">`,
    });

    // DESCRIPTION (titre, statut, localisation, date, durée, description, compétences)

    const detailsText = createElement("div", details, {
        id: "details__text",
    });

    // Titre
    createElement("p", detailsText, {
        id: "details__text__titre",
        text: d.titre_long,
    });

    // Statut et localisation
    const detailsTextTitre2 = createElement("p", detailsText, {
        id: "details__text__titre2",
    });
    if (d.statut) createElement("span", detailsTextTitre2, { text: d.statut });

    if (d.statut && d.localisation)
        createElement("span", detailsTextTitre2, { text: " - " });

    if (d.localisation)
        createElement("span", detailsTextTitre2, { text: d.localisation });

    // Date et durée
    const detailsTextTitre3 = createElement("p", detailsText, {
        id: "details__text__titre3",
    });
    if (d.date) createElement("span", detailsTextTitre3, { text: d.date });

    if (d.date && d.duree)
        createElement("span", detailsTextTitre3, { text: " (" });

    if (d.duree) createElement("span", detailsTextTitre3, { text: d.duree });

    if (d.date && d.duree)
        createElement("span", detailsTextTitre3, { text: ")" });

    // Description et compétences
    const detailsTxtTxt = createElement("div", detailsText, {
        id: "details__text__text",
    });

    if (d.description.length > 0) {
        const detailsTxtTxtDescr = createElement("div", detailsTxtTxt, {
            id: "details__text__text__description",
        });
        for (const paragraphe of d.description) {
            createElement("p", detailsTxtTxtDescr, { text: paragraphe });
        }
    }

    if (d.competences.length > 0) {
        const detailsTxtTxtComptnces = createElement("div", detailsTxtTxt, {
            id: "details__text__text__competence",
        });
        createElement("p", detailsTxtTxtComptnces, { text: "Compétences :" });

        const allCompetences = d.competences.join(", ");
        createElement("p", detailsTxtTxtComptnces, { text: allCompetences });
    }

    // Liens
    if (d.liens.length > 0) {
        const detailsTxtTxtLiens = createElement("div", detailsTxtTxt, {
            id: "details__text__text__liens",
        });
        createElement("p", detailsTxtTxtLiens, { text: "Liens :" });

        for (const lien of d.liens) {
            const a = createElement("a", detailsTxtTxtLiens, {
                text: lien.titre_court,
                attributes: {
                    href: lien.url,
                    target: "_blank",
                },
            });
        }
    }

    // Images
    const detailsImg = createElement("div", details, {
        id: "details__img",
    });

    const detailsImgSlideshow = createElement("div", detailsImg, {
        class: "slideshow-container",
    });

    for (let i = 0; i < d.photos.length; i++) {
        const photo = d.photos[i];

        const detailsImgDiv = createElement("div", detailsImgSlideshow, {
            class: ["mySlides", "fade"],
        });

        createElement("div", detailsImgDiv, {
            class: "numbertext",
            text: `${i + 1} / ${d.photos.length}`,
        });
        createElement("img", detailsImgDiv, {
            attributes: {
                src: `assets/images/${photo}`,
                style: "width:100%",
            },
        });
    }

    const dotContainer = createElement("div", detailsImgSlideshow, {
        attributes: { style: "text-align:center" },
    });

    for (let i = 0; i < d.photos.length; i++) {
        const dot = createElement("span", dotContainer, {
            class: "dot",
        });

        // Ajouter un écouteur d'événement pour le clic
        dot.addEventListener("click", function () {
            currentSlide(i + 1);
        });
    }

    // Dans showDetails, juste avant d'appeler showSlides()
    if (slideTimeout) {
        clearTimeout(slideTimeout);
        slideTimeout = null;
    }

    slideIndex = 0;

    showSlides();
}

// Déclaration globale pour garder une référence au timer
let slideTimeout;
