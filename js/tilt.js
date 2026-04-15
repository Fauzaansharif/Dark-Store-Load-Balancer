// js/tilt.js — 3D tilt effect for dashboard cards
// Include in every dashboard page after sidebar.js

(function () {
  function applyTilt(el, opts = {}) {
    const MAX = opts.max || 8;

    // Shine overlay
    const shine = document.createElement("div");
    shine.style.cssText = `
      position:absolute;inset:0;border-radius:inherit;pointer-events:none;
      background:radial-gradient(circle at 50% 50%,rgba(255,255,255,0.05) 0%,transparent 60%);
      opacity:0;transition:opacity 0.3s;mix-blend-mode:overlay;z-index:1;
    `;
    el.style.position = el.style.position || "relative";
    el.style.overflow = "hidden";
    el.appendChild(shine);

    el.addEventListener("mousemove", (e) => {
      const r   = el.getBoundingClientRect();
      const dx  = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
      const dy  = ((e.clientY - r.top)   / r.height - 0.5) * 2;
      el.style.transform    = `perspective(900px) rotateX(${-dy*MAX}deg) rotateY(${dx*MAX}deg) scale3d(1.015,1.015,1.015)`;
      el.style.transition   = "transform 0.08s ease";
      shine.style.opacity   = "1";
      shine.style.background= `radial-gradient(circle at ${(dx+1)/2*100}% ${(dy+1)/2*100}%,rgba(255,255,255,0.08) 0%,transparent 60%)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform  = "perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)";
      el.style.transition = "transform 0.5s cubic-bezier(.22,1,.36,1)";
      shine.style.opacity = "0";
    });
  }

  // Apply to KPI cards, table-wrap, cards, algo cards, plan cards
  function init() {
    const selectors = [
      ".kpi-card",
      ".table-wrap",
      ".card",
      ".algo-card",
      ".plan-card",
      ".conn-card:not(.dimmed)",
      ".settings-section",
      ".form-page-card",
    ];
    document.querySelectorAll(selectors.join(",")).forEach(el => applyTilt(el));
  }

  // Run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose so sidebar.js can re-run after dynamic content
  window.applyTiltToNew = function (el) { applyTilt(el); };
  window.initTilt = init;
})();
