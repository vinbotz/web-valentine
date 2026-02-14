/**
 * Valentine - Galeri, Musik, dan Floating Hearts
 * Bergantung pada: config.js (photos, tracks)
 */

const mainPhoto = document.getElementById("mainPhoto");
const photoCaption = document.getElementById("photoCaption");
const photoMeta = document.getElementById("photoMeta");
const thumbsContainer = document.getElementById("thumbsContainer");

const bgMusic = document.getElementById("bgMusic");
const musicTitle = document.getElementById("musicTitle");
const musicArtist = document.getElementById("musicArtist");
const musicDisc = document.getElementById("musicDisc");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevTrackBtn = document.getElementById("prevTrackBtn");
const nextTrackBtn = document.getElementById("nextTrackBtn");
const volumeSlider = document.getElementById("volumeSlider");
const musicToggleBtn = document.getElementById("musicToggleBtn");

let currentPhotoIndex = 0;
let currentTrackIndex = 0;
let isPlaying = false;
let userHasInteracted = false;
let currentTrackIsYoutube = false;
let galleryAutoSlideInterval = null;
var GALLERY_AUTO_SLIDE_SEC = 4;

// Helper: deteksi & ambil video ID dari link YouTube
// Format yang didukung: https://youtu.be/VIDEO_ID?si=... atau https://www.youtube.com/watch?v=VIDEO_ID
function isYoutubeUrl(src) {
  if (!src || typeof src !== "string") return false;
  var s = src.trim();
  return s.indexOf("youtube.com") !== -1 || s.indexOf("youtu.be") !== -1;
}
function getYoutubeVideoId(src) {
  if (!src || typeof src !== "string") return null;
  var s = src.trim();
  try {
    // Format youtu.be/VIDEO_ID atau youtu.be/VIDEO_ID?si=xxx
    if (s.indexOf("youtu.be/") !== -1) {
      var part = s.split("youtu.be/")[1] || "";
      return part.split("?")[0].split("&")[0].split("/")[0].trim();
    }
    // Format youtube.com/watch?v=VIDEO_ID
    var url = new URL(s);
    return url.searchParams.get("v") || null;
  } catch (e) {
    return null;
  }
}

// ---------- Galeri ----------
function startGalleryAutoSlide() {
  if (galleryAutoSlideInterval) clearInterval(galleryAutoSlideInterval);
  var list = window.photos || photos;
  if (!list || !list.length) return;
  galleryAutoSlideInterval = setInterval(function () {
    var next = (currentPhotoIndex + 1) % list.length;
    setPhoto(next);
  }, GALLERY_AUTO_SLIDE_SEC * 1000);
}

function updateGalleryDotsAndLoading() {
  var list = window.photos || photos;
  if (!list || !list.length) return;
  var dotsEl = document.getElementById("galleryDots");
  var loadingBar = document.getElementById("galleryLoadingBar");
  if (dotsEl) {
    var dots = dotsEl.querySelectorAll(".gallery-dot");
    dots.forEach(function (el, idx) {
      el.classList.toggle("active", idx === currentPhotoIndex);
    });
  }
  if (loadingBar) {
    loadingBar.classList.remove("run");
    void loadingBar.offsetWidth;
    loadingBar.classList.add("run");
  }
}

function renderGallery() {
  const list = window.photos || photos;
  if (!list || !list.length) return;
  thumbsContainer.innerHTML = "";
  var dotsEl = document.getElementById("galleryDots");
  if (dotsEl) {
    dotsEl.innerHTML = "";
    document.documentElement.style.setProperty(
      "--gallery-slide-duration",
      GALLERY_AUTO_SLIDE_SEC + "s",
    );
    list.forEach(function (photo, index) {
      var dot = document.createElement("div");
      dot.className = "gallery-dot" + (index === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Foto " + (index + 1));
      dot.addEventListener("click", function () {
        setPhoto(index);
        startGalleryAutoSlide();
      });
      dotsEl.appendChild(dot);
    });
  }
  list.forEach((photo, index) => {
    const thumb = document.createElement("div");
    thumb.className = "thumb" + (index === 0 ? " active" : "");
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = "Foto " + (index + 1);
    thumb.appendChild(img);
    thumb.addEventListener("click", function () {
      setPhoto(index);
      startGalleryAutoSlide();
    });
    thumbsContainer.appendChild(thumb);
  });
  setPhoto(0);
  var loadingBar = document.getElementById("galleryLoadingBar");
  if (loadingBar) {
    loadingBar.classList.remove("run");
    void loadingBar.offsetWidth;
    loadingBar.classList.add("run");
  }
  startGalleryAutoSlide();
}

function setPhoto(index) {
  const list = window.photos || photos;
  if (!list || !list[index]) return;
  currentPhotoIndex = index;
  const photo = list[index];
  mainPhoto.classList.remove("active");
  setTimeout(() => {
    mainPhoto.src = photo.src;
    mainPhoto.alt = photo.caption || "Foto kita";
    photoCaption.textContent = photo.caption || "";
    photoMeta.textContent = photo.meta || "";
    void mainPhoto.offsetWidth;
    mainPhoto.classList.add("active");
  }, 80);

  const thumbs = document.getElementsByClassName("thumb");
  Array.from(thumbs).forEach((el, idx) => {
    el.classList.toggle("active", idx === index);
  });
  updateGalleryDotsAndLoading();
}

// ---------- Musik ----------
function loadTrack(index) {
  const list = window.tracks || tracks;
  if (!list || !list[index]) return;
  currentTrackIndex = index;
  const track = list[index];
  musicTitle.textContent = track.title || "Lagu";
  musicArtist.textContent = track.artist || "";

  var trackSrc = (track.src || "").trim();
  if (isYoutubeUrl(trackSrc)) {
    currentTrackIsYoutube = true;
    bgMusic.pause();
    bgMusic.removeAttribute("src");
    var videoId = getYoutubeVideoId(trackSrc);
    if (videoId && window.ytPlayer) {
      window.ytPlayer.cueVideoById(videoId);
    } else if (videoId) {
      window.pendingYoutubeVideoId = videoId;
    }
  } else {
    currentTrackIsYoutube = false;
    if (window.ytPlayer && window.ytPlayer.pauseVideo) {
      try {
        window.ytPlayer.pauseVideo();
      } catch (e) {}
    }
    var src = (track.src || "").trim();
    if (src) {
      bgMusic.src = src;
      bgMusic.load();
    } else {
      bgMusic.removeAttribute("src");
    }
  }
}

function playMusic() {
  const list = window.tracks || tracks;
  if (!list || !list.length) return;
  userHasInteracted = true;

  if (currentTrackIsYoutube && window.ytPlayer && window.ytPlayer.playVideo) {
    try {
      window.ytPlayer.playVideo();
      isPlaying = true;
      playPauseBtn.textContent = "⏸";
      musicDisc.classList.add("playing");
      var label = musicToggleBtn.querySelector("span:nth-child(2)");
      if (label) label.textContent = "Pause Musik";
    } catch (e) {
      console.log("YouTube play error:", e);
    }
    return;
  }

  bgMusic
    .play()
    .then(() => {
      isPlaying = true;
      playPauseBtn.textContent = "⏸";
      musicDisc.classList.add("playing");
      var label = musicToggleBtn.querySelector("span:nth-child(2)");
      if (label) label.textContent = "Pause Musik";
    })
    .catch((err) => {
      console.log("Tidak bisa autoplay:", err);
    });
}

function pauseMusic() {
  if (currentTrackIsYoutube && window.ytPlayer && window.ytPlayer.pauseVideo) {
    try {
      window.ytPlayer.pauseVideo();
    } catch (e) {}
  } else {
    bgMusic.pause();
  }
  isPlaying = false;
  playPauseBtn.textContent = "▶";
  musicDisc.classList.remove("playing");
  var label = musicToggleBtn.querySelector("span:nth-child(2)");
  if (label) label.textContent = "Putar Musik";
}

function toggleMusic() {
  const list = window.tracks || tracks;
  if (!userHasInteracted && (!list || !list.length)) return;
  if (isPlaying) pauseMusic();
  else playMusic();
}

function nextTrack() {
  const list = window.tracks || tracks;
  if (!list || !list.length) return;
  currentTrackIndex = (currentTrackIndex + 1) % list.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) playMusic();
}

function prevTrack() {
  const list = window.tracks || tracks;
  if (!list || !list.length) return;
  currentTrackIndex = (currentTrackIndex - 1 + list.length) % list.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) playMusic();
}

// Volume
if (volumeSlider) {
  bgMusic.volume = parseFloat(volumeSlider.value);
  volumeSlider.addEventListener("input", () => {
    var vol = parseFloat(volumeSlider.value);
    bgMusic.volume = vol;
    if (window.ytPlayer && window.ytPlayer.setVolume) {
      try {
        window.ytPlayer.setVolume(Math.round(vol * 100));
      } catch (e) {}
    }
  });
}

// Event listeners musik
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    userHasInteracted = true;
    toggleMusic();
  });
}
if (musicToggleBtn) {
  musicToggleBtn.addEventListener("click", () => {
    userHasInteracted = true;
    toggleMusic();
  });
}
if (nextTrackBtn) {
  nextTrackBtn.addEventListener("click", () => {
    userHasInteracted = true;
    nextTrack();
  });
}
if (prevTrackBtn) {
  prevTrackBtn.addEventListener("click", () => {
    userHasInteracted = true;
    prevTrack();
  });
}
if (bgMusic) {
  bgMusic.addEventListener("ended", nextTrack);
}

// YouTube IFrame API: buat player saat API siap
function onYtStateChange(event) {
  if (event.data === 0) {
    nextTrack();
  }
}
window.onYouTubeIframeAPIReady = function () {
  var videoId = window.pendingYoutubeVideoId || "dQw4w9WgXcQ";
  window.ytPlayer = new YT.Player("yt-player", {
    height: "1",
    width: "1",
    videoId: videoId,
    events: { onStateChange: onYtStateChange },
  });
  window.ytPlayerReady = true;
  if (volumeSlider && window.ytPlayer.setVolume) {
    try {
      window.ytPlayer.setVolume(
        Math.round(parseFloat(volumeSlider.value) * 100),
      );
    } catch (e) {}
  }
  window.pendingYoutubeVideoId = null;
};

// ---------- Scroll ----------
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
window.scrollToSection = scrollToSection;

// ---------- Floating hearts ----------
function createHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";

  const size = Math.random() * 14 + 10;
  heart.style.width = size + "px";
  heart.style.height = size + "px";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.bottom = "-20px";

  const duration = Math.random() * 10 + 14;
  heart.style.animationDuration = duration + "s";
  heart.style.opacity = 0.5 + Math.random() * 0.5;

  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}

setInterval(createHeart, 700);

// ---------- IndexedDB (foto & lagu kapasitas besar), teks dari localStorage ----------
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

// Load data: dulu coba dari file JSON (untuk hosting), lalu IndexedDB/localStorage/config
function loadDataFromStorage() {
  var jsonUrl = "data/valentine-data.json";

  return fetch(jsonUrl)
    .then(function (res) {
      if (res.ok) return res.json();
      throw new Error("no json");
    })
    .then(function (data) {
      if (data && typeof data === "object") {
        window.photos = Array.isArray(data.photos) ? data.photos : (typeof photos !== "undefined" ? photos : []);
        window.tracks = Array.isArray(data.tracks) ? data.tracks : (typeof tracks !== "undefined" ? tracks : []);
        if (data.texts && typeof data.texts === "object") {
          window.texts = data.texts;
          applyTexts();
        }
        if (data.background && typeof data.background === "object") {
          applyBackground(data.background);
        }
        return;
      }
      throw new Error("invalid json");
    })
    .catch(function () {
      // Fallback: IndexedDB / localStorage / config
      var savedTexts = localStorage.getItem("valentine_texts");
      var savedBackground = localStorage.getItem("valentine_background");
      if (savedTexts) {
        try {
          window.texts = JSON.parse(savedTexts);
          applyTexts();
        } catch (e) {}
      }
      if (savedBackground) {
        try {
          applyBackground(JSON.parse(savedBackground));
        } catch (e) {}
      }

      return Promise.all([
        getFromDB("valentine_photos").catch(function () { return undefined; }),
        getFromDB("valentine_tracks").catch(function () { return undefined; }),
      ]).then(function (results) {
        var dbPhotos = results[0];
        var dbTracks = results[1];
        if (dbPhotos && Array.isArray(dbPhotos)) {
          window.photos = dbPhotos;
        } else {
          var savedPhotos = localStorage.getItem("valentine_photos");
          window.photos = savedPhotos
            ? (function () {
                try { return JSON.parse(savedPhotos); } catch (e) { return []; }
              })()
            : typeof photos !== "undefined" ? photos : [];
        }
        if (dbTracks && Array.isArray(dbTracks)) {
          window.tracks = dbTracks;
        } else {
          var savedTracks = localStorage.getItem("valentine_tracks");
          window.tracks = savedTracks
            ? (function () {
                try { return JSON.parse(savedTracks); } catch (e) { return []; }
              })()
            : typeof tracks !== "undefined" ? tracks : [];
        }
      });
    });
}

function applyTexts() {
  if (!window.texts) return;

  const logoEl = document.querySelector(".logo");
  if (logoEl && window.texts.logo) logoEl.textContent = window.texts.logo;

  const tagEl = document.querySelector(".tag span");
  if (tagEl && window.texts.tag) tagEl.textContent = window.texts.tag;

  const h1El = document.querySelector("h1");
  if (h1El && window.texts.titleLine1 && window.texts.titleLine2) {
    h1El.innerHTML = `${window.texts.titleLine1}<br>${window.texts.titleLine2}`;
  }

  const subtitleEl = document.querySelector(".subtitle");
  if (subtitleEl && window.texts.subtitle) {
    subtitleEl.textContent = window.texts.subtitle.replace(/\n/g, " ");
  }

  const footerEl = document.querySelector("footer span");
  if (footerEl && window.texts.footer)
    footerEl.textContent = window.texts.footer;

  // Timeline
  if (window.texts.timeline && window.texts.timeline.length) {
    const timelineEl = document.querySelector(".timeline");
    if (timelineEl) {
      timelineEl.innerHTML = window.texts.timeline
        .map(
          (item) => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h3>${item.title || ""}</h3>
            <p>${item.text || ""}</p>
            <div class="timeline-meta">${item.meta || ""}</div>
          </div>
        </div>
      `,
        )
        .join("");
    }
  }

  // Memories
  if (window.texts.memories && window.texts.memories.length) {
    const memoriesRow = document.querySelector(".memories-row");
    if (memoriesRow) {
      memoriesRow.innerHTML = window.texts.memories
        .map(
          (item) => `
        <div class="memory-card">
          <div class="memory-title">${item.title || ""}</div>
          <p class="memory-text">${item.text || ""}</p>
        </div>
      `,
        )
        .join("");
    }
  }
}

function applyBackground(bg) {
  if (!bg) return;

  const body = document.body;
  if (bg.image) {
    // Gabungkan background image dengan overlay gradient untuk efek love bergerak tetap terlihat
    body.style.backgroundImage = `radial-gradient(circle at top, rgba(255,229,241,0.75) 0%, rgba(255,205,228,0.75) 30%, rgba(245,169,198,0.75) 60%, rgba(240,140,168,0.75) 100%), url(${bg.image})`;
    body.style.backgroundSize = "cover, cover";
    body.style.backgroundPosition = "center, center";
    body.style.backgroundAttachment = "fixed, fixed";
  }

  if (bg.borderColor) {
    document.documentElement.style.setProperty("--accent", bg.borderColor);
    // Update border color untuk thumb active dan elemen lainnya
    let styleEl = document.getElementById("custom-border-style");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "custom-border-style";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .thumb.active {
        border-color: ${bg.borderColor} !important;
        box-shadow: 0 8px 18px ${bg.borderColor}66 !important;
      }
      .timeline-dot {
        background: ${bg.borderColor} !important;
        box-shadow: 0 0 0 5px ${bg.borderColor}4d, 0 8px 15px ${bg.borderColor}66 !important;
      }
      .tag-dot {
        background: ${bg.borderColor} !important;
        box-shadow: 0 0 0 4px ${bg.borderColor}40 !important;
      }
      .nav-btn.primary {
        background: linear-gradient(120deg, ${bg.borderColor}, ${bg.borderColor}dd) !important;
      }
    `;
  }
}

// ---------- Init ----------
window.addEventListener("load", function () {
  loadDataFromStorage().then(function () {
    if (window.photos && window.photos.length) renderGallery();
    if (window.tracks && window.tracks.length) loadTrack(0);
  });
});
