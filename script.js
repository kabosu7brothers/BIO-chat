const messagesContainer = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function addMessage(text, sender) {
  const msgElement = document.createElement('div');
  msgElement.classList.add('message', sender);
  msgElement.textContent = text;
  messagesContainer.appendChild(msgElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  // ユーザーのメッセージを表示
  addMessage(text, 'user');
  userInput.value = '';

  // 1秒後にボットからの簡易返信を表示
  setTimeout(() => {
    addMessage('「' + text + '」ですね！了解しました。', 'bot');
  }, 1000);
}

sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});
