const STORAGE_KEY = "kikurin-mandala-v1";
let notes = [];
let selectedNode = null;
let activeFilter = "all";

const nodeInfo = {
  core: { label: "佑哉（中心）", desc: "すべての根源。自分という存在の核。", badge: "b-core" },
  vision: { label: "ビジョン・未来", desc: "向かっていく方向と光。未来の設計図。", badge: "b-vision" },
  project: { label: "プロジェクト", desc: "現在進行中の動き・挑戦・仕事。", badge: "b-project" },
  relation: { label: "人間関係", desc: "大切な人たちとのつながり。", badge: "b-relation" },
  daily: { label: "日常の記録", desc: "毎日の出来事・小さな発見。", badge: "b-relation" },
  insight: { label: "気づき・メモ", desc: "ふと気づいたこと・頭に浮かんだこと。", badge: "b-core" },
  past: { label: "過去・経験", desc: "自分を形成してきた出来事と学び。", badge: "b-value" },
  destiny: { label: "宿命・占術", desc: "癸・九紫火星・数秘11。自分の設計図。", badge: "b-value" },
  art: { label: "音楽・写真", desc: "Studio One・Dazz。魂が喜ぶ表現。", badge: "b-sense" },
  sense: { label: "感性・美意識", desc: "美しいと感じる瞬間・エモい体験。", badge: "b-sense" },
  thought: { label: "思考パターン", desc: "自分の思考の癖・ゼロ100・繰り返す回路。", badge: "b-thought" },
  value: { label: "価値観", desc: "大切にしていること・曲げたくない軸。", badge: "b-value" },
  yuki: { label: "祐希ちゃん", desc: "最も大切な存在。豊かな未来の共に。", badge: "b-relation" },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getFilteredNotes() {
  if (activeFilter === "all") {
    return notes;
  }
  return notes.filter((note) => note.cat === activeFilter);
}

function updateSummary(count, total = notes.length) {
  const summary = document.getElementById("logSummary");
  if (!summary) {
    return;
  }

  if (total === 0) {
    summary.textContent = "まだ記録はありません";
    return;
  }

  if (activeFilter === "all") {
    summary.textContent = `${total}件の記録`;
    return;
  }

  const label = nodeInfo[activeFilter]?.label || "このカテゴリ";
  summary.textContent = `${label} ${count}件 / 全${total}件`;
}

function renderDetailNotes(relevant) {
  const detailNotes = document.getElementById("detailNotes");
  if (!detailNotes) {
    return;
  }

  if (relevant.length === 0) {
    detailNotes.innerHTML =
      '<p class="detail-empty">まだ記録がありません。下の入力欄から追加できます。</p>';
    return;
  }

  detailNotes.innerHTML = relevant
    .map(
      (note) => `
        <div class="detail-note">
          <div class="detail-note-head">
            ${note.tag ? `<span class="detail-note-tag"># ${escapeHtml(note.tag)}</span>` : ""}
            <button class="note-delete-btn" type="button" onclick="deleteNote(${note.id})" aria-label="この記録を削除">削除</button>
          </div>
          <div class="detail-note-body">${escapeHtml(note.note).replaceAll("\n", "<br />")}</div>
          <div class="detail-note-date">${escapeHtml(note.date)}</div>
        </div>
      `
    )
    .join("");
}

function selectNode(id) {
  selectedNode = id;
  const info = nodeInfo[id];
  if (!info) {
    return;
  }

  document.getElementById("detailTitle").textContent = info.label;
  document.getElementById("detailDesc").textContent = info.desc;
  document.getElementById("catSelect").value = id;

  const relevant = notes.filter((note) => note.cat === id);
  renderDetailNotes(relevant);

  document.getElementById("detailBox").classList.add("visible");
  document.getElementById("detailBox").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function addNote() {
  const cat = document.getElementById("catSelect").value;
  const tag = document.getElementById("tagInput").value.trim();
  const note = document.getElementById("noteInput").value.trim();
  if (!note) {
    return;
  }

  const now = new Date();
  const date = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}  ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  notes.unshift({ id: Date.now(), cat, tag, note, date });
  save();
  render();
  document.getElementById("noteInput").value = "";
  document.getElementById("tagInput").value = "";
  if (selectedNode === cat) {
    selectNode(cat);
  }
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  save();
  render();

  if (selectedNode) {
    selectNode(selectedNode);
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    // localStorage unavailable
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    notes = raw ? JSON.parse(raw) : [];
  } catch (error) {
    notes = [];
  }
  render();
}

function render() {
  const logList = document.getElementById("logList");
  const visibleNotes = getFilteredNotes();
  updateSummary(visibleNotes.length);

  if (visibleNotes.length === 0) {
    logList.innerHTML =
      notes.length === 0
        ? '<p class="log-empty">まだ記録がありません</p>'
        : '<p class="log-empty">このカテゴリにはまだ記録がありません</p>';
    return;
  }

  logList.innerHTML = visibleNotes
    .map((note) => {
      const info = nodeInfo[note.cat] || nodeInfo.core;
      return `
        <article class="log-card">
          <div class="log-top">
            <button class="log-badge ${info.badge}" type="button" onclick="focusCategory('${note.cat}')">${escapeHtml(info.label)}</button>
            ${note.tag ? `<span class="log-tag"># ${escapeHtml(note.tag)}</span>` : ""}
            <span class="log-date">${escapeHtml(note.date)}</span>
          </div>
          <div class="log-text">${escapeHtml(note.note).replaceAll("\n", "<br />")}</div>
          <div class="log-actions">
            <button class="log-action-btn" type="button" onclick="focusCategory('${note.cat}')">この領域を見る</button>
            <button class="log-action-btn log-action-btn-danger" type="button" onclick="deleteNote(${note.id})">削除</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function focusCategory(id) {
  const filter = document.getElementById("logFilter");
  activeFilter = id;
  if (filter) {
    filter.value = id;
  }
  render();
  selectNode(id);
}

function handleFilterChange(event) {
  activeFilter = event.target.value;
  render();
}

function handleNoteShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    addNote();
  }
}

function bindEvents() {
  const filter = document.getElementById("logFilter");
  const noteInput = document.getElementById("noteInput");

  if (filter) {
    filter.addEventListener("change", handleFilterChange);
  }

  if (noteInput) {
    noteInput.addEventListener("keydown", handleNoteShortcut);
  }
}

window.selectNode = selectNode;
window.addNote = addNote;
window.deleteNote = deleteNote;
window.focusCategory = focusCategory;

bindEvents();
load();
