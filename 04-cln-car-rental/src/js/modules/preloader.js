export function initPreloader(onDone) {
  const fill = document.getElementById('preloaderFill');
  const preloader = document.getElementById('preloader');
  let progress = 0;

  document.body.style.overflow = 'hidden';

  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
        if (onDone) onDone();
      }, 300);
    }
    fill.style.width = progress + '%';
  }, 80);
}
