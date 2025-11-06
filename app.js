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
    <div class="post ${post.tampered ? "tampered" : ""}">
      <div class="post-header">
        <span class="post-username">${escapeHtml(post.username)}</span>
        <span class="post-time">${new Date(post.timestamp).toLocaleString(
          "ja-JP"
        )}</span>
        ${
          post.tampered
            ? '<span class="tampered-badge">⚠️ 改ざんされた可能性</span>'
            : ""
        }
      </div>
      <div class="post-message">${escapeHtml(post.message)}</div>
      ${
        post.originalMessage
          ? `
        <details class="original-message">
          <summary>元のメッセージを表示</summary>
          <div class="original-content">${escapeHtml(
            post.originalMessage
          )}</div>
        </details>
      `
          : ""
      }
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

// 改ざんモード設定
async function setTamperMode(mode) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tamper-mode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: mode }),
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("モード変更に失敗しました");
    }

    const data = await response.json();

    const modeNames = {
      none: "改ざんなし",
      replace: "文字置換",
      insert: "広告挿入",
      delete: "一部削除",
    };

    document.getElementById("modeDisplay").textContent = modeNames[mode];
    alert(`改ざんモードを「${modeNames[mode]}」に変更しました`);
  } catch (error) {
    console.error("モード変更エラー:", error);
    alert("モード変更に失敗しました: " + error.message);
  }
}

// ページ読み込み時に投稿を取得
window.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});
