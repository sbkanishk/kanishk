document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('nav ul li a');
    
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            alert(`You clicked on ${event.target.textContent}!`);
        });
    });
});
