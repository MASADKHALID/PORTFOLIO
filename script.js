function showSidebar(){
    const sidebar = document.querySelector('.sidebar')
    if(!sidebar) return; // defensive
        // ensure visible and mark open (prefer class-based toggle; fallback to inline style)
        sidebar.classList.add('open')
        try{ sidebar.style.display = 'flex'; }catch(e){}
        try{ console.debug('showSidebar: sidebar opened (class added)'); }catch(e){}
  }
  function hideSidebar(){
    const sidebar = document.querySelector('.sidebar')
    if(!sidebar) return;
        // hide via class; also clear inline style as fallback
        sidebar.classList.remove('open')
        try{ sidebar.style.display = 'none'; }catch(e){}
        try{ console.debug('hideSidebar: sidebar closed (class removed)'); }catch(e){}
  }

// Expose to window so inline onclick="showSidebar()" works reliably
try{ window.showSidebar = showSidebar; window.hideSidebar = hideSidebar; }catch(e){}

    // Close responsive sidebar when any in-page nav link is clicked (mobile)
    document.addEventListener('click', function(e){
            // Only handle on small viewports (mobile) where sidebar/menu is used
            if(window.innerWidth > 800) return;
            const closest = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
            const link = closest;
            if(!link) return;
            // Only act for internal anchor links
            const href = link.getAttribute('href');
            if(!href || !href.startsWith('#')) return;
            // If sidebar is visible (mobile), hide it
            const sidebar = document.querySelector('.sidebar');
            if(sidebar && getComputedStyle(sidebar).display !== 'none'){
                    // hide immediately; anchor default navigation will still work
                    hideSidebar();
            }
    });

    // Ensure hamburger and sidebar close anchors don't navigate to '#' and reliably toggle
    document.addEventListener('DOMContentLoaded', function(){
        try{
            const menuBtnAnchor = document.querySelector('.menu-button a');
            const menuBtnLi = document.querySelector('.menu-button');
            // attach to both the li and the anchor to be defensive against markup differences
            if(menuBtnAnchor){
                menuBtnAnchor.addEventListener('click', function(evt){ evt.preventDefault(); showSidebar(); });
            }
            if(menuBtnLi){
                menuBtnLi.addEventListener('click', function(evt){ evt.preventDefault && evt.preventDefault(); showSidebar(); });
            }
            const sidebar = document.querySelector('.sidebar');
            if(sidebar){
                const firstLi = sidebar.querySelector('li');
                if(firstLi){
                    const closeA = firstLi.querySelector('a');
                    if(closeA){ closeA.addEventListener('click', function(evt){ evt.preventDefault(); hideSidebar(); }); }
                }
            }
        }catch(err){ /* non-fatal */ }
    });

  const filterButtons = document.querySelectorAll('.filter-button');
  const projectBoxes = document.querySelectorAll('.forthSection .cantainer .box');
  
  // Initially hide all boxes except ETL
  projectBoxes.forEach(box => {
      if (!box.classList.contains('etl')) {
          box.style.display = 'none';
      }
  });
  
  filterButtons.forEach(button => {
      button.addEventListener('click', () => {
          const category = button.dataset.category;
  
          projectBoxes.forEach(box => {
              if (category === 'all' || box.classList.contains(category)) {
                  box.style.display = 'block';
              } else {
                  box.style.display = 'none';
              }
          });
      });
  });

        // --- Circular skills animation (moved from inline HTML) ---
        document.addEventListener('DOMContentLoaded', function(){
            const circles = document.querySelectorAll('.circular-skills .skill-circle');
            const duration = 1000;
            const easeOutCubic = t => (--t)*t*t+1;

            function animateCircle(circle){
                const target = Math.max(0, Math.min(100, parseInt(circle.getAttribute('data-percent'),10) || 0));
                const svgCircle = circle.querySelector('.circle');
                const text = circle.querySelector('.percentage');
                const start = performance.now();

                const pathLength = svgCircle.getTotalLength();
                svgCircle.setAttribute('stroke-dasharray', pathLength);
                svgCircle.setAttribute('stroke-dashoffset', pathLength);

                requestAnimationFrame(function frame(now){
                    const elapsed = now - start;
                    const progress = Math.min(1, elapsed / duration);
                    const eased = easeOutCubic(progress);
                    const pct = eased * target / 100; // 0..1
                    const offset = Math.max(0, pathLength * (1 - pct));
                    svgCircle.setAttribute('stroke-dashoffset', offset);
                    text.textContent = Math.round(eased * target) + '%';
                    if(progress < 1) requestAnimationFrame(frame);
                });
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


    /* Mobile carousel removed: slide elements are no longer generated. */


    // --- Mobile stacked deck (swipe-up to reveal next, looping) ---
    (function(){
        const breakpoint = 800;
        function buildStack(){
            const container = document.querySelector('.thirdSection .Cantainer');
            if(!container) return;

            const existingDeck = container.querySelector('.stack-deck');
            // If we're now on desktop, remove any previously-created mobile deck and do nothing further
            if(window.innerWidth > breakpoint){
                if(existingDeck){
                    try{ if(existingDeck._autoId) clearInterval(existingDeck._autoId); }catch(e){}
                    const h = existingDeck._handlers || {};
                    try{ if(h.onPointerDown) existingDeck.removeEventListener('pointerdown', h.onPointerDown); }catch(e){}
                    try{ if(h.onPointerMove) existingDeck.removeEventListener('pointermove', h.onPointerMove); }catch(e){}
                    try{ if(h.onPointerUp) existingDeck.removeEventListener('pointerup', h.onPointerUp); }catch(e){}
                    try{ if(h.onPointerCancel) existingDeck.removeEventListener('pointercancel', h.onPointerCancel); }catch(e){}
                    try{ if(h.onTouchStart) existingDeck.removeEventListener('touchstart', h.onTouchStart); }catch(e){}
                    try{ if(h.onTouchMove) existingDeck.removeEventListener('touchmove', h.onTouchMove); }catch(e){}
                    try{ if(h.onTouchEnd) existingDeck.removeEventListener('touchend', h.onTouchEnd); }catch(e){}
                    try{ if(h.onPointerEnter) existingDeck.removeEventListener('pointerenter', h.onPointerEnter); }catch(e){}
                    try{ if(h.onPointerLeave) existingDeck.removeEventListener('pointerleave', h.onPointerLeave); }catch(e){}
                    existingDeck.remove();
                }
                return; // only build on mobile
            }

            // avoid rebuilding if already present
            if(existingDeck) return;

            const expLine = container.querySelector('.experienceLine');
            if(!expLine) return;
            const jobNodes = Array.from(expLine.querySelectorAll('.jobYear'));
            if(jobNodes.length === 0) return;

            // Create deck
            const deck = document.createElement('div'); deck.className = 'stack-deck';
            // Keep a queue of deep-cloned nodes so we preserve the original markup/format
            const queue = jobNodes.map(n => n.cloneNode(true));

            function renderDeck(){
                deck.innerHTML = '';
                // show up to 6 top items
                const slice = queue.slice(0, Math.min(queue.length, 6));
                slice.forEach(clonedNode => {
                    const card = document.createElement('div'); card.className = 'card';
                    const node = clonedNode.cloneNode(true);
                    node.classList.remove('jobYear');
                    while(node.firstChild){ card.appendChild(node.firstChild); }
                    deck.appendChild(card);
                });
            }

            container.insertBefore(deck, expLine);
            renderDeck();

            // gesture handling: swipe-up on top card to reveal next
            let startY = 0, isDragging=false, topCard=null;

            function onPointerDown(e){
                topCard = deck.querySelector('.card');
                if(!topCard) return;
                const targetCard = e.target.closest('.card');
                if(targetCard !== topCard) return;
                isDragging = true; startY = e.clientY || (e.touches && e.touches[0].clientY);
                topCard.classList.add('dragging');
                if(e.cancelable) e.preventDefault();
                if(e.pointerId) topCard.setPointerCapture && topCard.setPointerCapture(e.pointerId);
            }

            function onPointerMove(e){
                if(!isDragging || !topCard) return;
                const y = e.clientY || (e.touches && e.touches[0].clientY);
                const dy = y - startY;
                const translate = Math.min(0, dy);
                const rot = Math.max(-8, translate / 20);
                const scale = 1 + translate / 2000;
                topCard.style.transform = `translateX(-50%) translateY(${translate}px) rotate(${rot}deg) scale(${scale})`;
                topCard.style.opacity = `${Math.max(0.15, 1 + translate/300)}`;
                if(e.cancelable) e.preventDefault();
            }

            function revealTopCard(){
                const card = deck.querySelector('.card');
                if(!card) return;
                card.classList.add('revealed');
                card.style.transform = 'translateX(-50%) translateY(-160%) rotate(-10deg) scale(0.98)';
                card.style.opacity = '0';
                card.style.pointerEvents = 'none';
                const cleanup = () => { card.removeEventListener('transitionend', cleanup); const item = queue.shift(); queue.push(item); renderDeck(); };
                card.addEventListener('transitionend', cleanup);
                setTimeout(() => { try { cleanup(); } catch(e){} }, 600);
            }

            function onPointerUp(e){
                if(!isDragging) return; isDragging=false;
                if(topCard){ topCard.classList.remove('dragging'); topCard.style.transform='translateX(-50%)'; topCard.style.opacity=''; try{ topCard.releasePointerCapture && topCard.releasePointerCapture(e.pointerId); }catch(err){} }
                const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || startY;
                const dy = y - startY;
                if(dy < -40){ revealTopCard(); }
            }

            // pointer events
            deck.addEventListener('pointerdown', onPointerDown);
            deck.addEventListener('pointermove', onPointerMove);
            deck.addEventListener('pointerup', onPointerUp);
            deck.addEventListener('pointercancel', onPointerUp);
            deck.addEventListener('touchstart', onPointerDown, {passive:false});
            deck.addEventListener('touchmove', onPointerMove, {passive:false});
            deck.addEventListener('touchend', onPointerUp);

            // auto-advance loop (reveal) every 4s
            let auto = setInterval(revealTopCard, 4200);
            // store handlers & auto id on deck for later cleanup when switching to desktop
            deck._autoId = auto;
            deck._handlers = {
                onPointerDown, onPointerMove, onPointerUp,
                onPointerCancel: onPointerUp,
                onTouchStart: onPointerDown, onTouchMove: onPointerMove, onTouchEnd: onPointerUp,
                onPointerEnter: ()=> clearInterval(auto),
                onPointerLeave: ()=> { clearInterval(auto); auto = setInterval(revealTopCard, 4200); deck._autoId = auto; }
            };

            deck.addEventListener('pointerenter', deck._handlers.onPointerEnter);
            deck.addEventListener('pointerleave', deck._handlers.onPointerLeave);
        }

        window.addEventListener('resize', buildStack);
        document.addEventListener('DOMContentLoaded', buildStack);
    })();

