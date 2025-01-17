let remainingTime = 0;
let currentMode = "pomodoro";
let pomodoroCount = 0;

// Define default settings here as well
const defaultSettings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakCycle: 4,
};

const updateTimerDisplay = () => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const resetTimerDisplay = async () => {
    const settings = await loadFromStorage("settings", defaultSettings);
    remainingTime = settings[currentMode] * 60;
    updateTimerDisplay();
};

const initialize = async () => {
    // Load saved timer state or initialize defaults
    const savedTimerState = await loadFromStorage("timerState", {
        currentMode: "pomodoro",
        remainingTime: defaultSettings.pomodoro * 60,
        pomodoroCount: 0,
    });

    currentMode = savedTimerState.currentMode;
    remainingTime = savedTimerState.remainingTime;
    pomodoroCount = savedTimerState.pomodoroCount;

    updateTimerDisplay();

    document.getElementById("start").addEventListener("click", async () => {
        chrome.runtime.sendMessage({ action: "start" });
    });

    document.getElementById("pause").addEventListener("click", async () => {
        chrome.runtime.sendMessage({ action: "pause" });
    });

    document.getElementById("reset").addEventListener("click", async () => {
        await resetTimerDisplay();
        chrome.runtime.sendMessage({ action: "reset", time: remainingTime });
    });

    // Tab event listeners
    document.getElementById("pomodoro").addEventListener("click", async () => {
        currentMode = "pomodoro";
        await resetTimerDisplay();
        chrome.runtime.sendMessage({ action: "reset", time: remainingTime });
    });

    document.getElementById("short-break").addEventListener("click", async () => {
        currentMode = "short-break";
        await resetTimerDisplay();
        chrome.runtime.sendMessage({ action: "reset", time: remainingTime });
    });

    document.getElementById("long-break").addEventListener("click", async () => {
        currentMode = "long-break";
        await resetTimerDisplay();
        chrome.runtime.sendMessage({ action: "reset", time: remainingTime });
    });

    // Save settings
    document.getElementById("save-settings").addEventListener("click", async () => {
        const newSettings = {
            pomodoro: parseInt(document.getElementById("pomodoro-time").value, 10),
            shortBreak: parseInt(document.getElementById("short-break-time").value, 10),
            longBreak: parseInt(document.getElementById("long-break-time").value, 10),
            longBreakCycle: parseInt(document.getElementById("long-break-cycle").value, 10),
        };
        await saveToStorage("settings", newSettings);
        await resetTimerDisplay();
    });
};

initialize();
