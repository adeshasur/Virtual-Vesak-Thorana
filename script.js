const stories = [
    {
        id: "birth",
        number: "Panel 1",
        title: "සිද්ධාර්ථ කුමරුගේ උපත",
        icon: "✦",
        glow: "rgba(255, 214, 107, 0.38)",
        image: "assets/images/story-birth.png",
        description: "ලුම්බිණි උයනේ සිද්ධාර්ථ කුමරු උපත ලැබීය. මෙම අවස්ථාව බුදු සිරිතේ ආරම්භය ලෙස ශ්‍රද්ධාවෙන් සිහි කරයි."
    },
    {
        id: "four-sights",
        number: "Panel 2",
        title: "හතර දර්ශන",
        icon: "◌",
        glow: "rgba(130, 247, 255, 0.3)",
        image: "assets/images/story-four-sights.png",
        description: "වයසක, රෝගී, මළ සහ සංඝයා දැක ජීවිතයේ අනිත්‍ය බවත් දුකත් සිද්ධාර්ථ කුමරුට ගැඹුරින් අවබෝධ විය."
    },
    {
        id: "renunciation",
        number: "Panel 3",
        title: "මහබිනික්මන",
        icon: "☾",
        glow: "rgba(143, 112, 255, 0.32)",
        image: "assets/images/story-renunciation.png",
        description: "සත්‍යය සොයා රාජකීය ජීවිතය අත්හැර නිහඬ රැයක පිටත්වූ අවස්ථාව මහබිනික්මන ලෙස හැඳින්වේ."
    },
    {
        id: "austerities",
        number: "Panel 4",
        title: "දුෂ්කර ක්‍රියා",
        icon: "✺",
        glow: "rgba(255, 122, 144, 0.28)",
        image: "assets/images/story-austerities.png",
        description: "සත්‍යය සෙවීමේ දැඩි කැපවීමෙන් සිද්ධාර්ථ තවුසා දුෂ්කර ක්‍රියා කළ කාලය මෙහි සිහි කරයි."
    },
    {
        id: "enlightenment",
        number: "Panel 5",
        title: "බුද්ධත්වය ලැබීම",
        icon: "☸",
        glow: "rgba(255, 214, 107, 0.46)",
        image: "assets/images/story-enlightenment.png",
        description: "බෝධි වෘක්ෂය යටදී ගැඹුරු භාවනාවෙන් පසු සම්මා සම්බුද්ධත්වය ලැබූ මහා පූජනීය අවස්ථාවයි."
    },
    {
        id: "sermon",
        number: "Panel 6",
        title: "පළමු ධර්ම දේශනාව",
        icon: "◉",
        glow: "rgba(130, 247, 255, 0.34)",
        image: "assets/images/story-sermon.png",
        description: "ඉසිපතන මිගදායේදී ධම්මචක්කප්පවත්තන සූත්‍රය දේශනා කරමින් බුදුන් වහන්සේ ධර්ම චක්‍රය පළමුව වට කළ සේක."
    },
    {
        id: "parinibbana",
        number: "Panel 7",
        title: "පරිනිර්වාණය",
        icon: "✧",
        glow: "rgba(255, 248, 215, 0.32)",
        image: "assets/images/story-parinibbana.png",
        description: "කුසිනාරාවේදී බුදුන් වහන්සේ පරිනිර්වාණයට පත් වූ සේක. මෙම අවස්ථාව අනිත්‍යතාව සහ අප්‍රමාදය සිහි කරන සංවේදී මොහොතකි."
    }
];

const panels = document.querySelectorAll(".story-panel");
const modal = document.getElementById("storyModal");
const closeModal = document.getElementById("closeModal");
const storyIcon = document.getElementById("storyIcon");
const storyVisual = document.getElementById("storyVisual");
const storyImage = document.getElementById("storyImage");
const storyKicker = document.getElementById("storyKicker");
const storyTitle = document.getElementById("storyTitle");
const storyDescription = document.getElementById("storyDescription");
const prevStory = document.getElementById("prevStory");
const nextStory = document.getElementById("nextStory");
const speakStory = document.getElementById("speakStory");
const musicToggle = document.getElementById("musicToggle");
const musicNext = document.getElementById("musicNext");
const musicLabel = document.getElementById("musicLabel");

const musicTracks = [
    {
        title: "Buddhist Instrumental",
        src: "assets/audio/buddhist-instrumental.mp3"
    },
    {
        title: "Temple Bells",
        src: "assets/audio/temple-bells.mp3"
    },
    {
        title: "Pirith Chant",
        src: "assets/audio/pirith-chant.mp3"
    }
];

let currentStoryIndex = 0;
let lastFocusedPanel = null;
let audioContext;
let masterGain;
let droneNodes = [];
let bellTimer;
let isMusicPlaying = false;
let isNarrating = false;
let currentTrackIndex = 0;
let playlistAudio;
let usingGeneratedAmbience = false;

function getStoryIndex(id) {
    return stories.findIndex((story) => story.id === id);
}

function renderStory(index) {
    const story = stories[index];
    currentStoryIndex = index;
    stopNarration();
    storyIcon.textContent = story.icon;
    storyVisual.style.setProperty("--story-glow", story.glow);
    storyImage.src = story.image;
    storyImage.alt = story.title;
    storyKicker.textContent = story.number;
    storyTitle.textContent = story.title;
    storyDescription.textContent = story.description;
}

function openStoryModal(id) {
    const index = getStoryIndex(id);

    if (index < 0) {
        return;
    }

    renderStory(index);
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    closeModal.focus();
}

function closeStoryModal() {
    stopNarration();
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    if (lastFocusedPanel) {
        lastFocusedPanel.focus();
    }
}

function stopNarration() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    isNarrating = false;
    speakStory.textContent = "Narration";
    speakStory.setAttribute("aria-pressed", "false");
}

function toggleNarration() {
    if (!("speechSynthesis" in window)) {
        speakStory.textContent = "Unavailable";
        window.setTimeout(() => {
            if (!isNarrating) {
                speakStory.textContent = "Narration";
            }
        }, 1600);
        return;
    }

    if (isNarrating) {
        stopNarration();
        return;
    }

    const story = stories[currentStoryIndex];
    const utterance = new SpeechSynthesisUtterance(`${story.title}. ${story.description}`);
    utterance.lang = "si-LK";
    utterance.rate = 0.82;
    utterance.pitch = 0.92;
    utterance.onend = stopNarration;
    utterance.onerror = stopNarration;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    isNarrating = true;
    speakStory.textContent = "Stop";
    speakStory.setAttribute("aria-pressed", "true");
}

function showRelativeStory(step) {
    const nextIndex = (currentStoryIndex + step + stories.length) % stories.length;
    renderStory(nextIndex);
}

function createOscillator(frequency, type, gainValue) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue;
    oscillator.connect(gain).connect(masterGain);
    oscillator.start();

    return { oscillator, gain };
}

function playBellTone() {
    if (!audioContext || !masterGain || !isMusicPlaying || !usingGeneratedAmbience) {
        return;
    }

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, now);
    oscillator.frequency.exponentialRampToValueAtTime(370, now + 1.8);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    oscillator.connect(gain).connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + 2.3);
}

async function startGeneratedAmbience() {
    if (!audioContext) {
        audioContext = new AudioContext();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.18;
        masterGain.connect(audioContext.destination);
    }

    await audioContext.resume();
    usingGeneratedAmbience = true;

    if (droneNodes.length === 0) {
        droneNodes = [
            createOscillator(136.1, "sine", 0.28),
            createOscillator(204.15, "triangle", 0.12),
            createOscillator(272.2, "sine", 0.07)
        ];
    }

    playBellTone();
    bellTimer = window.setInterval(playBellTone, 9000);
}

function stopGeneratedAmbience() {
    usingGeneratedAmbience = false;
    window.clearInterval(bellTimer);

    if (masterGain && audioContext) {
        const now = audioContext.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);

        window.setTimeout(() => {
            droneNodes.forEach(({ oscillator }) => oscillator.stop());
            droneNodes = [];
            masterGain.gain.value = 0.18;
        }, 280);
    }
}

async function playPlaylistTrack() {
    const track = musicTracks[currentTrackIndex];

    if (!playlistAudio) {
        playlistAudio = new Audio();
        playlistAudio.volume = 0.45;
        playlistAudio.addEventListener("ended", () => {
            currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
            if (isMusicPlaying) {
                playPlaylistTrack().catch(() => startGeneratedAmbience());
            }
        });
    }

    playlistAudio.pause();
    playlistAudio.src = track.src;
    playlistAudio.currentTime = 0;
    await playlistAudio.play();
    usingGeneratedAmbience = false;
    musicLabel.textContent = track.title;
}

async function startMusic() {
    isMusicPlaying = true;
    musicToggle.setAttribute("aria-pressed", "true");
    musicLabel.textContent = "Loading...";

    try {
        await playPlaylistTrack();
    } catch (error) {
        await startGeneratedAmbience();
        musicLabel.textContent = "Temple Ambience";
    }
}

function stopMusic() {
    isMusicPlaying = false;
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Music Off";

    if (playlistAudio) {
        playlistAudio.pause();
        playlistAudio.currentTime = 0;
    }

    stopGeneratedAmbience();
}

async function playNextMusicTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;

    if (isMusicPlaying) {
        stopGeneratedAmbience();

        try {
            await playPlaylistTrack();
        } catch (error) {
            await startGeneratedAmbience();
            musicLabel.textContent = "Temple Ambience";
        }
    } else {
        musicLabel.textContent = musicTracks[currentTrackIndex].title;
        window.setTimeout(() => {
            if (!isMusicPlaying) {
                musicLabel.textContent = "Music Off";
            }
        }, 1400);
    }
}

panels.forEach((panel) => {
    panel.addEventListener("click", () => {
        lastFocusedPanel = panel;
        openStoryModal(panel.dataset.story);
    });
});

closeModal.addEventListener("click", closeStoryModal);
modal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-modal")) {
        closeStoryModal();
    }
});

prevStory.addEventListener("click", () => showRelativeStory(-1));
nextStory.addEventListener("click", () => showRelativeStory(1));
speakStory.addEventListener("click", toggleNarration);

musicToggle.addEventListener("click", () => {
    if (isMusicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});

musicNext.addEventListener("click", playNextMusicTrack);

document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("show")) {
        return;
    }

    if (event.key === "Escape") {
        closeStoryModal();
    }

    if (event.key === "ArrowLeft") {
        showRelativeStory(-1);
    }

    if (event.key === "ArrowRight") {
        showRelativeStory(1);
    }
});
