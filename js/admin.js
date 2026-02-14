/**
 * Admin Panel - Handle form, localStorage, IndexedDB
 * Foto & lagu disimpan di IndexedDB (kapasitas besar), teks di localStorage
 */

var VALENTINE_DB = "ValentineDB";
var VALENTINE_STORE = "valentine";

function openValentineDB() {
  return new Promise(function (resolve, reject) {
    var r = indexedDB.open(VALENTINE_DB, 1);
    r.onerror = function () {
      reject(r.error);
    };
    r.onsuccess = function () {
      resolve(r.result);
    };
    r.onupgradeneeded = function (e) {
      if (!e.target.result.objectStoreNames.contains(VALENTINE_STORE)) {
        e.target.result.createObjectStore(VALENTINE_STORE);
      }
    };
  });
}

function getFromDB(key) {
  return openValentineDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var t = db.transaction(VALENTINE_STORE, "readonly");
      var req = t.objectStore(VALENTINE_STORE).get(key);
      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
  });
}

function setInDB(key, value) {
  return openValentineDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var t = db.transaction(VALENTINE_STORE, "readwrite");
      var req = t.objectStore(VALENTINE_STORE).put(value, key);
      req.onsuccess = function () {
        resolve();
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
  });
}

function removeFromDB(key) {
  return openValentineDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var t = db.transaction(VALENTINE_STORE, "readwrite");
      var req = t.objectStore(VALENTINE_STORE).delete(key);
      req.onsuccess = function () {
        resolve();
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
  });
}

// Load data: foto & lagu dari IndexedDB (kapasitas besar), teks dari localStorage
function loadData() {
  var savedTexts = localStorage.getItem("valentine_texts");
  var savedBackground = localStorage.getItem("valentine_background");

  // Load texts (kecil, tetap localStorage)
  if (savedTexts) {
    window.adminTexts = JSON.parse(savedTexts);
  } else {
    window.adminTexts = {
      logo: "Our Valentine Story",
      tag: "Untuk kamu, cinta terbaikku",
      titleLine1: "Happy Valentine,",
      titleLine2: "my favorite human.",
      subtitle:
        "Ini adalah halaman kecil tempat semua momen, tawa, dan cerita kita disimpan.\nSetiap foto, setiap lagu, aku pilih karena mengingatkanku sama kamu. 💗",
      timeline: [
        {
          title: "Hari pertama kita saling jatuh hati",
          text: '"Kayaknya aku suka sama kamu."',
          meta: "Tanggal spesial kita",
        },
        {
          title: "Semua hari setelahnya",
          text: "Kita mungkin nggak selalu sempurna, tapi aku selalu bersyukur karena bisa jatuh cinta ke orang yang sama setiap hari.",
          meta: "Terima kasih sudah tetap tinggal.",
        },
      ],
      memories: [
        {
          title: "Malam kita ngobrol tanpa sadar waktu",
          text: "Entah kenapa, tiap ngobrol sama kamu, jam selalu terasa iri. Tiba-tiba sudah larut, tapi rasanya belum siap bilang selamat malam.",
        },
        {
          title: "Saat kamu ketawa sampai matamu menghilang",
          text: "Itu favoritku. Di momen itu, dunia rasanya mengecil, menyisakan cuma kamu, tawa kamu, dan rasa syukur karena kamu ada di sini.",
        },
        {
          title: "Hari-hari biasa yang tiba-tiba jadi spesial",
          text: "Kadang kita cuma texting, kadang cuma ketemu sebentar. Tapi entah kenapa, selama ada kamu, hari biasa pun terasa seperti hari istimewa.",
        },
      ],
      footer:
        "💗 Dibuat khusus untuk kamu. Kalau halaman ini terbuka, artinya aku sedang memikirkanmu.",
    };
  }

  // Load background
  if (savedBackground) {
    window.adminBackground = JSON.parse(savedBackground);
  } else {
    window.adminBackground = {
      image: null,
      borderColor: "#ff4b8b",
    };
  }

  // Default dulu (nanti ditimpa oleh loadDataAsync)
  window.adminPhotos = typeof photos !== "undefined" ? [...photos] : [];
  window.adminTracks = typeof tracks !== "undefined" ? [...tracks] : [];
}

// Load foto & lagu dari IndexedDB (atau fallback localStorage) — kapasitas besar
function loadDataAsync() {
  return Promise.all([
    getFromDB("valentine_photos").catch(function () {
      return undefined;
    }),
    getFromDB("valentine_tracks").catch(function () {
      return undefined;
    }),
  ]).then(function (results) {
    var dbPhotos = results[0];
    var dbTracks = results[1];
    if (dbPhotos && Array.isArray(dbPhotos) && dbPhotos.length >= 0) {
      window.adminPhotos = dbPhotos;
    } else {
      var savedPhotos = localStorage.getItem("valentine_photos");
      if (savedPhotos) {
        try {
          window.adminPhotos = JSON.parse(savedPhotos);
        } catch (e) {}
      }
    }
    if (dbTracks && Array.isArray(dbTracks) && dbTracks.length >= 0) {
      window.adminTracks = dbTracks;
    } else {
      var savedTracks = localStorage.getItem("valentine_tracks");
      if (savedTracks) {
        try {
          window.adminTracks = JSON.parse(savedTracks);
        } catch (e) {}
      }
    }
  });
}

// Tab Navigation
function showTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.getElementById(`tab-${tabName}`).classList.add("active");
  event.target.classList.add("active");
}

// ========== PHOTOS ==========
function renderPhotos() {
  const container = document.getElementById("photos-list");
  container.innerHTML = "";

  window.adminPhotos.forEach((photo, index) => {
    const card = document.createElement("div");
    card.className = "item-card photo-card";
    card.innerHTML = `
      <div class="item-card-header">
        <h4>Foto ${index + 1}</h4>
        <div class="item-card-actions">
          <button class="btn-icon move" onclick="movePhoto(${index}, 'up')" ${index === 0 ? "disabled" : ""}>⬆️</button>
          <button class="btn-icon move" onclick="movePhoto(${index}, 'down')" ${index === window.adminPhotos.length - 1 ? "disabled" : ""}>⬇️</button>
          <button class="btn-icon delete" onclick="deletePhoto(${index})">🗑️</button>
        </div>
      </div>
      <div class="form-group">
        <label>URL Foto</label>
        <input type="url" value="${photo.src || ""}" onchange="updatePhoto(${index}, 'src', this.value)" placeholder="https://..." />
        <input type="file" accept="image/*" onchange="uploadPhoto(${index}, this)" style="margin-top: 0.5rem;" />
      </div>
      <div class="form-group">
        <label>Caption</label>
        <input type="text" value="${photo.caption || ""}" onchange="updatePhoto(${index}, 'caption', this.value)" />
      </div>
      <div class="form-group">
        <label>Meta Text</label>
        <input type="text" value="${photo.meta || ""}" onchange="updatePhoto(${index}, 'meta', this.value)" />
      </div>
      ${photo.src ? `<img src="${photo.src}" class="photo-preview" />` : ""}
    `;
    container.appendChild(card);
  });
}

function addPhoto() {
  window.adminPhotos.push({
    src: "",
    caption: "",
    meta: "",
  });
  renderPhotos();
}

function updatePhoto(index, field, value) {
  window.adminPhotos[index][field] = value;
  if (field === "src" && value) {
    renderPhotos();
  }
}

function deletePhoto(index) {
  if (confirm("Hapus foto ini?")) {
    window.adminPhotos.splice(index, 1);
    renderPhotos();
  }
}

function movePhoto(index, direction) {
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex >= 0 && newIndex < window.adminPhotos.length) {
    [window.adminPhotos[index], window.adminPhotos[newIndex]] = [
      window.adminPhotos[newIndex],
      window.adminPhotos[index],
    ];
    renderPhotos();
  }
}

function uploadPhoto(index, input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      window.adminPhotos[index].src = e.target.result;
      renderPhotos();
    };
    reader.readAsDataURL(file);
  }
}

// ========== BACKGROUND ==========
function previewBackground(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      window.adminBackground.image = e.target.result;
      const preview = document.getElementById("bg-preview");
      preview.src = e.target.result;
      preview.style.display = "block";
      document.querySelector(
        "#bg-upload-area .upload-placeholder",
      ).style.display = "none";
    };
    reader.readAsDataURL(file);
  }
}

document
  .getElementById("border-color")
  .addEventListener("change", function (e) {
    window.adminBackground.borderColor = e.target.value;
  });

// ========== TRACKS ==========
function isYoutubeUrl(src) {
  if (!src || typeof src !== "string") return false;
  var s = src.trim();
  return s.indexOf("youtube.com") !== -1 || s.indexOf("youtu.be") !== -1;
}

function renderTracks() {
  const container = document.getElementById("tracks-list");
  container.innerHTML = "";

  window.adminTracks.forEach((track, index) => {
    const card = document.createElement("div");
    card.className = "item-card track-card";
    card.innerHTML = `
      <div class="item-card-header">
        <h4>Lagu ${index + 1}</h4>
        <div class="item-card-actions">
          <button class="btn-icon move" onclick="moveTrack(${index}, 'up')" ${index === 0 ? "disabled" : ""}>⬆️</button>
          <button class="btn-icon move" onclick="moveTrack(${index}, 'down')" ${index === window.adminTracks.length - 1 ? "disabled" : ""}>⬇️</button>
          <button class="btn-icon delete" onclick="deleteTrack(${index})">🗑️</button>
        </div>
      </div>
      <div class="form-group">
        <label>Judul Lagu</label>
        <input type="text" value="${track.title || ""}" onchange="updateTrack(${index}, 'title', this.value)" />
      </div>
      <div class="form-group">
        <label>Artis</label>
        <input type="text" value="${track.artist || ""}" onchange="updateTrack(${index}, 'artist', this.value)" />
      </div>
      <div class="form-group">
        <label>URL File Musik atau Link YouTube</label>
        <input type="text" class="track-src-input" data-index="${index}" value="${track.src && track.src.indexOf("data:") === 0 ? "" : (track.src || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}" onchange="updateTrack(${index}, 'src', this.value)" placeholder="${track.src && track.src.indexOf("data:") === 0 ? "✓ File terunggah (kosongkan untuk ganti link)" : "https://...mp3 atau https://youtu.be/VIDEO_ID"}" />
        <input type="file" accept="audio/mp3,audio/mpeg,audio/*,.mp3" onchange="uploadTrack(${index}, this)" style="margin-top: 0.5rem;" />
        <small class="form-help-inline">Upload file MP3 dari HP atau isi link YouTube. Setelah upload, klik <strong>Simpan Semua</strong>.</small>
      </div>
      ${track.src ? (isYoutubeUrl(track.src) ? `<div class="track-preview-youtube"><span class="badge-yt">🔗 Link YouTube</span> <a href="${(track.src + "").trim().replace(/"/g, "")}" target="_blank" rel="noopener">Buka di YouTube</a></div>` : `<div class="track-preview-audio"><span class="badge-upload">✓ Lagu dari file</span><audio controls src="${(track.src + "").trim().replace(/"/g, "")}" style="width: 100%; margin-top: 0.5rem;"></audio></div>`) : ""}
    `;
    container.appendChild(card);
  });
}

function addTrack() {
  window.adminTracks.push({
    title: "",
    artist: "",
    src: "",
  });
  renderTracks();
}

function updateTrack(index, field, value) {
  window.adminTracks[index][field] = value;
  if (field === "src" && value) {
    renderTracks();
  }
}

function deleteTrack(index) {
  if (confirm("Hapus lagu ini?")) {
    window.adminTracks.splice(index, 1);
    renderTracks();
  }
}

function moveTrack(index, direction) {
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex >= 0 && newIndex < window.adminTracks.length) {
    [window.adminTracks[index], window.adminTracks[newIndex]] = [
      window.adminTracks[newIndex],
      window.adminTracks[index],
    ];
    renderTracks();
  }
}

function uploadTrack(index, input) {
  var file = input.files[0];
  if (!file) return;
  var sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  if (file.size > 4 * 1024 * 1024) {
    if (
      !confirm(
        "File cukup besar (" +
          sizeMB +
          " MB). Di HP penyimpanan mungkin terbatas dan bisa gagal. Lanjutkan?",
      )
    ) {
      input.value = "";
      return;
    }
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    window.adminTracks[index].src = e.target.result;
    if (!window.adminTracks[index].title)
      window.adminTracks[index].title = (file.name || "Lagu").replace(
        /\.(mp3|m4a|wav)$/i,
        "",
      );
    renderTracks();
    var msg = document.createElement("div");
    msg.className = "upload-ok-msg";
    msg.textContent =
      '✓ File siap. Klik "Simpan Semua" agar lagu tersimpan dan bisa diputar di index.';
    var formGroup = input.closest(".form-group");
    if (formGroup) {
      var oldMsg = formGroup.querySelector(".upload-ok-msg");
      if (oldMsg) oldMsg.remove();
      formGroup.appendChild(msg);
      setTimeout(function () {
        if (msg.parentNode) msg.remove();
      }, 6000);
    }
  };
  reader.onerror = function () {
    alert("Gagal membaca file. Coba file lain atau format MP3.");
  };
  reader.readAsDataURL(file);
  input.value = "";
}

// ========== TEXTS ==========
function renderTexts() {
  document.getElementById("logo-text").value = window.adminTexts.logo || "";
  document.getElementById("tag-text").value = window.adminTexts.tag || "";
  document.getElementById("title-line1").value =
    window.adminTexts.titleLine1 || "";
  document.getElementById("title-line2").value =
    window.adminTexts.titleLine2 || "";
  document.getElementById("subtitle").value = window.adminTexts.subtitle || "";
  document.getElementById("footer-text").value = window.adminTexts.footer || "";

  // Timeline
  renderTimeline();
  // Memories
  renderMemories();
}

function renderTimeline() {
  const container = document.getElementById("timeline-items");
  container.innerHTML = "";

  window.adminTexts.timeline.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-card-header">
        <h4>Timeline ${index + 1}</h4>
        <div class="item-card-actions">
          <button class="btn-icon move" onclick="moveTimeline(${index}, 'up')" ${index === 0 ? "disabled" : ""}>⬆️</button>
          <button class="btn-icon move" onclick="moveTimeline(${index}, 'down')" ${index === window.adminTexts.timeline.length - 1 ? "disabled" : ""}>⬇️</button>
          <button class="btn-icon delete" onclick="deleteTimeline(${index})">🗑️</button>
        </div>
      </div>
      <div class="form-group">
        <label>Judul</label>
        <input type="text" value="${item.title || ""}" onchange="updateTimeline(${index}, 'title', this.value)" />
      </div>
      <div class="form-group">
        <label>Text</label>
        <textarea rows="2" onchange="updateTimeline(${index}, 'text', this.value)">${item.text || ""}</textarea>
      </div>
      <div class="form-group">
        <label>Meta</label>
        <input type="text" value="${item.meta || ""}" onchange="updateTimeline(${index}, 'meta', this.value)" />
      </div>
    `;
    container.appendChild(card);
  });
}

function addTimelineItem() {
  window.adminTexts.timeline.push({
    title: "",
    text: "",
    meta: "",
  });
  renderTimeline();
}

function updateTimeline(index, field, value) {
  window.adminTexts.timeline[index][field] = value;
}

function deleteTimeline(index) {
  if (confirm("Hapus timeline ini?")) {
    window.adminTexts.timeline.splice(index, 1);
    renderTimeline();
  }
}

function moveTimeline(index, direction) {
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex >= 0 && newIndex < window.adminTexts.timeline.length) {
    [window.adminTexts.timeline[index], window.adminTexts.timeline[newIndex]] =
      [window.adminTexts.timeline[newIndex], window.adminTexts.timeline[index]];
    renderTimeline();
  }
}

function renderMemories() {
  const container = document.getElementById("memories-items");
  container.innerHTML = "";

  window.adminTexts.memories.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-card-header">
        <h4>Memory Card ${index + 1}</h4>
        <div class="item-card-actions">
          <button class="btn-icon move" onclick="moveMemory(${index}, 'up')" ${index === 0 ? "disabled" : ""}>⬆️</button>
          <button class="btn-icon move" onclick="moveMemory(${index}, 'down')" ${index === window.adminTexts.memories.length - 1 ? "disabled" : ""}>⬇️</button>
          <button class="btn-icon delete" onclick="deleteMemory(${index})">🗑️</button>
        </div>
      </div>
      <div class="form-group">
        <label>Judul</label>
        <input type="text" value="${item.title || ""}" onchange="updateMemory(${index}, 'title', this.value)" />
      </div>
      <div class="form-group">
        <label>Text</label>
        <textarea rows="3" onchange="updateMemory(${index}, 'text', this.value)">${item.text || ""}</textarea>
      </div>
    `;
    container.appendChild(card);
  });
}

function addMemoryCard() {
  window.adminTexts.memories.push({
    title: "",
    text: "",
  });
  renderMemories();
}

function updateMemory(index, field, value) {
  window.adminTexts.memories[index][field] = value;
}

function deleteMemory(index) {
  if (confirm("Hapus memory card ini?")) {
    window.adminTexts.memories.splice(index, 1);
    renderMemories();
  }
}

function moveMemory(index, direction) {
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex >= 0 && newIndex < window.adminTexts.memories.length) {
    [window.adminTexts.memories[index], window.adminTexts.memories[newIndex]] =
      [window.adminTexts.memories[newIndex], window.adminTexts.memories[index]];
    renderMemories();
  }
}

// Event listeners untuk text fields
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("logo-text").addEventListener("input", function () {
    window.adminTexts.logo = this.value;
  });
  document.getElementById("tag-text").addEventListener("input", function () {
    window.adminTexts.tag = this.value;
  });
  document.getElementById("title-line1").addEventListener("input", function () {
    window.adminTexts.titleLine1 = this.value;
  });
  document.getElementById("title-line2").addEventListener("input", function () {
    window.adminTexts.titleLine2 = this.value;
  });
  document.getElementById("subtitle").addEventListener("input", function () {
    window.adminTexts.subtitle = this.value;
  });
  document.getElementById("footer-text").addEventListener("input", function () {
    window.adminTexts.footer = this.value;
  });
});

// ========== SAVE & RESET ==========
// Baca nilai terbaru dari form ke data (supaya tidak ada yang "belum blur" saat Simpan)
function syncFormToData() {
  // Foto galeri: urutan input = URL (url/text), Caption (text), Meta (text)
  var photoCards = document.querySelectorAll("#photos-list .photo-card");
  photoCards.forEach(function (card, index) {
    var inputs = card.querySelectorAll('.form-group input:not([type="file"])');
    if (window.adminPhotos[index] && inputs.length >= 3) {
      window.adminPhotos[index].src = (inputs[0].value || "").trim();
      window.adminPhotos[index].caption = (inputs[1].value || "").trim();
      window.adminPhotos[index].meta = (inputs[2].value || "").trim();
    }
  });

  // Lagu (jika src dari upload/file, jangan timpa dengan input kosong)
  var trackCards = document.querySelectorAll("#tracks-list .track-card");
  trackCards.forEach(function (card, index) {
    var inputs = card.querySelectorAll('.form-group input[type="text"]');
    if (window.adminTracks[index] && inputs.length >= 3) {
      window.adminTracks[index].title = (inputs[0].value || "").trim();
      window.adminTracks[index].artist = (inputs[1].value || "").trim();
      var srcVal = (inputs[2].value || "").trim();
      if (srcVal) {
        window.adminTracks[index].src = srcVal;
      } else if (
        window.adminTracks[index].src &&
        window.adminTracks[index].src.indexOf("data:") === 0
      ) {
        // Tetap pakai file yang sudah di-upload (base64), jangan ganti jadi kosong
      }
      // kalau srcVal kosong dan bukan data URL, src tetap bisa kosong
    }
  });

  // Teks (header, hero, footer)
  var logoEl = document.getElementById("logo-text");
  var tagEl = document.getElementById("tag-text");
  var title1El = document.getElementById("title-line1");
  var title2El = document.getElementById("title-line2");
  var subtitleEl = document.getElementById("subtitle");
  var footerEl = document.getElementById("footer-text");
  if (logoEl) window.adminTexts.logo = (logoEl.value || "").trim();
  if (tagEl) window.adminTexts.tag = (tagEl.value || "").trim();
  if (title1El) window.adminTexts.titleLine1 = (title1El.value || "").trim();
  if (title2El) window.adminTexts.titleLine2 = (title2El.value || "").trim();
  if (subtitleEl) window.adminTexts.subtitle = (subtitleEl.value || "").trim();
  if (footerEl) window.adminTexts.footer = (footerEl.value || "").trim();

  // Timeline
  var timelineCards = document.querySelectorAll("#timeline-items .item-card");
  timelineCards.forEach(function (card, index) {
    var inputs = card.querySelectorAll('input[type="text"]');
    var textarea = card.querySelector("textarea");
    if (window.adminTexts.timeline[index]) {
      window.adminTexts.timeline[index].title = inputs[0]
        ? (inputs[0].value || "").trim()
        : "";
      window.adminTexts.timeline[index].text = textarea
        ? (textarea.value || "").trim()
        : "";
      window.adminTexts.timeline[index].meta = inputs[1]
        ? (inputs[1].value || "").trim()
        : "";
    }
  });

  // Memories
  var memoryCards = document.querySelectorAll("#memories-items .item-card");
  memoryCards.forEach(function (card, index) {
    var titleInput = card.querySelector('input[type="text"]');
    var textarea = card.querySelector("textarea");
    if (window.adminTexts.memories[index]) {
      window.adminTexts.memories[index].title = titleInput
        ? (titleInput.value || "").trim()
        : "";
      window.adminTexts.memories[index].text = textarea
        ? (textarea.value || "").trim()
        : "";
    }
  });

  // Background border color
  var borderColorEl = document.getElementById("border-color");
  if (borderColorEl)
    window.adminBackground.borderColor = borderColorEl.value || "#ff4b8b";
}

// ---------- Export / Import (supaya data HP bisa dipindah ke laptop atau sebaliknya) ----------
function exportData() {
  syncFormToData();
  var data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    photos: window.adminPhotos,
    tracks: window.adminTracks,
    texts: window.adminTexts,
    background: window.adminBackground
  };
  var blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "valentine-data-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
  alert("✅ Data berhasil di-export. Kirim file ini ke laptop/HP lain, lalu gunakan \"Import Data\" di sana.");
}

function importData(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function() {
    try {
      var data = JSON.parse(reader.result);
      if (!Array.isArray(data.photos)) data.photos = [];
      if (!Array.isArray(data.tracks)) data.tracks = [];
      if (!data.texts || typeof data.texts !== "object") data.texts = window.adminTexts || {};
      if (!data.background || typeof data.background !== "object") data.background = { image: null, borderColor: "#ff4b8b" };
      setInDB("valentine_photos", data.photos).then(function() {
        return setInDB("valentine_tracks", data.tracks);
      }).then(function() {
        localStorage.setItem("valentine_texts", JSON.stringify(data.texts));
        localStorage.setItem("valentine_background", JSON.stringify(data.background));
        alert("✅ Data berhasil di-import. Halaman akan di-refresh.");
        window.location.reload();
      }).catch(function(e) {
        alert("❌ Gagal import: " + (e.message || e));
      });
    } catch (e) {
      alert("❌ File tidak valid (bukan JSON yang benar).");
    }
    input.value = "";
  };
  reader.readAsText(file);
}

function saveAll() {
  syncFormToData();
  try {
    localStorage.setItem("valentine_texts", JSON.stringify(window.adminTexts));
    localStorage.setItem(
      "valentine_background",
      JSON.stringify(window.adminBackground),
    );
  } catch (e) {
    alert("❌ Gagal menyimpan teks: " + (e.message || e));
    return;
  }
  setInDB("valentine_photos", window.adminPhotos)
    .then(function () {
      return setInDB("valentine_tracks", window.adminTracks);
    })
    .then(function () {
      alert(
        "✅ Semua perubahan berhasil disimpan! Buka/refresh halaman index untuk mendengar lagu.",
      );
    })
    .catch(function (e) {
      if (e.name === "QuotaExceededError" || e.code === 22) {
        alert(
          "❌ Penyimpanan penuh. Coba hapus beberapa lagu/foto yang tidak dipakai.",
        );
      } else {
        alert("❌ Gagal menyimpan foto/lagu: " + (e.message || e));
      }
    });
}

function resetAll() {
  if (
    confirm("Yakin ingin reset semua ke default? Semua perubahan akan hilang.")
  ) {
    localStorage.removeItem("valentine_texts");
    localStorage.removeItem("valentine_background");
    localStorage.removeItem("valentine_photos");
    localStorage.removeItem("valentine_tracks");
    removeFromDB("valentine_photos").catch(function () {});
    removeFromDB("valentine_tracks").catch(function () {});
    loadData();
    loadDataAsync().then(function () {
      renderPhotos();
      renderTracks();
      renderTexts();
      alert(
        "✅ Data direset ke default. Refresh halaman untuk melihat perubahan.",
      );
    });
  }
}

// Init: load teks dulu, lalu foto & lagu dari IndexedDB (bisa file besar)
loadData();
loadDataAsync().then(function () {
  renderPhotos();
  renderTracks();
  renderTexts();
  if (window.adminBackground.image) {
    var preview = document.getElementById("bg-preview");
    if (preview) {
      preview.src = window.adminBackground.image;
      preview.style.display = "block";
      var ph = document.querySelector("#bg-upload-area .upload-placeholder");
      if (ph) ph.style.display = "none";
    }
  }
  var borderEl = document.getElementById("border-color");
  if (borderEl)
    borderEl.value = window.adminBackground.borderColor || "#ff4b8b";
});
