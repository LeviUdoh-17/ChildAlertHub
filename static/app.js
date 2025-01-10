document.addEventListener("DOMContentLoaded", function() {
    window.addEventListener("scroll", function() {
        const navbar = document.querySelector(".custom-navbar");
        if (window.scrollY > 50) {
            document.body.classList.add("scrolled");
        } else {
            document.body.classList.remove("scrolled");
        }
    });

    // Trigger animations for hero section
    const heroH1 = document.querySelector(".hero-h1");
    const heroP = document.querySelector(".hero-p");

    heroH1.style.animationDelay = "0.5s";
    heroP.style.animationDelay = "1s";

    // Navbar toggler
    const navbarToggler = document.getElementById("navbar-toggler");
    const navbarCollapse = document.getElementById("navbar-collapse");

    navbarToggler.addEventListener("click", function() {
        navbarCollapse.classList.toggle("show");
    });

    // Toggle between login and signup forms
    const loginSection = document.getElementById("LogIn");
    const signUpSection = document.getElementById("SignUp");
    const signUpLink = document.querySelector(".sign-up-link");
    const loginLink = document.querySelector(".login-link");

    signUpLink.addEventListener("click", function(event) {
        event.preventDefault();
        loginSection.style.display = "none";
        signUpSection.style.display = "block";
        signUpSection.querySelector(".form-container").classList.add("visible");
        loginSection.querySelector(".form-container").classList.remove("visible");
    });

    loginLink.addEventListener("click", function(event) {
        event.preventDefault();
        signUpSection.style.display = "none";
        loginSection.style.display = "block";
        loginSection.querySelector(".form-container").classList.add("visible");
        signUpSection.querySelector(".form-container").classList.remove("visible");
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const isPasswordVisible = passwordInput.type === 'password';
            passwordInput.type = isPasswordVisible ? 'text' : 'password';
            this.textContent = isPasswordVisible ? '👁️‍🗨️' : '👁️';
        });
    });

    // Handle login form submission
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    console.error("Unexpected response:", data);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || "An error occurred");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("An error occurred. Please try again.");
        }
    });

    // Handle signup form submission
    const signupForm = document.getElementById("signup-form");
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            alert(result.message || result.error);
        } catch (error) {
            console.error("Signup error:", error);
            alert("Signup failed. Please try again.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const counterElement = document.getElementById("KidnapCases");
  let count = 0;
  const target = 3620;
  const duration = 2000;
  const increment = target / (duration / 16);

  // Counter Animation
  function updateCounter() {
    count += increment;
    if (count >= target) {
      count = target;
      counterElement.textContent = Math.floor(count);
      return;
    }
    counterElement.textContent = Math.floor(count);
    requestAnimationFrame(updateCounter);
  }

  updateCounter();
});