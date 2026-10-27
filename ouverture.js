(function ajouterStyle() {
    var style = document.createElement("style");
    style.textContent =
        ".carte-flip{display:block;position:relative;width:11rem;height:20rem;perspective:900px;cursor:pointer;" +
        "animation:distribue .6s ease-out backwards;background:none;border:0;padding:0}" +
        ".carte-inner{display:block;position:absolute;inset:0;transform-style:preserve-3d;" +
        "transition:transform .8s cubic-bezier(.2,.8,.2,1)}" +
        ".carte-flip.revelee .carte-inner{transform:rotateY(180deg)}" +
        ".carte-flip:not(.revelee):hover .carte-inner{transform:translateY(-6px)}" +
        ".carte-dos,.carte-face{display:block;position:absolute;inset:0;box-sizing:border-box;border-radius:.5rem;" +
        "backface-visibility:hidden;-webkit-backface-visibility:hidden}" +
        ".carte-dos{display:flex;align-items:center;justify-content:center;" +
        "border:4px solid #facc15;font-size:3rem;font-weight:bold;color:#facc15;" +
        "background:repeating-linear-gradient(45deg,#1a1030,#1a1030 10px,#2a1850 10px,#2a1850 20px)}" +
        ".carte-face{transform:rotateY(180deg);background:#111827;padding:.5rem;text-align:left;overflow:hidden}" +
        ".carte-face img{display:block}" +
        ".carte-face h3,.carte-face p{display:block}" +
        ".carte-flip.legendaire.revelee .carte-face{animation:lueur 1.6s ease-in-out infinite}" +
        "@keyframes distribue{from{opacity:0;transform:translateY(-60px) scale(.7) rotate(-6deg)}}" +
        "@keyframes lueur{50%{box-shadow:0 0 40px 8px rgba(250,204,21,.9)}}" +
        "@media (prefers-reduced-motion:reduce){.carte-flip,.carte-inner{animation:none;transition:none}}";
    document.head.appendChild(style);
})();

const boosters = [
    { id: 0, nom: "Pack du débutant",        image: "images/booster beginnerpack.png",          famille: "DEB" },
    { id: 1, nom: "Invocation obscure",      image: "images/Invocation obscure _ booster .png", famille: "OBS" },
    { id: 2, nom: "Invocation des légendes", image: "images/bosster inovationdeslegendes.png",  famille: "LEG" },
    { id: 3, nom: "Pack de la chance",       image: "images/pack de la chance.png",             famille: "CHA" }
];

const probabilites = [
    { Commune: 75, Rare: 20, Epique: 4,  "Légendaire": 1 },
    { Commune: 55, Rare: 30, Epique: 12, "Légendaire": 3 },
    { Commune: 30, Rare: 35, Epique: 25, "Légendaire": 10 },
    { Commune: 40, Rare: 25, Epique: 20, "Légendaire": 15 }
];

const NB_CARTES = 5;

function lireStockage(cle, defaut) {
    try {
        var valeur = JSON.parse(localStorage.getItem(cle));
        return valeur === null ? defaut : valeur;
    } catch (e) {
        return defaut;
    }
}

function ecrireStockage(cle, valeur) {
    try {
        localStorage.setItem(cle, JSON.stringify(valeur));
    } catch (e) {}
}

let boostersAchetes = lireStockage("boostersAchetes", {});
let cartesEnCours = [];
let nbRevelees = 0;

function afficherBoosters() {
    let zone = document.getElementById("liste-boosters");
    if (!zone) { return; }

    zone.innerHTML = "";

    for (let i = 0; i < boosters.length; i++) {
        let booster = boosters[i];
        let quantite = boostersAchetes[booster.id] || 0;

        zone.innerHTML += `
            <div class="bg-gray-900 p-4 rounded-lg text-center">
                <img src="${booster.image}"
                     alt="${booster.nom}"
                     class="h-60 w-full object-contain">

                <h3 class="text-xl font-bold text-yellow-400 mt-3">
                    ${booster.nom}
                </h3>

                <p class="mt-3">Quantité : ${quantite}</p>

                <button type="button"
                    data-ouvrir="${booster.id}"
                    class="bg-yellow-400 text-black p-3 mt-4 rounded font-bold ${quantite === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-300"}"
                    ${quantite === 0 ? "disabled" : ""}>
                    ${quantite === 0 ? "Indisponible" : "Ouvrir le booster"}
                </button>
            </div>
        `;
    }

    var total = 0;
    for (var id in boostersAchetes) { total += boostersAchetes[id]; }
    if (total === 0 && cartesEnCours.length === 0) {
        document.getElementById("message").innerHTML =
            'Vous n\'avez aucun booster. <a href="boutique.html" class="underline">Allez à la boutique</a>.';
    }
}

function tirerRarete(idBooster) {
    let chances = probabilites[idBooster];
    let nombre = Math.random() * 100;
    let total = 0;

    for (let rarete in chances) {
        total = total + chances[rarete];
        if (nombre < total) {
            return rarete;
        }
    }
    return "Commune";
}

function tirerCarte(idBooster) {
    let famille = boosters[idBooster].famille;

    let cartesDisponibles = cartes.filter(function (carte) {
        return carte.id.startsWith(famille + "-");
    });

    let rarete = tirerRarete(idBooster);

    let candidates = cartesDisponibles.filter(function (carte) {
        return carte.rarete === rarete;
    });

    if (candidates.length === 0) { candidates = cartesDisponibles; }
    if (candidates.length === 0) { candidates = cartes; }

    let index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
}

function ouvrirBooster(idBooster) {
    let message = document.getElementById("message");

    if (cartesEnCours.length > 0 && nbRevelees < cartesEnCours.length) {
        message.textContent = "Révélez d'abord toutes vos cartes !";
        return;
    }

    if (!boostersAchetes[idBooster] || boostersAchetes[idBooster] <= 0) {
        message.textContent = "Vous ne possédez pas ce booster !";
        return;
    }

    cartesEnCours = [];
    for (let i = 0; i < NB_CARTES; i++) {
        cartesEnCours.push(tirerCarte(idBooster));
    }
    nbRevelees = 0;

    boostersAchetes[idBooster]--;
    ecrireStockage("boostersAchetes", boostersAchetes);

    let collection = lireStockage("collectionMythoria", []);
    for (let i = 0; i < cartesEnCours.length; i++) {
        collection.push(cartesEnCours[i].id);
    }
    ecrireStockage("collectionMythoria", collection);

    afficherBoosters();
    afficherCartes(boosters[idBooster]);
}

function couleurBordure(rarete) {
    if (rarete === "Rare") { return "border-blue-500"; }
    if (rarete === "Epique") { return "border-purple-500"; }
    if (rarete === "Légendaire") { return "border-yellow-400"; }
    return "border-gray-500";
}

function afficherCartes(booster) {
    let zone = document.getElementById("zone-ouverture");
    let resultat = document.getElementById("cartes-obtenues");
    let message = document.getElementById("message");
    let imageBooster = document.getElementById("image-booster");
    let boutonGrimoire = document.getElementById("bouton-grimoire");

    zone.classList.remove("hidden");
    boutonGrimoire.classList.add("hidden");
    resultat.innerHTML = "";

    if (imageBooster) {
        imageBooster.src = booster.image;
        imageBooster.classList.remove("hidden");
    }

    message.textContent = "Cliquez sur chaque carte pour la révéler !";

    for (let i = 0; i < cartesEnCours.length; i++) {
        let carte = cartesEnCours[i];
        let image = carte.image.trim().replace(/\\_/g, "_");

        let type = carte.type ? `<p class="text-gray-400 text-sm">${carte.type}</p>` : "";
        let stats = (carte.atk !== undefined && carte.def !== undefined)
            ? `<p class="text-white text-sm font-bold mt-1">ATK ${carte.atk} · DEF ${carte.def}</p>`
            : "";

        let bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "carte-flip" + (carte.rarete === "Légendaire" ? " legendaire" : "");
        bouton.style.animationDelay = (i * 0.12) + "s";
        bouton.setAttribute("aria-label", "Carte " + (i + 1) + " face cachée, cliquer pour révéler");
        bouton.innerHTML = `
            <span class="carte-inner">
                <span class="carte-dos">M</span>
                <span class="carte-face border-4 ${couleurBordure(carte.rarete)}">
                    <img src="${image}" alt="${carte.nom}" class="w-full h-40 object-contain">
                    <h3 class="text-yellow-400 font-bold mt-1">${carte.nom}</h3>
                    ${type}
                    <p class="text-gray-300 text-sm">${carte.rarete}</p>
                    ${stats}
                </span>
            </span>
        `;
        bouton.addEventListener("click", function () {
            reveler(bouton, carte);
        });
        resultat.appendChild(bouton);
    }

    let ancien = document.getElementById("bouton-tout-reveler");
    if (ancien) { ancien.remove(); }

    let boutonTout = document.createElement("button");
    boutonTout.id = "bouton-tout-reveler";
    boutonTout.type = "button";
    boutonTout.textContent = "Tout révéler";
    boutonTout.className = "block mx-auto mt-6 border border-yellow-400 text-yellow-400 px-6 py-2 rounded font-bold hover:bg-yellow-400 hover:text-black";
    boutonTout.addEventListener("click", toutReveler);
    resultat.insertAdjacentElement("afterend", boutonTout);
}

function reveler(bouton, carte) {
    if (bouton.classList.contains("revelee")) { return; }

    bouton.classList.add("revelee");
    bouton.setAttribute("aria-label", carte.nom + ", " + carte.rarete);
    nbRevelees++;

    let message = document.getElementById("message");

    if (carte.rarete === "Légendaire") {
        message.textContent = "🌟 INCROYABLE ! Carte LÉGENDAIRE : " + carte.nom + " !";
    } else if (carte.rarete === "Epique") {
        message.textContent = "✨ Félicitations ! Carte ÉPIQUE : " + carte.nom + " !";
    } else if (carte.rarete === "Rare") {
        message.textContent = "💎 Bravo ! Carte RARE : " + carte.nom + " !";
    }

    if (nbRevelees === cartesEnCours.length) {
        terminer();
    }
}

function toutReveler() {
    let fermees = document.querySelectorAll(".carte-flip:not(.revelee)");
    for (let i = 0; i < fermees.length; i++) {
        (function (element, position) {
            setTimeout(function () { element.click(); }, position * 450);
        })(fermees[i], i);
    }
}

function terminer() {
    let tout = document.getElementById("bouton-tout-reveler");
    if (tout) { tout.remove(); }

    document.getElementById("bouton-grimoire").classList.remove("hidden");

    let message = document.getElementById("message");
    if (message.textContent.indexOf("Cliquez") === 0 || message.textContent === "") {
        message.textContent = "Vos 5 cartes ont été ajoutées à votre grimoire !";
    } else {
        message.textContent += " (cartes ajoutées à votre grimoire)";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let liste = document.getElementById("liste-boosters");

    if (liste) {
        liste.addEventListener("click", function (event) {
            let bouton = event.target.closest("[data-ouvrir]");
            if (bouton && !bouton.disabled) {
                ouvrirBooster(Number(bouton.getAttribute("data-ouvrir")));
            }
        });
    }

    afficherBoosters();
});