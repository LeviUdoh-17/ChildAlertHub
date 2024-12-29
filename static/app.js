document.addEventListener("DOMContentLoaded", function() {
    window.addEventListener("scroll", function() {
        const navbar = document.querySelector(".navbar");
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
});

document.addEventListener("DOMContentLoaded", () => {
  const counterElement = document.getElementById("KidnapCases");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signUpForm");
  const loginButton = document.getElementById("login-btn");
  const signupButton = document.getElementById("signup-btn");
  let count = 0;
  const target = 3620;
  const duration = 2000;
  const increment = target / (duration / 16);

  // Login form submission
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

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
                // Redirect user to the dashboard
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

  // Signup form submission
  signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(signupForm);
      const data = {
          username: formData.get("username"),
          password: formData.get("password"),
          user_type: formData.get("userType"),
      };

      try {
          const response = await fetch("/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
          });

          const result = await response.json();
          alert(result.message || result.error);
      } catch (error) {
          console.error("Signup error:", error);
          alert("Signup failed. Please try again.");
      }
  });

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

  // Toggle between login and sign-up forms
  loginButton.addEventListener("click", () => {
      loginForm.style.display = "block";
      signupForm.style.display = "none";
  });

  signupButton.addEventListener("click", () => {
      signupForm.style.display = "block";
      loginForm.style.display = "none";
  });

  updateCounter();
});
