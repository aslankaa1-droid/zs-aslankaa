/* ==========================================================================
   Zemelny Service mobile app prototype (English version)
   17 screens, navigation, AI scenario simulation
   ========================================================================== */

(function () {
  'use strict';

  // === App state ===
  const state = {
    screen: 'splash',
    history: [],
    user: { name: '', phone: '', authenticated: false },
    parcel: { cadastral: '', address: '', region: '', risk: '' },
    case: { id: null, status: 'none' },
    aiThinking: false,
  };

  // === Navigation ===
  function go(screenId, push = true) {
    const cur = document.querySelector('.app-screen.active');
    if (cur) cur.classList.remove('active');
    const next = document.getElementById('screen-' + screenId);
    if (next) {
      next.classList.add('active');
      if (push && state.screen !== screenId) state.history.push(state.screen);
      state.screen = screenId;
      next.scrollTop = 0;
      const sc = document.querySelector('.phone-screen');
      if (sc) sc.scrollTop = 0;
    }
  }

  function back() {
    if (state.history.length > 0) {
      const prev = state.history.pop();
      go(prev, false);
    } else {
      go('home', false);
    }
  }

  // Expose go() on window for console-driven demos and automated testing.
  window.go = go;

  // Click delegation
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-go]');
    if (target) {
      e.preventDefault();
      go(target.getAttribute('data-go'));
    }
    const backBtn = e.target.closest('[data-back]');
    if (backBtn) {
      e.preventDefault();
      back();
    }
  });

  // === Scenario 1: ESIA (Gosuslugi) login ===
  window.simulateEsiaLogin = function () {
    state.user.name = 'Ivan Petrov';
    state.user.phone = '+7 (916) 123-45-67';
    state.user.authenticated = true;
    document.querySelectorAll('[data-bind="user.name"]').forEach(el => el.textContent = state.user.name);
    document.querySelectorAll('[data-bind="user.phone"]').forEach(el => el.textContent = state.user.phone);
    showToast('Signed in via Gosuslugi');
    setTimeout(() => go('home'), 800);
  };

  // === Scenario 2: add a land plot ===
  window.simulateParcelLookup = function () {
    state.parcel.cadastral = '69:10:0152801:425';
    state.parcel.address = 'Tver Region, Kashin district, village of Novinki';
    state.parcel.region = 'Tver Region';
    state.parcel.risk = 'high';

    showLoadingThen(() => {
      go('diagnose-result');
    }, 'Requesting USRN extract via Kontur.Reestro…', 1800);
  };

  // === Scenario 3: AI-2 diagnostics ===
  window.simulateAiDiagnose = function () {
    showLoadingThen(() => {
      go('case-plan');
    }, 'AI-2 is analysing the extract and satellite data…', 2200);
  };

  // === Scenario 4: open a case ===
  window.simulateOpenCase = function () {
    state.case.id = 'CASE-2026-0042';
    state.case.status = 'open';
    showLoadingThen(() => {
      go('case-detail');
    }, 'AI-3 is preparing the initial documents…', 1600);
  };

  // === Scenario 5: SES signing ===
  window.simulatePepSign = function () {
    showLoadingThen(() => {
      showToast('Document signed with SES');
      go('case-detail');
    }, 'Verifying SMS code…', 1200);
  };

  // === Scenario 6: lawyer matching ===
  window.simulateLawyerMatch = function () {
    showLoadingThen(() => {
      go('lawyers-list');
    }, 'AI-6 is selecting lawyers by region…', 1800);
  };

  // === AI chat — simplified simulation ===
  window.sendChatMessage = function () {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    addChatMessage('user', text);

    setTimeout(() => {
      const reply = generateReply(text);
      addChatMessage('assistant', reply.text, reply.citations);
    }, 1100);
  };

  function generateReply(question) {
    const q = question.toLowerCase();

    if (q.includes('seizure') || q.includes('forfeit') || q.includes('101-fz') || q.includes('101 fz') || q.includes('101fz')) {
      return {
        text: 'Seizure of an agricultural land plot is possible under Article 6 of Federal Law 101-FZ when the plot is not used for 3 consecutive years or more. Before the seizure, the empowered authority issues a notice with a remediation period (a minimum of 6 months). If the indicators of violation are remedied within that period, no seizure follows.',
        citations: [{ source: '101-FZ', article: 'Art. 6' }, { source: 'PP-826', article: '01.09.2025' }]
      };
    }
    if (q.includes('fine') || q.includes('penalty') || q.includes('liab')) {
      return {
        text: 'Improper use of agricultural land is sanctioned under Article 8.8 of the Code of Administrative Offences of the Russian Federation — up to 50K RUB for natural persons and up to 700K RUB for legal entities. In addition, FZ-420 introduces turnover-linked fines for personal data leaks (1–3% of revenue, capped at 500M RUB).',
        citations: [{ source: 'Code of Administrative Offences', article: 'Art. 8.8' }, { source: 'FZ-420', article: '30.11.2024' }]
      };
    }
    if (q.includes('indicator') || q.includes('criter') || q.includes('non-use')) {
      return {
        text: 'The indicators of non-use are set out in Government Decree 826 (PP-826) of 01.09.2025: no signs of soil cultivation on more than 70% of the area, no crops on more than 50% of arable land, weeds covering more than 20% or trees and shrubs covering more than 15%. Satellite monitoring is used.',
        citations: [{ source: 'PP-826', article: 'Sections 2-4' }]
      };
    }
    if (q.includes('sale') || q.includes('co-owner') || q.includes('share')) {
      return {
        text: 'When a share in common shared ownership of an agricultural plot is sold, the other co-owners hold a pre-emptive right of purchase for 30 days (Article 8 of 101-FZ). The notice is sent by registered post or published in the official gazette of the constituent entity of the Russian Federation.',
        citations: [{ source: '101-FZ', article: 'Art. 8 para. 2' }]
      };
    }
    if (q.includes('kaluga')) {
      return {
        text: 'Kaluga Region specifics: the decision on land seizure is taken by the Ministry of Economic Development (rather than the Ministry of Agriculture, as in most regions). This affects the court jurisdiction and the addressee of submissions.',
        citations: [{ source: 'Regional playbook', article: 'Kaluga Region' }]
      };
    }
    return {
      text: 'Good question. To give you a precise answer, I need a little more context — please specify the region, the type of issue (seizure, fine, court challenge), or attach a photo of the notice. I will then pull the relevant articles of the law and strategies.',
      citations: []
    };
  }

  function addChatMessage(role, text, citations = []) {
    const wrap = document.getElementById('chat-messages');
    if (!wrap) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg--' + role;

    let html = '<div class="chat-msg__body">' + escapeHtml(text) + '</div>';
    if (citations.length) {
      html += '<div class="chat-msg__cite">';
      citations.forEach(c => {
        html += '<span class="chat-citation">' + escapeHtml(c.source) + ' · ' + escapeHtml(c.article) + '</span>';
      });
      html += '</div>';
    }
    msg.innerHTML = html;
    wrap.appendChild(msg);
    wrap.scrollTop = wrap.scrollHeight;
  }

  // === Utilities ===
  function showLoadingThen(callback, text, delay) {
    const overlay = document.getElementById('loading-overlay');
    const label = document.getElementById('loading-label');
    if (overlay && label) {
      label.textContent = text;
      overlay.classList.add('active');
      setTimeout(() => {
        overlay.classList.remove('active');
        callback();
      }, delay);
    } else {
      callback();
    }
  }

  function showToast(text) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'app-toast';
      document.querySelector('.phone').appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

  // === Enter key in chat ===
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.id === 'chat-input' && e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
    }
  });

  // === Init ===
  document.addEventListener('DOMContentLoaded', () => {
    go('splash', false);
    setTimeout(() => go('login'), 1500);
  });
})();
