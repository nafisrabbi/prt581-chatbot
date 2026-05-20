/* ============================================================
   js/ui.js — DOM Rendering & UI State Management
   PRT581 Doctors Training Chatbot
   ============================================================ */

let selectedDiagnosis = '';

// ── Append a chat message bubble ──────────────────────────
function appendMessage(role, text) {
  const container = document.getElementById('chatMessages');

  const group = document.createElement('div');
  group.className = `message-group ${role}`;

  // Meta row (avatar + name + time)
  const meta = document.createElement('div');
  meta.className = 'msg-meta';

  const avatarSm = document.createElement('div');
  avatarSm.className = `msg-avatar-sm ${role === 'user' ? 'student' : 'patient'}`;
  avatarSm.textContent = role === 'user' ? '🎓' : '👴';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = role === 'user' ? 'You (Student Doctor)' : 'Robert H. (Patient)';

  const timeSpan = document.createElement('span');
  timeSpan.textContent = currentTime();

  if (role === 'user') {
    meta.append(timeSpan, nameSpan, avatarSm);
  } else {
    meta.append(avatarSm, nameSpan, timeSpan);
  }

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;

  group.append(meta, bubble);
  container.appendChild(group);
  scrollToBottom();
}

// ── Append feedback bubble ─────────────────────────────────
function appendFeedback(text, type) {
  const container = document.getElementById('chatMessages');

  const group = document.createElement('div');
  group.className = 'message-group assistant';

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  meta.innerHTML = '<div class="msg-avatar-sm patient">📋</div><span>Educational Feedback</span><span>' + currentTime() + '</span>';

  const iconMap   = { correct: '✅', partial: '⚡', wrong: '❌' };
  const labelMap  = { correct: 'Diagnosis Correct!', partial: 'Partially Correct', wrong: 'Incorrect Diagnosis' };
  const classMap  = { correct: 'feedback', partial: 'feedback feedback-partial', wrong: 'feedback feedback-wrong' };

  const bubble = document.createElement('div');
  bubble.className = `bubble ${classMap[type]}`;

  const header = document.createElement('div');
  header.className = 'feedback-header';

  const icon = document.createElement('div');
  icon.className = `feedback-icon ${type}`;
  icon.textContent = iconMap[type];

  header.append(icon, document.createTextNode(labelMap[type]));

  const body = document.createElement('div');
  body.className = 'feedback-body';
  body.textContent = text;

  bubble.append(header, body);
  group.append(meta, bubble);
  container.appendChild(group);
  scrollToBottom();
}

// ── System / status message ────────────────────────────────
function appendSystemMsg(text) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'system-msg';
  div.textContent = text;
  container.appendChild(div);
  scrollToBottom();
}

// ── Loading / typing indicator ─────────────────────────────
function setLoading(show) {
  const existing = document.getElementById('typingIndicator');
  if (show) {
    if (existing) return;
    const container = document.getElementById('chatMessages');
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.id = 'typingIndicator';
    el.innerHTML = `
      <div class="msg-avatar-sm patient">👴</div>
      <div class="typing-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>`;
    container.appendChild(el);
    scrollToBottom();
  } else {
    if (existing) existing.remove();
  }
}

// ── Diagnosis panel ────────────────────────────────────────
function showDiagnosisPanel() {
  document.getElementById('diagnosisPanel').classList.add('visible');
  document.getElementById('diagBtn').style.display = 'none';
}

function hideDiagnosisPanel() {
  selectedDiagnosis = '';
  document.getElementById('diagnosisPanel').classList.remove('visible');
  document.getElementById('diagBtn').style.display = '';
  document.querySelectorAll('.diag-option').forEach(o => o.classList.remove('selected'));
  document.getElementById('diagCustomInput').value = '';
}

function selectDiag(el, diagnosis) {
  document.querySelectorAll('.diag-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedDiagnosis = diagnosis;
  document.getElementById('diagCustomInput').value = '';
}

// ── Progress bar ───────────────────────────────────────────
function updateProgress() {
  const pct = Math.min(messageCount * 10, 100);
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('msgCount').textContent = `${messageCount} question${messageCount !== 1 ? 's' : ''}`;

  const labels = [
    [0,  'Gathering history...'],
    [3,  'Good start — keep going!'],
    [6,  'Building a picture...'],
    [8,  'Almost ready to diagnose!'],
    [10, 'Ready to submit diagnosis!'],
  ];
  const label = [...labels].reverse().find(([n]) => messageCount >= n)?.[1] || 'Gathering history...';
  document.getElementById('progressLabel').textContent = label;
}

// ── Welcome card (also used on reset) ─────────────────────
function renderWelcomeCard() {
  const container = document.getElementById('chatMessages');
  const wc = document.createElement('div');
  wc.className = 'welcome-card';
  wc.innerHTML = `
    <div class="welcome-tag">🎓 Training Session</div>
    <h2>Skin Cancer Diagnostic Simulation</h2>
    <p>You are a junior doctor consulting with Robert H., a 58-year-old male who has noticed a concerning skin lesion. Ask questions to gather a complete clinical history and submit your diagnosis when ready.</p>
    <div class="welcome-chips">
      <div class="chip" onclick="sendQuick('Hello Robert, can you tell me what brings you in today?')">👋 Greet patient</div>
      <div class="chip" onclick="sendQuick('Can you describe the skin lesion you noticed?')">🔍 About the lesion</div>
      <div class="chip" onclick="sendQuick('How long have you had this lesion?')">📅 Timeline</div>
      <div class="chip" onclick="sendQuick('Do you have a family history of skin cancer?')">🧬 Family history</div>
      <div class="chip" onclick="sendQuick('How much sun exposure do you typically get?')">☀️ Sun exposure</div>
    </div>`;
  container.appendChild(wc);
}

// ── Input helpers ──────────────────────────────────────────
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ── Utility ────────────────────────────────────────────────
function scrollToBottom() {
  const c = document.getElementById('chatMessages');
  c.scrollTop = c.scrollHeight;
}

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
