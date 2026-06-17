document.addEventListener('DOMContentLoaded', () => {
  // ─── STAGGERED INTRO ANIMATION ──────────────────────────────
  const cards = document.querySelectorAll('.group');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.08}s`;
    card.style.opacity = '1';
  });

  // ─── DYNAMIC LINK RESOLVER ──────────────────────────────────
  resolveDynamicLinks();

  // ─── THEME MANAGER ──────────────────────────────────────────
  initTheme();

  // ─── SCROLLSPY (TABLE OF CONTENTS) ──────────────────────────
  initScrollSpy();

  // ─── SEARCH / FILTER SYSTEM ─────────────────────────────────
  initSearch();

  // ─── REFLECTIVE CURSOR GLOW ──────────────────────────────────
  initReflectiveGlow();

  // ─── MOBILE DRAWER MENU ─────────────────────────────────────
  initMobileDrawer();
});

/**
 * Automatically adjusts page internal links to use clean paths on
 * production (GitHub Pages) and standard file extensions locally.
 */
function resolveDynamicLinks() {
  const isLocal = window.location.protocol === 'file:';
  const hostname = window.location.hostname;
  const isGitHubPages = hostname.includes('github.io');

  document.querySelectorAll('[data-link-type]').forEach(link => {
    const type = link.getAttribute('data-link-type');
    
    // Resolve privacy policy link
    if (type === 'privacy') {
      if (isLocal) {
        link.href = 'privacy-policy.html';
      } else if (isGitHubPages) {
        link.href = '/sajidkhokharapps/expense-tracker/privacy-policy';
      } else {
        link.href = 'privacy-policy';
      }
    }
    
    // Resolve terms of use link
    if (type === 'terms') {
      if (isLocal) {
        link.href = 'terms-and-use.html';
      } else if (isGitHubPages) {
        link.href = '/sajidkhokharapps/expense-tracker/terms-and-use';
      } else {
        link.href = 'terms-and-use';
      }
    }
  });
}

/**
 * Handles Dark/Light mode selection and persistence
 */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const getSavedTheme = () => localStorage.getItem('theme');
  const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  
  // Set initial theme
  const initialTheme = getSavedTheme() || getSystemTheme();
  setTheme(initialTheme);

  // Click listener
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update button icons
    if (theme === 'light') {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      themeToggleBtn.title = "Switch to Dark Mode";
    } else {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      themeToggleBtn.title = "Switch to Light Mode";
    }
  }
}

/**
 * Intersection Observer ScrollSpy for tracking active sections in the sidebar
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('.group[id]');
  const tocItems = document.querySelectorAll('.toc-item');
  const drawerItems = document.querySelectorAll('.drawer-toc-item');
  
  if (sections.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-15% 0px -70% 0px', // Trigger focus when content occupies the top-mid viewport
    threshold: 0
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Update Sidebar
        tocItems.forEach(item => {
          if (item.getAttribute('data-target') === id) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });

        // Update Drawer
        drawerItems.forEach(item => {
          if (item.getAttribute('data-target') === id) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * Implements real-time text filtering and matching term highlighting
 */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const sections = document.querySelectorAll('.group[id]');
  const emptyState = document.getElementById('search-empty');
  
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    // Toggle clear button visibility
    if (query.length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }

    let matchCount = 0;

    sections.forEach(section => {
      // Temporarily remove prior highlights
      removeHighlights(section);

      if (query.length === 0) {
        section.style.display = 'block';
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        matchCount++;
        return;
      }

      const card = section.querySelector('.glass-card');
      const textToSearch = card ? card.textContent.toLowerCase() : section.textContent.toLowerCase();

      if (textToSearch.includes(query)) {
        section.style.display = 'block';
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        highlightText(card || section, query);
        matchCount++;
      } else {
        section.style.display = 'none';
        section.style.opacity = '0';
      }
    });

    // Handle empty state
    if (matchCount === 0) {
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');
    }
  });

  // Clear button click listener
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    clearBtn.classList.remove('visible');
    emptyState.classList.remove('visible');

    sections.forEach(section => {
      removeHighlights(section);
      section.style.display = 'block';
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    });
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(element, query) {
  if (!query) return;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  
  // Recursively highlight text nodes
  const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // Avoid highlighting empty spaces or script/style contents
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      // Do not corrupt active tags structure
      if (node.parentNode.tagName === 'MARK' || node.parentNode.tagName === 'A' && node.parentNode.classList.contains('doc-link')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  }, false);

  const textNodes = [];
  let node;
  while (node = walk.nextNode()) {
    textNodes.push(node);
  }

  textNodes.forEach(node => {
    const text = node.nodeValue;
    if (regex.test(text)) {
      const span = document.createElement('span');
      span.innerHTML = text.replace(regex, '<mark>$1</mark>');
      node.parentNode.replaceChild(span, node);
    }
  });
}

function removeHighlights(element) {
  const marks = element.querySelectorAll('mark');
  marks.forEach(mark => {
    const parent = mark.parentNode;
    const textNode = document.createTextNode(mark.textContent);
    parent.replaceChild(textNode, mark);
    
    // Clean up empty wrapping spans to keep DOM light and correct
    if (parent.tagName === 'SPAN' && parent.childNodes.length === 1) {
      const grandParent = parent.parentNode;
      const plainText = document.createTextNode(parent.textContent);
      grandParent.replaceChild(plainText, parent);
    }
  });
  element.normalize();
}

/**
 * Tracks the user's cursor to generate a subtle hover light sheen reflection on cards
 */
function initReflectiveGlow() {
  const cards = document.querySelectorAll('.glass-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/**
 * Mobile drawer interaction logic
 */
function initMobileDrawer() {
  const fab = document.getElementById('mobile-nav-fab');
  const overlay = document.getElementById('drawer-overlay');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('drawer-close');
  const links = document.querySelectorAll('.drawer-toc-item a');

  if (!fab || !drawer) return;

  const openDrawer = () => {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  };

  const closeDrawer = () => {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = ''; // Release scroll
  };

  fab.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.parentNode.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      
      closeDrawer();
      
      if (targetEl) {
        e.preventDefault();
        window.scrollTo({
          top: targetEl.offsetTop - 85,
          behavior: 'smooth'
        });
      }
    });
  });
}
