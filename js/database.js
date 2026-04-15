// js/database.js

document.addEventListener("DOMContentLoaded", () => {
  if (window.feather) feather.replace();

  // Health check
  API.health().then(h => {
    const badge = document.getElementById("healthBadge");
    const label = document.getElementById("healthLabel");
    if (h.status === "ok") {
      badge.className = "page-health online";
      label.textContent = "Backend online";
    } else {
      badge.className = "page-health offline";
      label.textContent = "Backend offline — update BACKEND_URL in api.js";
    }
  }).catch(() => {
    document.getElementById("healthBadge").className = "page-health offline";
    document.getElementById("healthLabel").textContent = "Backend offline";
  });
});

async function submitWarehouse() {
  const name   = document.getElementById("whName").value.trim();
  const city   = document.getElementById("whCity").value.trim();
  const lat    = document.getElementById("whLat").value;
  const lon    = document.getElementById("whLon").value;
  const cap    = document.getElementById("whCap").value;
  const status = document.getElementById("whStatus").value;

  if (!name || !lat || !lon || !cap) {
    return showAlert("error", "Please fill in all required fields (name, latitude, longitude, capacity).");
  }

  const btn = document.getElementById("submitBtn");
  btn.disabled    = true;
  btn.innerHTML   = '<span class="spinner"></span> Saving…';

  try {
    const res = await API.addWarehouse({
      name,
      city,
      latitude:  parseFloat(lat),
      longitude: parseFloat(lon),
      capacity:  parseInt(cap),
      status,
    });

    if (!res.success) throw new Error(res.error || "Unknown error");

    showAlert("success",
      `✅ "${res.warehouse.name}" added successfully! (ID: ${res.warehouse.id}). ` +
      `It is now available for load balancing.`
    );

    // Reset form
    ["whName","whCity","whLat","whLon","whCap"].forEach(id => {
      document.getElementById(id).value = "";
    });
    document.getElementById("whStatus").value = "active";

  } catch (e) {
    showAlert("error",
      `❌ Failed to save: ${e.message}. ` +
      `Make sure your backend is running and BACKEND_URL is set correctly in api.js.`
    );
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i data-feather="plus-circle"></i> Add Warehouse';
    if (window.feather) feather.replace();
  }
}

function showAlert(type, msg) {
  const el = document.getElementById("formAlert");
  el.className  = `alert ${type} show`;
  el.textContent = msg;
  // Don't auto-hide success so user can see the ID
  if (type !== "success") setTimeout(() => el.classList.remove("show"), 5000);
}
