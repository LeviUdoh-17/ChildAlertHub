const REGISTER_URL = "/register";
const LOGIN_URL = "/login";

document.addEventListener("DOMContentLoaded", function () {
    // Navbar scrolling effect
    window.addEventListener("scroll", function () {
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

    if (heroH1 && heroP) {
        heroH1.style.animationDelay = "0.5s";
        heroP.style.animationDelay = "1s";
    }

    // Navbar toggler
    const navbarToggler = document.getElementById("navbar-toggler");
    const navbarCollapse = document.getElementById("navbar-collapse");

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener("click", function () {
            navbarCollapse.classList.toggle("show");
        });
    }

    // Toggle between login and signup forms
    const loginSection = document.getElementById("LogIn");
    const signUpSection = document.getElementById("SignUp");
    const signUpLink = document.getElementById("sign-up-link");
    const loginLink = document.getElementById("login-link");

    if (signUpLink && loginLink && loginSection && signUpSection) {
        signUpLink.addEventListener("click", function (event) {
            event.preventDefault();
            loginSection.style.display = "none";
            signUpSection.style.display = "block";
        });

        loginLink.addEventListener("click", function (event) {
            event.preventDefault();
            signUpSection.style.display = "none";
            loginSection.style.display = "block";
        });
    }

    // Toggle password visibility
    const loginPassword = document.getElementById('login-password');
    const signupPassword = document.getElementById('signup-password');
    const togglePassword = document.getElementById('toggle-password');

    // Toggle visibility of password inputs
document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", function () {
        const passwordField = this.previousElementSibling;
        if (passwordField.type === "password") {
            passwordField.type = "text";
            this.textContent = "👁️‍🗨️";
        } else {
            passwordField.type = "password";
            this.textContent = "👁️";
        }
    });
});

// Handle login form submission
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!username || !password) {
            alert("Please fill out all fields.");
            return;
        }

        try {
            const response = await fetch(LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    alert("Login successful but no redirect specified.");
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Login failed due to a network error. Please try again later.");
        }
    });
}

// Handle signup form submission
const signupForm = document.getElementById("signup-form");
if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const firstName = document.getElementById("signup-firstname").value.trim();
        const lastName = document.getElementById("signup-lastname").value.trim();
        const username = document.getElementById("signup-username").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();

        if (!firstName || !lastName || !username || !email || !password) {
            alert("Please fill out all fields.");
            return;
        }

        try {
            const response = await fetch(REGISTER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, username, email, password }),
            });

            const result = await response.json();
            if (result.error) {
                alert(`Signup failed: ${result.error}`);
            } else {
                alert("Signup successful! " + result.message);
                // Redirect or reset form on success
                signupForm.reset();
                document.getElementById("login-link").click(); // Switch to login form
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("Signup failed due to a network error. Please try again later.");
        }
    });
}

// Toggle between Login and Signup forms
const loginSection = document.getElementById("LogIn");
const signupSection = document.getElementById("SignUp");

document.getElementById("sign-up-link").addEventListener("click", function (e) {
    e.preventDefault();
    loginSection.style.display = "none";
    signupSection.style.display = "block";
});

document.getElementById("login-link").addEventListener("click", function (e) {
    e.preventDefault();
    signupSection.style.display = "none";
    loginSection.style.display = "block";
});


    // Counter animation
    const counterElement = document.getElementById("KidnapCases");
    if (counterElement) {
        let count = 0;
        const target = 3620;
        const duration = 2000;
        const increment = target / (duration / 16);

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
    }
});
