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
    // const loginSection = document.getElementById("LogIn");
    // const signUpSection = document.getElementById("SignUp");
    // const signUpLink = document.getElementById("sign-up-link");
    // const loginLink = document.getElementById("login-link");

    // if (signUpLink && loginLink && loginSection && signUpSection) {
    //     signUpLink.addEventListener("click", function (event) {
    //         event.preventDefault();
    //         loginSection.style.display = "none";
    //         signUpSection.style.display = "block";
    //     });

    //     loginLink.addEventListener("click", function (event) {
    //         event.preventDefault();
    //         signUpSection.style.display = "none";
    //         loginSection.style.display = "block";
    //     });
    // }

    // Toggle password visibility
    const loginPassword = document.getElementById('login-password');
    const signupPassword = document.getElementById('signup-password');
    const togglePassword = document.getElementById('toggle-password');

    // Toggle visibility of password inputs
document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", function () {
        if (loginPassword.type === "password" || signupPassword.type === "password") {
            loginPassword.type = "text";
            signupPassword.type = "text";
            this.textContent = "👁️‍🗨️";
        } else {
            loginPassword.type = "password";
            signupPassword.type = "password";
            this.textContent = "👁️";
        }
    });
});

// Handle toast
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error("Toast container not found.");
        return;
    }

    const toast = document.createElement('div');
    // Dynamically set the class based on the type
    toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
    toast.textContent = message;

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Remove the toast after 4 seconds
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Handle login form submission
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!username || !password) {
            showToast('Please fill out all fields.', 'error');
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
                    showToast('Login successful but no redirect specified.', 'Success');
                }
            } else {
                const errorData = await response.json();
                showToast(errorData.error || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error("Error:", error);
            showToast(errorData.error || 'Login failed due to a network error. Please try again later.', 'error');
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
        console.log(firstName, lastName, username, email, password);
        if (!firstName || !lastName || !username || !email || !password) {
            showToast('Please fill out all fields.', 'error');
            return;
        }

        try {
            const response = await fetch(REGISTER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, username, email, password }),
            });
            const result = await response.json();
            console.log(response, result);
            if (result.error) {
                showToast(`Signup failed: ${result.error}`, 'error');
            } else {
                showToast('Signup successful!', 'success');
                // Redirect or reset form on success
                signupForm.reset();
                document.getElementById("login-link").click(); // Switch to login form
            }
        } catch (error) {
            console.error("Signup error:", error);
            showToast(`Signup failed: ${result.error}`, 'error');
        }
    });
}

const usernameInput = document.getElementById("signup-username");
if (usernameInput) {
    usernameInput.addEventListener("blur", async () => {
        const username = usernameInput.value.trim();
        if (!username) return;

        try {
            const response = await fetch(`${REGISTER_URL}/check-username`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const result = await response.json();
            if (result.exists) {
                showToast("Username already exists. Please choose a different one.", 'error');
            }
        } catch (error) {
            console.error("Username validation error:", error);
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

});
// Counter animation
const counterElement = document.getElementById("KidnapCases");
if (counterElement) {
    let count = 0;
    const target = 50000;
    const duration = 15000;
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

// Handle form submission
document.getElementById('card-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent page reload

    // Collect form data
    const reportFirstname = document.getElementById('report-firstname').value.trim();
    const reportLastname = document.getElementById('report-lastname').value.trim();
    const reportHeight = document.getElementById('report-height').value.trim();
    const reportAge = document.getElementById('report-age').value.trim();
    const reportMissingFrom = document.getElementById('report-MissingFrom').value.trim();
    const reportMissingSince = document.getElementById('report-MissingSince').value.trim();
    const feedback = document.getElementById('feedback').value.trim();
    const personalFirstname = document.getElementById('personal-firstname').value.trim();
    const personalLastname = document.getElementById('personal-lastname').value.trim();
    const personalAge = document.getElementById('personal-age').value.trim();
    const personalPhoneNumber = document.getElementById('personal-phoneNumber').value.trim();
    const personalEmail = document.getElementById('personal-email').value.trim();
    const personalDetails = document.getElementById('personalDetails').value.trim();

    // Get selected radio value
    const satisfactionRadios = document.querySelectorAll('input[name="satisfaction"]');
    let satisfaction = null;
    satisfactionRadios.forEach(radio => {
        if (radio.checked) satisfaction = radio.value;
    });

    // Validate required fields
    if (
        !reportHeight ||
        !reportAge ||
        !personalFirstname ||
        !personalLastname ||
        !personalAge ||
        !personalPhoneNumber ||
        !personalEmail ||
        !satisfaction
    ) {
        alert('Please fill in all required fields.');
        return;
    }

    // Validate phone number
    const phonePattern = /^[0-9]{11}$/;
    if (!phonePattern.test(personalPhoneNumber)) {
        alert('Please enter a valid 11-digit phone number.');
        return;
    }

    // Validate images
    const imagesInput = document.getElementById('Image');
    if (imagesInput.files.length === 0) {
        alert('Please upload at least one image.');
        return;
    }

    // Create form data for submission
    const formData = new FormData();
    formData.append('reportFirstname', reportFirstname);
    formData.append('reportLastname', reportLastname);
    formData.append('reportHeight', reportHeight);
    formData.append('reportAge', reportAge);
    formData.append('reportMissingFrom', reportMissingFrom);
    formData.append('reportMissingSince', reportMissingSince);
    formData.append('feedback', feedback);
    formData.append('personalFirstname', personalFirstname);
    formData.append('personalLastname', personalLastname);
    formData.append('personalAge', personalAge);
    formData.append('personalPhoneNumber', personalPhoneNumber);
    formData.append('personalEmail', personalEmail);
    formData.append('personalDetails', personalDetails);
    formData.append('satisfaction', satisfaction);

    // Append images to form data
    for (const file of imagesInput.files) {
        formData.append('images', file);
    }

    // Send data to the server
    fetch('/submit-card', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('card-form').reset(); // Clear the form
                showToast('Your report has been submitted successfully.', 'success');
            } else {
                showToast('Error submitting your report. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('There was an error submitting your report.', 'error');
        });
});

// Function to open the modal with card details
async function openModal(cardId) {
    try {
        console.log("Fetching details for card ID:", cardId); // Debugging log
        const response = await fetch(`/get-card-details/${cardId}`);
        if (response.ok) {
            const card = await response.json();
            console.log("Fetched card details:", card); // Debugging log

            // Populate the modal with card details
            const modalTitle = document.getElementById("modal-title");
            const modalImage = document.getElementById("modal-image");
            const modalFullName = document.getElementById("modal-fullname");
            const modalMissingInfo = document.getElementById("modal-missinginfo");
            const modalDetails = document.getElementById("modal-details");

            modalTitle.textContent = "Details of Missing Person";
            modalImage.src = `/uploads/${card.image}`;
            modalImage.alt = `Image of ${card.firstname} ${card.lastname}`;
            modalFullName.textContent = `Full Name: ${card.firstname} ${card.lastname}`;
            modalMissingInfo.textContent = `Missing Since: ${card.missingSince}, Last Seen: ${card.missingFrom}`;
            modalDetails.textContent = `Additional Details: ${card.details}`;

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById("cardModal"));
            modal.show();
        } else {
            console.error("Failed to fetch card details:", response.statusText); // Debugging log
        }
    } catch (error) {
        console.error("Error fetching card details:", error); // Debugging log
    }
}

// Fetch and display approved cards
async function fetchApprovedCards() {
    try {
        console.log("Fetching approved cards..."); // Debugging log
        const response = await fetch('/get-approved-cards');
        if (response.ok) {
            const data = await response.json();
            console.log("Approved cards fetched:", data); // Debugging log
            const cards = data.cards;
            displayApprovedCards(cards);
        } else {
            console.error("Failed to fetch approved cards:", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching approved cards:", error);
    }
}

function displayApprovedCards(cards) {
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = ""; // Clear existing cards
    if (cards.length === 0) {
        console.log("No approved cards to display."); // Debugging log
        cardsContainer.innerHTML = "<p>No approved cards found.</p>";
        return;
    }
    cards.forEach(card => {
        console.log("Rendering card:", card); // Debugging log
        const cardElement = document.createElement('div');
        cardElement.className = "MissingPersonCard";
        cardElement.innerHTML = `
            <img src="/uploads/${card.image}" alt="Card Image" class="card-image">
            <h3>${card.firstname} ${card.lastname}</h3>
            <p>Missing From: ${card.missingFrom}</p>
            <button class="btn btn-primary" onclick="openModal(${card.id})">View More</button>
        `;
        cardsContainer.appendChild(cardElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchApprovedCards();
});

// Add event listener to search form
document.querySelector('.d-flex').addEventListener('submit', function (e) {
    e.preventDefault();
    const searchQuery = document.querySelector('.form-control').value;
    const sortBy = document.querySelector('.form-select').value;
    fetchApprovedCards(searchQuery, sortBy);
});

// Copyright Year
document.getElementsByClassName("year").textContent = new Date().getFullYear();