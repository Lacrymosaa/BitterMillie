const chapters = {
    1: [
        'img/kirisame_spread_001.png', 'img/kirisame_spread_002.png', 'img/kirisame_spread_003.png', 'img/kirisame_spread_004.png',
        'img/kirisame_spread_005.png', 'img/kirisame_spread_006.png', 'img/kirisame_spread_007.png', 'img/kirisame_spread_008.png',
        'img/kirisame_spread_009.png', 'img/kirisame_spread_010.png'
    ], 2: []
};
let currentChapter = 1, pageIndex = 0;

const imgEl = document.getElementById('page'), soonEl = document.getElementById('soon'),
    selectEl = document.getElementById('chapter'), viewer = document.getElementById('viewer'),
    leftBtn = document.getElementById('arrow-left'), rightBtn = document.getElementById('arrow-right');
function render() {
    const pages = chapters[currentChapter];
    if (!pages.length) { imgEl.style.display = 'none'; leftBtn.style.display = 'none'; rightBtn.style.display = 'none'; soonEl.style.display = 'block'; }
    else { soonEl.style.display = 'none'; imgEl.style.display = 'block'; leftBtn.style.display = pageIndex > 0 ? 'block' : 'none'; rightBtn.style.display = pageIndex < pages.length - 1 ? 'block' : 'none'; imgEl.src = getLocalizedImagePath(pages[pageIndex]); }
    preloadNextImage();
}
selectEl.addEventListener('change', e => { currentChapter = +e.target.value; pageIndex = 0; render(); });
function preloadNextImage() { if (pageIndex < chapters[currentChapter].length - 1) { const link = document.createElement('link'); link.rel = 'preload'; link.as = 'image'; link.href = chapters[currentChapter][pageIndex + 1]; document.head.appendChild(link); } }
function nextPage() { if (pageIndex < chapters[currentChapter].length - 1) pageIndex++; render(); }
function prevPage() { if (pageIndex > 0) pageIndex--; render(); }
window.addEventListener('keydown', e => { if (e.key === 'ArrowRight') nextPage(); if (e.key === 'ArrowLeft') prevPage(); });
let touchStartX = 0;
viewer.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
viewer.addEventListener('touchend', e => { const x = e.changedTouches[0].clientX; if (x - touchStartX > 50) prevPage(); if (touchStartX - x > 50) nextPage(); });
viewer.addEventListener('dblclick', () => { document.fullscreenElement ? document.exitFullscreen() : viewer.requestFullscreen(); });
leftBtn.addEventListener('click', prevPage);
rightBtn.addEventListener('click', nextPage);
viewer.addEventListener('click', e => { if (e.target !== leftBtn && e.target !== rightBtn) { const mid = viewer.clientWidth / 2; e.clientX < viewer.getBoundingClientRect().left + mid ? prevPage() : nextPage(); } });
window.addEventListener('DOMContentLoaded', () => {
    const backLayer = document.querySelector('.rain-layer-back'), foreLayer = document.querySelector('.rain-layer'), mistLayer = document.querySelector('.mist-layer');
    for (let i = 0; i < 150; i++) { const drop = document.createElement('div'); drop.className = 'rain-drop back'; const x = Math.random() * 100; const d = 1.5 + Math.random() * 1; const del = -Math.random() * d; drop.style.left = x + 'vw'; drop.style.animationDuration = d + 's'; drop.style.animationDelay = del + 's'; backLayer.appendChild(drop); }
    for (let i = 0; i < 100; i++) { const drop = document.createElement('div'); drop.className = 'rain-drop'; const w = 1 + Math.random() * 2; const h = 20 + Math.random() * 50; const x = Math.random() * 100; const d = 0.7 + Math.random() * 0.8; const del = -Math.random() * d; drop.style.width = w + 'px'; drop.style.height = h + '%'; drop.style.left = x + 'vw'; drop.style.animationDuration = d + 's'; drop.style.animationDelay = del + 's'; foreLayer.appendChild(drop); }
    for (let i = 0; i < 4; i++) { const c = document.createElement('div'); c.className = 'mist-cloud'; const top = -20 + Math.random() * 140; const h = 25 + Math.random() * 35; const dur = 40 + Math.random() * 20; const pd = 10 + Math.random() * 10; const del = -Math.random() * dur; c.style.top = top + '%'; c.style.height = h + '%'; c.style.animationDuration = `${dur}s, ${pd}s`; c.style.animationDelay = `${del}s, ${-Math.random() * pd}s`; mistLayer.appendChild(c); }
    render();
});
let currentLanguage = 'EN';

const langToggleBtn = document.getElementById('lang-toggle');
langToggleBtn.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'EN' ? 'ES' : 'EN';
    langToggleBtn.textContent = currentLanguage === 'EN' ? 'Esp' : 'Eng';
    render();
});

function getLocalizedImagePath(path) {
    if (currentLanguage === 'EN') return path;
    const parts = path.split('.');
    parts[parts.length - 2] += '_ESP'; 
    return parts.join('.');
}
