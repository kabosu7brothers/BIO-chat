// 📦 Supabaseのライブラリを読み込み
import { createClient } from 'https://jsdelivr.net'

// ⚡️ あなたのSupabaseプロジェクトの設定（後述の手順でURLとキーを取得します）
const SUPABASE_URL = 'https://supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5...'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const messagesContainer = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// 画面にメッセージを追加する関数（元のコードのまま）
function addMessage(text, sender) {
  const msgElement = document.createElement('div');
  msgElement.classList.add('message', sender);
  msgElement.textContent = text;
  messagesContainer.appendChild(msgElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ⭕️ 1. メッセージをデータベースに保存する（送信処理）
async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  // Supabaseの「messages」テーブルにデータを挿入
  const { error } = await supabase
    .from('messages')
    .insert([{ text: text, sender: 'user' }]) // 自分を'user'として送信

  if (error) {
    console.error('送信エラー:', error);
  } else {
    userInput.value = '';
  }
}

// ⭕️ 2. 過去のチャット履歴を取得して表示する
async function fetchMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('履歴取得エラー:', error);
    return;
  }

  messagesContainer.innerHTML = ''; // 画面を一度クリア
  data.forEach(msg => {
    addMessage(msg.text, msg.sender);
  });
}

// ⭕️ 3. 新しいメッセージをリアルタイムで受信して画面に反映する
supabase
  .channel('room-1')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
    // 誰かが新しいメッセージをデータベースに入れたら、一瞬で画面に追加
    addMessage(payload.new.text, payload.new.sender);
  })
  .subscribe()

// ボタンやキーのイベント登録
sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

// 最初に対象のページを開いたときに履歴を読み込む
fetchMessages();

