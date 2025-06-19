import './bootstrap';



"use strict";




(function() { // IIFE para encapsular y evitar polución global

    // --- Función de Utilidad para Verificar Elementos ---
    const getElement = (selector, context = document, warn = false) => {
        const element = context.querySelector(selector);
        if (!element && warn) {
            console.warn(`Element not found for selector: ${selector}`);
        }
        return element;
    };

    // --- Función de Utilidad para Verificar Múltiples Elementos ---
    const getElements = (selector, context = document, warn = false) => {
        const elements = context.querySelectorAll(selector);
        if (elements.length === 0 && warn) {
            console.warn(`No elements found for selector: ${selector}`);
        }
        return elements;
    };

    // Esperar a que el DOM esté completamente cargado y parseado
    document.addEventListener("DOMContentLoaded", () => {

        const startTime = performance.now();
        console.log(`%cCentipy Scripts Initializing... [${new Date().toLocaleTimeString()}]`, "color: #7F5AF0; font-weight: bold;");

        // --- Selectores Comunes ---
        const SELECTORS = {
            typedPlaceholder: "#typed-text-placeholder",
            header: "#site-header",
            hamburger: "#hamburgerMenu",
            navLinks: "#navLinks",
            observableElements: "[data-observe]",
            backToTopButton: "#btnBackToTop",
            modalTriggers: "[data-modal]",
            modals: ".modal",
            modalClosers: "[data-close]",
            rippleElements: ".ripple",
            internalLinks: 'a[href^="#"]:not([href="#"])',
            // contactAnimationContainer: '#contact-animation-container' // Ya no existe en el HTML final
        };

        const header = getElement(SELECTORS.header);
        const body = document.body;

        // --- 1. Inicialización de Typed.js ---
        const initTypedText = () => {
            const typedTarget = getElement(SELECTORS.typedPlaceholder);
            if (!typedTarget) return;

            if (typeof Typed !== 'undefined') {
                try {
                    const stringsToType = [
                        "Creamos Experiencias Web <span class='highlight'>Brutales</span>.",
                        "Diseño <span class='highlight-alt'>Disruptivo</span> y Funcional.",
                        "Rendimiento <span class='highlight'>Obsesivo</span> Garantizado.",
                        "Soluciones Digitales Que <span class='highlight-alt'>Inspiran</span>.",
                        "Tu Visión Hecha <span class='highlight'>Realidad</span> Digital.",
                    ];
                    new Typed(typedTarget, {
                        strings: stringsToType, typeSpeed: 55, backSpeed: 35,
                        backDelay: 1800, startDelay: 500, loop: true,
                        smartBackspace: true, contentType: 'html', cursorChar: '_',
                    });
                    console.log("Typed.js Initialized.");
                } catch (error) {
                    console.error("Error initializing Typed.js:", error);
                    if (typedTarget) typedTarget.innerHTML = "Creamos Experiencias Web <span class='highlight'>Brutales</span>.";
                }
            } else {
                typedTarget.innerHTML = "Creamos Experiencias Web <span class='highlight'>Brutales</span>.";
                console.warn("Typed.js library not found. Displaying fallback text.");
            }
        };

        // --- 2. Header Dinámico al Hacer Scroll ---
        const initHeaderScroll = () => {
            if (!header) return;
            const scrollThreshold = 50;
            let isTicking = false;

            const updateHeader = () => {
                header.classList.toggle("scrolled", window.scrollY > scrollThreshold);
                isTicking = false;
            };

            window.addEventListener("scroll", () => { if (!isTicking) { window.requestAnimationFrame(updateHeader); isTicking = true; } }, { passive: true });
            updateHeader();
            console.log("Header Scroll Handler Initialized.");
        };

        // --- 3. Menú Hamburguesa ---
        const initHamburgerMenu = () => {
            const hamburger = getElement(SELECTORS.hamburger);
            const navLinks = getElement(SELECTORS.navLinks);
            if (!hamburger || !navLinks) return;

            const toggleNav = (forceClose = false) => {
                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                const shouldOpen = !isExpanded && !forceClose;
                hamburger.setAttribute('aria-expanded', String(shouldOpen));
                navLinks.classList.toggle('active', shouldOpen);
                body.classList.toggle('nav-open', shouldOpen);
            };

            hamburger.addEventListener('click', (e) => { e.stopPropagation(); toggleNav(); });
            navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleNav(true)));
            document.addEventListener('click', (e) => { if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) toggleNav(true); });
            window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navLinks.classList.contains('active')) toggleNav(true); });
            console.log("Hamburger Menu Initialized.");
        };

        // --- 4. Intersection Observer para Animaciones ---
        const initScrollAnimations = () => {
            if (!("IntersectionObserver" in window)) {
                console.warn("IntersectionObserver not supported. Fallback: making elements visible.");
                getElements(SELECTORS.observableElements).forEach(el => el.classList.add("visible"));
                return;
            }

            const observerOptions = { threshold: 0.15 };
            const observerCallback = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const delay = parseInt(element.dataset.delay || "0", 10);
                        if (!isNaN(delay)) element.style.transitionDelay = `${delay}ms`;
                        else console.warn("Invalid data-delay on:", element);
                        element.classList.add('visible');
                        observer.unobserve(element);
                    }
                });
            };
            const observer = new IntersectionObserver(observerCallback, observerOptions);
            getElements(SELECTORS.observableElements).forEach(el => observer.observe(el));
            console.log("Intersection Observer Initialized.");
        };

        // --- 5. Botón Volver Arriba (Back to Top) ---
        const initBackToTop = () => {
            const button = getElement(SELECTORS.backToTopButton);
            if (!button) return;
            const scrollThreshold = 400;
            let isTicking = false;

            const updateButtonVisibility = () => {
                button.classList.toggle("is-visible", window.scrollY > scrollThreshold);
                isTicking = false;
            };

            window.addEventListener("scroll", () => { if (!isTicking) { window.requestAnimationFrame(updateButtonVisibility); isTicking = true; } }, { passive: true });
            button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
            updateButtonVisibility();
            console.log("Back to Top Button Initialized.");
        };

        // --- 6. Manejo de Modales ---
        const initModals = () => {
            const triggers = getElements(SELECTORS.modalTriggers);
            const allModals = getElements(SELECTORS.modals);
            if (triggers.length === 0 || allModals.length === 0) return;

            let openModalElement = null;
            let previouslyFocusedElement = null;
            const closeModalTimeoutDuration = 500;

            const openModal = (modalId) => {
                const modal = document.getElementById(modalId);
                if (!modal || modal.classList.contains('is-open')) return;

                previouslyFocusedElement = document.activeElement;
                openModalElement = modal;
                modal.style.display = 'flex'; void modal.offsetHeight;
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                body.style.paddingRight = `${window.innerWidth - body.clientWidth}px`;
                body.style.overflow = 'hidden';

                const focusableElement = modal.querySelector(SELECTORS.modalClosers) || modal;
                try { focusableElement.focus(); } catch(e) { console.warn("Could not focus modal", e); }
                console.log(`Modal opened: ${modalId}`);
            };

            const closeModal = () => {
                if (!openModalElement) return;
                const modalToClose = openModalElement;
                let animationEnded = false;

                modalToClose.classList.add('is-closing');
                modalToClose.setAttribute('aria-hidden', 'true');

                const cleanup = () => {
                    modalToClose.classList.remove('is-open', 'is-closing');
                    modalToClose.style.display = 'none';
                    body.style.overflow = ''; body.style.paddingRight = '';
                    if (previouslyFocusedElement?.focus) previouslyFocusedElement.focus();
                    openModalElement = null;
                    console.log(`Modal closed: ${modalToClose.id}`);
                };

                const content = modalToClose.querySelector('.modal-content');
                const handleAnimationEnd = (event) => {
                     if (event.target === content || event.target === modalToClose) {
                         if (!animationEnded) {
                             animationEnded = true;
                             cleanup();
                             if(content) content.removeEventListener('animationend', handleAnimationEnd);
                              modalToClose.removeEventListener('animationend', handleAnimationEnd);
                         }
                    }
                };
                 modalToClose.addEventListener('animationend', handleAnimationEnd, { once: true });
                setTimeout(() => { if (!animationEnded) { console.warn(`Modal closing fallback for ${modalToClose.id}`); cleanup(); } }, closeModalTimeoutDuration);
            };

            triggers.forEach(trigger => trigger.addEventListener('click', (e) => { e.preventDefault(); const id = trigger.dataset.modal; if (id) openModal(id); }));
            allModals.forEach(modal => {
                modal.querySelectorAll(SELECTORS.modalClosers).forEach(closer => closer.addEventListener('click', closeModal));
                modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
            });
            window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openModalElement) closeModal(); });
            console.log("Modal Handling Initialized.");
        };

        // --- 7. Efecto Ripple JS ---
        const initRippleEffect = () => {
            getElements(SELECTORS.rippleElements).forEach(button => {
                button.addEventListener("click", function (e) {
                    try {
                        const rect = this.getBoundingClientRect();
                        const ripple = document.createElement("span");
                        const size = Math.max(rect.width, rect.height);
                        ripple.style.width = ripple.style.height = `${size}px`;
                        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                        ripple.className = "ripple-effect";

                        const existingRipple = this.querySelector(".ripple-effect");
                        if (existingRipple) existingRipple.remove();
                        this.appendChild(ripple);

                        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
                        setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 600); // Fallback
                    } catch (error) { console.error("Ripple error:", error); }
                });
            });
            console.log("Ripple Effect Initialized.");
        };

        // --- 8. Smooth Scroll para Enlaces Internos ---
        const initSmoothScroll = () => {
            getElements(SELECTORS.internalLinks).forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    if (!href || href.length <= 1 || href.charAt(0) !== '#') return;
                    try {
                        const targetElement = document.getElementById(href.substring(1));
                        if (targetElement) {
                            e.preventDefault();
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else console.warn(`Smooth scroll target not found: ${href}`);
                    } catch (error) { console.error(`Smooth scroll error for ${href}:`, error); }
                });
            });
            console.log("Smooth Scroll Initialized.");
        };

        // --- LLAMADAS A LAS FUNCIONES DE INICIALIZACIÓN ---
        try {
            initTypedText();
            initHeaderScroll();
            initHamburgerMenu();
            initScrollAnimations();
            initBackToTop();
            initModals();
            initRippleEffect();
            initSmoothScroll();

            const endTime = performance.now();
            console.log(`%cCentipy Scripts Initialization Complete. Took ${(endTime - startTime).toFixed(2)}ms.`, "color: #39FF14; font-weight: bold;");

        } catch (error) {
            console.error("Critical error during script initialization:", error);
        }

    }); // Fin de DOMContentLoaded

})(); // Fin de IIFE