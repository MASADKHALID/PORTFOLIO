// --- Preloader with Mini-Game ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const loadEndTime = Date.now();
    const minGameTime = 20000; // Minimum 20 seconds for game after page loads
    
    if(preloader) {
        // Add extra time for gameplay after page is ready
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);
        }, minGameTime);
    }
});

// Mini-game during loading
(function() {
    let score = 0;
    const preloader = document.getElementById('preloader');
    const scoreDisplay = document.getElementById('gameScore');
    
    if (!preloader || !scoreDisplay) return;
    
    function createTarget() {
        const target = document.createElement('div');
        target.className = 'game-target';
        target.textContent = 'catch me';
        
        // Random position within safe bounds
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const y = Math.random() * (window.innerHeight - 250) + 100;
        
        target.style.left = x + 'px';
        target.style.top = y + 'px';
        
        target.addEventListener('click', function() {
            score++;
            scoreDisplay.textContent = score;
            target.classList.add('clicked');
            setTimeout(() => target.remove(), 300);
        });
        
        preloader.appendChild(target);
        
        // Remove target after 2 seconds if not clicked
        setTimeout(() => {
            if (target.parentNode) {
                target.remove();
            }
        }, 2000);
    }
    
    // Create targets periodically during loading
    const gameInterval = setInterval(() => {
        if (document.getElementById('preloader') && !document.getElementById('preloader').classList.contains('fade-out')) {
            createTarget();
        } else {
            clearInterval(gameInterval);
        }
    }, 600);
    
    // Stop game when preloader starts fading out
    setTimeout(() => {
        clearInterval(gameInterval);
    }, 19500); // Stop 500ms before fade-out
})();

// --- Mobile hamburger menu: open/close + close on link tap ---
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('hamburgerBtn');
    const mobile = document.getElementById('mobileNav');
    if(!btn || !mobile) return;

    const openMobile = () => {
        mobile.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        mobile.setAttribute('aria-hidden','false');
    };
    const closeMobile = () => {
        mobile.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        mobile.setAttribute('aria-hidden','true');
    };

    btn.addEventListener('click', () => {
        if(mobile.classList.contains('open')) closeMobile(); else openMobile();
    });

    mobile.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobile));
});

// --- Circular skill animation (continuous loop) ---
document.addEventListener('DOMContentLoaded', () => {
    const circles = document.querySelectorAll('.skill-circle');
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    function animateCircle(el){
        const svgCircle = el.querySelector('.circle');
        const text = el.querySelector('.percentage');
        const target = parseInt(el.dataset.percent || '0', 10);
        if(!svgCircle || !text || Number.isNaN(target)) return;

        const pathLength = svgCircle.getTotalLength();
        svgCircle.style.strokeDasharray = `${pathLength}`;
        svgCircle.style.strokeDashoffset = `${pathLength}`;

        const duration = 1800;
        const pauseDuration = 1000;
        
        function loop(){
            const start = performance.now();
            
            function frame(now){
                const elapsed = now - start;
                const progress = Math.min(1, elapsed / duration);
                const eased = easeOutCubic(progress);
                const pct = eased * target / 100;
                const offset = Math.max(0, pathLength * (1 - pct));
                svgCircle.style.strokeDashoffset = `${offset}`;
                text.textContent = `${Math.round(eased * target)}%`;
                
                if(progress < 1) {
                    requestAnimationFrame(frame);
                } else {
                    // Pause at full, then reset and loop
                    setTimeout(() => {
                        svgCircle.style.strokeDashoffset = `${pathLength}`;
                        text.textContent = '0%';
                        setTimeout(loop, 100);
                    }, pauseDuration);
                }
            }
            requestAnimationFrame(frame);
        }
        loop();
    }

    function onScroll(){
        circles.forEach(c => {
            const rect = c.getBoundingClientRect();
            if(rect.top < window.innerHeight && rect.bottom >= 0 && !c.dataset.animated){
                c.dataset.animated = '1';
                animateCircle(c);
            }
        });
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
});

// --- Projects filter (uses data-filter buttons in HTML) ---
(function(){
    const section = document.querySelector('#projects');
    if(!section) return;
    const buttons = Array.from(section.querySelectorAll('.filter-btn'));
    const cards = Array.from(section.querySelectorAll('.project-card'));
    if(buttons.length === 0 || cards.length === 0) return;

    function applyFilter(filter){
        cards.forEach(card => {
            const matches = filter === 'all' || card.dataset.category === filter;
            card.classList.toggle('hidden', !matches);
        });
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.dataset.filter || 'all');
        });
    });

    applyFilter('etl');
})();

// --- Bio rotating text loop (typewriter effect for #pl, #expertise, #parttime) ---
document.addEventListener('DOMContentLoaded', () => {
    const targets = [
        { id: 'pl', phrases: ['Python', 'Java', 'C++', 'SQL', 'HTML/CSS', 'JavaScript'] },
        { id: 'expertise', phrases: ['ETL Pipelines', 'Data Engineering', 'Web Development', 'Database Administration', 'EDA & Visualization'] },
        { id: 'parttime', phrases: ['Computer Science', 'Physics', 'Programming'] }
    ];

    function typeLoop(el, phrases, speed = 85, backSpeed = 45, pause = 3000){
        if(!el || !phrases || phrases.length === 0) return;
        let i = 0, text = '', deleting = false;

        const step = () => {
            const full = phrases[i];
            if(!deleting){
                text = full.slice(0, text.length + 1);
                el.textContent = text;
                if(text === full){
                    deleting = true;
                    setTimeout(step, pause);
                    return;
                }
                setTimeout(step, speed);
            } else {
                text = full.slice(0, Math.max(0, text.length - 1));
                el.textContent = text;
                if(text.length === 0){
                    deleting = false;
                    i = (i + 1) % phrases.length;
                    setTimeout(step, speed);
                    return;
                }
                setTimeout(step, backSpeed);
            }
        };
        step();
    }

    targets.forEach((cfg, idx) => {
        const el = document.getElementById(cfg.id);
        // Much slower typing/deleting and longer pause; staggered starts
        setTimeout(() => {
            typeLoop(el, cfg.phrases, 240, 120, 5000);
        }, idx * 1000);
    });
});

// --- Mobile stacked deck for experience timeline ---
(function(){
    const breakpoint = 800;
    function buildStack(){
        const container = document.querySelector('.thirdSection .Cantainer');
        if(!container) return;
        const existingDeck = container.querySelector('.stack-deck');
        if(window.innerWidth > breakpoint){
            if(existingDeck){
                try{ if(existingDeck._autoId) clearInterval(existingDeck._autoId); }catch(e){}
                existingDeck.remove();
            }
            return;
        }
        if(existingDeck) return;

        const expLine = container.querySelector('.experienceLine');
        if(!expLine) return;
        const jobNodes = Array.from(expLine.querySelectorAll('.jobYear'));
        if(jobNodes.length === 0) return;

        const deck = document.createElement('div');
        deck.className = 'stack-deck';
        const queue = jobNodes.map(n => n.cloneNode(true));

        const renderDeck = () => {
            deck.innerHTML = '';
            queue.slice(0, Math.min(queue.length, 6)).forEach(node => {
                const card = document.createElement('div');
                card.className = 'card';
                const clone = node.cloneNode(true);
                clone.classList.remove('jobYear');
                while(clone.firstChild) card.appendChild(clone.firstChild);
                deck.appendChild(card);
            });
        };

        container.insertBefore(deck, expLine);
        renderDeck();

        let startY = 0, isDragging=false, topCard=null;
        let auto = null;
        
        const startAutoRotation = () => {
            if(auto) clearInterval(auto);
            auto = setInterval(() => {
                clearInterval(auto); // Stop timer immediately when fired
                revealTopCard();
            }, 8500);
            deck._autoId = auto;
        };
        
        const revealTopCard = () => {
            const card = deck.querySelector('.card');
            if(!card) return;
            card.classList.add('revealed');
            card.style.transform = 'translateX(-50%) translateY(-160%) rotate(-10deg) scale(0.98)';
            card.style.opacity = '0';
            card.style.pointerEvents = 'none';
            const cleanup = () => { 
                card.removeEventListener('transitionend', cleanup); 
                const item = queue.shift(); 
                queue.push(item); 
                renderDeck();
                setTimeout(() => startAutoRotation(), 100); // Wait a bit then start fresh timer
            };
            card.addEventListener('transitionend', cleanup);
            setTimeout(() => { try { cleanup(); } catch(e){} }, 600);
        };

        const onPointerDown = e => {
            topCard = deck.querySelector('.card');
            if(!topCard) return;
            const targetCard = e.target.closest('.card');
            if(targetCard !== topCard) return;
            isDragging = true;
            startY = e.clientY || (e.touches && e.touches[0].clientY);
            topCard.classList.add('dragging');
            if(e.cancelable) e.preventDefault();
            if(e.pointerId && topCard.setPointerCapture) topCard.setPointerCapture(e.pointerId);
        };

        const onPointerMove = e => {
            if(!isDragging || !topCard) return;
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            const dy = y - startY;
            const translate = Math.min(0, dy);
            const rot = Math.max(-8, translate / 20);
            const scale = 1 + translate / 2000;
            topCard.style.transform = `translateX(-50%) translateY(${translate}px) rotate(${rot}deg) scale(${scale})`;
            topCard.style.opacity = `${Math.max(0.15, 1 + translate/300)}`;
            if(e.cancelable) e.preventDefault();
        };

        const onPointerUp = e => {
            if(!isDragging || !topCard) return;
            isDragging = false;
            const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            const dy = y - startY;
            const translate = Math.min(0, dy);
            if(translate < -90){
                revealTopCard();
            } else {
                topCard.style.transition = 'transform .28s ease, opacity .28s ease';
                topCard.style.transform = 'translateX(-50%) translateY(0) rotate(0deg) scale(1)';
                topCard.style.opacity = '1';
                setTimeout(() => {
                    if(topCard){
                        topCard.classList.remove('dragging');
                        topCard.style.transition = '';
                    }
                }, 300);
            }
            if(e.cancelable) e.preventDefault();
        };

        deck.addEventListener('pointerdown', onPointerDown);
        deck.addEventListener('pointermove', onPointerMove);
        deck.addEventListener('pointerup', onPointerUp);
        deck.addEventListener('pointercancel', onPointerUp);
        deck.addEventListener('touchstart', onPointerDown, {passive:false});
        deck.addEventListener('touchmove', onPointerMove, {passive:false});
        deck.addEventListener('touchend', onPointerUp);

        startAutoRotation();
        deck._handlers = { onPointerDown, onPointerMove, onPointerUp };
        deck.addEventListener('pointerenter', () => { if(auto) clearInterval(auto); });
        deck.addEventListener('pointerleave', startAutoRotation);
    }

    window.addEventListener('resize', buildStack);
    document.addEventListener('DOMContentLoaded', buildStack);
})();
// --- Reusable stacked deck for certificates & achievements (all fifthSection containers) ---
/*
(function(){
    const breakpoint = 800;
    function buildStacks(){
        const containers = Array.from(document.querySelectorAll('.fifthSection .cantainer'));
        containers.forEach(container => {
            const existingDeck = container.querySelector('.stack-deck');
            if(window.innerWidth > breakpoint){
                if(existingDeck){
                    try{ if(existingDeck._autoId) clearInterval(existingDeck._autoId); }catch(e){}
                    existingDeck.remove();
                }
                return;
            }
            if(existingDeck) return;

            const boxNodes = Array.from(container.querySelectorAll('.box'));
            if(boxNodes.length === 0) return;

            const deck = document.createElement('div');
            deck.className = 'stack-deck';
            const queue = boxNodes.map(n => n.cloneNode(true));

            const renderDeck = () => {
                deck.innerHTML = '';
                queue.slice(0, Math.min(queue.length, 6)).forEach(node => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    const clone = node.cloneNode(true);
                    while(clone.firstChild) card.appendChild(clone.firstChild);
                    deck.appendChild(card);
                });
            };

            container.insertBefore(deck, container.firstChild);
            renderDeck();

            let startY = 0, isDragging=false, topCard=null;
            let auto = null;
            
            const startAutoRotation = () => {
                if(auto) clearInterval(auto);
                auto = setInterval(() => {
                    clearInterval(auto); // Stop timer immediately when fired
                    revealTopCard();
                }, 8500);
                deck._autoId = auto;
            };
            
            const revealTopCard = () => {
                const card = deck.querySelector('.card');
                if(!card) return;
                card.classList.add('revealed');
                card.style.transform = 'translateX(-50%) translateY(-160%) rotate(-10deg) scale(0.98)';
                card.style.opacity = '0';
                card.style.pointerEvents = 'none';
                const cleanup = () => { 
                    card.removeEventListener('transitionend', cleanup); 
                    const item = queue.shift(); 
                    queue.push(item); 
                    renderDeck();
                    setTimeout(() => startAutoRotation(), 100); // Wait a bit then start fresh timer
                };
                card.addEventListener('transitionend', cleanup);
                setTimeout(() => { try { cleanup(); } catch(e){} }, 600);
            };

            const onPointerDown = e => {
                topCard = deck.querySelector('.card');
                if(!topCard) return;
                const targetCard = e.target.closest('.card');
                if(targetCard !== topCard) return;
                isDragging = true;
                startY = e.clientY || (e.touches && e.touches[0].clientY);
                topCard.classList.add('dragging');
                if(e.cancelable) e.preventDefault();
                if(e.pointerId && topCard.setPointerCapture) topCard.setPointerCapture(e.pointerId);
            };

            const onPointerMove = e => {
                if(!isDragging || !topCard) return;
                const y = e.clientY || (e.touches && e.touches[0].clientY);
                const dy = y - startY;
                const translate = Math.min(0, dy);
                const rot = Math.max(-8, translate / 20);
                const scale = 1 + translate / 2000;
                topCard.style.transform = `translateX(-50%) translateY(${translate}px) rotate(${rot}deg) scale(${scale})`;
                topCard.style.opacity = `${Math.max(0.15, 1 + translate/300)}`;
                if(e.cancelable) e.preventDefault();
            };

            const onPointerUp = e => {
                if(!isDragging || !topCard) return;
                isDragging = false;
                const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
                const dy = y - startY;
                const translate = Math.min(0, dy);
                if(translate < -90){
                    revealTopCard();
                } else {
                    topCard.style.transition = 'transform .28s ease, opacity .28s ease';
                    topCard.style.transform = 'translateX(-50%) translateY(0) rotate(0deg) scale(1)';
                    topCard.style.opacity = '1';
                    setTimeout(() => {
                        if(topCard){
                            topCard.classList.remove('dragging');
                            topCard.style.transition = '';
                        }
                    }, 300);
                }
                if(e.cancelable) e.preventDefault();
            };

            deck.addEventListener('pointerdown', onPointerDown);
            deck.addEventListener('pointermove', onPointerMove);
            deck.addEventListener('pointerup', onPointerUp);
            deck.addEventListener('pointercancel', onPointerUp);
            deck.addEventListener('touchstart', onPointerDown, {passive:false});
            deck.addEventListener('touchmove', onPointerMove, {passive:false});
            deck.addEventListener('touchend', onPointerUp);

            startAutoRotation();
            deck._handlers = { onPointerDown, onPointerMove, onPointerUp };
            deck.addEventListener('pointerenter', () => { if(auto) clearInterval(auto); });
            deck.addEventListener('pointerleave', startAutoRotation);
        });
    }

    window.addEventListener('resize', buildStacks);
    document.addEventListener('DOMContentLoaded', buildStacks);
})();
*/
// ===== CV MENU BUTTON FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', () => {
    const cvBtn = document.getElementById('cvMenuButton');
    const cvMenu = document.getElementById('cvMenu');
    const cvOptions = document.querySelectorAll('.cv-option');

    if (!cvBtn || !cvMenu) return;

    // Toggle menu visibility
    cvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cvMenu.classList.toggle('active');
        cvBtn.classList.toggle('active');
    });

    // Handle CV option clicks
    cvOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const role = option.getAttribute('data-role');
            downloadCV(role);
            
            // Close menu after selection
            cvMenu.classList.remove('active');
            cvBtn.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!cvBtn.contains(e.target) && !cvMenu.contains(e.target)) {
            cvMenu.classList.remove('active');
            cvBtn.classList.remove('active');
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cvMenu.classList.remove('active');
            cvBtn.classList.remove('active');
        }
    });
});

// CV Download function
function downloadCV(role) {
    // Map roles to file names
    const fileMap = {
        'data-analyst': 'cv/Muhammad_Asad_Khalid_JR_Data_Engineer_&_Analyst.pdf',
        'data-engineer': 'cv/Muhammad_Asad_Khalid_JR_Data_Engineer_&_Analyst.pdf',
        'sqa': 'cv/CV_SQA.pdf',
        'software-engineer': 'cv/Muhammad_Asad_Khalid_Software_Engineer.pdf'
    };

    const fileName = fileMap[role];
    if (!fileName) {
        console.error('Invalid role selected');
        return;
    }

    // Open CV in new tab
    window.open(fileName, '_blank');
}

// --- Swipeable carousel with tap-to-reveal for mobile certificates/achievements ---
(function(){
    const breakpoint = 800;
    let lastWidth = window.innerWidth;
    
    function initCarousel(){
        const isMobile = window.innerWidth <= breakpoint;
        const wasMobile = lastWidth <= breakpoint;
        
        // Only reinitialize if crossing the breakpoint
        if(isMobile === wasMobile && lastWidth !== window.innerWidth) {
            return; // Same state, no need to reinit
        }
        
        lastWidth = window.innerWidth;
        const containers = document.querySelectorAll('.fifthSection .cantainer');
        
        containers.forEach(container => {
            // Remove existing carousel (cleanup)
            const existingCarousel = container.querySelector('.card-carousel');
            if(existingCarousel) {
                existingCarousel.remove();
            }
            
            if(!isMobile) {
                // Desktop: show original boxes
                container.querySelectorAll('.box').forEach(box => {
                    box.style.display = '';
                });
                return;
            }
            
            // Mobile: hide boxes and create carousel
            container.querySelectorAll('.box').forEach(box => {
                box.style.display = 'none';
            });
            
            const boxes = Array.from(container.querySelectorAll('.box'));
            if(boxes.length === 0) return;
            
            // Create carousel
            const carousel = document.createElement('div');
            carousel.className = 'card-carousel';
            
            let currentIndex = 0;
            let startX = 0;
            let isDragging = false;
            let dragStartY = 0;
            
            function createCardElement(box, backIndex = 0) {
                const card = document.createElement('div');
                const className = backIndex === 0 ? 'carousel-card' : `carousel-card back-${backIndex}`;
                card.className = className;
                card.innerHTML = box.innerHTML;
                return card;
            }
            
            function renderCards() {
                carousel.innerHTML = '';
                
                // Show front card + 3 tilted back cards
                const front = createCardElement(boxes[currentIndex], 0);
                const back1 = createCardElement(boxes[(currentIndex + 1) % boxes.length], 1);
                const back2 = createCardElement(boxes[(currentIndex + 2) % boxes.length], 2);
                const back3 = createCardElement(boxes[(currentIndex + 3) % boxes.length], 3);
                
                carousel.appendChild(back3);
                carousel.appendChild(back2);
                carousel.appendChild(back1);
                carousel.appendChild(front);
                
                // Tap to toggle description visibility
                front.addEventListener('click', (e) => {
                    if(e.target.tagName === 'A') return;
                    front.classList.toggle('active');
                });
            }
            
            function swipeCard(direction) {
                const cards = carousel.querySelectorAll('.carousel-card');
                const topCard = cards[3]; // Front card is last in DOM
                
                if(!topCard) return;
                
                topCard.classList.add('swiping');
                topCard.style.transform = `translateX(${direction === 'left' ? -120 : 120}%) translateY(0) rotate(${direction === 'left' ? -25 : 25}deg)`;
                topCard.style.opacity = '0';
                
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % boxes.length;
                    renderCards();
                }, 300);
            }
            
            carousel.addEventListener('pointerdown', (e) => {
                startX = e.clientX || (e.touches && e.touches[0].clientX);
                dragStartY = e.clientY || (e.touches && e.touches[0].clientY);
                isDragging = true;
            });
            
            carousel.addEventListener('pointermove', (e) => {
                if(!isDragging) return;
                const currentX = e.clientX || (e.touches && e.touches[0].clientX);
                const currentY = e.clientY || (e.touches && e.touches[0].clientY);
                const diffX = currentX - startX;
                const diffY = currentY - dragStartY;
                
                if(Math.abs(diffX) < Math.abs(diffY)) return;
                
                const cards = carousel.querySelectorAll('.carousel-card');
                const topCard = cards[3];
                
                if(topCard && Math.abs(diffX) > 10) {
                    topCard.classList.add('swiping');
                    const rotate = diffX / 20;
                    topCard.style.transform = `translateX(calc(-50% + ${diffX}px)) rotate(${rotate}deg)`;
                    topCard.style.opacity = `${Math.max(0.3, 1 - Math.abs(diffX) / 300)}`;
                }
            });
            
            carousel.addEventListener('pointerup', (e) => {
                if(!isDragging) return;
                isDragging = false;
                
                const currentX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
                const diff = currentX - startX;
                const cards = carousel.querySelectorAll('.carousel-card');
                const topCard = cards[3];
                
                if(!topCard) return;
                
                if(Math.abs(diff) > 100) {
                    swipeCard(diff > 0 ? 'right' : 'left');
                } else {
                    topCard.classList.remove('swiping');
                    topCard.style.transform = 'translateX(-50%) translateY(0) rotate(0deg)';
                    topCard.style.opacity = '1';
                }
            });
            
            carousel.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                dragStartY = e.touches[0].clientY;
                isDragging = true;
            }, {passive: true});
            
            carousel.addEventListener('touchmove', (e) => {
                if(!isDragging) return;
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const diffX = currentX - startX;
                const diffY = currentY - dragStartY;
                
                if(Math.abs(diffX) < Math.abs(diffY)) return;
                
                const cards = carousel.querySelectorAll('.carousel-card');
                const topCard = cards[3];
                
                if(topCard && Math.abs(diffX) > 10) {
                    topCard.classList.add('swiping');
                    const rotate = diffX / 20;
                    topCard.style.transform = `translateX(calc(-50% + ${diffX}px)) rotate(${rotate}deg)`;
                    topCard.style.opacity = `${Math.max(0.3, 1 - Math.abs(diffX) / 300)}`;
                }
            }, {passive: true});
            
            carousel.addEventListener('touchend', (e) => {
                if(!isDragging) return;
                isDragging = false;
                
                const currentX = e.changedTouches[0].clientX;
                const diff = currentX - startX;
                const cards = carousel.querySelectorAll('.carousel-card');
                const topCard = cards[3];
                
                if(!topCard) return;
                
                if(Math.abs(diff) > 100) {
                    swipeCard(diff > 0 ? 'right' : 'left');
                } else {
                    topCard.classList.remove('swiping');
                    topCard.style.transform = 'translateX(-50%) translateY(0) rotate(0deg)';
                    topCard.style.opacity = '1';
                }
            }, {passive: true});
            
            container.appendChild(carousel);
            renderCards();
        });
    }
    
    window.addEventListener('resize', initCarousel);
    document.addEventListener('DOMContentLoaded', initCarousel);
})();
 
