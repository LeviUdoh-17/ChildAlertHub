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
