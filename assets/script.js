/* ==========================================================================
   Земельный Сервис — общий JS
   ========================================================================== */

(function () {
  'use strict';

  // === Mobile nav toggle ===
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.querySelector('.nav-mobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // === Active nav highlighting ===
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .nav-mobile a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // === Toolbar (home/back/forward + theme + lang) ===
  // Динамическая инжекция в .site-header__inner и .nav-mobile.
  // Не правим HTML-файлы — добавляется на всех страницах автоматически.

  // Определение текущего языка по path: /en/, /fr/, /ar/ — иначе RU (корень)
  const path = location.pathname;
  const langMatch = path.match(/\/(en|fr|ar)\//);
  const currentLang = langMatch ? langMatch[1] : 'ru';

  // Глубина: legal/* ИЛИ en/legal/* — относительно корня сайта
  const inLegal = path.includes('/legal/');
  const inLangFolder = currentLang !== 'ru';
  const depth = (inLegal ? 1 : 0) + (inLangFolder ? 1 : 0);
  const upPrefix = depth ? '../'.repeat(depth) : '';
  const homeHref = upPrefix + 'index.html';

  const LANGS = [
    { code: 'ru', label: 'Русский', short: 'РУ' },
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'ar', label: 'العربية', short: 'AR' },
  ];

  // Возвращает путь к этой же странице на другом языке.
  // Сохраняем имя файла и подпапку legal/. RU — без префикса языка.
  function langHref(targetCode) {
    const fileMatch = path.match(/([^\/]+\.html)$/);
    const file = fileMatch ? fileMatch[1] : 'index.html';
    const isLegalPage = path.includes('/legal/');
    const segment = isLegalPage ? 'legal/' + file : file;
    if (targetCode === 'ru') {
      // Из en/foo.html в /foo.html. Из en/legal/foo.html в /legal/foo.html.
      return upPrefix + segment;
    }
    // RU → en/foo.html. EN → ../fr/foo.html и т.п.
    return upPrefix + targetCode + '/' + segment;
  }

  function langOptionsHTML() {
    return LANGS.map(l => `
      <button class="lang-option ${l.code === currentLang ? 'is-current' : ''}"
              data-lang-target="${l.code}"
              role="menuitem"
              ${l.code === currentLang ? 'aria-current="true"' : ''}>
        <span class="lang-option__short">${l.short}</span>
        <span class="lang-option__label">${l.label}</span>
        ${l.code === currentLang ? '<span class="lang-option__check">✓</span>' : ''}
      </button>
    `).join('');
  }

  const toolbarHTML = `
    <div class="site-toolbar" role="group" aria-label="Панель управления">
      <a class="site-toolbar__btn" href="${homeHref}" aria-label="В начало" title="В начало">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/></svg>
      </a>
      <button class="site-toolbar__btn" data-action="back" aria-label="Назад" title="Назад">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="site-toolbar__btn" data-action="forward" aria-label="Вперёд" title="Вперёд">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <span class="site-toolbar__sep" aria-hidden="true"></span>
      <button class="site-toolbar__btn" data-action="theme" aria-label="Сменить тему" title="Тема">
        <svg class="theme-icon-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 12 a 9 9 0 0 1 0 -9 z" fill="currentColor"/></svg>
        <svg class="theme-icon-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        <svg class="theme-icon-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
      <div class="lang-switcher">
        <button class="site-toolbar__btn site-toolbar__lang" data-action="lang-toggle" aria-label="Сменить язык" aria-haspopup="menu" aria-expanded="false" title="Язык / Language">
          ${LANGS.find(l => l.code === currentLang).short}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="margin-left:4px"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="lang-dropdown" role="menu">
          ${langOptionsHTML()}
        </div>
      </div>
    </div>
  `;

  // Вставляем в десктопный header — перед .nav-cta
  const headerInner = document.querySelector('.site-header__inner');
  const navCta = headerInner ? headerInner.querySelector('.nav-cta') : null;
  if (headerInner && navCta) {
    navCta.insertAdjacentHTML('beforebegin', toolbarHTML);
  }
  // В мобильное меню — в начало
  const mobileMenu = document.querySelector('.nav-mobile');
  if (mobileMenu) {
    mobileMenu.insertAdjacentHTML('afterbegin', toolbarHTML);
  }

  // === Theme toggle: auto / light / dark ===
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('zs-theme', t);
    document.querySelectorAll('.site-toolbar__btn[data-action="theme"]').forEach((btn) => {
      btn.querySelectorAll('svg').forEach((s) => s.style.display = 'none');
      const icon = btn.querySelector('.theme-icon-' + t);
      if (icon) icon.style.display = '';
      btn.setAttribute('title', 'Тема: ' + ({auto: 'авто', light: 'светлая', dark: 'тёмная'}[t]));
    });
  }
  applyTheme(localStorage.getItem('zs-theme') || 'auto');

  // Клики по toolbar
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.site-toolbar__btn[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    if (action === 'back') {
      e.preventDefault();
      if (history.length > 1) history.back();
    } else if (action === 'forward') {
      e.preventDefault();
      history.forward();
    } else if (action === 'theme') {
      e.preventDefault();
      const cur = document.documentElement.getAttribute('data-theme') || 'auto';
      const next = cur === 'auto' ? 'light' : cur === 'light' ? 'dark' : 'auto';
      applyTheme(next);
    } else if (action === 'lang-toggle') {
      e.preventDefault();
      const wrap = btn.closest('.lang-switcher');
      if (!wrap) return;
      const open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      // Закрытие при клике вне
      if (open) {
        const closeOnOutside = (ev) => {
          if (!wrap.contains(ev.target)) {
            wrap.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', closeOnOutside);
          }
        };
        setTimeout(() => document.addEventListener('click', closeOnOutside), 0);
      }
    }
  });

  // Делегированный клик по опции языка
  document.addEventListener('click', (e) => {
    const opt = e.target.closest('.lang-option[data-lang-target]');
    if (!opt) return;
    e.preventDefault();
    const target = opt.getAttribute('data-lang-target');
    const href = langHref(target);
    location.href = href;
  });

  // === Smooth fade-in on scroll (только если IO доступен и не пользователь reduce-motion) ===
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('zs-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      io.observe(el);
      // Если элемент уже виден на момент инициализации — открыть сразу
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
  }

  // === Smooth anchor scrolling ===
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // === Year in footer ===
  const y = document.getElementById('current-year');
  if (y) y.textContent = new Date().getFullYear();

  // === Cookie-баннер (152-ФЗ согласие на cookies) ===
  // Только для http(s) — на file:// localStorage кидает SecurityError, баннер не нужен.
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    try {
      const consentKey = 'zs-cookie-consent';
      if (!localStorage.getItem(consentKey)) {
        const COOKIE_TEXTS = {
          ru: { msg: 'Сайт использует cookies исключительно для работы переключателя темы и языка. Никакого трекинга и передачи третьим лицам.', accept: 'Понятно', more: 'Подробнее' },
          en: { msg: 'This site uses cookies only for theme and language switching. No tracking, no third-party data sharing.', accept: 'Got it', more: 'Details' },
          fr: { msg: 'Ce site utilise des cookies uniquement pour le changement de thème et de langue. Aucun pistage, aucun partage avec des tiers.', accept: 'Compris', more: 'Détails' },
          ar: { msg: 'يستخدم هذا الموقع ملفات تعريف الارتباط فقط لتبديل السمة واللغة. لا تتبّع، لا مشاركة مع طرف ثالث.', accept: 'فهمت', more: 'تفاصيل' }
        };
        const t = COOKIE_TEXTS[currentLang] || COOKIE_TEXTS.ru;
        const inLegalPage = location.pathname.includes('/legal/');
        const policyPath = (currentLang === 'ru' ? '' : (inLegalPage ? '../../' : '../')) + (inLegalPage ? '' : 'legal/') + 'policy-pd.html';
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookies consent');
        banner.innerHTML =
          '<div class="cookie-banner__msg">' + t.msg + '</div>' +
          '<div class="cookie-banner__actions">' +
            '<a class="btn btn-ghost btn-sm" href="' + policyPath + '">' + t.more + '</a>' +
            '<button class="btn btn-primary btn-sm" data-cookie-accept>' + t.accept + '</button>' +
          '</div>';
        document.body.appendChild(banner);
        requestAnimationFrame(() => banner.classList.add('show'));

        banner.querySelector('[data-cookie-accept]').addEventListener('click', () => {
          try { localStorage.setItem(consentKey, '1'); } catch(e) {}
          banner.classList.remove('show');
          setTimeout(() => banner.remove(), 300);
        });
      }
    } catch (e) {
      // localStorage недоступен — пропускаем
    }
  }
})();
