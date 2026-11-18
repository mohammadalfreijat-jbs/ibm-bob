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

    /*
     * Player — IBM Carbon "Bot" icon style
     * Teal (#008080) body, white face, #3ddbd9 antenna
     */
    robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <!-- antenna -->
        <line x1="16" y1="7" x2="16" y2="4" stroke="#3ddbd9" stroke-width="1.5"/>
        <circle cx="16" cy="3" r="1.5" fill="#3ddbd9"/>
        <!-- head -->
        <rect x="9" y="7" width="14" height="10" rx="2" fill="#008080"/>
        <!-- eyes -->
        <rect x="12" y="10" width="3" height="3" rx="0.5" fill="#3ddbd9"/>
        <rect x="17" y="10" width="3" height="3" rx="0.5" fill="#3ddbd9"/>
        <!-- mouth bar -->
        <rect x="13" y="15" width="6" height="1" rx="0.5" fill="#ffffff" opacity="0.7"/>
        <!-- body -->
        <rect x="11" y="18" width="10" height="7" rx="1" fill="#008080"/>
        <!-- chest light -->
        <rect x="14" y="20" width="4" height="2" rx="0.5" fill="#3ddbd9" opacity="0.9"/>
        <!-- legs -->
        <rect x="12" y="25" width="3" height="3" rx="1" fill="#005a5a"/>
        <rect x="17" y="25" width="3" height="3" rx="1" fill="#005a5a"/>
    </svg>`,

    /*
     * Good item — IBM Carbon "Star" (filled, 5-point)
     * Carbon Yellow (#f1c21b) with warm stroke
     */
    star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <polygon
            points="16,5 19.1,12.5 27.4,12.5 21,17.5 23.6,25 16,20.5 8.4,25 11,17.5 4.6,12.5 12.9,12.5"
            fill="#f1c21b" stroke="#d4a017" stroke-width="1" stroke-linejoin="round"/>
    </svg>`,

    /*
     * Bad item — IBM Carbon "Error" / Bug
     * Carbon Red (#da1e28), clean segmented body
     */
    bug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <!-- head -->
        <circle cx="16" cy="10" r="4" fill="#da1e28"/>
        <!-- antennae -->
        <line x1="13" y1="7"  x2="10" y2="4"  stroke="#da1e28" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="19" y1="7"  x2="22" y2="4"  stroke="#da1e28" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="10" cy="4" r="1.2" fill="#ff8389"/>
        <circle cx="22" cy="4" r="1.2" fill="#ff8389"/>
        <!-- body segments -->
        <ellipse cx="16" cy="18" rx="5" ry="6" fill="#da1e28"/>
        <line x1="11" y1="16" x2="11" y2="20" stroke="#ff8389" stroke-width="0.8" opacity="0.5"/>
        <line x1="21" y1="16" x2="21" y2="20" stroke="#ff8389" stroke-width="0.8" opacity="0.5"/>
        <!-- legs — three pairs -->
        <line x1="11" y1="15" x2="6"  y2="13" stroke="#ff8389" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="11" y1="19" x2="6"  y2="19" stroke="#ff8389" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="11" y1="23" x2="6"  y2="25" stroke="#ff8389" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="21" y1="15" x2="26" y2="13" stroke="#ff8389" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="21" y1="19" x2="26" y2="19" stroke="#ff8389" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="21" y1="23" x2="26" y2="25" stroke="#ff8389" stroke-width="1.5" stroke-linecap="round"/>
        <!-- eyes -->
        <circle cx="14" cy="9.5" r="1" fill="#fff" opacity="0.9"/>
        <circle cx="18" cy="9.5" r="1" fill="#fff" opacity="0.9"/>
    </svg>`,

    /*
     * Bonus item — IBM Carbon "Trophy" (award)
     * Carbon Gold palette
     */
    trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <!-- cup body -->
        <path d="M10 5 L10 18 C10 22 22 22 22 18 L22 5 Z" fill="#f1c21b" stroke="#d4a017" stroke-width="1.5"/>
        <!-- cup handles -->
        <path d="M10 8 C10 8 6 8 6 12 C6 16 10 16 10 16" stroke="#d4a017" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M22 8 C22 8 26 8 26 12 C26 16 22 16 22 16" stroke="#d4a017" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <!-- shine line -->
        <line x1="13" y1="8"  x2="13" y2="17" stroke="#fff" stroke-width="1" opacity="0.4"/>
        <!-- stem -->
        <rect x="14" y="22" width="4" height="4" fill="#d4a017"/>
        <!-- base -->
        <rect x="10" y="26" width="12" height="2" rx="1" fill="#d4a017"/>
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
        primaryColor: "#008080",
        accentColor: "#3ddbd9",
        backgroundStart: "#071a2f",
        backgroundEnd: "#123f68",
        successMessage: "You powered the future with IBM Bob!"
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
const SHEETS_ENDPOINT = "https://defaultf8732124c5e24e519ce15530ffc7be.54.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/01/workflows/6585114da5834e07921fdb2b9d455acc/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dArTugVYUVM5DMdoUeC_-U157bc-OpBFRaSiX4GLF4M";

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

    applyTheme("technology");

    const enteredName = playerNameInput.value.trim();

    playerNameDisplay.textContent =
        enteredName.length > 0 ? enteredName : "Guest";

    currentPlayerSpeed = gameConfig.playerSpeeds.normal;
    gameConfig.pointsPerItem = 10;

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
    const el = document.activeElement;

    if (!el) {
        return false;
    }

    if (el.isContentEditable || el.tagName === "TEXTAREA") {
        return true;
    }

    if (el.tagName === "INPUT") {
        const textTypes = new Set([
            "text", "email", "tel", "password",
            "search", "url", "number"
        ]);

        return textTypes.has((el.type || "text").toLowerCase());
    }

    return false;
}

document.addEventListener("keydown", (event) => {
    if (isTypingInInput() || !gameRunning) {
        return;
    }

    const key = event.key.toLowerCase();

    if (event.code === "Space") {
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
    if (isTypingInInput() || !gameRunning) {
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

/*
    Registration screen → game screen transition
*/

(function setupRegistration() {
    const regScreen   = document.getElementById("registrationScreen");
    const gameScreen  = document.getElementById("gameScreen");
    const regForm     = document.getElementById("registrationForm");
    const regName     = document.getElementById("reg-name");
    const regEmail    = document.getElementById("reg-email");
    const regPhone    = document.getElementById("reg-phone");
    const nameError   = document.getElementById("reg-name-error");
    const emailError  = document.getElementById("reg-email-error");

    if (!regScreen || !regForm) {
        return;
    }

    regForm.addEventListener("submit", function (event) {
        event.preventDefault();

        /* — Validate — */
        let valid = true;

        const nameVal  = regName.value.trim();
        const emailVal = regEmail.value.trim();

        if (nameVal.length === 0) {
            regName.classList.add("cds-input--error");
            nameError.hidden = false;
            valid = false;
        } else {
            regName.classList.remove("cds-input--error");
            nameError.hidden = true;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailVal)) {
            regEmail.classList.add("cds-input--error");
            emailError.hidden = false;
            valid = false;
        } else {
            regEmail.classList.remove("cds-input--error");
            emailError.hidden = true;
        }

        if (!valid) {
            return;
        }

        /* — Populate hidden game inputs — */
        playerNameInput.value = nameVal;
        emailInput.value      = emailVal;
        phoneInput.value      = regPhone.value.trim();

        /* — Show player name immediately in the scoreboard — */
        playerNameDisplay.textContent = nameVal;

        /* — Slide to game screen — */
        document.documentElement.classList.add("game-active");
        regScreen.addEventListener("transitionend", function onDone() {
            regScreen.hidden = true;
            regScreen.removeEventListener("transitionend", onDone);
        }, { once: true });

        /* — Initialise game now that the canvas is visible — */
        initializeGame();
    });
}());
