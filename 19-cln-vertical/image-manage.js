/* image-manage.js
   Edit IMAGES below: change "src" (path or URL) and "alt" per slot.
   HTML slot: <img data-img="hero-portrait">
   Video slot: <video data-video="settle"> -> edit VIDEOS below.
   Each video has a fallback image slot in IMAGES (shown if the video is missing/fails).
   Console helpers: listImages(), setImage(name, src, alt)
   Test upload: open index.html?edit and click any image to pick a file. */

const IMAGES = {
  "hero-portrait": { src: "images/hero-portrait.png", alt: "" },
  "manifesto-dancer": { src: "images/manifesto-dancer.png", alt: "" },
  "collage-1": { src: "images/collage-1.jpg", alt: "" },
  "collage-flower": { src: "images/collage-flower.jpg", alt: "" },
  "collage-3": { src: "images/collage-3.jpg", alt: "" },
  "collage-ghost": { src: "images/collage-ghost.jpg", alt: "" },
  "untouched": { src: "images/untouched.jpg", alt: "" },
  "rituals": { src: "images/rituals.jpg", alt: "" },
  "artifact-1": { src: "images/artifact-1.jpg", alt: "" },
  "artifact-2": { src: "images/artifact-2.jpg", alt: "" },
  "artifact-3": { src: "images/artifact-3.jpg", alt: "" },
  "unknown-figure": { src: "images/unknown-figure.jpg", alt: "" },
  "unknown-butterfly": { src: "images/unknown-butterfly.jpg", alt: "" },
  "studio-chat": { src: "images/studio-chat.jpg", alt: "" },
  "modus": { src: "images/modus.jpg", alt: "" },
  "concept": { src: "images/concept.jpg", alt: "" },
  "portfolio-footer": { src: "images/portfolio-footer.png", alt: "" },

  /* video fallbacks */
  "settle-fallback": { src: "images/settle-fallback.jpg", alt: "" },
  "perspective-fallback": { src: "images/perspective-fallback.jpg", alt: "" }
};

const VIDEOS = {
  "settle": "videos/settle.mp4",
  "perspective": "videos/perspective.mp4"
};

function setImage(name, src, alt) {
  const item = IMAGES[name];
  if (!item) return console.warn("Unknown image:", name);
  if (src !== undefined) item.src = src;
  if (alt !== undefined) item.alt = alt;
  document.querySelectorAll(`img[data-img="${name}"]`).forEach(img => {
    img.src = item.src;
    img.alt = item.alt;
  });
}

function applyImages() {
  Object.keys(IMAGES).forEach(name => setImage(name));
}

/* if a video fails to load, hide it so the fallback image underneath shows */
function applyVideos() {
  Object.keys(VIDEOS).forEach(name => {
    document.querySelectorAll(`video[data-video="${name}"]`).forEach(v => {
      v.addEventListener("error", () => { v.style.display = "none"; });
      v.src = VIDEOS[name];
      v.play().catch(() => {});
    });
  });
}

function listImages() {
  console.table(IMAGES);
  return IMAGES;
}

function enableUpload() {
  document.querySelectorAll("img[data-img]").forEach(img => {
    img.style.cursor = "pointer";
    img.title = "Click to replace: " + img.dataset.img;
    img.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const file = input.files[0];
        if (file) setImage(img.dataset.img, URL.createObjectURL(file));
      };
      input.click();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyImages();
  applyVideos();
  if (location.search.includes("edit")) enableUpload();
});
