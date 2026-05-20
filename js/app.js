/* ============================================================
   js/app.js — Application Initialisation
   PRT581 Doctors Training Chatbot
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Auto-focus the message input on load
  document.getElementById('messageInput').focus();

  // If user previously saved a key in sessionStorage, restore it
  const savedKey = sessionStorage.getItem('medtrain_api_key');
  if (savedKey) {
    apiKey = savedKey;
    document.getElementById('apiBanner').style.display = 'none';
  }
});

// Override saveApiKey to also persist to sessionStorage for the tab session
const _originalSaveApiKey = saveApiKey;
function saveApiKey() {
  const input = document.getElementById('apiKeyInput').value.trim();
  if (input.startsWith('sk-ant-') || input.startsWith('sk-')) {
    apiKey = input;
    sessionStorage.setItem('medtrain_api_key', input);
    document.getElementById('apiBanner').style.display = 'none';
    appendSystemMsg('✅ API key saved — live AI responses activated.');
  } else {
    alert('Please enter a valid Anthropic API key (starts with sk-ant-).');
  }
}
