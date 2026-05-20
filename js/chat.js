/* ============================================================
   js/chat.js — API Communication & Conversation Logic
   PRT581 Doctors Training Chatbot
   ============================================================ */

// ── State ──────────────────────────────────────────────────
let conversation = [];    // Array of {role, content} message objects
let apiKey = '';           // Anthropic API key (user-provided)
let messageCount = 0;     // Number of student messages sent
let sessionActive = true; // Whether session can accept new messages

// ── Demo mode fallback responses (no API key) ──────────────
const DEMO_RESPONSES = [
  "Yes, I've been meaning to come in about this spot on my arm. It's been worrying me for a while now — my wife finally convinced me to get it checked.",
  "It's on my left forearm, about here. It started out small — I thought it was just a freckle — but it's definitely gotten bigger over the past several months.",
  "I'd say about 8 months ago is when I first noticed it. But it's changed a fair bit since then. The colour seems different and the edges look irregular, not like a normal mole.",
  "It itches sometimes, yeah. And once — maybe 6 weeks ago — it bled when I caught it on my sleeve while gardening. That was when I really started to worry.",
  "The colour... it's not just one colour. There's a brown part, but there's also a darker bit — almost black — and recently I noticed a small pinkish area that wasn't there before.",
  "I've been a landscape gardener for over 30 years, so I'm outside all day. To be honest, I didn't really use sunscreen much until a few years ago. I spent a lot of summers up in Queensland too.",
  "My father had melanoma — he was about 65 when he was diagnosed. And I think one of my uncles had something removed from his skin, but I'm not sure what it was.",
  "No, I don't have any other spots that look like this one. This is the only one that's concerned me.",
  "It's probably about... I don't know, maybe a centimetre and a half across? It's grown a fair bit from when I first spotted it.",
  "I haven't had it looked at before, no. I kept putting it off, to be honest. I suppose I was hoping it would just go away on its own.",
];

let demoIndex = 0;

// ── API Key ────────────────────────────────────────────────
function saveApiKey() {
  const input = document.getElementById('apiKeyInput').value.trim();
  if (input.startsWith('sk-ant-') || input.startsWith('sk-')) {
    apiKey = input;
    document.getElementById('apiBanner').style.display = 'none';
    appendSystemMsg('✅ API key saved — live AI responses activated.');
  } else {
    alert('Please enter a valid Anthropic API key (starts with sk-ant-).');
  }
}

// ── Send a message ─────────────────────────────────────────
async function sendMessage() {
  if (!sessionActive) return;

  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  autoResize(input);

  // Add to UI and state
  appendMessage('user', text);
  conversation.push({ role: 'user', content: text });
  messageCount++;
  updateProgress();

  setLoading(true);
  document.getElementById('sendBtn').disabled = true;

  try {
    const response = await getPatientResponse();
    appendMessage('assistant', response);
    conversation.push({ role: 'assistant', content: response });
  } catch (err) {
    appendSystemMsg('⚠️ Could not reach AI service. Check your API key or try demo mode.');
    console.error('API error:', err);
  }

  setLoading(false);
  document.getElementById('sendBtn').disabled = false;
  document.getElementById('messageInput').focus();
}

// ── Quick-send from chips ──────────────────────────────────
async function sendQuick(text) {
  document.getElementById('messageInput').value = text;
  await sendMessage();
}

// ── Get patient AI response ────────────────────────────────
async function getPatientResponse() {
  if (!apiKey) {
    // Demo mode — cycle through preset responses with a short delay
    await delay(700 + Math.random() * 700);
    const resp = DEMO_RESPONSES[demoIndex % DEMO_RESPONSES.length];
    demoIndex++;
    return resp;
  }

  const res = await fetch(CONFIG.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': CONFIG.apiVersion,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      system: SYSTEM_PROMPT,
      messages: conversation,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.content.map(b => b.text || '').join('').trim();
}

// ── Diagnosis submission ───────────────────────────────────
async function submitDiagnosis() {
  const custom = document.getElementById('diagCustomInput').value.trim();
  const diag = custom || selectedDiagnosis;

  if (!diag) {
    alert('Please select a diagnosis or type one in the text box first.');
    return;
  }

  hideDiagnosisPanel();
  sessionActive = false;

  appendMessage('user', `📋 My diagnosis: ${diag}`);
  setLoading(true);

  try {
    const feedback = await getFeedback(diag);
    const type = getDiagType(diag);
    appendFeedback(feedback, type);

    const scoreMap = { correct: 100, partial: 60, wrong: 30 };
    const score = scoreMap[type];
    document.getElementById('scoreBadge').style.display = 'inline-flex';
    document.getElementById('scoreText').textContent = score + '%';
    document.getElementById('diagBtn').style.display = 'none';
  } catch (err) {
    appendSystemMsg('⚠️ Could not generate feedback. Please check your connection.');
    sessionActive = true;
    console.error('Feedback error:', err);
  }

  setLoading(false);
}

// ── Evaluate diagnosis type ────────────────────────────────
function getDiagType(diag) {
  const d = diag.toLowerCase();
  if (d.includes('melanoma')) return 'correct';
  const partialKeywords = ['bcc', 'scc', 'basal', 'squamous', 'actinic', 'carcinoma', 'cancer', 'malignant'];
  if (partialKeywords.some(k => d.includes(k))) return 'partial';
  return 'wrong';
}

// ── Get educational feedback ───────────────────────────────
async function getFeedback(diagnosis) {
  if (!apiKey) {
    await delay(1000 + Math.random() * 500);
    return getDemoFeedback(diagnosis);
  }

  const prompt = FEEDBACK_PROMPT_TEMPLATE.replace('{DIAGNOSIS}', diagnosis);

  const res = await fetch(CONFIG.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': CONFIG.apiVersion,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CONFIG.model,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  return data.content.map(b => b.text || '').join('').trim();
}

// ── Demo feedback responses ────────────────────────────────
function getDemoFeedback(diagnosis) {
  const type = getDiagType(diagnosis);

  if (type === 'correct') {
    return `Correct — Excellent diagnostic reasoning!\n\nRobert's presentation is a textbook melanoma. Let's walk through the ABCDE criteria:\n\nAsymmetry: The lesion is irregular and not symmetrical. Border: Uneven, poorly defined edges — not the smooth border of a benign naevus. Colour: Multiple shades including brown, black, and a new pink/red area, indicating variable melanin production and possible vascularity. Diameter: At 1.5cm it is well above the 6mm warning threshold. Evolution: Active growth and colour change over 8 months, plus new bleeding — all highly significant.\n\nAdditional risk factors here include over 30 years of occupational UV exposure, Fitzpatrick II skin type, and a first-degree family history of melanoma.\n\nManagement: Urgent referral to dermatology for dermoscopy and excisional biopsy with appropriate margins. Do not delay — early melanoma has an excellent prognosis. Outstanding work today, keep building on this clinical pattern recognition.`;
  }

  if (type === 'partial') {
    return `Partially Correct — You identified a skin malignancy, which shows good instinct, but the most likely diagnosis here is Melanoma rather than ${diagnosis}.\n\nKey distinguishing features: The presence of multiple colours (brown, black, and pink) strongly points to melanoma over BCC or SCC. BCC typically presents as a pearly, rolled-border nodule. SCC tends to appear as a scaly, crusted lesion on a background of actinic damage. Neither typically shows the multicolour variation seen here. Additionally, the rapid evolution over 8 months and the family history of melanoma are red flags that should push your differential toward melanoma.\n\nManagement: This patient needs an urgent dermatology referral for dermoscopy and excisional biopsy — do not delay.\n\nGood thinking to consider a malignant diagnosis. Refine your ABCDE pattern recognition and you will nail these cases.`;
  }

  return `Incorrect — ${diagnosis} is not consistent with this presentation.\n\nLet's review why this is concerning for melanoma using the ABCDE criteria: Asymmetry — the lesion is irregular. Border — uneven and poorly defined. Colour — multiple shades of brown, black, and pink, which is highly atypical for benign lesions. Diameter — 1.5cm, well over the 6mm threshold. Evolution — actively growing, changing colour, and has bled.\n\nBenign lesions such as seborrhoeic keratosis or simple naevi do not typically bleed, grow rapidly over months, or display multicolour variation. The combination of all five ABCDE features, plus 30+ years of UV exposure, fair skin, and a father with melanoma, makes this a high-risk presentation.\n\nThis patient needs an urgent dermatology referral today. Remember the ABCDE rule — it exists precisely to catch cases like this. Keep practising and you will develop strong pattern recognition.`;
}

// ── Reset session ──────────────────────────────────────────
function resetSession() {
  if (!confirm('Reset this session? All conversation history will be cleared.')) return;

  conversation = [];
  messageCount = 0;
  demoIndex = 0;
  selectedDiagnosis = '';
  sessionActive = true;

  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('diagnosisPanel').classList.remove('visible');
  document.getElementById('diagBtn').style.display = '';
  document.getElementById('scoreBadge').style.display = 'none';
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('progressLabel').textContent = 'Gathering history...';
  document.getElementById('msgCount').textContent = '0 questions';
  document.querySelectorAll('.diag-option').forEach(o => o.classList.remove('selected'));
  document.getElementById('diagCustomInput').value = '';

  renderWelcomeCard();
}

// ── Helpers ────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
