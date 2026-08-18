import * as THREE from 'three';
import { i18n } from './translations.js';

window.currentLang = localStorage.getItem('gestu-lang') || 'fr';

export function setLanguage(lang) {
    window.currentLang = lang;
    localStorage.setItem('gestu-lang', lang);

    // 1. Update all static elements with [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) {
            el.innerHTML = i18n[lang][key];
        }
    });

    // 2. Update language switcher UI
    document.querySelectorAll('.lang-switch span').forEach(s => {
        if (s.textContent.trim().toLowerCase() === lang) {
            s.classList.add('active');
            s.classList.remove('dim');
        } else {
            s.classList.add('dim');
            s.classList.remove('active');
        }
    });

    // 3. Update Hero Carousel Slides (Home View)
    if (window.projectsData) {
        document.querySelectorAll('.carousel-slide').forEach(slide => {
            const projId = slide.getAttribute('data-project-id');
            const project = window.projectsData.find(p => p.id === projId);
            if (!project) return;

            const titleEl = slide.querySelector('.slide-project-title');
            if (titleEl) {
                titleEl.innerHTML = (lang === 'en' && project.titleEn) ? project.titleEn.replace('<br>', ' ') : project.title.replace('<br>', ' ');
            }
            const metaEl = slide.querySelector('.slide-project-meta');
            if (metaEl) {
                const loc = (lang === 'en' && project.locationEn) ? project.locationEn.toUpperCase() : project.location.toUpperCase();
                metaEl.textContent = `${project.year} • ${loc}`;
            }
            const locEl = slide.querySelector('.slide-project-loc');
            if (locEl) {
                locEl.textContent = (lang === 'en' && project.locationEn) ? project.locationEn : project.location;
            }
            const catEl = slide.querySelector('.slide-project-cat');
            if (catEl) {
                const cat = (lang === 'en' && project.programmeEn) ? project.programmeEn : ((lang === 'en' && project.categoryEn) ? project.categoryEn : (project.programme || project.category));
                catEl.textContent = cat;
            }
            const btnEl = slide.querySelector('.slide-discover-btn');
            if (btnEl) {
                btnEl.textContent = lang === 'en' ? 'DISCOVER THE PROJECT →' : 'DÉCOUVRIR LE PROJET →';
            }
        });

        // 4. Update Horizontal Selected Projects Slider (Home View)
        document.querySelectorAll('.other-project-card').forEach(card => {
            const href = card.getAttribute('href') || '';
            const projId = href.replace('#projet-', '');
            const project = window.projectsData.find(p => p.id === projId);
            if (!project) return;

            const titleEl = card.querySelector('.other-card-title');
            if (titleEl) {
                titleEl.innerHTML = (lang === 'en' && project.titleEn) ? project.titleEn.replace('<br>', ' ') : project.title.replace('<br>', ' ');
            }
            const locEl = card.querySelector('.other-card-loc');
            if (locEl) {
                const loc = (lang === 'en' && project.locationEn) ? project.locationEn : project.location;
                locEl.textContent = `${loc} • ${project.year}`;
            }
        });
    }

    // 5. Update Contact Form Placeholders
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.placeholder = lang === 'en' ? 'Your name' : 'Votre nom';
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.placeholder = lang === 'en' ? 'Your email' : 'Votre email';
    const subjectInput = document.getElementById('subject');
    if (subjectInput) subjectInput.placeholder = lang === 'en' ? 'Subject' : 'Sujet';
    const messageInput = document.getElementById('message');
    if (messageInput) messageInput.placeholder = lang === 'en' ? 'Your message' : 'Votre message';

    // 6. Refresh dynamic views
    if (typeof window.renderProjectsGrid === 'function') window.renderProjectsGrid();
    if (window.location.hash.startsWith('#projet-')) {
        if (typeof window.populateProjectDetail === 'function') {
            window.populateProjectDetail(window.location.hash.replace('#projet-', ''));
        }
    }
}

window.setLanguage = setLanguage;


// --- DISSOLUTION CANVAS PARTICLES & LIGHT STREAKS ---
let dissolutionAnimId = null;

function startDissolutionCanvas() {
    const canvas = document.getElementById('dissolution-canvas');
    const svg = document.getElementById('loader-svg');
    if (!canvas || !svg) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const svgRect = svg.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;
    const logoW = svgRect.width;
    const logoH = svgRect.height;

    // High density fine vertical rays matching the storyboard
    const streaksCount = 110;
    const streaks = [];
    
    for (let i = 0; i < streaksCount; i++) {
        // Distribute streaks across the vertical columns of the emblem
        const colOffset = (Math.random() - 0.5) * logoW * 0.95;
        const dir = Math.random() > 0.5 ? -1 : 1; // Up or Down
        const initialY = centerY + (Math.random() - 0.5) * logoH * 0.85;

        streaks.push({
            x: centerX + colOffset,
            y: initialY,
            length: Math.random() * 40 + 20,
            maxLength: Math.random() * 260 + 120,
            speed: (Math.random() * 6 + 3) * dir,
            width: Math.random() * 1.8 + 0.6,
            alpha: Math.random() * 0.8 + 0.2,
            color: Math.random() > 0.4 ? '#d8a86a' : '#fae3b6',
            decay: Math.random() * 0.018 + 0.009
        });
    }

    // Floating gold micro-particles
    const particlesCount = 55;
    const particles = [];
    for (let i = 0; i < particlesCount; i++) {
        particles.push({
            x: centerX + (Math.random() - 0.5) * logoW * 0.9,
            y: centerY + (Math.random() - 0.5) * logoH * 0.9,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 2 + 0.8,
            alpha: Math.random() * 0.85 + 0.15,
            decay: Math.random() * 0.02 + 0.012
        });
    }

    let startTime = performance.now();

    function renderStreaks(now) {
        const elapsed = (now - startTime) / 1000;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Draw vertical streaks
        streaks.forEach(s => {
            s.y += s.speed;
            s.length = Math.min(s.maxLength, s.length + Math.abs(s.speed) * 2.8);
            s.alpha = Math.max(0, s.alpha - s.decay);

            if (s.alpha > 0) {
                const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.length * (s.speed < 0 ? 1 : -1));
                grad.addColorStop(0, 'rgba(255, 248, 230, ' + s.alpha + ')');
                grad.addColorStop(0.35, s.color === '#fae3b6' ? 'rgba(250, 227, 182, ' + (s.alpha * 0.85) + ')' : 'rgba(216, 168, 106, ' + (s.alpha * 0.85) + ')');
                grad.addColorStop(1, 'rgba(180, 120, 50, 0)');

                ctx.strokeStyle = grad;
                ctx.lineWidth = s.width;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x, s.y + s.length * (s.speed < 0 ? -1 : 1));
                ctx.stroke();
            }
        });

        // Draw micro-particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = Math.max(0, p.alpha - p.decay);

            if (p.alpha > 0) {
                ctx.fillStyle = 'rgba(255, 238, 195, ' + p.alpha + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        if (elapsed < 1.6) {
            dissolutionAnimId = requestAnimationFrame(renderStreaks);
        } else {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }

    dissolutionAnimId = requestAnimationFrame(renderStreaks);
}

function initApp() {
    // Lang Switch
    document.querySelectorAll('.lang-switch span').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.textContent.trim().toLowerCase();
            console.log('Lang switch clicked:', lang);
            if (typeof setLanguage === 'function') {
                setLanguage(lang);
            }
        });
    });
    
    // Apply initial language
    setLanguage(window.currentLang);

    const loader = document.getElementById('loader');
    const mainContent = document.getElementById('main-content');

    // --- TIMELINE DU NOUVEAU LOADER (FUSION & DISSOLUTION - 4.2s) ---
    if (loader) {
        // 0s - 0.7s: Étape 1 - Apparition de l'élément central lumineux
        setTimeout(() => {
            loader.classList.add('active');
            loader.classList.add('stage-initial');
        }, 50);

        // 0.7s - 1.8s: Étape 2 - Assemblage fluide des pièces périphériques
        setTimeout(() => {
            loader.classList.add('stage-assemble');
        }, 750);

        // 1.8s - 2.6s: Étape 3 - Stabilisation du logo complet au centre (lueur dorée)
        setTimeout(() => {
            loader.classList.add('stage-stabilize');
        }, 1850);

        // 2.6s - 3.6s: Étape 4 - Dissolution verticale en fines lignes lumineuses
        setTimeout(() => {
            loader.classList.add('stage-dissolve');
            startDissolutionCanvas();
        }, 2600);

        // 3.6s - 4.2s: Étape 5 - Transition douce / fondu au clair révélant le site
        setTimeout(() => {
            loader.classList.add('stage-fadeout');
            
            if (mainContent) {
                mainContent.style.display = 'block';
                void mainContent.offsetWidth; // Force reflow
                mainContent.style.opacity = '1';
            }
        }, 3600);

        // 4.2s: Disparition complète du loader
        setTimeout(() => {
            loader.style.display = 'none';
            if (dissolutionAnimId) cancelAnimationFrame(dissolutionAnimId);
        }, 4250);
    }

    // --- MENU OVERLAY LOGIC ---
    const menuBtn = document.getElementById('menu-toggle');
    const menuOverlay = document.getElementById('menu-overlay');
    const overlayLinks = document.querySelectorAll('.overlay-link');

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    // Close menu when clicking a link
    overlayLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    });

    // --- THEME TOGGLE LOGIC ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // SVG icons
    const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    const sunIcon = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-mode');
            
            if (document.documentElement.classList.contains('light-mode')) {
                themeIcon.innerHTML = sunIcon;
            } else {
                themeIcon.innerHTML = moonIcon;
            }
        });
    }

    // --- LANGUAGE SWITCHER LOGIC ---
    document.querySelectorAll('.lang-switch span').forEach(s => {
        s.addEventListener('click', () => {
            const lang = s.textContent.trim().toLowerCase();
            if (lang === 'fr' || lang === 'en') {
                setLanguage(lang);
            }
        });
    });
    setLanguage(window.currentLang);

    // --- GLOBAL BACK-TO-TOP HANDLER ---
    document.addEventListener('click', (e) => {
        const backBtn = e.target.closest('.back-to-top');
        if (backBtn) {
            e.preventDefault();
            const activeView = document.querySelector('.page-view.active');
            if (activeView) {
                activeView.scrollTo({ top: 0, behavior: 'smooth' });
            }
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.scrollTo({ top: 0, behavior: 'smooth' });
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // --- SMART HEADER (WILMOTTE SCROLL BEHAVIOR: HIDE ON SCROLL DOWN, SHOW ON SCROLL UP) ---
    function initSmartHeader() {
        const header = document.querySelector('.global-header');
        const menuOverlay = document.getElementById('menu-overlay');
        if (!header) return;

        let lastScrollY = 0;
        let ticking = false;

        function getActiveScrollTop() {
            const activeView = document.querySelector('.page-view.active');
            if (activeView && activeView.scrollTop > 0) {
                return activeView.scrollTop;
            }
            const mainContent = document.getElementById('main-content');
            if (mainContent && mainContent.scrollTop > 0) {
                return mainContent.scrollTop;
            }
            return window.pageYOffset || document.documentElement.scrollTop || 0;
        }

        function handleScrollUpdate(e) {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (menuOverlay && menuOverlay.classList.contains('active')) {
                        header.classList.remove('header-hidden');
                        ticking = false;
                        return;
                    }

                    let currentScrollY = 0;
                    if (e && e.target && typeof e.target.scrollTop === 'number' && e.target !== document) {
                        currentScrollY = e.target.scrollTop;
                    } else {
                        currentScrollY = getActiveScrollTop();
                    }

                    const diff = currentScrollY - lastScrollY;

                    if (currentScrollY <= 40) {
                        // At the very top: show header
                        header.classList.remove('header-hidden');
                        header.classList.remove('header-scrolled');
                    } else if (diff > 6 && currentScrollY > 70) {
                        // Scrolling DOWN: header glides up and disappears
                        header.classList.add('header-hidden');
                    } else if (diff < -4) {
                        // Scrolling UP: header glides down and reappears
                        header.classList.remove('header-hidden');
                        header.classList.add('header-scrolled');
                    }

                    lastScrollY = currentScrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', handleScrollUpdate, { passive: true });
        
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.addEventListener('scroll', handleScrollUpdate, { passive: true });
        }

        document.querySelectorAll('.page-view').forEach(view => {
            view.addEventListener('scroll', handleScrollUpdate, { passive: true });
        });
    }

    initSmartHeader();

    // --- SPA ROUTING LOGIC & WILMOTTE EDITORIAL MOSAIC ---
    window.renderWilmotteProjects = function renderWilmotteProjects() {
        const gallery = document.getElementById('projects-staggered-gallery');
        if (!gallery || !window.projectsData) return;

        const displayItems = window.projectsData;

        // Row rhythm sequence (2, 3, 2, 2, 3, 2...) matching Wilmotte editorial composition
        const rowPatterns = [
            { name: 'pattern-asym-left', count: 2 },
            { name: 'pattern-triad', count: 3 },
            { name: 'pattern-spaced', count: 2 },
            { name: 'pattern-asym-right', count: 2 },
            { name: 'pattern-triad-alt', count: 3 },
            { name: 'pattern-offset', count: 2 }
        ];

        let itemIndex = 0;
        let patternIndex = 0;
        let rowsHtml = '';

        while (itemIndex < displayItems.length) {
            const pattern = rowPatterns[patternIndex % rowPatterns.length];
            const rowItems = displayItems.slice(itemIndex, itemIndex + pattern.count);
            itemIndex += pattern.count;
            patternIndex++;

            rowsHtml += `
                <div class="wilmotte-row ${pattern.name}">
                    ${rowItems.map((item, idx) => `
                        <a href="#projet-${item.id}" class="wilmotte-card reveal delay-${(idx % 3) + 1}">
                            <div class="wilmotte-img-box">
                                <img src="${item.image}" alt="${item.title.replace('<br>', ' ')}" loading="lazy">
                            </div>
                            <div class="wilmotte-caption">
                                <span class="wilmotte-caption-title">${window.currentLang === 'en' && item.titleEn ? item.titleEn.replace('<br>', ' ') : item.title.replace('<br>', ' ')}</span>
                                <span class="wilmotte-caption-loc">${item.year} • ${window.currentLang === 'en' && item.locationEn ? item.locationEn : item.location}</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            `;
        }

        gallery.innerHTML = rowsHtml;

        if (typeof initScrollReveal === 'function') {
            initScrollReveal();
        }
    };

    window.renderProjectsGrid = window.renderWilmotteProjects;

    window.populateProjectDetail = function populateProjectDetail(projectId) {
        if (!window.projectsData) return false;
        const project = window.projectsData.find(p => p.id === projectId);
        if (!project) return false;

        document.getElementById('detail-title').innerHTML = window.currentLang === 'en' && project.titleEn ? project.titleEn : project.title;
        document.getElementById('detail-location').textContent = window.currentLang === 'en' && project.locationEn ? project.locationEn : project.location;
        document.getElementById('detail-year').textContent = project.year;
        document.getElementById('detail-surface').textContent = project.surface;
        document.getElementById('detail-mission').textContent = window.currentLang === 'en' && project.missionEn ? project.missionEn : project.mission;
        document.getElementById('detail-status').textContent = window.currentLang === 'en' && project.statusEn ? project.statusEn : project.status;
        document.getElementById('detail-desc').innerHTML = window.currentLang === 'en' && project.descriptionEn ? project.descriptionEn : project.description;

        const catRow = document.getElementById('detail-category-row');
        const catEl = document.getElementById('detail-category');
        if (catRow && catEl) {
            if (project.category) {
                catEl.textContent = window.currentLang === 'en' && project.categoryEn ? project.categoryEn : project.category;
                catRow.style.display = 'block';
            } else {
                catRow.style.display = 'none';
            }
        }

        const progRow = document.getElementById('detail-programme-row');
        const progEl = document.getElementById('detail-programme');
        if (progRow && progEl) {
            if (project.programme) {
                progEl.textContent = window.currentLang === 'en' && project.programmeEn ? project.programmeEn : project.programme;
                progRow.style.display = 'block';
            } else {
                progRow.style.display = 'none';
            }
        }
        const visualContainer = document.querySelector('.project-visual');
        
        function renderInteractiveHero(container, proj) {
            let html = `<div class="hero-interactive" id="hero-interactive">`;
            proj.timeLapseImages.forEach((src, idx) => {
                const opacity = idx === 0 ? 1 : 0; // First image visible
                html += `<img src="${src}" class="time-img" id="time-img-${idx}" style="opacity: ${opacity};" alt="Time lapse ${idx}">`;
            });
            const label = proj.timeLabels ? proj.timeLabels[0] : "";
            html += `<div class="time-indicator" id="time-indicator">${label}</div>`;
            html += `</div>`;
            container.innerHTML = html;
            
            // Attach lightbox to interactive container
            const heroInteractive = document.getElementById('hero-interactive');
            heroInteractive.style.cursor = 'zoom-in';
            heroInteractive.onclick = () => {
                // Find currently visible image
                const images = Array.from(document.querySelectorAll('.time-img'));
                const activeImg = images.reduce((prev, current) => {
                    return (parseFloat(prev.style.opacity) > parseFloat(current.style.opacity)) ? prev : current;
                });
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                lightboxImg.src = activeImg.src;
                lightbox.classList.add('active');
            };
        }

        if (project.timeLapseImages && project.timeLapseImages.length > 0) {
            // Render interactive time-lapse hero
            renderInteractiveHero(visualContainer, project);
        } else {
            // Render standard main image
            visualContainer.innerHTML = `<img id="detail-main-img" src="${project.image}" alt="Project Visual" class="project-main-img">`;
            
            // Save the original hero image
            const originalHeroSrc = project.image;
            const mainImgEl = document.getElementById('detail-main-img');
            
            // Open lightbox when clicking the main image
            mainImgEl.style.cursor = 'zoom-in';
            mainImgEl.onclick = () => {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                lightboxImg.src = mainImgEl.src;
                lightbox.classList.add('active');
            };
        }
        
        const thumbnailsContainer = document.getElementById('detail-thumbnails');
        thumbnailsContainer.innerHTML = '';
        const thumbnailsCol = document.querySelector('.project-thumbnails');

        if (project.gallery && project.gallery.length > 1) {
            if (thumbnailsCol) thumbnailsCol.style.display = 'block';
            project.gallery.forEach((item, index) => {
                const src = typeof item === 'string' ? item : item.src;
                const title = typeof item === 'string' ? '' : item.title;
                const isTimeLapse = typeof item === 'object' ? item.isTimeLapse : false;
                
                const thumbWrapper = document.createElement('div');
                thumbWrapper.className = 'thumb-wrapper';
                thumbWrapper.style.marginBottom = '1.5rem';
                thumbWrapper.style.cursor = 'pointer';
                thumbWrapper.style.paddingRight = '10px';
                
                const img = document.createElement('img');
                img.src = src;
                img.alt = title || `Miniature ${index + 1}`;
                img.className = 'thumb-img';
                img.style.width = '100%';
                img.style.display = 'block';
                img.style.transition = 'transform 0.3s ease';
                
                // When we click the thumbnail, swap the main image in the hero place
                thumbWrapper.onclick = () => {
                    if (window.innerWidth <= 768) {
                        const lightbox = document.getElementById('lightbox');
                        const lightboxImg = document.getElementById('lightbox-img');
                        lightboxImg.src = src;
                        lightbox.classList.add('active');
                        return;
                    }
                    
                    const visualContainer = document.querySelector('.project-visual');
                    if (isTimeLapse && project.timeLapseImages) {
                        renderInteractiveHero(visualContainer, project);
                    } else {
                        // Overwrite the hero area completely (removes interactive time-lapse if present)
                        visualContainer.innerHTML = `<img id="detail-main-img" src="${src}" alt="Project Visual" class="project-main-img">`;
                        
                        // Attach lightbox to this new static image
                        const newMainImgEl = document.getElementById('detail-main-img');
                        newMainImgEl.style.cursor = 'zoom-in';
                        newMainImgEl.onclick = () => {
                            const lightbox = document.getElementById('lightbox');
                            const lightboxImg = document.getElementById('lightbox-img');
                            lightboxImg.src = newMainImgEl.src;
                            lightbox.classList.add('active');
                        };
                    }
                };
                
                // Add hover effect
                thumbWrapper.onmouseenter = () => { img.style.transform = 'scale(1.02)'; };
                thumbWrapper.onmouseleave = () => { img.style.transform = 'scale(1)'; };

                thumbWrapper.appendChild(img);
                
                if (title) {
                    const titleEl = document.createElement('div');
                    titleEl.textContent = title;
                    titleEl.style.fontSize = '0.75rem';
                    titleEl.style.marginTop = '0.5rem';
                    titleEl.style.opacity = '0.7';
                    titleEl.style.textTransform = 'uppercase';
                    titleEl.style.letterSpacing = '0.05em';
                    thumbWrapper.appendChild(titleEl);
                }
                
                thumbnailsContainer.appendChild(thumbWrapper);
            });
        } else {
            if (thumbnailsCol) thumbnailsCol.style.display = 'none';
        }
        return true;
    }

    function handleRoute() {
        const hash = window.location.hash;
        
        // Hide all views
        document.querySelectorAll('.page-view').forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });

        // Determine which view to show
        let targetViewId = 'view-home';
        
        if (hash === '#projets') {
            targetViewId = 'view-projets-grid';
            renderProjectsGrid();
        } else if (hash === '#actualites') {
            targetViewId = 'view-actualites';
        } else if (hash === '#recherche') {
            targetViewId = 'view-recherche';
        } else if (hash === '#agence') {
            targetViewId = 'view-agence';
        } else if (hash === '#contact') {
            targetViewId = 'view-contact';
        } else if (hash.startsWith('#projet-')) {
            const projectId = hash.replace('#projet-', '');
            const success = populateProjectDetail(projectId);
            if (success) {
                targetViewId = 'view-project-detail';
            }
        }

        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.style.display = 'block';
            // slight delay to allow display: block to apply before fading in
            setTimeout(() => {
                targetView.classList.add('active');
            }, 50);

            if (targetViewId === 'view-home' && typeof window.wilmotteShowSlide === 'function') {
                const randomSlide = Math.floor(Math.random() * 6);
                window.wilmotteShowSlide(randomSlide);
            }

            if (targetViewId === 'view-recherche') {
                if (typeof window.startRechercheLoop === 'function') {
                    window.startRechercheLoop();
                } else if (typeof window.initRechercheWebGL === 'function') {
                    window.initRechercheWebGL();
                }
            } else {
                if (typeof window.stopRechercheLoop === 'function') {
                    window.stopRechercheLoop();
                }
            }
        }
        
        initScrollReveal();
    }

    // --- WILMOTTE HERO CAROUSEL ENGINE ---
    function initWilmotteCarousel() {
        const carousel = document.getElementById('home-hero-carousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.carousel-slide');
        const indicators = carousel.querySelectorAll('.carousel-indicators .indicator');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        let currentIndex = 0;
        let autoPlayTimer = null;

        function showSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            currentIndex = index;

            slides.forEach((slide, i) => {
                if (i === currentIndex) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            indicators.forEach((ind, i) => {
                if (i === currentIndex) {
                    ind.classList.add('active');
                } else {
                    ind.classList.remove('active');
                }
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(() => {
                showSlide(currentIndex + 1);
            }, 5500);
        }

        function stopAutoPlay() {
            if (autoPlayTimer) clearInterval(autoPlayTimer);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                stopAutoPlay();
                showSlide(currentIndex - 1);
                startAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                stopAutoPlay();
                showSlide(currentIndex + 1);
                startAutoPlay();
            });
        }

        indicators.forEach((ind, i) => {
            ind.addEventListener('click', () => {
                stopAutoPlay();
                showSlide(i);
                startAutoPlay();
            });
        });

        window.wilmotteShowSlide = function(idx) {
            stopAutoPlay();
            showSlide(idx);
            startAutoPlay();
        };

        // Randomly pick an initial project on entry (Page 2 Client Requirement)
        const initialRandomIndex = Math.floor(Math.random() * slides.length);
        showSlide(initialRandomIndex);
        startAutoPlay();

        // Pause on hover
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }

    initWilmotteCarousel();

    // --- AUTRES PROJETS HORIZONTAL SLIDER (PAGE 4 DU CLIENT) ---
    const otherTrackWrapper = document.getElementById('other-projects-track-wrapper');
    const otherPrev = document.getElementById('other-prev');
    const otherNext = document.getElementById('other-next');

    if (otherPrev && otherTrackWrapper) {
        otherPrev.addEventListener('click', (e) => {
            e.preventDefault();
            otherTrackWrapper.scrollBy({ left: -340, behavior: 'smooth' });
        });
    }
    if (otherNext && otherTrackWrapper) {
        otherNext.addEventListener('click', (e) => {
            e.preventDefault();
            otherTrackWrapper.scrollBy({ left: 340, behavior: 'smooth' });
        });
    }

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // --- SCROLL REVEAL OBSERVER ---
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        reveals.forEach(reveal => {
            reveal.classList.remove('visible');
            observer.observe(reveal);
        });
    }

    // Listen for URL changes
    window.addEventListener('hashchange', handleRoute);
    
    // Also handle clicks on the logo to go back home
    document.querySelector('.logo-wrapper').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = ''; // Clear hash goes to home
    });

    // Initialize route on load
    // Need a tiny delay for projectsData to be loaded
    setTimeout(handleRoute, 50);

    // Lightbox close logic
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target.id !== 'lightbox-img') {
                lightbox.classList.remove('active');
            }
        });
    }

    // Share Button Logic
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUrl = encodeURIComponent(window.location.href);
            let shareUrl = '';
            
            if (btn.classList.contains('share-fb')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
            } else if (btn.classList.contains('share-in')) {
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
            } else if (btn.classList.contains('share-pi')) {
                // For Pinterest we need an image URL ideally, but we can just pass the page URL
                shareUrl = `https://pinterest.com/pin/create/button/?url=${currentUrl}`;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    // --- INTERACTIVE HERO (TIME LAPSE) LOGIC ---
    let lastActiveIndex = -1;

    function updateInteractiveHeroByIndex(activeIndex) {
        const heroInteractive = document.getElementById('hero-interactive');
        if (!heroInteractive) return;

        const images = Array.from(heroInteractive.querySelectorAll('.time-img'));
        if (images.length === 0) return;

        const clampedIndex = Math.max(0, Math.min(images.length - 1, activeIndex));
        if (clampedIndex === lastActiveIndex) return;
        lastActiveIndex = clampedIndex;

        // Instant, sharp, discrete switch: only the active image is visible
        images.forEach((img, i) => {
            if (i === clampedIndex) {
                img.style.opacity = '1';
                img.style.visibility = 'visible';
                img.style.zIndex = '2';
            } else {
                img.style.opacity = '0';
                img.style.visibility = 'hidden';
                img.style.zIndex = '1';
            }
        });

        // Update Time Indicator
        const hash = window.location.hash;
        if (hash.startsWith('#projet-')) {
            const projectId = hash.replace('#projet-', '');
            const project = window.projectsData.find(p => p.id === projectId);
            if (project && project.timeLabels) {
                const indicator = document.getElementById('time-indicator');
                if (indicator && project.timeLabels[clampedIndex]) {
                    indicator.textContent = project.timeLabels[clampedIndex];
                }
            }
        }
    }

    // Mousemove for Desktop: instantaneous switch by zone
    window.addEventListener('mousemove', (e) => {
        const heroInteractive = document.getElementById('hero-interactive');
        if (!heroInteractive) {
            lastActiveIndex = -1;
            return;
        }

        const images = heroInteractive.querySelectorAll('.time-img');
        const count = images.length;
        if (count <= 1) return;

        const rect = heroInteractive.getBoundingClientRect();
        let pos = 0;
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
            pos = (e.clientX - rect.left) / rect.width;
        } else {
            pos = e.clientX / window.innerWidth;
        }

        pos = Math.max(0, Math.min(0.9999, pos));
        const activeIndex = Math.floor(pos * count);
        updateInteractiveHeroByIndex(activeIndex);
    });

    // Scroll for Mobile/Touch: discrete zone switch
    const scrollContainer = document.getElementById('main-content');
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', () => {
            const heroInteractive = document.getElementById('hero-interactive');
            if (!heroInteractive) return;
            const count = heroInteractive.querySelectorAll('.time-img').length;
            if (count <= 1) return;

            const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            if (maxScroll <= 0) return;
            const pos = Math.max(0, Math.min(0.9999, scrollContainer.scrollTop / maxScroll));
            const activeIndex = Math.floor(pos * count);
            updateInteractiveHeroByIndex(activeIndex);
        });
    }

    window.addEventListener('scroll', () => {
        const heroInteractive = document.getElementById('hero-interactive');
        if (!heroInteractive) return;
        const count = heroInteractive.querySelectorAll('.time-img').length;
        if (count <= 1) return;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return;
        const pos = Math.max(0, Math.min(0.9999, window.scrollY / maxScroll));
        const activeIndex = Math.floor(pos * count);
        updateInteractiveHeroByIndex(activeIndex);
    });

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
