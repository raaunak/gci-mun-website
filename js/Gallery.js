(function () {
  // Define your images and years here:
  const galleryData = [
    {
      year: 2024,
      img: "images/Mun 2024 Gallery.jpg",
      link: "https://drive.google.com/drive/folders/17NH_5ObiSyKdAn4MOMBVINDXH5nDItg8",
      alt: "Gallery image for 2024"
    },
    {
      year: 2025,
      img: "images/MUN 2025 Gallery.jpg",
      link: "https://drive.google.com/drive/folders/1GdDwe0Bk5Ts7AJG3MhwdCYZQsElf0eCS",
      alt: "Gallery image for 2025"
    }
    // add more entries as needed...
  ];

  // Elements
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const imgEl = document.getElementById('galleryImage');
  const yearEl = document.getElementById('galleryYear');
  const wrapper = document.querySelector('.gallery-image-wrap');
  const linkEl = document.getElementById('galleryLink');

  // State
  let index = galleryData.length - 1; // default: latest (last item)
  const ANIM_DURATION = 360; // ms

  // Preload images
  galleryData.forEach(entry => {
    const i = new Image();
    i.src = entry.img;
  });

  // Render function
  function render(newIndex, direction) {
    if (newIndex < 0 || newIndex > galleryData.length - 1) return;

    // disable buttons while animating
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    wrapper.classList.add('is-animating');

    imgEl.style.transition = `transform ${ANIM_DURATION}ms ease, opacity ${ANIM_DURATION}ms ease`;

    // exit animation
    if (direction === 'left') {
      imgEl.style.transform = 'translateX(-20px)';
      imgEl.style.opacity = '0';
    } else if (direction === 'right') {
      imgEl.style.transform = 'translateX(20px)';
      imgEl.style.opacity = '0';
    } else {
      imgEl.style.opacity = '0';
      imgEl.style.transform = 'translateX(0)';
    }

    setTimeout(() => {
      const entry = galleryData[newIndex];

      // swap image + link + alt + year
      imgEl.src = entry.img;
      imgEl.alt = entry.alt || `Gallery image for ${entry.year}`;
      linkEl.href = entry.link || '#';
      // keep target blank + rel noopener for security
      linkEl.target = '_blank';
      linkEl.rel = 'noopener';

      yearEl.textContent = entry.year;

      // position slightly off screen then animate in
      if (direction === 'left') imgEl.style.transform = 'translateX(20px)';
      else if (direction === 'right') imgEl.style.transform = 'translateX(-20px)';
      else imgEl.style.transform = 'translateX(0)';

      // force reflow then animate in
      void imgEl.offsetWidth;
      imgEl.style.transform = 'translateX(0)';
      imgEl.style.opacity = '1';

      setTimeout(() => {
        wrapper.classList.remove('is-animating');
        updateButtons(newIndex);
      }, ANIM_DURATION);
    }, ANIM_DURATION);

    index = newIndex;
  }

  function updateButtons(currentIndex) {
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= galleryData.length - 1;
  }

  // initial state
  function init() {
    if (!galleryData || galleryData.length === 0) {
      console.warn('galleryData is empty');
      return;
    }

    const entry = galleryData[index];
    imgEl.src = entry.img;
    imgEl.alt = entry.alt || `Gallery image for ${entry.year}`;
    linkEl.href = entry.link || '#';
    linkEl.target = '_blank';
    linkEl.rel = 'noopener';
    yearEl.textContent = entry.year;
    updateButtons(index);

    // attach events
    prevBtn.addEventListener('click', () => {
      if (index > 0) render(index - 1, 'left');
    });
    nextBtn.addEventListener('click', () => {
      if (index < galleryData.length - 1) render(index + 1, 'right');
    });

    // keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && index > 0) render(index - 1, 'left');
      else if (e.key === 'ArrowRight' && index < galleryData.length - 1) render(index + 1, 'right');
    });

    // swipe support
    let startX = null;
    wrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, {passive: true});
    wrapper.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const endX = (e.changedTouches && e.changedTouches[0].clientX) || 0;
      const dx = endX - startX;
      const THRESH = 40;
      if (dx > THRESH && index > 0) render(index - 1, 'left');
      else if (dx < -THRESH && index < galleryData.length - 1) render(index + 1, 'right');
      startX = null;
    }, {passive: true});
  }

  // run
  init();
})();
