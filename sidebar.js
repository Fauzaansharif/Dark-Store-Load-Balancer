// sidebar.js — injects sidebar into every dashboard page
// Include AFTER api.js:  <script src="/sidebar.js"></script>

(function () {
  const path = window.location.pathname.replace(/\/$/, "") || "/";

  const links = [
    { href: "/dashboard/",   icon: "bar-chart-2",  label: "Dashboard"   },
    { href: "/exec/",        icon: "map-pin",       label: "Warehouses"  },
    { href: "/workflows/",   icon: "git-branch",    label: "Workflows"   },
    { href: "/connections/", icon: "link",          label: "Connections" },
    { href: "/billing/",     icon: "credit-card",   label: "Billing"     },
    { href: "/settings/",    icon: "settings",      label: "Settings"    },
  ];

  function active(href) {
    const h = href.replace(/\/$/, "");
    return path === h || path + "/" === href ? "active" : "";
  }

  const html = `
    <aside class="sidebar">
      <a href="/" class="sidebar-logo">
        <img src="/logo.jpeg" alt="ZoneScore" onerror="this.style.display='none'"/>
        <span>ZoneScore</span>
      </a>
      ${links.map(l => `
        <a href="${l.href}" class="nav-link ${active(l.href)}">
          <i data-feather="${l.icon}"></i>${l.label}
        </a>`).join("")}
      <div class="sidebar-bottom">
        <a href="/database.html" class="nav-link" style="color:var(--green)">
          <i data-feather="plus-circle"></i> Add Warehouse
        </a>
        <div id="sidebarHealth" class="health-pill checking">
          <span class="health-dot"></span>
          <span id="healthLabel">Checking…</span>
        </div>
      </div>
    </aside>`;

  document.body.insertAdjacentHTML("afterbegin", html);
  if (window.feather) feather.replace();

  setTimeout(async () => {
    const pill  = document.getElementById("sidebarHealth");
    const label = document.getElementById("healthLabel");
    try {
      const h = await API.health();
      if (h.status === "ok") {
        pill.className    = "health-pill online";
        label.textContent = "Backend online";
      } else throw new Error();
    } catch {
      pill.className    = "health-pill offline";
      label.textContent = "Backend offline";
    }
  }, 600);
})();
