// js/login.js

// Demo credentials
const DEMO = { email: "admin@zonescore.io", password: "admin123" };

// 3D tilt on the login card
const card = document.getElementById("loginCard");
if (card) {
  card.addEventListener("mousemove", (e) => {
    const r  = card.getBoundingClientRect();
    const dx = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
    const dy = ((e.clientY - r.top)   / r.height - 0.5) * 2;
    card.style.transform = `perspective(900px) rotateX(${-dy*6}deg) rotateY(${dx*6}deg)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transition = "transform 0.6s cubic-bezier(.22,1,.36,1)";
    card.style.transform  = "perspective(900px) rotateX(0) rotateY(0)";
    setTimeout(() => card.style.transition = "", 600);
  });
}

// Toggle password visibility
function togglePw() {
  const inp  = document.getElementById("password");
  const icon = document.getElementById("eyeIcon");
  const show = inp.type === "password";
  inp.type   = show ? "text" : "password";
  icon.innerHTML = show
    ? `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
}

// Handle login
async function doLogin() {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const btn      = document.getElementById("loginBtn");
  const btnText  = document.getElementById("loginBtnText");
  const spinner  = document.getElementById("loginBtnSpinner");
  const alert    = document.getElementById("loginAlert");

  if (!email || !password) {
    showAlert("error", "Please enter your email and password.");
    return;
  }

  // Loading state
  btn.disabled         = true;
  btnText.style.display  = "none";
  spinner.style.display  = "inline-block";
  alert.style.display    = "none";

  // Simulate async check (replace with real API call if you add auth)
  await new Promise(r => setTimeout(r, 900));

  if (email === DEMO.email && password === DEMO.password) {
    showAlert("success", "✅ Login successful — redirecting to dashboard…");
    setTimeout(() => { window.location.href = "/dashboard/"; }, 800);
  } else {
    showAlert("error", "Invalid email or password. Try: admin@zonescore.io / admin123");
    btn.disabled        = false;
    btnText.style.display = "inline";
    spinner.style.display = "none";
  }
}

function showAlert(type, msg) {
  const el   = document.getElementById("loginAlert");
  el.className   = `lf-alert ${type}`;
  el.textContent = msg;
  el.style.display = "block";
}

// Allow Enter key to submit
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});
