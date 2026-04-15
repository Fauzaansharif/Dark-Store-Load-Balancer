// ============================================================
//  api.js  —  ZoneScore Frontend ↔ Backend Connector
//  Include in EVERY page: <script src="/api.js"></script>
//
//  ⚠️  After deploying backend, update BACKEND_URL below.
// ============================================================

const BACKEND_URL = "https://zonescore-backend.onrender.com";

const API = {
  // Warehouses
  getWarehouses: (status) =>
    _get(`/api/warehouses${status ? "?status=" + status : ""}`),
  getWarehouse: (id) => _get(`/api/warehouses/${id}`),
  addWarehouse: (data) => _post("/api/warehouses", data),
  updateWarehouse: (id, d) => _put(`/api/warehouses/${id}`, d),
  deleteWarehouse: (id) => _del(`/api/warehouses/${id}`),
  setStatus: (id, s) => _patch(`/api/warehouses/${id}/status`, { status: s }),

  // Orders
  placeOrder: (data) => _post("/api/orders", data),
  getOrders: (params) => _get("/api/orders" + _qs(params)),
  updateOrderStatus: (id, s) =>
    _patch(`/api/orders/${id}/status`, { status: s }),
  simulate: (lat, lon) =>
    _post("/api/orders/simulate", { customerLat: lat, customerLon: lon }),

  // Dashboards
  getStats: () => _get("/api/dashboard/stats"),
  getWarehouseLoad: () => _get("/api/dashboard/warehouse-load"),

  // Workflows
  getWorkflows: () => _get("/api/workflows"),
  createWorkflow: (data) => _post("/api/workflows", data),
  toggleWorkflow: (id) => _patch(`/api/workflows/${id}/toggle`, {}),
  deleteWorkflow: (id) => _del(`/api/workflows/${id}`),

  // Billing
  getBilling: () => _get("/api/billing"),
  upgradePlan: (plan) => _post("/api/billing/upgrade", { plan }),

  // Health
  health: () => _get("/api/health").catch(() => ({ status: "offline" })),
};

// ── Internal helpers ──────────────────────────────────────────
async function _get(path) {
  const r = await fetch(BACKEND_URL + path);
  return r.json();
}
async function _post(path, body) {
  const r = await fetch(BACKEND_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}
async function _put(path, body) {
  const r = await fetch(BACKEND_URL + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}
async function _patch(path, body) {
  const r = await fetch(BACKEND_URL + path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}
async function _del(path) {
  const r = await fetch(BACKEND_URL + path, { method: "DELETE" });
  return r.json();
}
function _qs(params) {
  if (!params) return "";
  const s = new URLSearchParams(params).toString();
  return s ? "?" + s : "";
}

window.API = API;
window.BACKEND_URL = BACKEND_URL;
