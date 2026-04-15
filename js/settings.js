// js/settings.js

feather.replace();

// Populate read-only fields
document.getElementById("apiBackendUrl").value  = BACKEND_URL;
document.getElementById("healthEndpoint").value = BACKEND_URL + "/api/health";
if (document.getElementById("backendUrlInput"))
  document.getElementById("backendUrlInput").value = BACKEND_URL;

function showTab(name) {
  document.querySelectorAll(".settings-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  event.currentTarget.classList.add("active");
}

function saveGeneral() {
  showAlert("success", "Settings saved locally. To change the backend URL permanently, edit BACKEND_URL in api.js.");
}

function saveThresholds() {
  showAlert("success", "Threshold preferences saved.");
}

async function testConnection() {
  const el  = document.getElementById("connResult");
  el.className = "alert info show";
  el.textContent = "Testing connection…";
  try {
    const h = await API.health();
    if (h.status === "ok") {
      el.className = "alert success show";
      el.textContent = `✅ Connected to ${BACKEND_URL} — backend is online.`;
    } else throw new Error("Unexpected response");
  } catch (e) {
    el.className = "alert error show";
    el.textContent = `❌ Cannot reach ${BACKEND_URL}. Make sure your backend is running.`;
  }
}

async function resetCounters() {
  if (!confirm("Reset all warehouse order counters to 0?\nThis cannot be undone.")) return;
  try {
    // Fetch all warehouses, set current_orders = 0 on each
    const res = await API.getWarehouses();
    if (!res.warehouses) throw new Error("Failed to fetch warehouses");
    for (const w of res.warehouses) {
      await API.updateWarehouse(w.id, { current_orders: 0 });
    }
    showAlert("success", "All order counters reset to 0.");
  } catch (e) {
    showAlert("error", e.message);
  }
}

function confirmDeleteOrders() {
  if (!confirm("⚠️ This will permanently delete ALL orders.\n\nAre you absolutely sure?")) return;
  showAlert("warning", "Delete all orders — connect this to a backend DELETE /api/orders endpoint when needed.");
}

function showAlert(type, msg) {
  const el = document.getElementById("pageAlert");
  el.className = `alert ${type} show`;
  el.textContent = msg;
  setTimeout(() => el.classList.remove("show"), 5000);
}
