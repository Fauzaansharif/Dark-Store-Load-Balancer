// js/connections.js

feather.replace();
document.getElementById("backendUrl").textContent = BACKEND_URL;

API.health().then(h => {
  const badge = document.getElementById("restBadge");
  const box   = document.getElementById("backendStatusBody");
  if (h.status === "ok") {
    badge.className = "badge active";
    badge.textContent = "Online";
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;font-size:0.86rem;">
        <span class="badge active">✅ Backend online</span>
        Connected to <code>${BACKEND_URL}</code>
      </div>`;
  } else {
    badge.className = "badge inactive";
    badge.textContent = "Offline";
    box.innerHTML = `
      <div class="alert error show">
        ❌ Backend offline. Start your server: <code>npm run dev</code>
        then update <code>BACKEND_URL</code> in <code>/api.js</code>.
      </div>`;
  }
});
