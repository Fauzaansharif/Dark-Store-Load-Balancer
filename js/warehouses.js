// js/warehouses.js — Warehouses (exec) page logic

feather.replace();
let warehouses = [];

async function loadWH() {
  const status = document.getElementById("filterStatus").value;
  try {
    const res = await API.getWarehouses(status || null);
    warehouses = res.warehouses || [];
    renderTable(warehouses);
  } catch (e) {
    showAlert("error", "Cannot reach backend: " + e.message);
  }
}

function renderTable(whs) {
  if (!whs.length) {
    document.getElementById("whBody").innerHTML = `
      <tr><td colspan="6" class="table-empty">
        No warehouses found.
        <button class="btn btn-ghost btn-sm" onclick="openModal()">Add one →</button>
      </td></tr>`;
    return;
  }

  document.getElementById("whBody").innerHTML = whs.map(w => {
    const pct = w.capacity > 0 ? Math.round((w.current_orders / w.capacity) * 100) : 0;
    const lvl = pct >= 90 ? "critical" : pct >= 70 ? "high" : pct >= 40 ? "medium" : "low";
    return `
      <tr>
        <td class="wh-name-cell">${w.name}</td>
        <td>${w.city || "—"}</td>
        <td class="wh-coords">${w.latitude?.toFixed(4)}, ${w.longitude?.toFixed(4)}</td>
        <td>
          <div class="cap-indicator">
            <div class="load-bg">
              <div class="load-fill ${lvl}" style="width:${Math.min(pct, 100)}%"></div>
            </div>
            <span class="cap-text">${w.current_orders}/${w.capacity}</span>
          </div>
        </td>
        <td><span class="badge ${w.status}">${w.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-ghost btn-sm" title="Edit" onclick="editWarehouse(${w.id})">
              <i data-feather="edit-2"></i>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete" onclick="deleteWarehouse(${w.id}, '${w.name.replace(/'/g, "\\'")}')">
              <i data-feather="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  feather.replace();
}

function openModal() {
  document.getElementById("whId").value     = "";
  document.getElementById("whName").value   = "";
  document.getElementById("whCity").value   = "";
  document.getElementById("whLat").value    = "";
  document.getElementById("whLon").value    = "";
  document.getElementById("whCap").value    = "";
  document.getElementById("whStatus").value = "active";
  document.getElementById("modalTitle").textContent = "Add Warehouse";
  document.getElementById("modal").classList.add("show");
}

function editWarehouse(id) {
  const w = warehouses.find(x => x.id === id);
  if (!w) return;
  document.getElementById("whId").value     = w.id;
  document.getElementById("whName").value   = w.name;
  document.getElementById("whCity").value   = w.city || "";
  document.getElementById("whLat").value    = w.latitude;
  document.getElementById("whLon").value    = w.longitude;
  document.getElementById("whCap").value    = w.capacity;
  document.getElementById("whStatus").value = w.status;
  document.getElementById("modalTitle").textContent = "Edit Warehouse";
  document.getElementById("modal").classList.add("show");
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

async function saveWarehouse() {
  const id   = document.getElementById("whId").value;
  const name = document.getElementById("whName").value.trim();
  const city = document.getElementById("whCity").value.trim();
  const lat  = document.getElementById("whLat").value;
  const lon  = document.getElementById("whLon").value;
  const cap  = document.getElementById("whCap").value;
  const stat = document.getElementById("whStatus").value;

  if (!name || !lat || !lon || !cap) {
    return showAlert("error", "Please fill in all required fields.");
  }

  const btn = document.getElementById("saveBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    const payload = {
      name, city,
      latitude:  parseFloat(lat),
      longitude: parseFloat(lon),
      capacity:  parseInt(cap),
      status:    stat,
    };
    const res = id ? await API.updateWarehouse(id, payload) : await API.addWarehouse(payload);
    if (!res.success) throw new Error(res.error);
    showAlert("success", id ? `"${name}" updated successfully.` : `"${name}" added to network.`);
    closeModal();
    loadWH();
  } catch (e) {
    showAlert("error", e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Warehouse";
  }
}

async function deleteWarehouse(id, name) {
  if (!confirm(`Delete "${name}"?\n\nThis cannot be undone.`)) return;
  try {
    const res = await API.deleteWarehouse(id);
    if (!res.success) throw new Error(res.error);
    showAlert("success", `"${name}" deleted.`);
    loadWH();
  } catch (e) {
    showAlert("error", e.message);
  }
}

function showAlert(type, msg) {
  const el = document.getElementById("pageAlert");
  el.className = `alert ${type} show`;
  el.textContent = (type === "success" ? "✅ " : "❌ ") + msg;
  setTimeout(() => el.classList.remove("show"), 4500);
}

loadWH();
