(() => {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');
  let stored = null;
  try { stored = localStorage.getItem('stackshift-theme'); } catch {}
  if (stored === 'light' || (!stored && matchMedia('(prefers-color-scheme: light)').matches)) body.classList.add('light');
  toggle?.addEventListener('click', () => {
    body.classList.toggle('light');
    try { localStorage.setItem('stackshift-theme', body.classList.contains('light') ? 'light' : 'dark'); } catch {}
  });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const links = [...document.querySelectorAll('.toc a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
})();
