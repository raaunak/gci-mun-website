// js/include-navbar.js (updated with mobile-panel behavior)
document.addEventListener('DOMContentLoaded', () => {
  const containerId = 'site-navbar';
  const fragmentPath = '/components/navbar.html'; // adjust if your path differs
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(fragmentPath, { cache: 'no-cache' })
    .then(resp => {
      if (!resp.ok) throw new Error(`Failed to fetch ${fragmentPath}: ${resp.status}`);
      return resp.text();
    })
    .then(html => {
      // insert fragment
      container.innerHTML = html;
      container.setAttribute('aria-hidden', 'false');

      // optional: ensure images/links are root absolute if they were relative
      rewriteRelativePaths(container);

      // add 'is-active' to matching nav link
      setActiveNavLink(container);

      // ensure a hamburger/menu-toggle exists (inject it if navbar fragment didn't include one)
      ensureMenuToggle(container);

      // Create and attach the mobile panel (cloned menu inside)
      ensureMobilePanel(container);

      // init interactions (hover for desktop, click for mobile, dropdown toggles)
      initNavbarInteractions(container);

      // init menu toggle wiring (open/close panel, disable scroll, etc.)
      initMenuToggle(container);
    })
    .catch(err => {
      console.error('Navbar include error:', err);
      container.innerHTML = '<nav><a href="/index.html">Home</a></nav>';
      container.setAttribute('aria-hidden', 'false');
    });

  /* ------------------ helpers ------------------ */

function setActiveNavLink(root) {
  const currentPath =
    window.location.pathname.replace(/\/$/, '') || '/index.html';

  // apply logic to BOTH desktop menu and mobile cloned menu
  const menus = [
    root.querySelector('.main-menu'),
    document.querySelector('.panel-cloned-menu')
  ].filter(Boolean);

  menus.forEach(menu => {
    menu.querySelectorAll('a[href]').forEach(a => {
      const href = new URL(a.getAttribute('href'), location.origin)
        .pathname.replace(/\/$/, '');

      // reset
      a.classList.remove('is-active');
      a.removeAttribute('aria-current');

      if (href === currentPath) {
        // underline active link
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');

        // 🔥 if inside dropdown → underline parent "Conference"
        const dropdown = a.closest('.dropdown');
        if (dropdown) {
          const parentSpan = dropdown
            .closest('li')
            ?.querySelector('span');

          if (parentSpan) {
            parentSpan.classList.add('is-active');
          }
        }
      }
    });
  });
}


  function rewriteRelativePaths(root) {
    // convert relative image src or link href that start with ./ or ../ or lacking leading slash to absolute (site root)
    root.querySelectorAll('img[src]').forEach(img => {
      const s = img.getAttribute('src');
      if (!s) return;
      if (s.startsWith('./') || s.startsWith('../') || !s.startsWith('/')) {
        img.src = new URL(s, location.origin + '/').href;
      }
    });
    root.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (!h) return;
      if (h.startsWith('./') || h.startsWith('../') || (!h.startsWith('/') && !h.startsWith('http') && !h.startsWith('#'))) {
        a.href = new URL(h, location.origin + '/').href;
      }
    });
  }

  function ensureMenuToggle(root) {
    // if the fragment already contains an element with id="menuToggle", do nothing.
    if (root.querySelector('#menuToggle')) return;

    // find .logo and insert after it
    const logo = root.querySelector('.logo');
    if (!logo) return;

    const toggle = document.createElement('div');
    toggle.id = 'menuToggle';
    toggle.className = 'menu-toggle';
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-label', 'Toggle menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerText = '☰';

    // insert after logo
    logo.parentNode.insertBefore(toggle, logo.nextSibling);
  }

  function ensureMobilePanel(root) {
  // if panel exists, do nothing
  if (root.querySelector('.mobile-panel') || document.querySelector('.mobile-panel')) return;

  // create panel container
  const panel = document.createElement('aside');
  panel.className = 'mobile-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="mobile-panel-header" role="region" aria-label="Mobile menu header">
      <button class="mobile-close" aria-label="Close menu">✕</button>
    </div>
    <div class="panel-body"></div>
  `;

  // append to body to overlay viewport
  document.body.appendChild(panel);

  // copy the main-menu markup into panel-body (clone to keep original menu for desktop)
  const mainMenu = root.querySelector('.main-menu');
  const panelBody = panel.querySelector('.panel-body');
  if (mainMenu && panelBody) {
    const cloned = mainMenu.cloneNode(true);
    cloned.classList.add('panel-cloned-menu');
    panelBody.appendChild(cloned);

    // remove any mobile-logo element if present in the cloned structure (safety)
    const possibleLogo = panelBody.querySelector('.mobile-logo');
    if (possibleLogo) possibleLogo.remove();
  }

  // wire the close button
  panel.querySelector('.mobile-close').addEventListener('click', () => closePanel(panel));
}


  function openPanel(panel) {
    if (!panel) return;
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');

    // disable page scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // ensure focus lands on close button for accessibility
    const closeBtn = panel.querySelector('.mobile-close');
    if (closeBtn) closeBtn.focus();
  }

  function closePanel(panel) {
    if (!panel) return;
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');

    // restore scrolling
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function initNavbarInteractions(root) {
    // Hover interactions for desktop remain unchanged (mouseenter/mouseleave)
    const topLevelItems = root.querySelectorAll('.main-menu > ul > li');
    topLevelItems.forEach(li => {
      li.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) li.classList.add('open');
      });
      li.addEventListener('mouseleave', () => {
        if (window.innerWidth > 1024) li.classList.remove('open');
      });
    });

    // Mobile/touch: enable tap-to-toggle for items with dropdowns inside the cloned panel
    // The cloned menu lives inside .mobile-panel .panel-cloned-menu
    const panel = document.querySelector('.mobile-panel');
    if (!panel) return;

    panel.addEventListener('click', (e) => {
      const clicked = e.target;
      // find a top-level li containing the clicked element
      const li = clicked.closest('.panel-cloned-menu > ul > li, .panel-cloned-menu li');
      if (!li) return;

      // if this li has a dropdown child
      const dropdown = li.querySelector('.dropdown');
      // clickable target to toggle should be the span or top-level anchor inside li
      const toggleTarget = li.querySelector('span, a');

      // If clicked element is the toggleTarget (or inside it) and dropdown exists, toggle it
      if (dropdown && toggleTarget && (toggleTarget.contains(clicked) || toggleTarget === clicked)) {
        // prevent following links when toggling
        e.preventDefault();
        li.classList.toggle('open');
        return;
      }

      // if user clicked a link inside dropdown, allow default behaviour (link will open)
    });

    // Also close panel when resized to desktop (cleanup)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        const p = document.querySelector('.mobile-panel');
        if (p && p.classList.contains('active')) closePanel(p);
        // remove any .open states from cloned menu items
        document.querySelectorAll('.panel-cloned-menu li.open').forEach(x => x.classList.remove('open'));
      }
    });
  }

  function initMenuToggle(root) {
    const toggle = root.querySelector('#menuToggle');
    const panel = document.querySelector('.mobile-panel');

    if (!toggle || !panel) return;

    // Click to open panel
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = panel.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(isActive));
      if (isActive) openPanel(panel);
      else closePanel(panel);
    });

    // Click outside panel closes it
    document.addEventListener('click', (e) => {
      // if click was inside panel or toggle, ignore
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      if (panel.classList.contains('active')) {
        closePanel(panel);
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Escape key closes panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('active')) {
        closePanel(panel);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

});
