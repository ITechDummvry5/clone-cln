(function () {
  var list = document.getElementById('fq');
  if (!list) return;
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var li = b.parentElement, wasOpen = li.classList.contains('open');
    list.querySelectorAll('li').forEach(function (x) {
      x.classList.remove('open');
      x.firstElementChild.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) { li.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
  });
})();
