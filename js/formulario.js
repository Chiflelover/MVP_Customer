/**
 * formulario.js
 * Lógica del formulario de datos del usuario y del chatbot DR.IANKA
 * DR.IANKA · Plataforma de orientación médica
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // REFERENCIAS AL DOM
  // ============================================================
  const formView      = document.getElementById('formView');
  const chatView      = document.getElementById('chatView');
  const userDataForm  = document.getElementById('userDataForm');
  const stepDot1      = document.getElementById('stepDot1');
  const stepDot2      = document.getElementById('stepDot2');
  const btnVolverForm = document.getElementById('btnVolverForm');
  const messagesEl    = document.getElementById('chatMessages');
  const chatInput     = document.getElementById('chatInput');
  const chatSendBtn   = document.getElementById('chatSendBtn');

  // ============================================================
  // CUSTOM ALERT
  // ============================================================
  const alertOverlay = document.getElementById('customAlert');
  const alertMessage = document.getElementById('customAlertMessage');
  const alertBtn     = document.getElementById('customAlertBtn');

  function showAlert(msg) {
    alertMessage.textContent = msg;
    alertOverlay.classList.add('active');
  }

  alertBtn.addEventListener('click', () => alertOverlay.classList.remove('active'));
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') alertOverlay.classList.remove('active');
  });
  alertOverlay.addEventListener('click', e => {
    if (e.target === alertOverlay) alertOverlay.classList.remove('active');
  });

  // ============================================================
  // RADIO PILLS
  // ============================================================
  document.querySelectorAll('.radio-pill').forEach(pill => {
    const radio = pill.querySelector('input[type="radio"]');
    pill.addEventListener('click', () => {
      document.querySelectorAll('.radio-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      radio.checked = true;
    });
  });

  // ============================================================
  // TRANSICIÓN FORMULARIO → CHAT
  // ============================================================
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const edad = document.getElementById('edad').value.trim();
    const sexo = document.querySelector('input[name="sexo"]:checked');

    if (!edad || isNaN(edad) || +edad <= 0 || +edad > 120) {
      showAlert('Por favor, ingresa una edad válida.');
      return;
    }
    if (!sexo) {
      showAlert('Por favor, selecciona tu sexo.');
      return;
    }

    const nombre = document.getElementById('nombre').value.trim();
    sessionStorage.setItem('edad', edad);
    sessionStorage.setItem('sexo', sexo.value);
    if (nombre) sessionStorage.setItem('nombre', nombre);

    formView.classList.add('fade-out');
    setTimeout(() => {
      formView.classList.add('hidden');
      formView.classList.remove('fade-out');
      chatView.classList.remove('hidden');
      chatView.classList.add('fade-in');
      stepDot1.classList.remove('active');
      stepDot2.classList.add('active');
      initChat(nombre, sexo.value, +edad);
    }, 350);
  });

  // Volver al formulario
  btnVolverForm.addEventListener('click', () => {
    chatView.classList.add('hidden');
    chatView.classList.remove('fade-in');
    formView.classList.remove('hidden');
    formView.classList.add('fade-in');
    stepDot1.classList.add('active');
    stepDot2.classList.remove('active');
    messagesEl.innerHTML = '';
    chatState        = 'BIENVENIDA';
    detectedSymptoms = [];
    diasEnfermo      = null;
    chatInput.disabled    = false;
    chatSendBtn.disabled  = false;
  });

  // ============================================================
  // DATOS DEL CHATBOT
  // ============================================================
  const allSymptoms = [
    'Fiebre',
    'Tos',
    'Dolor de cabeza',
    'Dificultad para respirar',
    'Dolor de garganta',
    'Pérdida de olfato/gusto',
    'Cansancio extremo'
  ];

  /** Mapa de palabras clave → síntoma reconocido */
  const keywordMap = [
    { keywords: ['fiebre', 'temperatura', 'calentura', 'febricula', 'febrícola', 'calor'],       symptom: 'Fiebre' },
    { keywords: ['tos', 'tose', 'tosiendo'],                                                      symptom: 'Tos' },
    { keywords: ['cabeza', 'cefalea', 'migraña', 'jaqueca'],                                     symptom: 'Dolor de cabeza' },
    { keywords: ['respirar', 'ahogo', 'disnea', 'falta de aire', 'asfixia', 'pecho', 'jadeo'],  symptom: 'Dificultad para respirar' },
    { keywords: ['garganta', 'faringitis', 'amigdalas', 'deglutir', 'tragar'],                   symptom: 'Dolor de garganta' },
    { keywords: ['olfato', 'gusto', 'oler', 'saborear', 'huelo', 'saboreo', 'anosmia'],         symptom: 'Pérdida de olfato/gusto' },
    { keywords: ['cansancio', 'fatiga', 'agotamiento', 'debilidad', 'sin energia', 'sin energía', 'cansado'], symptom: 'Cansancio extremo' }
  ];

  /** Estados del chatbot */
  let chatState        = 'BIENVENIDA';
  let detectedSymptoms = [];
  let diasEnfermo      = null;

  // ============================================================
  // UTILIDADES
  // ============================================================
  const delay = ms => new Promise(res => setTimeout(res, ms));

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /** Sanitiza texto antes de insertarlo en HTML */
  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ============================================================
  // CONSTRUCCIÓN DE MENSAJES
  // ============================================================
  const BOT_AVATAR_SVG = `
    <svg viewBox="0 0 24 24" fill="#fff">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`;

  function addBotBubble(html, extraClass = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-bot';
    wrapper.innerHTML = `
      <div class="msg-bot-avatar" aria-hidden="true">${BOT_AVATAR_SVG}</div>
      <div class="msg-bot-bubble ${extraClass}">${html}</div>
    `;
    messagesEl.appendChild(wrapper);
    scrollBottom();
    return wrapper;
  }

  function addUserBubble(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-user';
    wrapper.innerHTML = `<div class="msg-user-bubble">${escHtml(text)}</div>`;
    messagesEl.appendChild(wrapper);
    scrollBottom();
  }

  async function showTyping(ms = 1200) {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="msg-bot-avatar" aria-hidden="true">${BOT_AVATAR_SVG}</div>
      <div class="typing-dots"><span></span><span></span><span></span></div>
    `;
    messagesEl.appendChild(indicator);
    scrollBottom();
    await delay(ms);
    messagesEl.removeChild(indicator);
  }

  // ============================================================
  // DETECCIÓN DE SÍNTOMAS Y DÍAS
  // ============================================================
  function detectSymptoms(text) {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const found = [];
    keywordMap.forEach(({ keywords, symptom }) => {
      if (keywords.some(kw => lower.includes(kw)) && !found.includes(symptom)) {
        found.push(symptom);
      }
    });
    return found;
  }

  function detectDays(text) {
    const lower = text.toLowerCase();
    const numMatch = lower.match(/(\d+)\s*(día|dias|días|semana|semanas|mes|meses|hora|horas)/);
    if (numMatch) {
      const num  = parseInt(numMatch[1]);
      const unit = numMatch[2];
      if (unit.startsWith('hora'))   return Math.max(1, Math.round(num / 24));
      if (unit.startsWith('semana')) return num * 7;
      if (unit.startsWith('mes'))    return num * 30;
      return num;
    }
    if (lower.includes('un día')   || lower.includes('1 día')    || lower.includes('ayer')) return 1;
    if (lower.includes('dos días') || lower.includes('2 días'))                              return 2;
    if (lower.includes('tres días')|| lower.includes('3 días'))                              return 3;
    if (lower.includes('una semana')|| lower.includes('1 semana'))                           return 7;
    if (lower.includes('hoy')      || lower.includes('poco'))                                return 1;
    const soloNum = lower.match(/^\s*(\d+)\s*$/);
    if (soloNum) return parseInt(soloNum[1]);
    return null;
  }

  // ============================================================
  // LÓGICA DE DIAGNÓSTICO
  // ============================================================
  /**
   * Evalúa síntomas y días para determinar la gravedad.
   * Reglas:
   *   - 3 o más síntomas → Atención Requerida
   *   - 7+ días CON 2+ síntomas → Atención Requerida
   *   - En caso contrario → Caso Leve
   */
  function runDiagnosis(symptoms, days) {
    const isGrave = symptoms.length >= 3 || (days && days >= 7 && symptoms.length >= 2);
    let badge, text, recs;

    if (isGrave) {
      badge = 'Atención Requerida';
      text  = 'Detecté varios síntomas concurrentes. Te recomiendo consultar con un médico a la brevedad.';
      recs  = [
        'Consultar con un médico hoy (teleconsulta o presencial)',
        'Monitorear tu temperatura cada pocas horas',
        'Evitar esfuerzos físicos hasta ser evaluado'
      ];
    } else {
      badge = 'Caso Leve';
      text  = 'Tus síntomas parecen ser leves. Con cuidados en casa deberías mejorar pronto.';
      recs  = ['Descansa y repon energías', 'Hidratarte bien con agua o suero oral'];
      if (symptoms.includes('Fiebre') || symptoms.includes('Dolor de cabeza')) {
        recs.push('Tomar paracetamol si hay molestias (según dosis recomendada)');
      } else if (symptoms.includes('Dolor de garganta') || symptoms.includes('Tos')) {
        recs.push('Beber líquidos tibios para aliviar la garganta');
      } else {
        recs.push('Monitorear tu evolución en las próximas 24 horas');
      }
    }
    return { isGrave, badge, text, recs };
  }

  // ============================================================
  // CHIPS DE SÍNTOMAS
  // ============================================================
  /**
   * @param {string[]} exclude  Síntomas ya seleccionados (se omiten)
   * @param {boolean}  showDone Muestra el chip "Ya no tengo más síntomas"
   */
  function buildSymptomChips(exclude = [], showDone = false) {
    const available = allSymptoms.filter(s => !exclude.includes(s));
    if (available.length === 0 && !showDone) return '';

    const chips = available.map(s => `
      <span class="chip" data-symptom="${escHtml(s)}" role="button" tabindex="0" aria-label="Agregar síntoma: ${escHtml(s)}">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        ${escHtml(s)}
      </span>
    `).join('');

    const doneChip = showDone
      ? `<span class="chip chip-done" data-done="true" role="button" tabindex="0" aria-label="No tengo más síntomas">
           <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
           Ya no tengo más síntomas
         </span>`
      : '';

    return `<div class="suggestion-chips" aria-label="Síntomas sugeridos">${chips}${doneChip}</div>`;
  }

  // ============================================================
  // RENDER DEL RESULTADO DENTRO DEL CHAT
  // ============================================================
  function renderResultCard(diagnosis) {
    const { isGrave, badge, text, recs } = diagnosis;
    const recsHtml = recs.map(r => `
      <div class="chat-result-rec">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${escHtml(r)}</span>
      </div>
    `).join('');

    return `
      <div class="chat-result ${isGrave ? 'grave' : ''}">
        <div class="chat-result-badge">${escHtml(badge)}</div>
        <p class="chat-result-text">${escHtml(text)}</p>
        <div class="chat-result-recs">${recsHtml}</div>
      </div>
      <button class="btn-chat-action" id="btnVerDiagnostico">
        <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        Ver diagnóstico completo
      </button>
      <button class="btn-chat-action secondary" id="btnHablarMedico">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        Hablar con un médico
      </button>
    `;
  }

  // ============================================================
  // LISTENERS DE CHIPS
  // ============================================================
  function attachChipListeners() {
    messagesEl.querySelectorAll('.chip:not([data-bound])').forEach(chip => {
      chip.setAttribute('data-bound', 'true');

      // Chip "Ya no tengo más síntomas"
      if (chip.dataset.done === 'true') {
        const handleDone = async () => {
          if (chatState !== 'ESPERANDO_SINTOMAS' && chatState !== 'CONFIRMAR_SINTOMAS') return;
          chip.closest('.suggestion-chips')?.querySelectorAll('.chip').forEach(c => {
            c.style.pointerEvents = 'none';
            c.style.opacity = '0.45';
          });
          chip.classList.add('selected');
          chip.style.opacity = '1';
          addUserBubble('Ya no tengo más síntomas');
          chatInput.disabled   = true;
          chatSendBtn.disabled = true;
          await preguntarDias();
          chatInput.disabled   = false;
          chatSendBtn.disabled = false;
          chatInput.focus();
        };
        chip.addEventListener('click', handleDone);
        chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleDone(); });
        return;
      }

      // Chip de síntoma normal
      const handleChip = () => {
        if (chatState !== 'ESPERANDO_SINTOMAS' && chatState !== 'CONFIRMAR_SINTOMAS') return;
        const symptom = chip.dataset.symptom;
        if (!detectedSymptoms.includes(symptom)) detectedSymptoms.push(symptom);
        chip.classList.add('selected');
        chip.style.pointerEvents = 'none';
        addUserBubble(symptom);
        handleSymptomAdded(symptom);
      };
      chip.addEventListener('click', handleChip);
      chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleChip(); });
    });
  }

  // ============================================================
  // FLUJO CONVERSACIONAL
  // ============================================================
  async function handleSymptomAdded() {
    chatInput.disabled   = true;
    chatSendBtn.disabled = true;
    await showTyping(700);

    if (detectedSymptoms.length < 3) {
      const rest = allSymptoms.filter(s => !detectedSymptoms.includes(s));
      const msg  = rest.length > 0
        ? `¿Tienes algún otro síntoma?${buildSymptomChips(detectedSymptoms, true)}`
        : '¿Tienes algún otro síntoma que no esté en la lista? Escríbemelo. Si no, escribe <em>"no"</em> o haz clic abajo.';
      addBotBubble(msg);
      attachChipListeners();
      chatState = 'CONFIRMAR_SINTOMAS';
    } else {
      await preguntarDias();
    }

    chatInput.disabled   = false;
    chatSendBtn.disabled = false;
    chatInput.focus();
  }

  async function preguntarDias() {
    chatState = 'ESPERANDO_DIAS';
    await showTyping(900);
    addBotBubble('Entendido. ¿Hace cuántos días empezaron estos síntomas? (Ej: <em>2 días</em>, <em>1 semana</em>)');
    scrollBottom();
  }

  // ============================================================
  // INICIALIZAR CHAT
  // ============================================================
  async function initChat(nombre, sexo, edad) {
    chatState        = 'BIENVENIDA';
    detectedSymptoms = [];
    diasEnfermo      = null;

    const greeting = nombre
      ? `¡Hola, <strong>${escHtml(nombre)}</strong>! 👋`
      : '¡Hola! 👋';

    chatInput.disabled   = true;
    chatSendBtn.disabled = true;

    await delay(400);
    addBotBubble(`${greeting} Soy <strong>DR.IANKA</strong>, tu asistente médico virtual.`);

    await showTyping(1000);
    addBotBubble(`Veo que tienes <strong>${escHtml(String(edad))} años</strong>. Ahora cuéntame, ¿qué síntomas estás presentando?`);

    await showTyping(900);
    addBotBubble(`Puedes escribirlos o seleccionar de las opciones rápidas:${buildSymptomChips([])}`);
    attachChipListeners();

    chatState        = 'ESPERANDO_SINTOMAS';
    chatInput.disabled   = false;
    chatSendBtn.disabled = false;
    chatInput.focus();
  }

  // ============================================================
  // PROCESADOR DE MENSAJES DEL USUARIO
  // ============================================================
  async function processUserMessage(text) {
    if (!text.trim()) return;
    addUserBubble(text);
    chatInput.value      = '';
    chatInput.disabled   = true;
    chatSendBtn.disabled = true;

    if (chatState === 'ESPERANDO_SINTOMAS' || chatState === 'CONFIRMAR_SINTOMAS') {

      const lower      = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const isNegation = /^(no|nada|ninguno|ningún|ningun|solo\s*eso|es\s*todo|eso\s*es\s*todo|fin|listo)$/.test(lower.trim());
      const found      = detectSymptoms(text);

      if (found.length > 0) {
        found.forEach(s => { if (!detectedSymptoms.includes(s)) detectedSymptoms.push(s); });
        await showTyping(800);

        if (isNegation || detectedSymptoms.length >= 5 || chatState === 'CONFIRMAR_SINTOMAS') {
          await preguntarDias();
        } else {
          const rest = allSymptoms.filter(s => !detectedSymptoms.includes(s));
          if (rest.length > 0) {
            addBotBubble(`Anotado ✓ <strong>${found.map(escHtml).join(', ')}</strong>. ¿Tienes algún otro síntoma?${buildSymptomChips(detectedSymptoms, true)}`);
            attachChipListeners();
            chatState = 'CONFIRMAR_SINTOMAS';
          } else {
            await preguntarDias();
          }
        }

      } else if (isNegation && detectedSymptoms.length > 0) {
        await preguntarDias();

      } else if (isNegation && detectedSymptoms.length === 0) {
        await showTyping(700);
        addBotBubble('Entiendo. Para poder ayudarte, necesito saber al menos un síntoma. ¿Qué molestias tienes?');

      } else {
        await showTyping(700);
        addBotBubble(`No pude identificar síntomas específicos. ¿Podrías describirlos con más detalle o seleccionar de la lista?${buildSymptomChips(detectedSymptoms)}`);
        attachChipListeners();
      }

    } else if (chatState === 'ESPERANDO_DIAS') {

      const days = detectDays(text);
      if (days !== null && days > 0) {
        diasEnfermo = days;
        sessionStorage.setItem('tiempo', `${days} día${days === 1 ? '' : 's'}`);
        sessionStorage.setItem('selectedSymptoms', JSON.stringify(detectedSymptoms));

        chatState = 'ANALIZANDO';
        await showTyping(1500);
        addBotBubble('🔍 Analizando tu información...');
        await showTyping(1800);

        const diagnosis  = runDiagnosis(detectedSymptoms, days);
        const resultHtml = renderResultCard(diagnosis);
        addBotBubble(resultHtml);
        chatState = 'RESULTADO';

        setTimeout(() => {
          const btnDiag = document.getElementById('btnVerDiagnostico');
          const btnMed  = document.getElementById('btnHablarMedico');
          if (btnDiag) btnDiag.addEventListener('click', () => { window.location.href = 'carga.html'; });
          if (btnMed)  btnMed.addEventListener('click',  () => { window.location.href = 'teleconsulta.html'; });
        }, 100);

        chatInput.disabled      = true;
        chatSendBtn.disabled    = true;
        chatInput.placeholder   = 'Consulta finalizada';

      } else {
        await showTyping(700);
        addBotBubble('No entendí cuántos días llevas así. ¿Puedes decirme el número? Por ejemplo: <em>"3 días"</em> o <em>"1 semana"</em>.');
      }

    } else if (chatState === 'RESULTADO') {
      await showTyping(600);
      addBotBubble('El análisis ya está listo. Haz clic en <strong>"Ver diagnóstico completo"</strong> para continuar.');
    }

    if (chatState !== 'RESULTADO' && chatState !== 'ANALIZANDO') {
      chatInput.disabled   = false;
      chatSendBtn.disabled = false;
      chatInput.focus();
    }

    scrollBottom();
  }

  // ============================================================
  // EVENTOS DE ENVÍO
  // ============================================================
  chatSendBtn.addEventListener('click', () => {
    processUserMessage(chatInput.value.trim());
  });

  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processUserMessage(chatInput.value.trim());
    }
  });

});
