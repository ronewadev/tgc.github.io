// Dark Mode Toggle
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    const toggleIcon = document.querySelector('.dark-mode-toggle i');
    if (body.classList.contains('dark-mode')) {
        toggleIcon.classList.remove('fa-moon');
        toggleIcon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        toggleIcon.classList.remove('fa-sun');
        toggleIcon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Check for saved dark mode preference
document.addEventListener('DOMContentLoaded', () => {
    // Dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        const toggleIcon = document.querySelector('.dark-mode-toggle i');
        if (toggleIcon) {
            toggleIcon.classList.remove('fa-moon');
            toggleIcon.classList.add('fa-sun');
        }
    }

    // Animation on scroll
    const animateElements = document.querySelectorAll('.animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Set active navigation link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (currentPage === linkPage || 
            (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
});