import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase設定
const SUPABASE_URL = 'https://sdorkxwgzdynyjnkmpzi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Mttjc-U-xVtUP9hYBblLdA_jQpHrUUN';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const messagesContainer = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// メッセージ表示
function addMessage(text, sender) {
  const msgElement = document.createElement('div');
  msgElement.classList.add('message', sender);
  msgElement.textContent = text;
  messagesContainer.appendChild(msgElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 送信処理
async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  const { error } = await supabase
    .from('messages')
    .insert([{ text: text, sender: 'user' }]);

  if (error) {
    console.error('送信エラー:', error);
  } else {
    userInput.value = '';
  }
}

// 過去メッセージ取得
async function fetchMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('履歴取得エラー:', error);
    return;
  }

  messagesContainer.innerHTML = '';
  data.forEach(msg => addMessage(msg.text, msg.sender));
}

// リアルタイム購読
supabase
  .channel('room-1')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
    addMessage(payload.new.text, payload.new.sender);
  })
  .subscribe();

// イベント登録
sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSend();
  }
});

// 初期ロード
fetchMessages();

