const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("active");

    if (navMenu.classList.contains("active")) {
        hamburger.textContent = "✕";
    } else {
        hamburger.textContent = "☰";
    }
});