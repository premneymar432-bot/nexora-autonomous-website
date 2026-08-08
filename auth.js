const STORAGE_KEY = "nexoraUser";

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message " + (type || "");
}

document.querySelectorAll("[data-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.toggle);
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    button.textContent = visible ? "SHOW" : "HIDE";
    button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
  });
});

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;
    const message = document.getElementById("signupMessage");

    if (!name || !email || !password || !confirm) {
      showMessage(message, "Please fill in all fields.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage(message, "Password must contain at least 6 characters.", "error");
      return;
    }

    if (password !== confirm) {
      showMessage(message, "Passwords do not match.", "error");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name,
      email,
      password
    }));

    showMessage(message, "Account created successfully. Opening sign in...", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      showMessage(message, "No account found. Please create an account first.", "error");
      return;
    }

    let user;
    try {
      user = JSON.parse(saved);
    } catch {
      showMessage(message, "Saved account data is invalid. Please sign up again.", "error");
      return;
    }

    if (email === user.email && password === user.password) {
      sessionStorage.setItem("nexoraLoggedIn", "true");
      sessionStorage.setItem("nexoraUserName", user.name);
      showMessage(message, "Login successful. Opening Nexora...", "success");

      setTimeout(() => {
        window.location.href = "home.html";
      }, 700);
    } else {
      showMessage(message, "Incorrect email or password.", "error");
    }
  });
}
