document.addEventListener("DOMContentLoaded", () => {
  // Replace with your API Gateway endpoint
  const API_ENDPOINT = "https://0r041vdgbb.execute-api.ca-central-1.amazonaws.com/";


  document.getElementById("uploadBtn").addEventListener("click", async () => {
    const previewImage = document.getElementById("previewImage");
    const buttons = document.getElementById("resultButtons");

    // Gather inputs
    const selectedMineral = document.getElementById("mineral").value;
    const selectedPriorities = [];
    if (document.getElementById("protectedAreas").checked) selectedPriorities.push("protected");
    if (document.getElementById("speciesRisk").checked) selectedPriorities.push("species");
    if (document.getElementById("infrastructure").checked) selectedPriorities.push("infra");

    // ⚠️ Validation: Check if at least one priority is selected
    if (selectedPriorities.length === 0) {
      alert("⚠️ Please select at least one priority");
      return;
    }

    // 🔧 FIX: Match Python's sort_keys=True by creating object with alphabetically sorted keys
    const signaturePayload = {
      fileHashes: [],  // 'f' comes first
      mineral: selectedMineral,  // 'm' comes second (keep as-is, even if 'na')
      priorities: selectedPriorities.sort()  // 'p' comes third
    };

    // Generate hash - NO FORMATTING (null, 0 still adds spaces)
    // Python uses: json.dumps(payload, sort_keys=True) which produces compact JSON
    // const sigStr = JSON.stringify(signaturePayload);  // Compact by default
    const sigStr = `{"fileHashes": [], "mineral": "${selectedMineral}", "priorities": [${selectedPriorities.map(p => `"${p}"`).join(', ')}]}`;

    console.log("Signature string:", sigStr);  // Debug log

    const sigBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(sigStr)
    );
    const requestId = bufferToHex(sigBuffer);

    console.log("Request ID:", requestId);  // Debug log
    console.log(`Loading results for request ID: ${requestId}`);

    try {
      // Fetch signed URLs from Lambda via API Gateway
      const response = await fetch(`${API_ENDPOINT}/${requestId}`);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("You've made too many requests. Please wait a few minutes and try again.");
        }
        throw new Error(`Something went wrong while loading your results (status ${response.status}). Please try again later.`);
      }

      const urls = await response.json();

      console.log(`Successfully loaded results for request ID: ${requestId}`);

      // Show preview image using signed URL
      previewImage.src = urls.preview;
      previewImage.style.display = "block";

      // Show download buttons
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

      // Text version (accessible caption) of the result map
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

      // ✅ FIXED: Use hash (#) instead of query parameter (?)
      const dashboardUrl = buildDashboardUrl(urls);
      document.getElementById("viewMaplibre").onclick = () => {
        console.log(urls.has_chunks ? "Opening chunked dashboard" : "Opening single-file dashboard with data URL");
        window.open(dashboardUrl, "_blank");
      };

      // Make the text-version link a real, directly clickable dashboard link
      const dashboardLink = document.getElementById("textVersionDashboardLink");
      dashboardLink.href = dashboardUrl;
      dashboardLink.target = "_blank";
      dashboardLink.rel = "noopener noreferrer";

      document.getElementById("textVersionDetails").style.display = "block";

    } catch (error) {
      alert(`❌ Error: ${error.message}`);
      console.error("Error fetching signed URLs:", error);
    }
  });
});

// Short mineral names matching the notebook/backend's title wording
const MINERAL_SHORT_NAMES = {
  carbonatite_ree: "carbonatite REE",
  cd_zinc: "CD zinc",
  graphite: "graphite",
  magmatic_nickel: "magmatic nickel",
  mvt_zinc: "MVT zinc",
  pegmatite_lithium: "pegmatite-hosted lithium"
};

const PRIORITY_LABELS = {
  infra: "infrastructure cost",
  protected: "protected areas",
  species: "critical habitat"
};

// Builds the dashboard URL, embedding chunked or single-file data via the hash
function buildDashboardUrl(urls) {
  if (urls.has_chunks) {
    const data = { manifest: urls.chunks_manifest, chunks: urls.chunks };
    return `${urls.dashboard}#${encodeURIComponent(JSON.stringify(data))}`;
  }
  return `${urls.dashboard}#${encodeURIComponent(urls.all_points_geojson)}`;
}

// Builds the dynamic title used as the Result Map's text-version caption
function buildResultMapTitle(mineral, priorities) {
  const dynamicParts = [];
  if (mineral) {
    dynamicParts.push(MINERAL_SHORT_NAMES[mineral] || mineral.replace(/_/g, " "));
  }
  ["infra", "protected", "species"].forEach((key) => {
    if (priorities.includes(key)) dynamicParts.push(PRIORITY_LABELS[key]);
  });

  const baseTitle = "Critical mineral priority map (2 km resolution)";
  return dynamicParts.length ? `${baseTitle} - ${dynamicParts.join(" - ")}` : baseTitle;
}

// Converts ArrayBuffer → hex string
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Download helper
function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}