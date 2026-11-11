"use strict";

/*
    IBM Bob Catch Challenge
    -----------------------
    This game uses only standard browser technologies.

    The configuration below is intentionally centralized so IBM Bob
    can easily understand and modify the game during the demonstration.
*/

const gameConfig = {
    durationSeconds: 45,
    startingLives: 3,
    pointsPerItem: 10,
    obstaclePenalty: 10,

    playerSpeeds: {
        slow: 5,
        normal: 8,
        fast: 12
    },

    fallingSpeed: 3.2,
    spawnIntervalMilliseconds: 850,
    obstacleChance: 0.25,
    bonusChance: 0.08
};

/* SVG icon helpers — viewBox="0 0 32 32", sized to fill the item container. */
const svg = {
    /* Player icons */
    robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="8" y="10" width="16" height="12" rx="3" fill="#fff" stroke="#0f62fe" stroke-width="1.5"/>
        <circle cx="12" cy="16" r="2" fill="#0f62fe"/>
        <circle cx="20" cy="16" r="2" fill="#0f62fe"/>
        <rect x="14" y="6" width="4" height="4" rx="1" fill="#78a9ff"/>
        <line x1="16" y1="6" x2="16" y2="4" stroke="#78a9ff" stroke-width="1.5"/>
        <circle cx="16" cy="3.5" r="1.5" fill="#78a9ff"/>
        <rect x="11" y="22" width="4" height="3" rx="1" fill="#0f62fe"/>
        <rect x="17" y="22" width="4" height="3" rx="1" fill="#0f62fe"/>
    </svg>`,

    shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 4 L26 8 L26 16 C26 22 16 28 16 28 C16 28 6 22 6 16 L6 8 Z" fill="#007d79" stroke="#42be65" stroke-width="1.5"/>
        <path d="M12 16 L15 19 L20 13" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    car: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="4" y="14" width="24" height="10" rx="2" fill="#198038"/>
        <path d="M8 14 L11 8 L21 8 L24 14" fill="#a7f0ba" stroke="#198038" stroke-width="1"/>
        <circle cx="10" cy="24" r="3" fill="#333" stroke="#a7f0ba" stroke-width="1"/>
        <circle cx="22" cy="24" r="3" fill="#333" stroke="#a7f0ba" stroke-width="1"/>
        <rect x="13" y="9" width="6" height="4" rx="1" fill="#71e884" opacity="0.7"/>
    </svg>`,

    brain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <ellipse cx="16" cy="16" rx="10" ry="9" fill="#8a3ffc" stroke="#d4bbff" stroke-width="1.5"/>
        <path d="M16 7 C16 7 10 10 10 16 C10 22 16 25 16 25" stroke="#d4bbff" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M16 7 C16 7 22 10 22 16 C22 22 16 25 16 25" stroke="#d4bbff" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="11" cy="13" r="1.5" fill="#fff" opacity="0.8"/>
        <circle cx="21" cy="13" r="1.5" fill="#fff" opacity="0.8"/>
        <circle cx="13" cy="19" r="1" fill="#fff" opacity="0.6"/>
        <circle cx="19" cy="19" r="1" fill="#fff" opacity="0.6"/>
    </svg>`,

    globe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="#00c48c" stroke="#00ff87" stroke-width="1.5"/>
        <ellipse cx="16" cy="16" rx="5" ry="11" stroke="#00ff87" stroke-width="1" fill="none"/>
        <line x1="5" y1="16" x2="27" y2="16" stroke="#00ff87" stroke-width="1"/>
        <line x1="7" y1="11" x2="25" y2="11" stroke="#00ff87" stroke-width="0.8" opacity="0.6"/>
        <line x1="7" y1="21" x2="25" y2="21" stroke="#00ff87" stroke-width="0.8" opacity="0.6"/>
    </svg>`,

    /* Good item icons */
    star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <polygon points="16,4 19.5,13 29,13 21.5,18.5 24.5,28 16,22.5 7.5,28 10.5,18.5 3,13 12.5,13" fill="#ffd700" stroke="#f59e0b" stroke-width="1"/>
    </svg>`,

    lock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="9" y="15" width="14" height="11" rx="2" fill="#42be65" stroke="#007d79" stroke-width="1.5"/>
        <path d="M11 15 L11 11 C11 7.5 21 7.5 21 11 L21 15" stroke="#007d79" stroke-width="1.5" fill="none"/>
        <circle cx="16" cy="20" r="2" fill="#fff"/>
        <line x1="16" y1="22" x2="16" y2="24" stroke="#fff" stroke-width="1.5"/>
    </svg>`,

    bolt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <polygon points="18,4 10,18 15,18 14,28 22,14 17,14" fill="#ffd700" stroke="#f59e0b" stroke-width="1"/>
    </svg>`,

    bulb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 5 C11 5 8 9 8 13 C8 17 11 19 12 21 L20 21 C21 19 24 17 24 13 C24 9 21 5 16 5Z" fill="#d4bbff" stroke="#8a3ffc" stroke-width="1.5"/>
        <rect x="12" y="21" width="8" height="2" rx="1" fill="#8a3ffc"/>
        <rect x="13" y="23" width="6" height="2" rx="1" fill="#8a3ffc"/>
        <line x1="16" y1="8" x2="16" y2="12" stroke="#8a3ffc" stroke-width="1.5" opacity="0.5"/>
    </svg>`,

    diamond: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <polygon points="16,4 28,14 16,28 4,14" fill="#00c48c" stroke="#00ff87" stroke-width="1.5"/>
        <polygon points="16,8 24,14 16,24 8,14" fill="#00ff87" opacity="0.4"/>
    </svg>`,

    /* Bad item icons */
    bug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <ellipse cx="16" cy="18" rx="6" ry="7" fill="#da1e28" stroke="#ff8389" stroke-width="1.5"/>
        <circle cx="16" cy="11" r="4" fill="#da1e28" stroke="#ff8389" stroke-width="1.5"/>
        <line x1="10" y1="15" x2="5" y2="12" stroke="#ff8389" stroke-width="1.5"/>
        <line x1="10" y1="19" x2="4" y2="19" stroke="#ff8389" stroke-width="1.5"/>
        <line x1="22" y1="15" x2="27" y2="12" stroke="#ff8389" stroke-width="1.5"/>
        <line x1="22" y1="19" x2="28" y2="19" stroke="#ff8389" stroke-width="1.5"/>
        <circle cx="13.5" cy="10" r="1" fill="#fff" opacity="0.8"/>
        <circle cx="18.5" cy="10" r="1" fill="#fff" opacity="0.8"/>
    </svg>`,

    virus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="7" fill="#da1e28" stroke="#ff8389" stroke-width="1.5"/>
        <line x1="16" y1="5" x2="16" y2="9" stroke="#ff8389" stroke-width="2" stroke-linecap="round"/>
        <line x1="16" y1="23" x2="16" y2="27" stroke="#ff8389" stroke-width="2" stroke-linecap="round"/>
        <line x1="5" y1="16" x2="9" y2="16" stroke="#ff8389" stroke-width="2" stroke-linecap="round"/>
        <line x1="23" y1="16" x2="27" y2="16" stroke="#ff8389" stroke-width="2" stroke-linecap="round"/>
        <line x1="8" y1="8" x2="11" y2="11" stroke="#ff8389" stroke-width="2" stroke-linecap="round"/>
        <line x1="21" y1="21" x2="24" y2="24" stroke="#ff8389" stroke-width="2" stroke-linecap="round"/>
        <line x1="24" y1="8" x2="21" y2="11" stroke="#ff8389" stroke-width="2" stroke-linecap="round"/>
        <line x1="11" y1="21" x2="8" y2="24" stroke="#ff8389" stroke-width="2" stroke-linecap="round"/>
        <circle cx="16" cy="16" r="3" fill="#ff8389" opacity="0.5"/>
    </svg>`,

    cone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <polygon points="16,5 26,26 6,26" fill="#f1c21b" stroke="#da1e28" stroke-width="1.5"/>
        <rect x="6" y="23" width="20" height="3" rx="1" fill="#da1e28"/>
        <line x1="11" y1="18" x2="21" y2="18" stroke="#fff" stroke-width="2"/>
        <line x1="13" y1="13" x2="19" y2="13" stroke="#fff" stroke-width="1.5"/>
    </svg>`,

    swirl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 6 C22 6 26 10 26 16 C26 20 23 23 19 23 C15 23 13 20 13 17 C13 14 15 12 17 12 C19 12 20 14 20 16" stroke="#da1e28" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="20" cy="16" r="2" fill="#da1e28"/>
    </svg>`,

    warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <polygon points="16,4 29,27 3,27" fill="#f1c21b" stroke="#da1e28" stroke-width="1.5"/>
        <rect x="15" y="13" width="2" height="7" rx="1" fill="#da1e28"/>
        <circle cx="16" cy="23" r="1.5" fill="#da1e28"/>
    </svg>`,

    /* Bonus icon */
    trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="12" y="24" width="8" height="3" rx="1" fill="#ffd700" stroke="#f59e0b" stroke-width="1"/>
        <rect x="10" y="27" width="12" height="2" rx="1" fill="#f59e0b"/>
        <path d="M10 6 L10 18 C10 22 22 22 22 18 L22 6 Z" fill="#ffd700" stroke="#f59e0b" stroke-width="1.5"/>
        <path d="M10 9 C10 9 6 9 6 13 C6 17 10 17 10 17" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
        <path d="M22 9 C22 9 26 9 26 13 C26 17 22 17 22 17" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
        <line x1="13" y1="24" x2="13" y2="22" stroke="#f59e0b" stroke-width="1"/>
        <line x1="19" y1="24" x2="19" y2="22" stroke="#f59e0b" stroke-width="1"/>
    </svg>`
};

const themes = {
    technology: {
        title: "IBM Bob Catch Challenge",
        description: "Collect the AI stars and avoid the bugs.",
        playerIcon: svg.robot,
        playerEmoji: "🤖",
        goodIcon: svg.star,
        badIcon: svg.bug,
        primaryColor: "#0f62fe",
        accentColor: "#78a9ff",
        backgroundStart: "#071a2f",
        backgroundEnd: "#123f68",
        successMessage: "You powered the future with AI!"
    },

    cybersecurity: {
        title: "Cybersecurity Defense Challenge",
        description: "Collect protected data and avoid cyber threats.",
        playerIcon: svg.shield,
        playerEmoji: "🛡️",
        goodIcon: svg.lock,
        badIcon: svg.virus,
        primaryColor: "#007d79",
        accentColor: "#42be65",
        backgroundStart: "#061a18",
        backgroundEnd: "#0b4f4a",
        successMessage: "You protected the digital environment!"
    },

    smartCity: {
        title: "Smart City Challenge",
        description: "Collect clean energy and avoid traffic barriers.",
        playerIcon: svg.car,
        playerEmoji: "🚙",
        goodIcon: svg.bolt,
        badIcon: svg.cone,
        primaryColor: "#198038",
        accentColor: "#a7f0ba",
        backgroundStart: "#082b16",
        backgroundEnd: "#165c31",
        successMessage: "You helped build a smarter city!"
    },

    watsonx: {
        title: "IBM watsonx AI Challenge",
        description: "Collect AI insights and avoid hallucinations.",
        playerIcon: svg.brain,
        playerEmoji: "🧠",
        goodIcon: svg.bulb,
        badIcon: svg.swirl,
        primaryColor: "#8a3ffc",
        accentColor: "#d4bbff",
        backgroundStart: "#1a0533",
        backgroundEnd: "#3d1473",
        successMessage: "You mastered the power of IBM watsonx AI!"
    },

    gitex: {
        title: "GITEX 2026 — IBM Challenge",
        description: "Collect innovation tokens and avoid disruptions.",
        playerIcon: svg.globe,
        playerEmoji: "🌐",
        goodIcon: svg.diamond,
        badIcon: svg.warning,
        primaryColor: "#00c48c",
        accentColor: "#00ff87",
        backgroundStart: "#000000",
        backgroundEnd: "#002a1a",
        successMessage: "You're a GITEX 2026 Innovation Champion! See you at the IBM booth. 🎉"
    }
};

/*
    DOM references
*/

const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const startOverlay = document.getElementById("startOverlay");

const gameTitle = document.getElementById("gameTitle");
const subtitle = document.querySelector(".subtitle");

const playerNameInput = document.getElementById("playerNameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const themeSelect = document.getElementById("themeSelect");
const speedSelect = document.getElementById("speedSelect");
const pointsSelect = document.getElementById("pointsSelect");

const playerNameDisplay = document.getElementById("playerNameDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const livesDisplay = document.getElementById("livesDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const pauseOverlay = document.getElementById("pauseOverlay");

const moveLeftButton = document.getElementById("moveLeftButton");
const moveRightButton = document.getElementById("moveRightButton");

const howToPlayButton = document.getElementById("howToPlayButton");
const instructionsDialog = document.getElementById("instructionsDialog");
const closeDialogButton = document.getElementById("closeDialogButton");

/*
    Game state
*/

let gameRunning = false;
let gamePaused = false;
let animationFrameId = null;
let spawnTimerId = null;
let countdownTimerId = null;

let score = 0;
let lives = gameConfig.startingLives;
let timeRemaining = gameConfig.durationSeconds;
let highScore = Number(localStorage.getItem("ibmBobHighScore")) || 0;

/*
    Power Automate HTTP trigger URL for Excel lead capture.
*/
const SHEETS_ENDPOINT = "https://defaultf8732124c5e24e519ce15530ffc7be.54.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/13/workflows/c80998fda0d049b39883d7c63ce79c4b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fAsO4CnVAQSDwl05gGY46kj6tvNPH_pLOkAD1spu-qQ";

let playerX = 0;
let currentPlayerSpeed = gameConfig.playerSpeeds.normal;
let currentTheme = themes.technology;

let moveLeft = false;
let moveRight = false;

let fallingItems = [];
let comboCount = 0;

/*
    Initialization
*/

function initializeGame() {
    applyTheme(themeSelect.value);
    positionPlayerInCenter();
    updateScoreboard();

    window.addEventListener("resize", keepPlayerInsideGameArea);
}

function saveHighScore(finalScore) {
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem("ibmBobHighScore", highScore);
    }
}

/*
    Leaderboard — top-5 stored in localStorage.
*/

function getLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem("ibmBobLeaderboard")) || [];
    } catch {
        return [];
    }
}

function saveLeaderboard(name, finalScore) {
    const board = getLeaderboard();

    board.push({ name: name || "Guest", score: finalScore });
    board.sort((a, b) => b.score - a.score);

    const top5 = board.slice(0, 5);

    localStorage.setItem("ibmBobLeaderboard", JSON.stringify(top5));

    return top5;
}

function buildLeaderboardHTML(board) {
    if (board.length === 0) {
        return "";
    }

    const rows = board.map((entry, index) => `
        <tr>
            <td style="padding:4px 10px;opacity:0.7;">#${index + 1}</td>
            <td style="padding:4px 10px;">${escapeHtml(entry.name)}</td>
            <td style="padding:4px 10px;font-weight:700;">${entry.score}</td>
        </tr>
    `).join("");

    return `
        <div style="margin-top:16px;">
            <p style="font-weight:700;margin-bottom:6px;">🏅 GITEX Leaderboard</p>
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                <thead>
                    <tr style="opacity:0.6;font-size:0.8rem;text-transform:uppercase;">
                        <th style="padding:4px 10px;text-align:left;">#</th>
                        <th style="padding:4px 10px;text-align:left;">Name</th>
                        <th style="padding:4px 10px;text-align:left;">Score</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

/*
    Google Sheets submission — fire-and-forget.
*/

function submitToSheets(name, email, phone, finalScore) {
    if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.startsWith("YOUR_")) {
        return;
    }

    const payload = {
        name: name || "Guest",
        email: email || "",
        phone: phone || "",
        score: finalScore,
        theme: currentTheme.title,
        timestamp: new Date().toISOString()
    };

    fetch(SHEETS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch(() => {
        /* Silently ignore network errors during the demo. */
    });
}

function applyTheme(themeName) {
    currentTheme = themes[themeName] || themes.technology;

    document.documentElement.style.setProperty(
        "--primary-color",
        currentTheme.primaryColor
    );

    document.documentElement.style.setProperty(
        "--accent-color",
        currentTheme.accentColor
    );

    document.documentElement.style.setProperty(
        "--game-background-start",
        currentTheme.backgroundStart
    );

    document.documentElement.style.setProperty(
        "--game-background-end",
        currentTheme.backgroundEnd
    );

    gameTitle.textContent = currentTheme.title;
    subtitle.textContent = currentTheme.description;
    player.innerHTML = currentTheme.playerIcon;

    const overlayIcon = startOverlay.querySelector(".large-icon");

    if (overlayIcon) {
        overlayIcon.innerHTML = currentTheme.playerIcon;
    }
}

function positionPlayerInCenter() {
    const gameWidth = gameArea.clientWidth;
    const playerWidth = player.offsetWidth;

    playerX = Math.max(0, (gameWidth - playerWidth) / 2);
    updatePlayerPosition();
}

function keepPlayerInsideGameArea() {
    const maximumX = gameArea.clientWidth - player.offsetWidth;

    playerX = Math.max(0, Math.min(playerX, maximumX));
    updatePlayerPosition();
}

function updatePlayerPosition() {
    player.style.left = `${playerX}px`;
}

/*
    Starting and resetting
*/

function startGame() {
    if (gameRunning) {
        return;
    }

    applyTheme(themeSelect.value);

    const enteredName = playerNameInput.value.trim();

    playerNameDisplay.textContent =
        enteredName.length > 0 ? enteredName : "Guest";

    currentPlayerSpeed =
        gameConfig.playerSpeeds[speedSelect.value] ||
        gameConfig.playerSpeeds.normal;

    gameConfig.pointsPerItem =
        Number.parseInt(pointsSelect.value, 10) || 10;

    score = 0;
    lives = gameConfig.startingLives;
    timeRemaining = gameConfig.durationSeconds;
    comboCount = 0;

    removeAllFallingItems();
    positionPlayerInCenter();
    updateScoreboard();

    startOverlay.classList.add("hidden");
    gameRunning = true;
    gamePaused = false;
    pauseButton.disabled = false;
    pauseButton.textContent = "⏸ Pause";

    gameArea.focus();

    function restartSpawnTimer() {
        if (spawnTimerId !== null) {
            window.clearInterval(spawnTimerId);
        }

        const progress = getDifficultyProgress();
        const interval = Math.round(
            gameConfig.spawnIntervalMilliseconds * (1 - progress * 0.5)
        );

        spawnTimerId = window.setInterval(createFallingItem, interval);
    }

    restartSpawnTimer();

    countdownTimerId = window.setInterval(() => {
        timeRemaining -= 1;
        updateScoreboard();
        restartSpawnTimer();

        if (timeRemaining <= 0) {
            endGame("time");
        }
    }, 1000);

    animationFrameId = window.requestAnimationFrame(gameLoop);
}

function resetGame() {
    stopGameTimers();
    removeAllFallingItems();

    gameRunning = false;
    score = 0;
    lives = gameConfig.startingLives;
    timeRemaining = gameConfig.durationSeconds;
    comboCount = 0;

    moveLeft = false;
    moveRight = false;

    positionPlayerInCenter();
    updateScoreboard();

    startOverlay.innerHTML = `
        <div class="overlay-content">
            <div class="large-icon">${currentTheme.playerEmoji}</div>
            <h2>Ready to play?</h2>
            <p>${currentTheme.description}</p>
            <p>
                Choose your settings and select
                <strong>Start Game</strong>.
            </p>
        </div>
    `;

    pauseOverlay.classList.add("hidden");
    pauseButton.disabled = true;
    pauseButton.textContent = "⏸ Pause";
    gamePaused = false;
    startOverlay.classList.remove("hidden");
    startButton.textContent = "Start Game";
}

function stopGameTimers() {
    if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (spawnTimerId !== null) {
        window.clearInterval(spawnTimerId);
        spawnTimerId = null;
    }

    if (countdownTimerId !== null) {
        window.clearInterval(countdownTimerId);
        countdownTimerId = null;
    }
}

/*
    Main animation loop
*/

function gameLoop() {
    if (!gameRunning) {
        return;
    }

    movePlayer();
    moveFallingItems();

    animationFrameId = window.requestAnimationFrame(gameLoop);
}

function movePlayer() {
    if (moveLeft) {
        playerX -= currentPlayerSpeed;
    }

    if (moveRight) {
        playerX += currentPlayerSpeed;
    }

    const maximumX = gameArea.clientWidth - player.offsetWidth;

    playerX = Math.max(0, Math.min(playerX, maximumX));

    updatePlayerPosition();
}

/*
    Falling items
*/

function getDifficultyProgress() {
    const elapsed = gameConfig.durationSeconds - timeRemaining;

    return Math.min(1, elapsed / gameConfig.durationSeconds);
}

function createFallingItem() {
    if (!gameRunning) {
        return;
    }

    const progress = getDifficultyProgress();
    const dynamicSpeed =
        gameConfig.fallingSpeed * (1 + progress * 1.5) +
        Math.random() * 1.5;

    const dynamicObstacleChance =
        gameConfig.obstacleChance + progress * 0.25;

    const roll = Math.random();
    const isBadItem = roll < dynamicObstacleChance;
    const isBonusItem = !isBadItem && roll > (1 - gameConfig.bonusChance);

    const itemElement = document.createElement("div");

    if (isBadItem) {
        itemElement.className = "falling-item bad-item";
        itemElement.innerHTML = currentTheme.badIcon;
        itemElement.setAttribute("aria-label", "Obstacle");
    } else if (isBonusItem) {
        itemElement.className = "falling-item bonus-item";
        itemElement.innerHTML = svg.trophy;
        itemElement.setAttribute("aria-label", "Bonus");
    } else {
        itemElement.className = "falling-item good-item";
        itemElement.innerHTML = currentTheme.goodIcon;
        itemElement.setAttribute("aria-label", "Collectible");
    }

    const itemWidth = 48;
    const maximumX = Math.max(
        0,
        gameArea.clientWidth - itemWidth
    );

    const itemX = Math.random() * maximumX;

    itemElement.style.left = `${itemX}px`;

    gameArea.appendChild(itemElement);

    fallingItems.push({
        element: itemElement,
        x: itemX,
        y: -55,
        isBad: isBadItem,
        isBonus: isBonusItem,
        speed: dynamicSpeed
    });
}

function moveFallingItems() {
    for (let index = fallingItems.length - 1; index >= 0; index -= 1) {
        const item = fallingItems[index];

        item.y += item.speed;
        item.element.style.top = `${item.y}px`;

        if (isColliding(item.element, player)) {
            handleCollision(item);
            removeFallingItem(index);
            continue;
        }

        if (item.y > gameArea.clientHeight) {
            removeFallingItem(index);
        }
    }
}

function isColliding(firstElement, secondElement) {
    const firstRectangle = firstElement.getBoundingClientRect();
    const secondRectangle = secondElement.getBoundingClientRect();

    return !(
        firstRectangle.right < secondRectangle.left ||
        firstRectangle.left > secondRectangle.right ||
        firstRectangle.bottom < secondRectangle.top ||
        firstRectangle.top > secondRectangle.bottom
    );
}

function handleCollision(item) {
    if (item.isBad) {
        comboCount = 0;
        lives -= 1;

        showScorePopup(
            `-${gameConfig.obstaclePenalty}`,
            item.x,
            item.y,
            "#ff8389"
        );

        gameArea.classList.remove("screen-flash");

        /*
            Reading offsetWidth restarts the CSS animation.
        */
        void gameArea.offsetWidth;

        gameArea.classList.add("screen-flash");

        if (lives <= 0) {
            lives = 0;
            updateScoreboard();
            endGame("lives");
            return;
        }
    } else {
        comboCount += 1;

        const multiplier = comboCount >= 3 ? 2 : 1;
        const basePoints = item.isBonus
            ? gameConfig.pointsPerItem * 3
            : gameConfig.pointsPerItem;
        const earned = basePoints * multiplier;

        score += earned;

        if (comboCount === 3) {
            showScorePopup("COMBO x2! 🔥", item.x, item.y - 30, "#fbbf24");
        }

        const label = item.isBonus
            ? `+${earned} BONUS!`
            : `+${earned}${multiplier > 1 ? " x2" : ""}`;

        const color = item.isBonus ? "#ffd700" : "#a7f0ba";

        showScorePopup(label, item.x, item.y, color);
    }

    updateScoreboard();
}

function removeFallingItem(index) {
    const item = fallingItems[index];

    if (item && item.element.parentNode) {
        item.element.remove();
    }

    fallingItems.splice(index, 1);
}

function removeAllFallingItems() {
    fallingItems.forEach((item) => {
        if (item.element.parentNode) {
            item.element.remove();
        }
    });

    fallingItems = [];
}

/*
    Score popup
*/

function showScorePopup(text, x, y, color) {
    const popup = document.createElement("div");

    popup.className = "score-popup";
    popup.textContent = text;
    popup.style.left = `${x}px`;
    popup.style.top = `${Math.max(0, y)}px`;
    popup.style.color = color;

    gameArea.appendChild(popup);

    window.setTimeout(() => {
        popup.remove();
    }, 700);
}

/*
    Game completion
*/

function endGame(reason) {
    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    stopGameTimers();
    removeAllFallingItems();

    const playerName =
        playerNameDisplay.textContent || "Guest";

    let resultHeading = "Game Complete!";

    if (reason === "lives") {
        resultHeading = "Challenge Over!";
    }

    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    saveHighScore(score);

    const leaderboard = saveLeaderboard(playerName, score);
    const scoreMessage = getScoreMessage(score);
    const isNewBest = score > 0 && score >= highScore;
    const leaderboardHTML = buildLeaderboardHTML(leaderboard);

    submitToSheets(playerName, email, phone, score);

    startOverlay.innerHTML = `
        <div class="overlay-content">
            <div class="large-icon">${currentTheme.playerEmoji}</div>

            <h2>${resultHeading}</h2>

            <p>
                <strong>${escapeHtml(playerName)}</strong>,
                your final score is:
            </p>

            <p style="font-size: 2.2rem; margin: 12px 0;">
                <strong>${score}</strong>
            </p>

            ${isNewBest ? `<p style="color:#a7f0ba; font-weight:700;">🎉 New Best Score!</p>` : `<p style="opacity:0.8;">Best: ${highScore}</p>`}

            <p>${scoreMessage}</p>

            <p>${currentTheme.successMessage}</p>

            ${leaderboardHTML}
        </div>
    `;

    pauseButton.disabled = true;
    pauseButton.textContent = "⏸ Pause";
    startOverlay.classList.remove("hidden");
    startButton.textContent = "Play Again";
}

function getScoreMessage(finalScore) {
    if (finalScore >= 300) {
        return "Outstanding! You're ready for IBM Think. 🏆";
    }

    if (finalScore >= 150) {
        return "Excellent! IBM watsonx would be proud of you. 🚀";
    }

    if (finalScore >= 50) {
        return "Good start! Every IBM innovation begins with curiosity. 💡";
    }

    return "Keep going! Even Deep Blue lost before it won. 🤖";
}

/*
    Scoreboard
*/

function updateScoreboard() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    timeDisplay.textContent = timeRemaining;
    highScoreDisplay.textContent = highScore;

    const timeCard = timeDisplay.closest(".score-card");

    if (timeRemaining <= 10 && gameRunning) {
        timeCard.classList.add("urgent");
    } else {
        timeCard.classList.remove("urgent");
    }
}

/*
    Input controls
*/

function pauseGame() {
    if (!gameRunning || gamePaused) {
        return;
    }

    gamePaused = true;

    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    window.clearInterval(spawnTimerId);
    spawnTimerId = null;
    window.clearInterval(countdownTimerId);
    countdownTimerId = null;

    pauseOverlay.classList.remove("hidden");
    pauseButton.textContent = "▶ Resume";
}

function resumeGame() {
    if (!gameRunning || !gamePaused) {
        return;
    }

    gamePaused = false;

    pauseOverlay.classList.add("hidden");
    pauseButton.textContent = "⏸ Pause";

    function restartSpawnTimer() {
        if (spawnTimerId !== null) {
            window.clearInterval(spawnTimerId);
        }

        const progress = getDifficultyProgress();
        const interval = Math.round(
            gameConfig.spawnIntervalMilliseconds * (1 - progress * 0.5)
        );

        spawnTimerId = window.setInterval(createFallingItem, interval);
    }

    restartSpawnTimer();

    countdownTimerId = window.setInterval(() => {
        timeRemaining -= 1;
        updateScoreboard();
        restartSpawnTimer();

        if (timeRemaining <= 0) {
            endGame("time");
        }
    }, 1000);

    animationFrameId = window.requestAnimationFrame(gameLoop);
    gameArea.focus();
}

function togglePause() {
    if (gamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function isTypingInInput() {
    const tag = document.activeElement?.tagName;
    const type = document.activeElement?.type;

    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        document.activeElement?.isContentEditable
    );
}

document.addEventListener("keydown", (event) => {
    if (isTypingInInput()) {
        return;
    }

    const key = event.key.toLowerCase();

    if (event.code === "Space" && gameRunning) {
        event.preventDefault();
        togglePause();
    }

    if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        moveLeft = true;
    }

    if (key === "arrowright" || key === "d") {
        event.preventDefault();
        moveRight = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (isTypingInInput()) {
        return;
    }

    const key = event.key.toLowerCase();

    if (key === "arrowleft" || key === "a") {
        moveLeft = false;
    }

    if (key === "arrowright" || key === "d") {
        moveRight = false;
    }
});

function activateMovementButton(button, direction) {
    const startMoving = (event) => {
        event.preventDefault();

        if (direction === "left") {
            moveLeft = true;
        } else {
            moveRight = true;
        }
    };

    const stopMoving = (event) => {
        event.preventDefault();

        if (direction === "left") {
            moveLeft = false;
        } else {
            moveRight = false;
        }
    };

    button.addEventListener("pointerdown", startMoving);
    button.addEventListener("pointerup", stopMoving);
    button.addEventListener("pointercancel", stopMoving);
    button.addEventListener("pointerleave", stopMoving);
}

activateMovementButton(moveLeftButton, "left");
activateMovementButton(moveRightButton, "right");

/*
    Interface events
*/

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
resetButton.addEventListener("click", resetGame);

themeSelect.addEventListener("change", () => {
    if (!gameRunning) {
        applyTheme(themeSelect.value);
    }
});

howToPlayButton.addEventListener("click", () => {
    if (typeof instructionsDialog.showModal === "function") {
        instructionsDialog.showModal();
    } else {
        window.alert(
            "Use the arrow keys or A and D to move. " +
            "Collect good items and avoid obstacles."
        );
    }
});

closeDialogButton.addEventListener("click", () => {
    instructionsDialog.close();
});

/*
    Basic HTML escaping for user-supplied names.
*/

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

initializeGame();