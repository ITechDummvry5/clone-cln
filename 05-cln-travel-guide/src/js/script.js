/* ------------------------------------------------------------------
   Edit this array to match your own images and copy.
   Each "image" should point at a file in assets/img/.
------------------------------------------------------------------- */
const slides = [
  {
    image: "assets/img/img_1.png",
    place: "Tarifa · Spain",
    title: "Los Lances Beach",
    desc: "A wide stretch of sand where the Atlantic wind never sits still — come for the kitesurfing, stay for the slow sunsets."
  },
  {
    image: "assets/img/img_2.png",
    place: "Cappadocia · Turkey",
    title: "Göreme Valley",
    desc: "Sunrise balloons drift over honeycombed rock chimneys carved by centuries of wind and rain."
  },
  {
    image: "assets/img/img_3.png",
    place: "Switzerland · Alps",
    title: "Saint Antönien",
    desc: "A quiet alpine village where the trail starts at your doorstep and the air smells like pine and snowmelt."
  },
  {
    image: "assets/img/img_4.png",
    place: "Nagano · Japan",
    title: "Japan Alps Prefecture",
    desc: "Cedar forests, onsen towns, and ridgelines that disappear into cloud — Japan's mountains, unhurried."
  },
  {
    image: "assets/img/img_5.png",
    place: "Faroe Islands · Denmark",
    title: "Sørvágsvatn Lake",
    desc: "A lake that appears to float above the ocean, framed by cliffs that drop straight into the Atlantic."
  }
];

const bgStack      = document.getElementById("bgStack");
const cardTrack     = document.getElementById("cardTrack");
const heroContent   = document.getElementById("heroContent");
const slidePlace    = document.getElementById("slidePlace");
const slideTitle    = document.getElementById("slideTitle");
const slideDesc     = document.getElementById("slideDesc");
const progressFill  = document.getElementById("progressFill");
const arrowLeft     = document.getElementById("arrowLeft");
const arrowRight    = document.getElementById("arrowRight");

let activeIndex = 0;

/* ---------- Build cards ---------- */

function renderCards(){
  cardTrack.innerHTML = "";
  slides.forEach((slide, i) => {
    const card = document.createElement("button");
    card.className = "card" + (i === activeIndex ? " is-active" : "");
    card.style.backgroundImage = `url('${slide.image}')`;
    card.setAttribute("aria-label", `${slide.title}, ${slide.place}`);
    card.innerHTML = `
      <span class="card__label">
        <span class="card__place">${slide.place}</span>
        <span class="card__title">${slide.title}</span>
      </span>
    `;
    card.addEventListener("click", () => goTo(i));
    cardTrack.appendChild(card);
  });
}

/* ---------- Background: zoom-in-from-bottom-center transition ---------- */

function pushBackground(image){
  const layer = document.createElement("div");
  layer.className = "bg-layer";
  layer.style.backgroundImage = `url('${image}')`;
  bgStack.appendChild(layer);

  // Force a reflow so the animation class re-triggers reliably,
  // then kick off the zoom-in.
  void layer.offsetWidth;
  layer.classList.add("is-entering");

  // House-keeping: once the new layer has finished animating in,
  // drop any older layers underneath it so the DOM doesn't grow forever.
  layer.addEventListener("animationend", () => {
    [...bgStack.children].forEach(child => {
      if (child !== layer) child.remove();
    });
  }, { once: true });
}

/* ---------- Text content swap ---------- */

function updateContent(slide){
  heroContent.classList.add("is-fading");
  setTimeout(() => {
    slidePlace.textContent = slide.place;
    slideTitle.innerHTML = slide.title.replace(" ", "<br>");
    slideDesc.textContent = slide.desc;
    heroContent.classList.remove("is-fading");
  }, 180);
}

/* ---------- Go to a given slide ---------- */

function goTo(index){
  if (index === activeIndex) return;
  activeIndex = (index + slides.length) % slides.length;
  const slide = slides[activeIndex];

  pushBackground(slide.image);
  updateContent(slide);

  [...cardTrack.children].forEach((card, i) => {
    card.classList.toggle("is-active", i === activeIndex);
  });
  cardTrack.children[activeIndex].scrollIntoView({
    behavior: "smooth", inline: "center", block: "nearest"
  });

  progressFill.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
}

/* ---------- Arrow scroll controls ---------- */

arrowLeft.addEventListener("click", () => {
  cardTrack.scrollBy({ left: -260, behavior: "smooth" });
});
arrowRight.addEventListener("click", () => {
  cardTrack.scrollBy({ left: 260, behavior: "smooth" });
});

/* ---------- Init ---------- */

renderCards();
pushBackground(slides[activeIndex].image);
progressFill.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;