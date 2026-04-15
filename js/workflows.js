// js/workflows.js

feather.replace();

const TRIGGERS = {
  load_threshold_80: "Load > 80%",
  load_threshold_90: "Load > 90%",
  warehouse_inactive: "Warehouse inactive",
  new_order: "New order received",
  order_delivered: "Order delivered",
  order_cancelled: "Order cancelled",
};
const ACTIONS = {
  notify_admin:    "Notify admin",
  auto_rebalance:  "Auto-rebalance orders",
  switch_algorithm:"Switch algorithm",
  pause_warehouse: "Pause warehouse",
  log_event:       "Log event",
};

async function loadWF() {
  try {
    const res = await API.getWorkflows();
    const wfs = res.workflows || [];
    if (!wfs.length) {
      document.getElementById("wfBody").innerHTML =
        `<tr><td colspan="5" class="table-empty">No workflows yet. Create your first automation.</td></tr>`;
      return;
    }
    document.getElementById("wfBody").innerHTML = wfs.map(w => `
      <tr>
        <td><strong>${w.name}</strong></td>
        <td class="wf-trigger">${TRIGGERS[w.trigger] || w.trigger}</td>
        <td class="wf-action">${ACTIONS[w.action] || w.action}</td>
        <td><span class="badge ${w.enabled ? "enabled" : "disabled"}">${w.enabled ? "Enabled" : "Disabled"}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-ghost btn-sm wf-toggle-btn" onclick="toggle(${w.id})">
              ${w.enabled ? "Disable" : "Enable"}
            </button>
            <button class="btn btn-danger btn-sm" onclick="del(${w.id})">
              <i data-feather="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>`).join("");
    feather.replace();
  } catch (e) { showAlert("error", e.message); }
}

function openModal()  { document.getElementById("modal").classList.add("show"); }
function closeModal() { document.getElementById("modal").classList.remove("show"); }

async function saveWorkflow() {
  const name    = document.getElementById("wfName").value.trim();
  const trigger = document.getElementById("wfTrigger").value;
  const action  = document.getElementById("wfAction").value;
  if (!name) return showAlert("error", "Enter a workflow name.");
  try {
    const res = await API.createWorkflow({ name, trigger, action });
    if (!res.success) throw new Error(res.error);
    showAlert("success", `Workflow "${name}" created.`);
    closeModal();
    document.getElementById("wfName").value = "";
    loadWF();
  } catch (e) { showAlert("error", e.message); }
}

async function toggle(id) {
  try { await API.toggleWorkflow(id); loadWF(); }
  catch (e) { showAlert("error", e.message); }
}

async function del(id) {
  if (!confirm("Delete this workflow?")) return;
  try {
    await API.deleteWorkflow(id);
    showAlert("success", "Workflow deleted.");
    loadWF();
  } catch (e) { showAlert("error", e.message); }
}

function showAlert(type, msg) {
  const el = document.getElementById("pageAlert");
  el.className = `alert ${type} show`;
  el.textContent = (type === "success" ? "✅ " : "❌ ") + msg;
  setTimeout(() => el.classList.remove("show"), 4000);
}

loadWF();
