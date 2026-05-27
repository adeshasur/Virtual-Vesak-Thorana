const stories = [
    {
        id: "birth",
        number: "Panel 1",
        title: "සිද්ධාර්ථ කුමරුගේ උපත",
        icon: "✦",
        description: "වෙසක් පොහෝ දින ලුම්බිණි උයනේ සිද්ධාර්ථ කුමරු උපත ලැබූ බව බෞද්ධ ඉතිහාසයේ සඳහන් වේ. මේ උපත ලෝකයට කරුණාව, ප්‍රඥාව සහ සමාදානය ගෙන ආ මහා ආරම්භයක් ලෙස සැලකේ."
    },
    {
        id: "renunciation",
        number: "Panel 2",
        title: "මහබිනික්මන",
        icon: "☾",
        description: "සිද්ධාර්ථ කුමරු ලෝකයේ දුක, වයසට යාම, රෝග සහ මරණය පිළිබඳ අවබෝධයක් ලබා සත්‍යය සොයා රාජමාළිගාව හැර ගිය අවස්ථාව මහබිනික්මන ලෙස හැඳින්වේ."
    },
    {
        id: "enlightenment",
        number: "Panel 3",
        title: "බුද්ධත්වය ලැබීම",
        icon: "☸",
        description: "බෝධි වෘක්ෂය යට ගැඹුරු භාවනාවෙන් පසු ගෞතම බුදුන් වහන්සේ චතුරාර්ය සත්‍යය අවබෝධ කර බුද්ධත්වයට පත්වූ සේක. මෙය අඳුරෙන් ආලෝකයට යන මහා ජයග්‍රහණයකි."
    },
    {
        id: "sermon",
        number: "Panel 4",
        title: "ධම්මචක්කප්පවත්තන සූත්‍රය",
        icon: "◉",
        description: "බුදුන් වහන්සේ ඉසිපතන මිගදායේදී පළමු ධර්ම දේශනාව පැවැත්වූ සේක. මධ්‍යම ප්‍රතිපදාව සහ චතුරාර්ය සත්‍යය පැහැදිලි කළ මෙම අවස්ථාව ධර්ම චක්‍රය පළමුව වට කළ මොහොත ලෙස සලකයි."
    },
    {
        id: "parinibbana",
        number: "Panel 5",
        title: "පරිනිර්වාණය",
        icon: "✺",
        description: "බුදුන් වහන්සේගේ අවසාන මහා පරිනිර්වාණය අනිත්‍යතාව සහ අප්‍රමාදව ජීවත් වීම පිළිබඳ ගැඹුරු පණිවිඩයක් ලබා දෙයි. එය ශ්‍රද්ධාවෙන් සිහි කරන මහා සංවේදී අවස්ථාවකි."
    }
];

const panels = document.querySelectorAll(".story-panel");
const modal = document.getElementById("storyModal");
const closeModal = document.getElementById("closeModal");
const storyIcon = document.getElementById("storyIcon");
const storyKicker = document.getElementById("storyKicker");
const storyTitle = document.getElementById("storyTitle");
const storyDescription = document.getElementById("storyDescription");
const prevStory = document.getElementById("prevStory");
const nextStory = document.getElementById("nextStory");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");

let currentStoryIndex = 0;
let lastFocusedPanel = null;
let audioContext;
let masterGain;
let droneNodes = [];
let bellTimer;
let isMusicPlaying = false;

function getStoryIndex(id) {
    return stories.findIndex((story) => story.id === id);
}

function renderStory(index) {
    const story = stories[index];
    currentStoryIndex = index;
    storyIcon.textContent = story.icon;
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
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    if (lastFocusedPanel) {
        lastFocusedPanel.focus();
    }
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
    if (!audioContext || !masterGain || !isMusicPlaying) {
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

async function startMusic() {
    if (!audioContext) {
        audioContext = new AudioContext();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.18;
        masterGain.connect(audioContext.destination);
    }

    await audioContext.resume();

    if (droneNodes.length === 0) {
        droneNodes = [
            createOscillator(136.1, "sine", 0.28),
            createOscillator(204.15, "triangle", 0.12),
            createOscillator(272.2, "sine", 0.07)
        ];
    }

    isMusicPlaying = true;
    musicToggle.setAttribute("aria-pressed", "true");
    musicLabel.textContent = "Music On";
    playBellTone();
    bellTimer = window.setInterval(playBellTone, 9000);
}

function stopMusic() {
    isMusicPlaying = false;
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Music Off";
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

musicToggle.addEventListener("click", () => {
    if (isMusicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});

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
