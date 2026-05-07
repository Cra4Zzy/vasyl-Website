const body = document.body;
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const progress = document.querySelector('.page-progress');
const glow = document.querySelector('.cursor-glow');

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const percent = height > 0 ? (scrollTop / height) * 100 : 0;
  progress.style.width = `${percent}%`;
  header.classList.toggle('is-scrolled', scrollTop > 30);
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  });

  nav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Menü öffnen');
    }
  });
}

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
  revealObserver.observe(item);
});

if (glow && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const tilt = document.querySelector('[data-tilt] .visual-frame');
const tiltWrap = document.querySelector('[data-tilt]');

if (tilt && tiltWrap && window.matchMedia('(pointer: fine)').matches) {
  tiltWrap.addEventListener('pointermove', (event) => {
    const rect = tiltWrap.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tilt.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateZ(0)`;
  });

  tiltWrap.addEventListener('pointerleave', () => {
    tilt.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

const links = document.querySelectorAll('a[href^="#"]');
links.forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    const target = id && id.length > 1 ? document.querySelector(id) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


// v6: Projekt-Slider am Seitenanfang
const projectSlider = document.querySelector('[data-project-slider]');
if (projectSlider) {
  const track = projectSlider.querySelector('[data-slider-track]');
  const slides = Array.from(projectSlider.querySelectorAll('[data-slider-slide]'));
  const dotsWrap = document.querySelector('[data-slider-dots]');
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('[data-slider-dot]')) : [];
  const prevButton = document.querySelector('[data-slider-prev]');
  const nextButton = document.querySelector('[data-slider-next]');
  let activeIndex = 0;
  let rafId = null;
  let autoTimer = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setDot(index) {
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
  }

  function scrollToSlide(index, behavior = 'smooth') {
    if (!track || !slides.length) return;
    activeIndex = (index + slides.length) % slides.length;
    const target = slides[activeIndex];
    const left = target.offsetLeft - track.offsetLeft;
    track.scrollTo({ left, behavior: prefersReducedMotion ? 'auto' : behavior });
    setDot(activeIndex);
  }

  function updateFromScroll() {
    if (!track || !slides.length) return;
    const currentLeft = track.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach((slide, index) => {
      const distance = Math.abs((slide.offsetLeft - track.offsetLeft) - currentLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      activeIndex = closestIndex;
      setDot(activeIndex);
    }
  }

  function scheduleScrollUpdate() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateFromScroll();
      rafId = null;
    });
  }

  function startAuto() {
    if (prefersReducedMotion || window.matchMedia('(max-width: 680px)').matches) return;
    stopAuto();
    autoTimer = window.setInterval(() => {
      scrollToSlide(activeIndex + 1);
    }, 6200);
  }

  function stopAuto() {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  prevButton?.addEventListener('click', () => {
    stopAuto();
    scrollToSlide(activeIndex - 1);
    startAuto();
  });

  nextButton?.addEventListener('click', () => {
    stopAuto();
    scrollToSlide(activeIndex + 1);
    startAuto();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAuto();
      scrollToSlide(index);
      startAuto();
    });
  });

  track?.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  projectSlider.addEventListener('pointerenter', stopAuto);
  projectSlider.addEventListener('pointerleave', startAuto);
  projectSlider.addEventListener('focusin', stopAuto);
  projectSlider.addEventListener('focusout', startAuto);

  setDot(0);
  startAuto();
}

// v8: Projekt-Video-Slider
const videoSlider = document.querySelector('[data-video-slider]');
if (videoSlider) {
  const videoTrack = videoSlider.querySelector('[data-video-track]');
  const videoSlides = Array.from(videoSlider.querySelectorAll('[data-video-slide]'));
  const videoDotsWrap = document.querySelector('[data-video-dots]');
  const videoDots = videoDotsWrap ? Array.from(videoDotsWrap.querySelectorAll('[data-video-dot]')) : [];
  const videoPrev = document.querySelector('[data-video-prev]');
  const videoNext = document.querySelector('[data-video-next]');
  const videoElements = Array.from(videoSlider.querySelectorAll('video'));
  let activeVideoIndex = 0;
  let videoRafId = null;
  const prefersReducedMotionVideo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pauseOtherVideos(index) {
    videoElements.forEach((video, videoIndex) => {
      if (videoIndex !== index && !video.paused) video.pause();
    });
  }

  function setVideoDot(index) {
    videoDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
  }

  function scrollToVideo(index, behavior = 'smooth') {
    if (!videoTrack || !videoSlides.length) return;
    activeVideoIndex = (index + videoSlides.length) % videoSlides.length;
    const target = videoSlides[activeVideoIndex];
    const left = target.offsetLeft - videoTrack.offsetLeft;
    videoTrack.scrollTo({ left, behavior: prefersReducedMotionVideo ? 'auto' : behavior });
    setVideoDot(activeVideoIndex);
    pauseOtherVideos(activeVideoIndex);
  }

  function updateVideoFromScroll() {
    if (!videoTrack || !videoSlides.length) return;
    const currentLeft = videoTrack.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Infinity;

    videoSlides.forEach((slide, index) => {
      const distance = Math.abs((slide.offsetLeft - videoTrack.offsetLeft) - currentLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeVideoIndex) {
      activeVideoIndex = closestIndex;
      setVideoDot(activeVideoIndex);
      pauseOtherVideos(activeVideoIndex);
    }
  }

  function scheduleVideoScrollUpdate() {
    if (videoRafId) return;
    videoRafId = requestAnimationFrame(() => {
      updateVideoFromScroll();
      videoRafId = null;
    });
  }

  videoPrev?.addEventListener('click', () => scrollToVideo(activeVideoIndex - 1));
  videoNext?.addEventListener('click', () => scrollToVideo(activeVideoIndex + 1));

  videoDots.forEach((dot, index) => {
    dot.addEventListener('click', () => scrollToVideo(index));
  });

  videoElements.forEach((video, index) => {
    video.addEventListener('play', () => pauseOtherVideos(index));
  });

  videoTrack?.addEventListener('scroll', scheduleVideoScrollUpdate, { passive: true });
  setVideoDot(0);
}
