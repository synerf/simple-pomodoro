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

// Load data from storage
const loadFromStorage = async (key, defaultValue) => {
    const result = await chrome.storage.local.get(key);
    return result[key] || defaultValue;
};

// Save data to storage
const saveToStorage = async (key, value) => {
    const obj = {};
    obj[key] = value;
    await chrome.storage.local.set(obj);
};

// Notify user
const notifyUser = (message) => {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title: "Pomodoro Timer",
        message: message,
        priority: 2,
    });
};

// Start the timer
const startTimer = async () => {
    clearInterval(timerInterval);

    timerInterval = setInterval(async () => {
        remainingTime -= 1;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            await handleCycleEnd();
            notifyUser("Time's up! Take a break.");
        } else {
            await saveToStorage("timerState", { currentMode, remainingTime, pomodoroCount });
        }
    }, 1000);
};

// Handle cycle end
const handleCycleEnd = async () => {
    const settings = await loadFromStorage("settings", defaultSettings);

    if (currentMode === "pomodoro") {
        pomodoroCount += 1;
        currentMode = pomodoroCount % settings.longBreakCycle === 0 ? "long-break" : "short-break";
    } else {
        currentMode = "pomodoro";
    }

    remainingTime = settings[currentMode] * 60; // Reset to new mode time
};

// Initialize timer state on startup
const initializeTimerState = async () => {
    const savedTimerState = await loadFromStorage("timerState", {
        currentMode: "pomodoro",
        remainingTime: defaultSettings.pomodoro * 60,
        pomodoroCount: 0,
    });

    currentMode = savedTimerState.currentMode;
    remainingTime = savedTimerState.remainingTime;
    pomodoroCount = savedTimerState.pomodoroCount;

    // If a timer was running, start it again
    if (remainingTime > 0) {
        startTimer();
    }
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "start") {
        startTimer();
        sendResponse({ status: "started" });
    } else if (request.action === "pause") {
        clearInterval(timerInterval);
        sendResponse({ status: "paused" });
    } else if (request.action === "reset") {
        remainingTime = request.time; // Expecting time in seconds
        sendResponse({ status: "reset" });
    }
});

// Initialize on startup
initializeTimerState();
