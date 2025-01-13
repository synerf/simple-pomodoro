let timerInterval;
let currentMode = "pomodoro";
let remainingTime = 0;
let pomodoroCount = 0;

const defaultSettings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakCycle: 4,
};

// Save data to Chrome storage
const saveToStorage = async (key, value) => {
    const obj = {};
    obj[key] = value;
    await chrome.storage.local.set(obj);
};

// Load data from Chrome storage
const loadFromStorage = async (key, defaultValue) => {
    const result = await chrome.storage.local.get(key);
    return result[key] || defaultValue;
};

// Update timer display
const updateTimerDisplay = () => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// Start the timer
const startTimer = async () => {
    clearInterval(timerInterval); // Prevent duplicate intervals
    timerInterval = setInterval(async () => {
        remainingTime -= 1;
        updateTimerDisplay();

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            await handleCycleEnd();
        } else {
            await saveToStorage("timerState", {
                currentMode,
                remainingTime,
                pomodoroCount,
            });
        }
    }, 1000);
};

// Pause the timer
const pauseTimer = () => {
    clearInterval(timerInterval);
};

// Reset the timer
const resetTimer = async () => {
    const settings = await loadFromStorage("settings", defaultSettings);
    remainingTime = settings[currentMode] * 60;
    updateTimerDisplay();
    await saveToStorage("timerState", {
        currentMode,
        remainingTime,
        pomodoroCount,
    });
};

// Handle the end of a cycle
const handleCycleEnd = async () => {
    const settings = await loadFromStorage("settings", defaultSettings);
    if (currentMode === "pomodoro") {
        pomodoroCount += 1;
        currentMode = pomodoroCount % settings.longBreakCycle === 0 ? "long-break" : "short-break";
    } else {
        currentMode = "pomodoro";
    }
    await resetTimer();
};

// Initialize the app
const initialize = async () => {
    // Load saved settings or defaults
    const settings = await loadFromStorage("settings", defaultSettings);

    // Load saved timer state or initialize defaults
    const savedTimerState = await loadFromStorage("timerState", {
        currentMode: "pomodoro",
        remainingTime: settings.pomodoro * 60,
        pomodoroCount: 0,
    });

    currentMode = savedTimerState.currentMode;
    remainingTime = savedTimerState.remainingTime;
    pomodoroCount = savedTimerState.pomodoroCount;

    updateTimerDisplay();

    // Button event listeners
    document.getElementById("start").addEventListener("click", startTimer);
    document.getElementById("pause").addEventListener("click", pauseTimer);
    document.getElementById("reset").addEventListener("click", resetTimer);

    // Tab event listeners
    document.getElementById("pomodoro").addEventListener("click", async () => {
        currentMode = "pomodoro";
        await resetTimer();
    });
    document.getElementById("short-break").addEventListener("click", async () => {
        currentMode = "short-break";
        await resetTimer();
    });
    document.getElementById("long-break").addEventListener("click", async () => {
        currentMode = "long-break";
        await resetTimer();
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
        await resetTimer();
    });
};

initialize();
