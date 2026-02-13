// ============================================
// GRANTWISE AI - MAIN JAVASCRIPT
// ============================================

// Dark mode toggle
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const html = document.documentElement;

    // Check for saved preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const theme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Intersection Observer for animations on scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Toast notification system
const Toast = {
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast alert alert-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// Make Toast available globally
window.Toast = Toast;

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// Character counter for textareas
function initCharCounters() {
    document.querySelectorAll('textarea[data-max-length]').forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('data-max-length'));
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        textarea.parentNode.appendChild(counter);

        const updateCounter = () => {
            const current = textarea.value.length;
            counter.textContent = `${current} / ${maxLength}`;

            if (current > maxLength) {
                counter.style.color = 'hsl(var(--color-error))';
            } else if (current > maxLength * 0.9) {
                counter.style.color = 'hsl(var(--color-warning))';
            } else {
                counter.style.color = 'hsl(var(--color-text-muted))';
            }
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });
}

// Auto-save form data to localStorage
function initAutoSave(formId, storageKey) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Load saved data
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const field = form.elements[key];
                if (field) field.value = data[key];
            });
            Toast.info('Draft restored from previous session');
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }

    // Save on input
    let saveTimeout;
    form.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            localStorage.setItem(storageKey, JSON.stringify(data));
        }, 1000);
    });

    // Clear on submit
    form.addEventListener('submit', () => {
        localStorage.removeItem(storageKey);
    });
}

// Initialize all features on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initSmoothScroll();
    initScrollAnimations();
    initMobileMenu();
    initCharCounters();
});

// Export for use in other scripts
window.GrantWise = {
    Toast,
    initAutoSave
};
