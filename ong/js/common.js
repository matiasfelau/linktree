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
    // La funcionalidad del newsletter se maneja en cada página individual
    // para poder usar el modal de Bootstrap correctamente
}

// AOS Initialization
export function initAOS() {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
}
