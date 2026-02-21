const API = "http://localhost:5000/api/auth";

function showMessage(text, type = "success") {
  msg.className = type;     // uses CSS classes: success / error
  msg.innerText = text;
}

function validatePassword(password) {
  const minLength = password.length >= 9;
  const numbers = (password.match(/[0-9]/g) || []).length >= 2;
  const special = (password.match(/[^A-Za-z0-9]/g) || []).length >= 2;
  const capitals = (password.match(/[A-Z]/g) || []).length >= 2;
  const smalls = (password.match(/[a-z]/g) || []).length >= 2;

  return minLength && numbers && special && capitals && smalls;
}

function generateStrongPassword() {
  const caps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const small = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  const special = "!@#$%^&*()_+<>?";

  function pick(str) {
    return str[Math.floor(Math.random() * str.length)];
  }

  let password = "";

  // Mandatory characters
  password += pick(caps) + pick(caps);
  password += pick(small) + pick(small);
  password += pick(nums) + pick(nums);
  password += pick(special) + pick(special);

  // Fill remaining length
  const all = caps + small + nums + special;
  while (password.length < 12) {
    password += pick(all);
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function suggestPassword() {
  const newPass = generateStrongPassword();
  document.getElementById("password").value = newPass;

  showMessage("Strong password generated", "success");
}


// ✅ REGISTER
function register() {
  if (!email.value || !password.value) {
    return showMessage("Please fill all fields", "error");
  }

  // ⭐ CRITICAL VALIDATION ADDED
  if (!validatePassword(password.value)) {
    return showMessage(
      "❌ Weak Password\nNeed:\n• 9+ characters\n• 2 Numbers\n• 2 Special Characters\n• 2 CAPITAL Letters\n• 2 Small Letters",
      "error"
    );
  }

  fetch(API + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showMessage(data.message || "Account created", "success");
      } else {
        showMessage(data.message || "Registration failed", "error");
      }
    })
    .catch(() => showMessage("Server error", "error"));
}


// ✅ LOGIN
function login() {
  if (!email.value || !password.value) {
    return showMessage("Enter email & password", "error");
  }

  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Keeping your existing storage logic ✔
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);

        showMessage("Login successful... Redirecting", "success");

        setTimeout(() => {
          window.location = "dashboard.html";
        }, 600);
      } else {
        showMessage(data.message || "Invalid credentials", "error");
      }
    })
    .catch(() => showMessage("Server not responding", "error"));
}


// ✅ LOGOUT
function logout() {
  localStorage.clear();
  window.location = "index.html";
}


// ✅ DASHBOARD EMAIL DISPLAY
if (window.location.pathname.includes("dashboard.html")) {
  const savedEmail = localStorage.getItem("email");

  if (!savedEmail) {
    window.location = "index.html";
  } else {
    userEmail.innerText = "Logged in as: " + savedEmail;
  }
}

function togglePassword() {
  const passField = document.getElementById("password");
  const toggleBtn = document.querySelector(".toggle");

  if (passField.type === "password") {
    passField.type = "text";
    toggleBtn.innerText = "🙈";
  } else {
    passField.type = "password";
    toggleBtn.innerText = "👁";
  }
}


function resetPasswordSimple() {
  const emailField = document.getElementById("email");
  const passField = document.getElementById("newPassword");

  if (!emailField.value || !passField.value) {
    return showMessage("Fill all fields", "error");
  }

  if (!validatePassword(passField.value)) {
    return showMessage("Weak password", "error");
  }

  fetch(API + "/forgot-password-simple", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailField.value,
      newPassword: passField.value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showMessage("✅ Password updated! Redirecting to login...", "success");

        setTimeout(() => {
          window.location = "index.html";   // login page
        }, 1200); // smooth delay
      } else {
        showMessage(data.message || "Update failed", "error");
      }
    })
    .catch(() => showMessage("Server error", "error"));
}

const passInput = document.getElementById("password");

if (passInput) {
  passInput.addEventListener("input", () => {
    if (validatePassword(passInput.value)) {
      showMessage("✅ Strong Password", "success");
    } else {
      showMessage(
        "❌ Weak Password — Need 2 Caps, 2 Small, 2 Numbers, 2 Special (9+ length)",
        "error"
      );
    }
  });
}