// app.js
// 掲示板のフロントエンド処理

const API_BASE_URL = "https://nontextural-unabdicating-natisha.ngrok-free.dev";

// フォーム送信処理
document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const message = document.getElementById("message").value;

  if (!username || !message) {
    alert("名前とメッセージを入力してください");
    return;
  }

  try {
    await submitPost(username, message);
    alert("投稿しました！");
    document.getElementById("postForm").reset();
    loadPosts();
  } catch (error) {
    alert("投稿に失敗しました: " + error.message);
  }
});

// 投稿を送信
async function submitPost(username, message) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        username: username,
        message: message,
        timestamp: new Date().toISOString(),
      }),
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("投稿に失敗しました");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("投稿エラー:", error);
    throw error;
  }
}

// 投稿を読み込み
async function loadPosts() {
  const container = document.getElementById("postsContainer");
  container.innerHTML = '<div class="loading">読み込み中...</div>';

  try {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("投稿の読み込みに失敗しました");
    }

    const posts = await response.json();
    displayPosts(posts);
  } catch (error) {
    console.error("読み込みエラー:", error);
    container.innerHTML = `
      <div class="error">
        <p>❌ エラー: ${error.message}</p>
        <p>サーバーに接続できません</p>
      </div>
    `;
  }
}

// 投稿を表示
function displayPosts(posts) {
  const container = document.getElementById("postsContainer");

  if (posts.length === 0) {
    container.innerHTML = '<div class="no-posts">まだ投稿がありません</div>';
    return;
  }

  container.innerHTML = posts
    .reverse()
    .map(
      (post) => `
    <div class="post">
      <div class="post-header">
        <span class="post-username">${escapeHtml(post.username)}</span>
        <span class="post-time">${new Date(post.timestamp).toLocaleString(
          "ja-JP"
        )}</span>
      </div>
      <div class="post-message">${escapeHtml(post.message)}</div>
    </div>
  `
    )
    .join("");
}

// XSS対策: HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ページ読み込み時に投稿を取得
window.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});
