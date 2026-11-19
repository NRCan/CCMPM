document.addEventListener("DOMContentLoaded", () => {
    // Remplacez par votre point de terminaison API Gateway
    const API_ENDPOINT = "https://0r041vdgbb.execute-api.ca-central-1.amazonaws.com/";


    document.getElementById("uploadBtn").addEventListener("click", async () => {
        const previewImage = document.getElementById("previewImage");
        const buttons = document.getElementById("resultButtons");

        // Récupération des entrées
        const selectedMineral = document.getElementById("mineral").value;
        const selectedPriorities = [];
        if (document.getElementById("protectedAreas").checked) selectedPriorities.push("protected");
        if (document.getElementById("speciesRisk").checked) selectedPriorities.push("species");
        if (document.getElementById("infrastructure").checked) selectedPriorities.push("infra");

        // ⚠️ Validation : au moins une priorité doit être sélectionnée
        if (selectedPriorities.length === 0) {
            alert("⚠️ Veuillez sélectionner au moins une priorité");
            return;
        }

        // Reproduit json.dumps(payload, sort_keys=True) côté Python avec des clés triées alphabétiquement
        const signaturePayload = {
            fileHashes: [],  // 'f' vient en premier
            mineral: selectedMineral,  // 'm' vient en second (conservé tel quel, même si 'na')
            priorities: selectedPriorities.sort()  // 'p' vient en troisième
        };

        const sigStr = `{"fileHashes": [], "mineral": "${selectedMineral}", "priorities": [${selectedPriorities.map(p => `"${p}"`).join(', ')}]}`;

        console.log("Signature string:", sigStr);  // Journal de débogage

        const sigBuffer = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(sigStr)
        );
        const requestId = bufferToHex(sigBuffer);

        console.log("Request ID:", requestId);  // Journal de débogage
        console.log(`Loading results for request ID: ${requestId}`);

        try {
            // Récupération des URL signées depuis Lambda via API Gateway
            const response = await fetch(`${API_ENDPOINT}/${requestId}`);

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Vous avez effectué un nombre trop élevé de requêtes. Veuillez patienter quelques minutes, puis réessayer.");
                }
                throw new Error(`Une erreur est survenue lors du chargement de vos résultats (état ${response.status}). Veuillez réessayer plus tard.`);
            }

            const urls = await response.json();

            console.log(`Successfully loaded results for request ID: ${requestId}`);

            // Afficher l'image d'aperçu avec l'URL signée
            previewImage.src = urls.preview;
            previewImage.style.display = "block";

            // Afficher les boutons de téléchargement
            buttons.style.display = "flex";
            document.getElementById("resultsDivider").style.display = "block";

            document.getElementById("downloadGeojson").onclick = () => {
                triggerDownload(urls.geojson, "pareto_frontier.geojson");
            };
            document.getElementById("downloadRank").onclick = () => {
                triggerDownload(urls.rank, "pareto_rank.tif");
            };
            document.getElementById("downloadPercentiles").onclick = () => {
                triggerDownload(urls.percentiles, "pareto_percentiles.tif");
            };

            // Version textuelle (légende accessible) de la carte des résultats
            document.getElementById("textVersionTitle").textContent =
                buildResultMapTitle(selectedMineral, selectedPriorities);

            const geojsonLink = document.getElementById("textVersionGeojsonLink");
            geojsonLink.href = urls.geojson;
            geojsonLink.setAttribute("download", "pareto_frontier.geojson");

            const rankLink = document.getElementById("textVersionRankLink");
            rankLink.href = urls.rank;
            rankLink.setAttribute("download", "pareto_rank.tif");

            const percentilesLink = document.getElementById("textVersionPercentilesLink");
            percentilesLink.href = urls.percentiles;
            percentilesLink.setAttribute("download", "pareto_percentiles.tif");

            // Utilise le fragment (#) plutôt qu'un paramètre de requête (?)
            const dashboardUrl = buildDashboardUrl(urls);
            document.getElementById("viewMaplibre").onclick = () => {
                console.log(urls.has_chunks ? "Opening chunked dashboard" : "Opening single-file dashboard with data URL");
                window.open(dashboardUrl, "_blank");
            };

            // Fait du lien de la version textuelle un vrai lien cliquable vers le tableau de bord
            const dashboardLink = document.getElementById("textVersionDashboardLink");
            dashboardLink.href = dashboardUrl;
            dashboardLink.target = "_blank";
            dashboardLink.rel = "noopener noreferrer";

            document.getElementById("textVersionDetails").style.display = "block";

        } catch (error) {
            alert(`❌ Erreur : ${error.message}`);
            console.error("Error fetching signed URLs:", error);
        }
    });
});

// Noms courts des minéraux, utilisés dans les titres dynamiques
const MINERAL_SHORT_NAMES = {
    carbonatite_ree: "ETR encaissés dans des carbonatites",
    cd_zinc: "zinc à dominante clastique",
    graphite: "graphite",
    magmatic_nickel: "nickel magmatique",
    mvt_zinc: "zinc Mississippi-Valley (MVT)",
    pegmatite_lithium: "pegmatites lithinifères"
};

const PRIORITY_LABELS = {
    infra: "coût des infrastructures",
    protected: "aires protégées",
    species: "habitat essentiel"
};

// Construit l'URL du tableau de bord, en intégrant les données fragmentées ou en un seul fichier via le fragment
function buildDashboardUrl(urls) {
    if (urls.has_chunks) {
        const data = { manifest: urls.chunks_manifest, chunks: urls.chunks };
        return `${urls.dashboard}#${encodeURIComponent(JSON.stringify(data))}`;
    }
    return `${urls.dashboard}#${encodeURIComponent(urls.all_points_geojson)}`;
}

// Construit le titre dynamique utilisé comme légende de la version textuelle de la carte des résultats
function buildResultMapTitle(mineral, priorities) {
    const dynamicParts = [];
    if (mineral) {
        dynamicParts.push(MINERAL_SHORT_NAMES[mineral] || mineral.replace(/_/g, " "));
    }
    ["infra", "protected", "species"].forEach((key) => {
        if (priorities.includes(key)) dynamicParts.push(PRIORITY_LABELS[key]);
    });

    const baseTitle = "Carte des priorités en matière de minéraux critiques (résolution de 2 km)";
    return dynamicParts.length ? `${baseTitle} - ${dynamicParts.join(" - ")}` : baseTitle;
}

// Convertit un ArrayBuffer en chaîne hexadécimale
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// Utilitaire de téléchargement
function triggerDownload(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
