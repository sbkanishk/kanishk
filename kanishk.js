document.addEventListener('DOMContentLoaded', () => {
    // Automatically update the copyright year
    const yearSpan = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    yearSpan.textContent = currentYear;

    console.log("Welcome to Shashi Bhushan Kanishk's Terminal.");
});
