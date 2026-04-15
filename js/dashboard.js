// js/dashboard.js — Dashboard page logic

feather.replace();

const ALGO_LABELS = {
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
        ❌ Cannot reach backend. Update <code>BACKEND_URL</code> in <code>/api.js</code> then redeploy.
        <br><small>${e.message}</small>
      </div>`;
  }
}

function renderKPIs(s) {
  const lc = s.overallLoadPercent >= 80 ? "red"
           : s.overallLoadPercent >= 50 ? "yellow"
           : "green";

  const top = topAlgo(s.algorithmUsageBreakdown);

  document.getElementById("kpiGrid").innerHTML = `
    <div class="kpi-card blue">
      <div class="kpi-label"><i data-feather="package"></i> Total Orders</div>
      <div class="kpi-value">${s.totalOrders}</div>
      <div class="kpi-sub">${s.orderStatusBreakdown.pending} pending · ${s.orderStatusBreakdown.delivered} delivered</div>
    </div>
    <div class="kpi-card green">
      <div class="kpi-label"><i data-feather="map-pin"></i> Active Warehouses</div>
      <div class="kpi-value">${s.activeWarehouses}</div>
      <div class="kpi-sub">${s.inactiveWarehouses} inactive / offline</div>
    </div>
    <div class="kpi-card ${lc}">
      <div class="kpi-label"><i data-feather="activity"></i> Network Load</div>
      <div class="kpi-value">${s.overallLoadPercent}%</div>
      <div class="kpi-sub">${s.totalCurrentOrders} of ${s.totalCapacity} capacity used</div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-label"><i data-feather="zap"></i> Top Algorithm</div>
      <div class="kpi-value" style="font-size:1rem;padding-top:6px">${top}</div>
      <div class="kpi-sub">Most used routing method</div>
    </div>
  `;
  feather.replace();
}

function topAlgo(breakdown) {
  if (!breakdown || !Object.keys(breakdown).length) return "—";
  const top = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];
  return ALGO_LABELS[top[0]] || top[0];
}

function renderWH(whs) {
  if (!whs.length) {
    document.getElementById("whBody").innerHTML =
      `<tr><td colspan="5" class="table-empty">No warehouses yet. <a href="/database.html">Add one →</a></td></tr>`;
    return;
  }
  document.getElementById("whBody").innerHTML = whs.map(w => {
    const pct = w.capacity > 0 ? Math.round((w.current_orders / w.capacity) * 100) : 0;
    const lvl = pct >= 90 ? "critical" : pct >= 70 ? "high" : pct >= 40 ? "medium" : "low";
    return `
      <tr>
        <td><strong>${w.name}</strong></td>
        <td>${w.city || "—"}</td>
        <td><span class="badge ${w.status}">${w.status}</span></td>
        <td class="mono">${w.current_orders} / ${w.capacity}</td>
        <td>
          <div class="load-wrap">
            <div class="load-bg">
              <div class="load-fill ${lvl}" style="width:${Math.min(pct, 100)}%"></div>
            </div>
            <span class="load-pct">${pct}%</span>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function renderOrders(orders) {
  if (!orders.length) {
    document.getElementById("ordBody").innerHTML =
      `<tr><td colspan="5" class="table-empty">No orders yet.</td></tr>`;
    return;
  }
  document.getElementById("ordBody").innerHTML = orders.map(o => `
    <tr>
      <td>${o.customer_name || "Guest"}</td>
      <td>${o.assigned_warehouse_name || "—"}</td>
      <td><code>${o.algorithm_used || "—"}</code></td>
      <td>${o.distance_km != null ? o.distance_km + " km" : "—"}</td>
      <td><span class="badge ${o.status}">${o.status}</span></td>
    </tr>`).join("");
}

async function runSim() {
  const lat = parseFloat(document.getElementById("simLat").value);
  const lon = parseFloat(document.getElementById("simLon").value);
  if (isNaN(lat) || isNaN(lon)) return alert("Enter valid coordinates.");

  const grid = document.getElementById("algoGrid");
  const btn  = document.getElementById("simBtn");
  grid.style.display = "grid";
  grid.innerHTML = `<div><span class="spinner"></span> Running all 4 algorithms…</div>`;
  btn.disabled = true;

  try {
    const res = await API.simulate(lat, lon);
    if (!res.success) throw new Error(res.error);

    grid.innerHTML = Object.entries(res.algorithmComparison).map(([algo, w]) => `
      <div class="algo-card">
        <div class="algo-tag">${ALGO_LABELS[algo] || algo}</div>
        ${w
          ? `<div class="algo-wh-name">${w.name}</div>
             <div class="algo-detail">${w.city} · ${w.loadPercent}% load${w.distanceKm ? " · " + w.distanceKm + " km" : ""}</div>`
          : `<div class="algo-unavailable">No warehouse available</div>`
        }
      </div>`).join("");
  } catch (e) {
    grid.innerHTML = `<div class="alert error show">Error: ${e.message}</div>`;
  } finally {
    btn.disabled = false;
  }
}

loadAll();
setInterval(loadAll, 30000);
