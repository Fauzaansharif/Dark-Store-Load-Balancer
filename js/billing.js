// js/billing.js

feather.replace();

const PLAN_LABELS = { starter: "Starter", growth: "Growth", enterprise: "Enterprise" };
const PLAN_AMOUNTS = { starter: "₹0", growth: "₹999", enterprise: "Custom" };

async function loadBilling() {
  try {
    const res = await API.getBilling();
    const b   = res.billing;

    const badge = document.getElementById("currentPlanBadge");

    if (b) {
      badge.textContent = PLAN_LABELS[b.plan] + " Plan";

      document.getElementById("billingInfo").style.display = "block";
      document.getElementById("biPlan").textContent   = PLAN_LABELS[b.plan] || b.plan;
      document.getElementById("biAmount").textContent = PLAN_AMOUNTS[b.plan] || "—";
      document.getElementById("biStatus").innerHTML   = `<span class="badge ${b.status}">${b.status}</span>`;
      document.getElementById("biPeriod").textContent =
        b.period_start && b.period_end
          ? `${b.period_start}  →  ${b.period_end}`
          : "—";

      // Highlight current plan card
      ["starter","growth","enterprise"].forEach(p => {
        const card = document.getElementById("plan" + capitalize(p));
        const btn  = document.getElementById("btn"  + capitalize(p));
        if (p === b.plan) {
          card.classList.add("current");
          btn.textContent = "Current Plan";
          btn.disabled    = true;
        }
      });
    } else {
      badge.textContent = "No active plan";
    }
  } catch (e) {
    showAlert("error", "Cannot reach backend: " + e.message);
    document.getElementById("currentPlanBadge").textContent = "Error";
  }
}

async function upgradePlan(plan) {
  const btn = document.getElementById("btn" + capitalize(plan));
  btn.disabled    = true;
  btn.textContent = "Processing…";
  try {
    const res = await API.upgradePlan(plan);
    if (!res.success) throw new Error(res.error);
    showAlert("success", `Switched to ${PLAN_LABELS[plan]} plan!`);
    loadBilling();
  } catch (e) {
    showAlert("error", e.message);
    btn.disabled    = false;
    btn.textContent = "Try again";
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function showAlert(type, msg) {
  const el = document.getElementById("pageAlert");
  el.className = `alert ${type} show`;
  el.textContent = (type === "success" ? "✅ " : "❌ ") + msg;
  setTimeout(() => el.classList.remove("show"), 4500);
}

loadBilling();
