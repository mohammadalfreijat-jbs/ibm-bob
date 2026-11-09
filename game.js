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

const themes = {
    technology: {
        title: "IBM Bob Catch Challenge",
        description: "Collect the AI stars and avoid the bugs.",
        playerIcon: "🤖",
        goodIcon: "⭐",
        badIcon: "🐞",
        primaryColor: "#0f62fe",
        accentColor: "#78a9ff",
        backgroundStart: "#071a2f",
        backgroundEnd: "#123f68",
        successMessage: "You powered the future with AI!"
    },

    cybersecurity: {
        title: "Cybersecurity Defense Challenge",
        description: "Collect protected data and avoid cyber threats.",
        playerIcon: "🛡️",
        goodIcon: "🔐",
        badIcon: "🦠",
        primaryColor: "#007d79",
        accentColor: "#42be65",
        backgroundStart: "#061a18",
        backgroundEnd: "#0b4f4a",
        successMessage: "You protected the digital environment!"
    },

    smartCity: {
        title: "Smart City Challenge",
        description: "Collect clean energy and avoid traffic barriers.",
        playerIcon: "🚙",
        goodIcon: "⚡",
        badIcon: "🚧",
        primaryColor: "#198038",
        accentColor: "#a7f0ba",
        backgroundStart: "#082b16",
        backgroundEnd: "#165c31",
        successMessage: "You helped build a smarter city!"
    },

    watsonx: {
        title: "IBM watsonx AI Challenge",
        description: "Collect AI insights and avoid hallucinations.",
        playerIcon: "🧠",
        goodIcon: "💡",
        badIcon: "🌀",
        primaryColor: "#8a3ffc",
        accentColor: "#d4bbff",
        backgroundStart: "#1a0533",
        backgroundEnd: "#3d1473",
        successMessage: "You mastered the power of IBM watsonx AI!"
    },

    gitex: {
        title: "GITEX 2026 — IBM Challenge",
        description: "Collect innovation tokens and avoid disruptions.",
        playerIcon: "🌐",
        goodIcon: "🔷",
        badIcon: "⚠️",
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
const resetButton = document.getElementById("resetButton");

const moveLeftButton = document.getElementById("moveLeftButton");
const moveRightButton = document.getElementById("moveRightButton");

const howToPlayButton = document.getElementById("howToPlayButton");
const instructionsDialog = document.getElementById("instructionsDialog");
const closeDialogButton = document.getElementById("closeDialogButton");

/*
    Game state
*/

let gameRunning = false;
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
    player.textContent = currentTheme.playerIcon;

    const overlayIcon = startOverlay.querySelector(".large-icon");

    if (overlayIcon) {
        overlayIcon.textContent = currentTheme.playerIcon;
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
            <div class="large-icon">${currentTheme.playerIcon}</div>
            <h2>Ready to play?</h2>
            <p>${currentTheme.description}</p>
            <p>
                Choose your settings and select
                <strong>Start Game</strong>.
            </p>
        </div>
    `;

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

    const roll = Math.random();
    const isBadItem = roll < gameConfig.obstacleChance;
    const isBonusItem = !isBadItem && roll > (1 - gameConfig.bonusChance);

    const itemElement = document.createElement("div");

    if (isBadItem) {
        itemElement.className = "falling-item bad-item";
        itemElement.textContent = currentTheme.badIcon;
        itemElement.setAttribute("aria-label", "Obstacle");
    } else if (isBonusItem) {
        itemElement.className = "falling-item bonus-item";
        itemElement.textContent = "🏆";
        itemElement.setAttribute("aria-label", "Bonus");
    } else {
        itemElement.className = "falling-item good-item";
        itemElement.textContent = currentTheme.goodIcon;
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
            <div class="large-icon">${currentTheme.playerIcon}</div>

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

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

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