/* ==========================================================================
   Прототип мобильного приложения «Земельный Сервис»
   17 экранов, навигация, симуляция AI-сценариев
   ========================================================================== */

(function () {
  'use strict';

  // === Состояние приложения ===
  const state = {
    screen: 'splash',
    history: [],
    user: { name: '', phone: '', authenticated: false },
    parcel: { cadastral: '', address: '', region: '', risk: '' },
    case: { id: null, status: 'none' },
    aiThinking: false,
  };

  // === Навигация ===
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

  // Экспортируем go в window — чтобы можно было управлять прототипом из консоли
  // (полезно для демо и автоматического тестирования)
  window.go = go;

  // Делегирование кликов
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

  // === Сценарий 1: вход через ЕСИА ===
  window.simulateEsiaLogin = function () {
    state.user.name = 'Иван Петров';
    state.user.phone = '+7 (916) 123-45-67';
    state.user.authenticated = true;
    document.querySelectorAll('[data-bind="user.name"]').forEach(el => el.textContent = state.user.name);
    document.querySelectorAll('[data-bind="user.phone"]').forEach(el => el.textContent = state.user.phone);
    showToast('Авторизация через Госуслуги успешна');
    setTimeout(() => go('home'), 800);
  };

  // === Сценарий 2: добавление участка ===
  window.simulateParcelLookup = function () {
    state.parcel.cadastral = '69:10:0152801:425';
    state.parcel.address = 'Тверская обл., Кашинский р-н, д. Новинки';
    state.parcel.region = 'Тверская область';
    state.parcel.risk = 'high';

    // Показ "получение выписки"
    showLoadingThen(() => {
      go('diagnose-result');
    }, 'Запрашиваем ЕГРН через Контур.Реестро…', 1800);
  };

  // === Сценарий 3: AI-2 диагностика ===
  window.simulateAiDiagnose = function () {
    showLoadingThen(() => {
      go('case-plan');
    }, 'AI-2 анализирует выписку и спутниковые данные…', 2200);
  };

  // === Сценарий 4: открытие кейса ===
  window.simulateOpenCase = function () {
    state.case.id = 'CASE-2026-0042';
    state.case.status = 'open';
    showLoadingThen(() => {
      go('case-detail');
    }, 'AI-3 готовит первичные документы…', 1600);
  };

  // === Сценарий 5: ПЭП-подписание ===
  window.simulatePepSign = function () {
    showLoadingThen(() => {
      showToast('Документ подписан ПЭП');
      go('case-detail');
    }, 'Проверяем СМС-код…', 1200);
  };

  // === Сценарий 6: подбор юриста ===
  window.simulateLawyerMatch = function () {
    showLoadingThen(() => {
      go('lawyers-list');
    }, 'AI-6 подбирает юристов по региону…', 1800);
  };

  // === AI чат — упрощённая симуляция ===
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

    if (q.includes('изъят') || q.includes('101-ФЗ') || q.includes('101 фз') || q.includes('101фз')) {
      return {
        text: 'Изъятие участка с/х назначения возможно по ст. 6 101-ФЗ при неиспользовании 3 года и более подряд. Перед изъятием уполномоченный орган выдаёт предписание со сроком устранения признаков (минимум 6 месяцев). Если устраните признаки в срок — изъятия не будет.',
        citations: [{ source: '101-ФЗ', article: 'ст. 6' }, { source: 'ПП-826', article: '01.09.2025' }]
      };
    }
    if (q.includes('штраф') || q.includes('ответственн')) {
      return {
        text: 'За ненадлежащее использование земель с/х назначения предусмотрены штрафы по ст. 8.8 КоАП РФ — для физических лиц до 50 тыс ₽, для юр.лиц до 700 тыс ₽. Дополнительно — оборотные штрафы по ФЗ-420 при утечке ПДн (1–3% выручки до 500 млн ₽).',
        citations: [{ source: 'КоАП РФ', article: 'ст. 8.8' }, { source: 'ФЗ-420', article: '30.11.2024' }]
      };
    }
    if (q.includes('признак') || q.includes('критер')) {
      return {
        text: 'Признаки неиспользования установлены ПП-826 от 01.09.2025: отсутствие признаков обработки почвы на > 70% площади, отсутствие посевов на > 50% пашни, зарастание сорняками > 20% или древесно-кустарниковой растительностью > 15%. Используется спутниковый мониторинг.',
        citations: [{ source: 'ПП-826', article: 'п. 2-4' }]
      };
    }
    if (q.includes('продаж') || q.includes('доль') || q.includes('пай')) {
      return {
        text: 'При продаже доли в общей долевой собственности на с/х участок остальные дольщики имеют преимущественное право покупки в течение 30 дней (101-ФЗ ст. 8). Извещение направляется заказным письмом или публикацией в газете субъекта.',
        citations: [{ source: '101-ФЗ', article: 'ст. 8 ч. 2' }]
      };
    }
    if (q.includes('калуг')) {
      return {
        text: 'Особенность Калужской области: решение об изъятии принимает Министерство экономического развития (а не Минсельхоз, как в большинстве регионов). Это влияет на подсудность исков и шапку обращений.',
        citations: [{ source: 'Региональный плейбук', article: 'Калужская обл.' }]
      };
    }
    return {
      text: 'Хороший вопрос. Чтобы дать точный ответ, мне нужно немного больше контекста — укажите регион, тип проблемы (изъятие, штраф, оспаривание) или прикрепите фото предписания. Я подберу подходящие статьи закона и стратегии.',
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

  // === Утилиты ===
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

  // === Enter в чате ===
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
