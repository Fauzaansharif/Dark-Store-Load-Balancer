// api.js  —  ZoneScore Frontend ↔ Backend Connector
// ⚠️  Change BACKEND_URL after deploying to Render

const BACKEND_URL = "https://zonescore-backend.onrender.com";
// → After deploy: "https://zonescore-backend.onrender.com"

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

  // Riders
  getRiders: (params) => _get("/api/riders" + _qs(params)),
  getRider: (id) => _get(`/api/riders/${id}`),
  addRider: (data) => _post("/api/riders", data),
  updateRiderStatus: (id, s) =>
    _patch(`/api/riders/${id}/status`, { status: s }),
  updateRiderLocation: (id, lat, lon) =>
    _patch(`/api/riders/${id}/location`, {
      current_lat: lat,
      current_lon: lon,
    }),
  deleteRider: (id) => _del(`/api/riders/${id}`),
  nearbyRiders: (whId, km) =>
    _get(`/api/riders/nearby/${whId}?radius=${km || 3}`),

  // Dashboard
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

  // Algorithms info
  getAlgorithms: () => _get("/api/algorithms"),

  // Health
  health: () => _get("/api/health").catch(() => ({ status: "offline" })),
};

async function _get(p) {
  return (await fetch(BACKEND_URL + p)).json();
}
async function _post(p, b) {
  return (
    await fetch(BACKEND_URL + p, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    })
  ).json();
}
async function _put(p, b) {
  return (
    await fetch(BACKEND_URL + p, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    })
  ).json();
}
async function _patch(p, b) {
  return (
    await fetch(BACKEND_URL + p, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    })
  ).json();
}
async function _del(p) {
  return (await fetch(BACKEND_URL + p, { method: "DELETE" })).json();
}
function _qs(params) {
  if (!params) return "";
  const s = new URLSearchParams(params).toString();
  return s ? "?" + s : "";
}

window.API = API;
window.BACKEND_URL = BACKEND_URL;
