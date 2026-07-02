/* ==========================================================================
   Dr. Anika Sharma — Healthcare Website
   Vanilla JavaScript (ES6) — no jQuery, no frameworks
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------------------
       1. Loading Animation
    ------------------------------------------------------------ */
    const loader = document.getElementById('page-loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader && loader.classList.add('loaded'), 200);
    });

    /* ------------------------------------------------------------
       2. Sticky Navbar on Scroll
    ------------------------------------------------------------ */
    const navbar = document.getElementById('mainNavbar');
    const toggleNavbarBackground = () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    toggleNavbarBackground();
    window.addEventListener('scroll', toggleNavbarBackground, { passive: true });

    /* Collapse mobile menu after clicking a link */
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('#navMenu .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
                bsCollapse.hide();
            }
        });
    });

    /* ------------------------------------------------------------
       3. Active Navigation Highlight (Scroll Spy)
    ------------------------------------------------------------ */
    const sections = document.querySelectorAll('main section[id]');
    const navLinkMap = new Map();
    navLinks.forEach(link => {
        const id = link.getAttribute('href').replace('#', '');
        navLinkMap.set(id, link);
    });

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = navLinkMap.get(id);
            if (!link) return;
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(section => spyObserver.observe(section));

    /* ------------------------------------------------------------
       4. Smooth Scrolling for Anchor Links
    ------------------------------------------------------------ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.length <= 1) return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const navHeight = document.getElementById('mainNavbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        });
    });

    /* ------------------------------------------------------------
       5. Scroll Reveal Animation
    ------------------------------------------------------------ */
    const revealEls = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-reveal-delay') || 0;
                setTimeout(() => entry.target.classList.add('revealed'), Number(delay));
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ------------------------------------------------------------
       6. Animated Counters
    ------------------------------------------------------------ */
    const counters = document.querySelectorAll('.counter');
    const animateCounter = (el) => {
        const target = Number(el.getAttribute('data-target'));
        const duration = 1600;
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            const value = Math.floor(eased * target);
            el.textContent = value.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString();
            }
        };
        requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    /* ------------------------------------------------------------
       7. Testimonial Slider
    ------------------------------------------------------------ */
    const track = document.getElementById('testimonialTrack');
    const slides = track ? Array.from(track.children) : [];
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    let currentSlide = 0;
    let autoplayTimer = null;

    const buildDots = () => {
        if (!dotsContainer) return;
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    };

    const updateSlider = () => {
        if (!track) return;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        if (dotsContainer) {
            Array.from(dotsContainer.children).forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }
    };

    const goToSlide = (index) => {
        currentSlide = (index + slides.length) % slides.length;
        updateSlider();
        restartAutoplay();
    };

    const restartAutoplay = () => {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
    };

    if (track && slides.length) {
        buildDots();
        updateSlider();
        restartAutoplay();

        nextBtn && nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
        prevBtn && prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));

        /* Touch swipe support */
        let touchStartX = 0;
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 40) {
                goToSlide(currentSlide + (diff > 0 ? 1 : -1));
            }
        }, { passive: true });
    }

    /* ------------------------------------------------------------
       8. Appointment Form Validation
    ------------------------------------------------------------ */
    const appointmentForm = document.getElementById('appointmentForm');
    const formSuccess = document.getElementById('formSuccess');
    const apptDateInput = document.getElementById('apptDate');

    if (apptDateInput) {
        const today = new Date().toISOString().split('T')[0];
        apptDateInput.setAttribute('min', today);
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!appointmentForm.checkValidity()) {
                appointmentForm.classList.add('was-validated');
                const firstInvalid = appointmentForm.querySelector(':invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            appointmentForm.classList.add('was-validated');
            formSuccess.classList.add('show');
            appointmentForm.reset();
            appointmentForm.classList.remove('was-validated');

            setTimeout(() => formSuccess.classList.remove('show'), 6000);
        });
    }

    /* Newsletter form (footer) — lightweight confirmation */
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('newsletterEmail');
            if (input && input.value) {
                input.value = '';
                input.placeholder = 'Subscribed! Thank you.';
                setTimeout(() => { input.placeholder = 'Your email'; }, 4000);
            }
        });
    }

    /* ------------------------------------------------------------
       9. Back-to-Top Button
    ------------------------------------------------------------ */
    const backToTop = document.getElementById('backToTop');
    const toggleBackToTop = () => {
        if (window.scrollY > 480) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTop && backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ------------------------------------------------------------
       10. Footer Year
    ------------------------------------------------------------ */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

});