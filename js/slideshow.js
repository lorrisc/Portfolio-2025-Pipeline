/**
 * Affiche automatiquement les diapositives une par une avec un délai entre chaque.
 * Incrémente l'index de la diapositive et boucle à la première lorsque la fin est atteinte.
 * Gère également l'activation visuelle des points de navigation.
 */
function showSlides() {
    let i;
    let slides = document.querySelectorAll(".mySlides");
    let dots = document.querySelectorAll(".dot");

    // Protection contre une exécution sans diapositive
    if (slides.length === 0) return;

    // Masquer toutes les diapositives
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    // Passer à la diapositive suivante
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1; // Revenir à la première diapositive
    }

    // Désactiver tous les points
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // Afficher la diapositive actuelle et activer son point
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";

    // Relancer le cycle automatique
    if (slideTimeout) {
        clearTimeout(slideTimeout);
    }
    slideTimeout = setTimeout(showSlides, 4000); // 4 secondes entre chaque diapositive
}

/**
 * Affiche manuellement une diapositive spécifique sans modifier l'ordre d'affichage.
 * Utilisée par exemple lors d'un clic utilisateur sur un point de navigation.
 */
function showSlidesManual() {
    let i;
    let slides = document.querySelectorAll(".mySlides");
    let dots = document.querySelectorAll(".dot");

    // Masquer toutes les diapositives
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    // Désactiver tous les points
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // Afficher la diapositive sélectionnée et activer son point
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

/**
 * Affiche une diapositive spécifique lorsque l'utilisateur clique sur un point de navigation.
 * Cette fonction interrompt le défilement automatique, affiche la diapositive sélectionnée,
 * puis relance le défilement automatique après un délai.
 *
 * @param {number} n - L'index (1-based ou 0-based selon ton implémentation) de la diapositive à afficher.
 */
function currentSlide(n) {
    // Arrêter le défilement automatique s'il est en cours
    if (slideTimeout) {
        clearTimeout(slideTimeout);
        slideTimeout = null;
    }

    // Mettre à jour l'index courant et afficher manuellement la diapositive sélectionnée
    slideIndex = n;
    showSlidesManual();

    // Relancer le défilement automatique après 10 secondes
    slideTimeout = setTimeout(showSlides, 10000);
}
