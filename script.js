// Premium Scroll Reveal
const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -80px 0px"
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, revealOptions);

// Initialize reveals
document.querySelectorAll('.reveal').forEach((el, index) => {
    // Add staggered delay if not explicitly set
    if (!el.classList.contains('reveal-delay-1') &&
        !el.classList.contains('reveal-delay-2') &&
        !el.classList.contains('reveal-delay-3')) {
        // el.style.transitionDelay = `${(index % 3) * 0.1}s`;
    }
    revealObserver.observe(el);
});

// Smooth scroll for anchors with fixed header offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Form handling (Mock)
// Form handling now managed by FormSubmit.co via HTML action
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    // Optional: Add simple client-side validation here if needed
}

// Logic for Service Dropdowns
function toggleDropdown(button) {
    const container = button.parentElement;
    const content = container.querySelector('.dropdown-content');

    // Toggle active state on button
    button.classList.toggle('active');

    // Toggle visibility of content
    content.classList.toggle('show');

    // Change button text based on state
    const span = button.querySelector('span');
    if (button.classList.contains('active')) {
        span.textContent = "Moins de détails";
    } else {
        span.textContent = "Plus de détails";
    }
}

// Mobile Menu Logic
const hamburger = document.getElementById('hamburger-menu');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        // Prevent scrolling when menu is open
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'initial';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'initial';
        });
    });
}

