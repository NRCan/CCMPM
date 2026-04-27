document.addEventListener("DOMContentLoaded", () => {
  // Replace with your API Gateway endpoint
  const API_ENDPOINT = "https://31mtood3jj.execute-api.ca-central-1.amazonaws.com/default/GeneratePresignedUrl";


  document.getElementById("uploadBtn").addEventListener("click", async () => {
    const statusElement = document.getElementById("status");
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
      statusElement.textContent = "⚠️ Please select at least one priority";
      statusElement.style.color = "red";
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

    // Show request ID
    statusElement.textContent = `Showing results for request ID: ${requestId}`;

    try {
      // Fetch signed URLs from Lambda via API Gateway
      const response = await fetch(`${API_ENDPOINT}/${requestId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const urls = await response.json();

      // Show success status
      statusElement.textContent = `Showing results for request ID: ${requestId}`;

      // Show preview image using signed URL
      previewImage.src = urls.preview;
      previewImage.style.display = "block";

      // Show download buttons
      buttons.style.display = "flex";

      document.getElementById("downloadGeojson").onclick = () => {
        triggerDownload(urls.geojson, "pareto_frontier.geojson");
      };
      document.getElementById("downloadRank").onclick = () => {
        triggerDownload(urls.rank, "pareto_rank.tif");
      };
      document.getElementById("downloadPercentiles").onclick = () => {
        triggerDownload(urls.percentiles, "pareto_percentiles.tif");
      };
      // document.getElementById("viewMaplibre").onclick = () => {
      //   window.open(urls.dashboard, "_blank");
      // };

      // ✅ FIXED: Use hash (#) instead of query parameter (?)
      document.getElementById("viewMaplibre").onclick = () => {
        if (urls.has_chunks) {
          // Chunked dashboard - pass manifest and chunks via hash
          const data = {
            manifest: urls.chunks_manifest,
            chunks: urls.chunks
          };
          const dashboardUrl = `${urls.dashboard}#${encodeURIComponent(JSON.stringify(data))}`;
          console.log("Opening chunked dashboard");
          window.open(dashboardUrl, "_blank");
        } else {
          // Single file dashboard - pass dataUrl via hash
          const dashboardUrl = `${urls.dashboard}#${encodeURIComponent(urls.all_points_geojson)}`;
          console.log("Opening single-file dashboard with data URL");
          window.open(dashboardUrl, "_blank");
        }
      };

    } catch (error) {
      statusElement.textContent = `❌ Error: ${error.message}`;
      statusElement.style.color = "red";
      console.error("Error fetching signed URLs:", error);
    }
  });
});

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