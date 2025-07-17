const audioTracks = {
    background: { src: 'music/rain.mp3', volume: 0.30, loop: true },
    estela: { src: 'music/estela.ogg', volume: 0.30, loop: true },
    night: { src: 'music/night.ogg', volume: 0.30, loop: true }
};

const audioElements = {};

function createAudio(name, { src, volume, loop }) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = 0;
    audio.dataset.targetVolume = volume;
    audioElements[name] = audio;
    return audio;
}

function fade(audio, to, duration = 400) {
    const from = audio.volume;
    const step = (to - from) / (duration / 40);
    let current = from;
    clearInterval(audio._fadeInterval);
    audio._fadeInterval = setInterval(() => {
        current += step;
        if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
            audio.volume = to;
            clearInterval(audio._fadeInterval);
        } else {
            audio.volume = current;
        }
    }, 40);

    if (to === 0) {
        const checkPause = () => {
            if (audio.volume <= 0.01) {
                audio.pause();
                audio.currentTime = 0;
                audio.removeEventListener('volumechange', checkPause);
            }
        };
        audio.addEventListener('volumechange', checkPause);
    } else {
        if (audio.paused) audio.play();
    }
}

createAudio('background', audioTracks.background);
createAudio('estela', audioTracks.estela);
createAudio('night', audioTracks.night);

const volumeSlider = document.getElementById('master-volume');
const volumeIcon = document.getElementById('volume-icon');
const volumeToggle = document.getElementById('volume-toggle');
let masterVolume = parseFloat(volumeSlider.value);
let muted = false;

const musicGroups = [
    { name: 'estela', chapters: [1], pages: [5, 6], audios: ['estela'], muteBackground: true },
    { name: 'night', chapters: [1], pages: [7, 8, 9, 10], audios: ['night'], muteBackground: false }
];

let activeAudios = new Set();

function updateAudio() {
    const currentPage = pageIndex + 1;
    const foundGroup = musicGroups.find(g => g.chapters.includes(currentChapter) && g.pages.includes(currentPage));

    const backgroundShouldBeMuted = foundGroup?.muteBackground || false;

    const newActiveAudios = foundGroup ? new Set(foundGroup.audios) : new Set();

    if (backgroundShouldBeMuted || muted) {
        fade(audioElements.background, 0);
    } else {
        if (audioElements.background.paused) audioElements.background.play();
        fade(audioElements.background, audioTracks.background.volume * masterVolume);
    }

    for (const name in audioElements) {
        if (name === 'background') continue;
        if (!newActiveAudios.has(name) && audioElements[name].volume > 0) {
            fade(audioElements[name], 0);
        }
    }

    for (const name of newActiveAudios) {
        if (muted) {
            fade(audioElements[name], 0);
        } else {
            const targetVol = audioTracks[name].volume * masterVolume;
            if (audioElements[name].paused) audioElements[name].play();
            fade(audioElements[name], targetVol);
        }
    }

    activeAudios = newActiveAudios;
}

volumeSlider.addEventListener('input', () => {
    masterVolume = parseFloat(volumeSlider.value);
    if (!muted) {
        if (audioElements.background.volume > 0) {
            fade(audioElements.background, audioTracks.background.volume * masterVolume);
        }
        for (const name of activeAudios) {
            const targetVol = audioTracks[name].volume * masterVolume;
            fade(audioElements[name], targetVol);
        }
        volumeIcon.textContent = masterVolume > 0 ? '🔊' : '🔇';
    }
});

volumeToggle.addEventListener('click', () => {
    muted = !muted;
    if (muted) {
        for (const name in audioElements) {
            fade(audioElements[name], 0);
        }
        volumeIcon.textContent = '🔇';
    } else {
        updateAudio();
        volumeIcon.textContent = masterVolume > 0 ? '🔊' : '🔇';
    }
});

function patchNavigationAudio() {
    const oldRender = render;
    render = function () {
        oldRender();
        updateAudio();
    };

    selectEl.addEventListener('change', e => {
        for (const name in audioElements) {
            if (name !== 'background') {
                fade(audioElements[name], 0);
            }
        }
        if (!muted) {
            fade(audioElements.background, audioTracks.background.volume * masterVolume);
        }
        activeAudios.clear();
    });
}
patchNavigationAudio();
