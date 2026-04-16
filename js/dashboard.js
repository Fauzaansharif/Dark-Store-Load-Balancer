// js/dashboard.js  —  Dashboard page logic (rider-aware)

feather.replace();

const ALGO_LABELS = {
  "smart-nearest":        "🧠 Smart Nearest",
  "nearest":              "📍 Nearest Warehouse",
  "round-robin":          "🔄 Round Robin",
  "weighted-round-robin": "⚖️ Weighted Round Robin",
  "least-loaded":         "🪶 Least Loaded",
};

async function loadAll() {
  try {
    const [statsRes, loadRes, ordersRes] = await Promise.all([
      API.getStats(),
      API.getWarehouseLoad(),
      API.getOrders({ limit: 8 }),
    ]);
    if (statsRes.success)  renderKPIs(statsRes.stats);
    if (loadRes.success)   renderWH(loadRes.warehouses);
    if (ordersRes.success) renderOrders(ordersRes.orders);
  } catch (e) {
    document.getElementById("kpiGrid").innerHTML = `
      <div class="alert error show" style="grid-column:1/-1">
        ❌ Cannot reach backend. Update <code>BACKEND_URL</code> in <code>/api.js</code>.
        <br><small>${e.message}</small>
      </div>`;
  }
}

function renderKPIs(s) {
  const lc = s.overallLoadPercent >= 80 ? "red"
           : s.overallLoadPercent >= 50 ? "yellow"
           : "green";
  const rs = s.riderStats || {};

  document.getElementById("kpiGrid").innerHTML = `
    <div class="kpi-card blue">
      <div class="kpi-label"><i data-feather="package"></i> Total Orders</div>
      <div class="kpi-value">${s.totalOrders}</div>
      <div class="kpi-sub">${s.orderStatusBreakdown.pending || 0} pending · ${s.orderStatusBreakdown.delivered || 0} delivered</div>
    </div>
    <div class="kpi-card green">
      <div class="kpi-label"><i data-feather="map-pin"></i> Active Warehouses</div>
      <div class="kpi-value">${s.activeWarehouses}</div>
      <div class="kpi-sub">${s.inactiveWarehouses} inactive / offline</div>
    </div>
    <div class="kpi-card ${lc}">
      <div class="kpi-label"><i data-feather="activity"></i> Network Load</div>
      <div class="kpi-value">${s.overallLoadPercent}%</div>
      <div class="kpi-sub">${s.totalCurrentOrders} of ${s.totalCapacity} capacity</div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-label"><i data-feather="truck"></i> Riders</div>
      <div class="kpi-value">${rs.available || 0}<span style="font-size:1rem;opacity:.5"> / ${rs.total || 0}</span></div>
      <div class="kpi-sub">${rs.on_delivery || 0} on delivery · ${rs.offline || 0} offline</div>
    </div>
  `;
  feather.replace();
}

function renderWH(whs) {
  if (!whs.length) {
    document.getElementById("whBody").innerHTML =
      `<tr><td colspan="7" class="table-empty">No warehouses. <a href="/database.html">Add one →</a></td></tr>`;
    return;
  }
  document.getElementById("whBody").innerHTML = whs.map(w => {
    const lvl = w.loadLevel || "low";
    return `
      <tr>
        <td><strong>${w.name}</strong></td>
        <td><span class="zone-tag zone-${(w.zone||'').toLowerCase()}">${w.zone || "—"}</span></td>
        <td>${w.area || "—"}</td>
        <td><span class="badge ${w.status}">${w.status}</span></td>
        <td class="mono">${w.current_orders}/${w.capacity}</td>
        <td>
          <div class="load-wrap">
            <div class="load-bg">
              <div class="load-fill ${lvl}" style="width:${Math.min(w.loadPercent,100)}%"></div>
            </div>
            <span class="load-pct">${w.loadPercent}%</span>
          </div>
        </td>
        <td>
          <span class="rider-count ${w.availableRiders > 0 ? 'has-riders' : 'no-riders'}">
            <i data-feather="user"></i> ${w.availableRiders} available
          </span>
        </td>
      </tr>`;
  }).join("");
  feather.replace();
}

function renderOrders(orders) {
  if (!orders.length) {
    document.getElementById("ordBody").innerHTML =
      `<tr><td colspan="6" class="table-empty">No orders yet.</td></tr>`;
    return;
  }
  document.getElementById("ordBody").innerHTML = orders.map(o => `
    <tr>
      <td>${o.customer_name || "Guest"}<br><span class="mono" style="font-size:0.72rem;color:var(--text2)">${o.customer_area || ""}</span></td>
      <td>${o.assigned_warehouse_name || "—"}</td>
      <td>${o.assigned_rider_name
            ? `<span style="color:var(--green)">${o.assigned_rider_name}</span>`
            : '<span style="color:var(--text3)">—</span>'}</td>
      <td><code>${o.algorithm_used || "—"}</code></td>
      <td>${o.warehouse_distance_km != null ? o.warehouse_distance_km + " km" : "—"}</td>
      <td><span class="badge ${o.status}">${o.status.replace("_"," ")}</span></td>
    </tr>`).join("");
}

// ── Algorithm Simulator ───────────────────────────────────────
async function runSim() {
  const lat = parseFloat(document.getElementById("simLat").value);
  const lon = parseFloat(document.getElementById("simLon").value);
  if (isNaN(lat) || isNaN(lon)) return alert("Enter valid coordinates.");

  const grid = document.getElementById("algoGrid");
  const btn  = document.getElementById("simBtn");
  grid.style.display = "grid";
  grid.innerHTML = `<div style="grid-column:1/-1"><span class="spinner"></span> Running all 5 algorithms…</div>`;
  btn.disabled   = true;

  try {
    const res = await API.simulate(lat, lon);
    if (!res.success) throw new Error(res.error);

    grid.innerHTML = Object.entries(res.algorithmComparison).map(([algo, w]) => {
      if (w.error) return `
        <div class="algo-card">
          <div class="algo-tag">${ALGO_LABELS[algo] || algo}</div>
          <div class="algo-unavailable">${w.error}</div>
        </div>`;
      return `
        <div class="algo-card">
          <div class="algo-tag">${ALGO_LABELS[algo] || algo}</div>
          <div class="algo-wh-name">${w.name}</div>
          <div class="algo-detail">${w.zone} · ${w.loadPct}% load · ${w.distanceKm} km away</div>
          ${w.rider
            ? `<div class="algo-rider">🛵 ${w.rider.name} · ${w.rider.distKm} km from WH</div>`
            : `<div class="algo-rider-none">No rider assigned</div>`}
          ${w.routingReason
            ? `<div class="algo-reason" title="${w.routingReason}">ℹ️ ${w.routingReason.slice(0, 70)}${w.routingReason.length > 70 ? "…" : ""}</div>`
            : ""}
        </div>`;
    }).join("");

    // Show config info
    const info = document.getElementById("simInfo");
    if (info) {
      info.textContent =
        `Load threshold: ${res.loadThresholdPct}%  |  Rider search radius: ${res.riderRadiusKm} km`;
      info.style.display = "block";
    }
  } catch (e) {
    grid.innerHTML = `<div class="alert error show">Error: ${e.message}</div>`;
  } finally {
    btn.disabled = false;
  }
}

// Extend API for riders
API.getRiders = (params) => API.getOrders && fetch(BACKEND_URL + "/api/riders" + (params ? "?" + new URLSearchParams(params) : "")).then(r => r.json());

loadAll();
setInterval(loadAll, 30000);
