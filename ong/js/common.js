// Common functionality shared across pages

// Back to Top functionality
export function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Newsletter functionality
export function initNewsletter() {
    const footerNewsletterForm = document.getElementById('footerNewsletterForm');
    const footerNewsletterEmail = document.getElementById('footerNewsletterEmail');
    
    if (footerNewsletterForm) {
        footerNewsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = footerNewsletterEmail.value;
            alert(`¡Gracias por suscribirte con ${email}!`);
            footerNewsletterEmail.value = '';
        });
    }
}

// AOS Initialization
export function initAOS() {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
}
