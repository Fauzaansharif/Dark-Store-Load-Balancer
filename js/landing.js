// js/landing.js — Landing page interactions

// ── Nav scroll effect ─────────────────────────────
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 20);
}, { passive: true });

// ── Scroll reveal ─────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // stagger children
      e.target.style.transitionDelay = (i * 0.07) + "s";
      e.target.classList.add("visible");
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  ".feat-card, .algo-card, .stack-card, .team-card, .hero-stats"
).forEach(el => {
  el.classList.add("reveal");
  observer.observe(el);
});

// ── 3D Tilt effect ────────────────────────────────
// Applied to every element with data-tilt attribute
function applyTilt(el) {
  const MAX   = 10;  // max rotation degrees
  const SHINE = true;

  // Add shine layer
  if (SHINE) {
    const shine = document.createElement("div");
    shine.style.cssText = `
      position:absolute;inset:0;border-radius:inherit;
      background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%);
      opacity:0;pointer-events:none;transition:opacity 0.3s;
      mix-blend-mode:overlay;
    `;
    shine.classList.add("tilt-shine");
    el.style.position = "relative";
    el.style.overflow = "hidden";
    el.appendChild(shine);
  }

  el.addEventListener("mousemove", (e) => {
    const rect   = el.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    const rotX   = -dy * MAX;
    const rotY   =  dx * MAX;

    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;

    const shine = el.querySelector(".tilt-shine");
    if (shine) {
      shine.style.opacity = "1";
      shine.style.background = `radial-gradient(circle at ${(dx+1)/2*100}% ${(dy+1)/2*100}%, rgba(255,255,255,0.10) 0%, transparent 60%)`;
    }
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)";
    el.style.transition = "transform 0.5s cubic-bezier(.22,1,.36,1)";
    const shine = el.querySelector(".tilt-shine");
    if (shine) shine.style.opacity = "0";
    setTimeout(() => { el.style.transition = "transform 0.08s ease, box-shadow 0.2s ease"; }, 500);
  });

  el.addEventListener("mouseenter", () => {
    el.style.transition = "transform 0.08s ease";
  });
}

document.querySelectorAll("[data-tilt]").forEach(applyTilt);
