
document.addEventListener("DOMContentLoaded", () => {
const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll(".navbar .main-menu a");

navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;

    if (linkPath === currentPath) {
    link.classList.add("active");

    // If inside dropdown, underline parent (Conference)
    const dropdown = link.closest(".dropdown");
    if (dropdown) {
        dropdown.closest("li")
        .querySelector("span")
        ?.classList.add("active");
    }
    }
});
});

