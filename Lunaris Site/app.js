const slidesRoot = document.getElementById('slidesRoot');
const sections = [...document.querySelectorAll('.slide')];

function smoothScrollTo(container, targetTop, duration = 320) {
  const startTop = container.scrollTop;
  const distance = targetTop - startTop;
  if (Math.abs(distance) < 1) return Promise.resolve();

  return new Promise((resolve) => {
    const start = performance.now();
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      container.scrollTop = startTop + distance * easeInOut(progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

if (slidesRoot && sections.length) {
  let lockWheel = false;
  let wheelAccumulator = 0;
  slidesRoot.addEventListener(
    'wheel',
    async (e) => {
      if (lockWheel) {
        e.preventDefault();
        return;
      }
      const delta = e.deltaY;
      if (!Number.isFinite(delta) || delta === 0) return;
      wheelAccumulator += delta;
      if (Math.abs(wheelAccumulator) < 0.25) return;

      const viewport = Math.max(1, slidesRoot.clientHeight);
      const idx = Math.max(0, Math.min(sections.length - 1, Math.round(slidesRoot.scrollTop / viewport)));
      const nextIdx = wheelAccumulator > 0 ? Math.min(sections.length - 1, idx + 1) : Math.max(0, idx - 1);
      if (nextIdx === idx) return;

      lockWheel = true;
      wheelAccumulator = 0;
      e.preventDefault();
      await smoothScrollTo(slidesRoot, sections[nextIdx].offsetTop, 320);
      setTimeout(() => {
        lockWheel = false;
      }, 30);
    },
    { passive: false }
  );
}
