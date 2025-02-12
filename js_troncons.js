// Initialisation de la carte OpenLayers
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                attributions: '© OpenStreetMap contributors © CARTO'
            })
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([7.752111, 48.573405]),  // Coordonnées de Strasbourg
        zoom: 14
    })
});

const vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'troncons_final_10.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: function (feature) {
        return getFeatureStyle(feature);
    }
});

map.addLayer(vectorLayer);

// Attendre que les données soient chargées avant d’appliquer les styles
vectorLayer.getSource().on('change', function (e) {
    if (vectorLayer.getSource().getState() === 'ready') {
        console.log('Données GeoJSON chargées avec succès.');
        vectorLayer.changed();  // Remplace par vectorLayer.changed()    
    }
});


// Variable pour l'indicateur courant
var currentIndicator = "ICT"; // Indicateur par défaut

// Fonction pour appliquer le style en fonction de l'indicateur sélectionné
function getFeatureStyle(feature) {
    const value = feature.get(currentIndicator);
    const color = getColorForValue(value);
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: color // Remplissage des polygones
        }),
        stroke: new ol.style.Stroke({
            color: 'grey', // Bordure grise pour plus de contraste
            width: 1
        })
    });
}

// Fonction pour déterminer la couleur selon la valeur
function getColorForValue(value) {
    if (value === undefined || value === null) return 'gray';
    const numValue = parseFloat(value);
    if (currentIndicator === "ICT") {
        if (numValue < 1.714) return 'rgba(255, 25, 28, 0.6)';         // Rouge pour 1 - Très Faible
        if (numValue < 2.16) return 'rgba(253, 174, 97, 0.6)';     // Orange pour 2 - Faible
        if (numValue < 2.66) return 'rgba(255, 255, 191, 0.6)';       // Jaune pour 3 - Modéré
        if (numValue < 3.21) return 'rgba(171, 221, 164, 0.6)';       // Vert clair pour 4 - Fort
        return 'rgba(5, 130, 42, 0.6)';                           // Vert foncé pour 5 - Très Fort
    } else if (currentIndicator === "IUGZA") {
        if (numValue <= 0) return 'rgba(212, 211, 210, 0.6)';
        if (numValue < 0.1) return 'rgba(252, 245, 240, 0.6)';
        if (numValue < 0.4) return 'rgba(252, 164, 134, 0.6)';
        if (numValue < 0.75) return 'rgba(234, 55, 42, 0.6)';
        return 'rgba(103, 0, 13, 0.6)';
    }
    return 'gray';
}


function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';  // Nettoyer la légende avant de la mettre à jour
    
    if (currentIndicator === "ICT") {
        legend.innerHTML = `
            <div class="legend-title">Régulation de la température</div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 25, 28, 0.6);"></div><span>Très Faible</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(253, 174, 97, 0.6);"></div><span>Faible</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 255, 191, 0.6);"></div><span>Modérée</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(171, 221, 164, 0.6);"></div><span>Forte</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(5, 130, 42, 0.6);"></div><span>Très Forte</span></div>
        `;
    } else if (currentIndicator === "IUGZA") {
        legend.innerHTML = `
            <div class="legend-title">Risque allergénique</div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(212, 211, 210, 0.6);"></div><span>0 - Null</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(252, 245, 240, 0.6);"></div><span>0.1 - Faible</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(252, 164, 134, 0.6);"></div><span>0.4 - Modéré</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(234, 55, 42, 0.6);"></div><span>0.75 - Élevé</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: rgba(103, 0, 13, 0.6);"></div><span>1 - Très Élevé</span></div>
        `;
    }
}


// Fonction pour créer chaque élément de la légende
function createLegendItem(color, label) {
    return `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${color};"></div>
            <span>${label}</span>
        </div>
    `;
}

// Affichage des valeurs des indicateurs au survol
var info = document.getElementById('info');

// Changement d'indicateur selon le bouton
document.getElementById('tempButton').addEventListener('click', function () {
    currentIndicator = "ICT";
    vectorLayer.changed();     // Rafraîchir la couche pour appliquer les nouveaux styles
    updateLegend();            // Mettre à jour la légende
});

document.getElementById("allergButton").addEventListener("click", function () {
    currentIndicator = "IUGZA";
    vectorLayer.changed();     // Rafraîchir la couche pour appliquer les nouveaux styles
    updateLegend();            // Mettre à jour la légende
});

document.getElementById('settingsButton').addEventListener('click', function () {
    const infoBubble = document.getElementById('infoBubble');
    
    // Toggle pour afficher/masquer la bulle
    if (infoBubble.style.display === 'none') {
        infoBubble.style.display = 'block';
    } else {
        infoBubble.style.display = 'none';
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const tempButton = document.getElementById('tempButton');
    const allergButton = document.getElementById('allergButton');
    const explanatoryText = document.getElementById('explanatoryText');

    // Texte pour chaque indicateur
    const texts = {
        temperature: `
            <h3>Régulation de la température</h3>
            <p>
                Cet indicateur estime la capacité des tronçons à modérer les températures locales. 
                Les valeurs plus élevées indiquent une meilleure régulation thermique, ce qui contribue 
                à un microclimat plus agréable en réduisant les effets d'îlots de chaleur.
                <br><br>
                L'indice de régulation de la température a été calculé à partir de données relatives aux caractéristiques de la végétation et la structure urbaine de chaque tronçon de rue. Les valeurs relatives à la végétation concernent l'ombre portée d'un arbre, le nombre d'arbres, le SIOM (Short Integral of Maturity), la végétation basse. Le contexte urbain est caractérisé par la hauteur des bâtiments, la surface imperméable, la surface hydrographique et le Sky View Factor.   
            </p>
        `,
        allergenic: `
            <h3>Indice allergénique</h3>
            <p>
                Cet indicateur évalue le potentiel allergénique de chaque tronçon. Des valeurs élevées peuvent présenter un risque elevé pour les personnes sensibles aux allergies saisonnières.
                <br><br>
                L'indice allergénique calculé se base sur le "Index of Urban Green Zone Allerginicity" dévelopé par Cariñanos et al. 2014. A partir de données concernant la manière de poliniser, la durée de pollinisation et le poteniel allergénique de chaque espèce contenue dans un espace, il est possible d'en estimer le risque allergénique. 
            </p>
        `
    };

    // Afficher le texte de la régulation de température au chargement
    explanatoryText.innerHTML = texts.temperature;

    // Changer le texte lors du clic sur les boutons
    tempButton.addEventListener('click', () => {
        explanatoryText.innerHTML = texts.temperature;
    });

    allergButton.addEventListener('click', () => {
        explanatoryText.innerHTML = texts.allergenic;
    });
});


map.on("pointermove", function (event) {
    var feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
        return feature;
    });

    if (feature) {
        var value = feature.get(currentIndicator);
        if (value !== null && value !== undefined) {
            info.innerHTML = currentIndicator + ": " + value.toFixed(2);
        } else {
            info.innerHTML = currentIndicator + ": N/A";
        }        
        info.style.left = (event.originalEvent.clientX + 15) + "px"; // Décalage pour éviter de cacher le curseur
        info.style.top = (event.originalEvent.clientY + 15) + "px";
        info.style.display = "block";
    } else {
        info.style.display = "none";
    }
});

// Initialisation de la légende au chargement de la carte
updateLegend();
