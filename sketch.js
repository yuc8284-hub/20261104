// 英文小能手 - 畫線連連看遊戲主程式 (p5.js)
const wordPool = [
    { word: "Apple", emoji: "🍎" },
    { word: "Cat", emoji: "🐱" },
    { word: "Dog", emoji: "🐶" },
    { word: "Sun", emoji: "☀️" },
    { word: "Book", emoji: "📖" },
    { word: "Fish", emoji: "🐟" },
    { word: "Tree", emoji: "🌳" },
    { word: "Car", emoji: "🚗" },
    { word: "Star", emoji: "⭐" },
    { word: "Ball", emoji: "⚽" },
    { word: "Milk", emoji: "🥛" },
    { word: "House", emoji: "🏠" },
    { word: "Duck", emoji: "🦆" },
    { word: "Moon", emoji: "🌙" },
    { word: "Key", emoji: "🔑" },
    { word: "Hat", emoji: "🎩" },
    { word: "Clock", emoji: "⏰" },
    { word: "Cake", emoji: "🎂" }
];

let currentRound = [];
let imgObjects = [];
let wordObjects = [];
let selectedImg = null;
let feedbackMessage = "👉 請將左側圖片視窗與右側英文單字視窗拉線連起來（點擊右側單字可聽發音）！";
let connectedCount = 0;
let isFinished = false;
let btnRestart;
let permanentLines = [];
let userAnswers = {}; 
let gameStarted = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    noLoop(); 
}

function startGame() {
    gameStarted = true;
    loop();
    initNewRound();
    setupTouchEvents();
}

function draw() {
    if (!gameStarted) return;

    background(251, 248, 204);

    // 繪製大標題
    push();
    fill(51);
    textSize(width < 768 ? 24 : 34);
    textStyle(BOLD);
    text("英文小能手", width / 2, 30);
    
    // 提示與鼓勵文字
    textSize(width < 768 ? 13 : 16);
    textStyle(NORMAL);
    fill(80);
    text(feedbackMessage, width / 2, 65);
    pop();

    // 繪製藍色大框框
    let boxW = min(width - 60, 900);
    let boxH = height - 120;
    let boxX = width / 2;
    let boxY = height / 2 + 25;

    push();
    stroke(163, 196, 243); 
    strokeWeight(6);
    fill(255, 255, 255, 230);
    rectMode(CENTER);
    rect(boxX, boxY, boxW, boxH, 20);
    pop();

    // 繪製已連好的線條
    for (let lineItem of permanentLines) {
        push();
        stroke(lineItem.color);
        strokeWeight(6);
        line(lineItem.x1, lineItem.y1, lineItem.x2, lineItem.y2);
        pop();
    }

    // 若正在拖曳，即時繪製虛線
    if (selectedImg && mouseIsPressed) {
        push();
        stroke(163, 196, 243);
        strokeWeight(5);
        drawingContext.setLineDash([6, 6]);
        line(selectedImg.x, selectedImg.y, mouseX, mouseY);
        pop();
    }

    // 繪製左側圖片與右側單字視窗
    for (let imgObj of imgObjects) {
        imgObj.display();
    }
    for (let wordObj of wordObjects) {
        wordObj.display();
    }

    // 全部連完時顯示重新開始按鈕
    if (isFinished) {
        btnRestart.show();
    } else {
        if (btnRestart) btnRestart.hide();
    }
}

// 初始化新的一輪題目（每次隨機挑選不同的 6 題）
function initNewRound() {
    isFinished = false;
    selectedImg = null;
    connectedCount = 0;
    permanentLines = [];
    userAnswers = {};
    feedbackMessage = "👉 請將左側圖片視窗與右側英文單字視窗拉線連起來（點擊右側單字可聽發音）！";

    let shuffledPool = [...wordPool].sort(() => Math.random() - 0.5);
    
    if (currentRound.length > 0 && shuffledPool[0].word === currentRound[0].word) {
        let temp = shuffledPool[0];
        shuffledPool[0] = shuffledPool[6];
        shuffledPool[6] = temp;
    }

    currentRound = shuffledPool.slice(0, 6);

    let shuffledImgs = [...currentRound].sort(() => Math.random() - 0.5);
    let shuffledWords = [...currentRound].sort(() => Math.random() - 0.5);

    imgObjects = [];
    wordObjects = [];

    let boxW = min(width - 60, 900);
    let startXImg = width / 2 - boxW / 3.5;
    let startXWord = width / 2 + boxW / 3.5;
    
    let startY = (height / 2 + 25) - 140;
    let spacingY = 58; 

    for (let i = 0; i < shuffledImgs.length; i++) {
        let y = startY + i * spacingY;
        imgObjects.push(new ImgWindow(startXImg, y, shuffledImgs[i]));
    }

    for (let i = 0; i < shuffledWords.length; i++) {
        let y = startY + i * spacingY;
        wordObjects.push(new WordWindow(startXWord, y, shuffledWords[i]));
    }

    if (!btnRestart) {
        btnRestart = createButton('再玩一次 / 下一關');
        btnRestart.style('background-color', '#a3c4f3');
        btnRestart.style('border', 'none');
        btnRestart.style('border-radius', '30px');
        btnRestart.style('padding', '8px 20px');
        btnRestart.style('font-size', '15px');
        btnRestart.style('font-weight', 'bold');
        btnRestart.style('cursor', 'pointer');
        btnRestart.style('box-shadow', '0 4px 10px rgba(0,0,0,0.1)');
        btnRestart.mousePressed(initNewRound);
    }
    positionButton();
}

function positionButton() {
    if (btnRestart) {
        btnRestart.position(width / 2 - btnRestart.elt.offsetWidth / 2, height - 45);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (gameStarted && !isFinished) {
        initNewRound();
    }
}

function mousePressed() {
    if (!gameStarted || isFinished) return;

    for (let imgObj of imgObjects) {
        if (!imgObj.connected && imgObj.contains(mouseX, mouseY)) {
            selectedImg = imgObj;
            return;
        }
    }

    for (let wordObj of wordObjects) {
        if (wordObj.contains(mouseX, mouseY)) {
            speakWord(wordObj.data.word);
            return;
        }
    }
}

function mouseReleased() {
    if (!gameStarted || !selectedImg || isFinished) return;

    for (let wordObj of wordObjects) {
        if (!wordObj.connected && wordObj.contains(mouseX, mouseY)) {
            userAnswers[selectedImg.data.word] = wordObj.data.word;
            
            let lineData = { 
                x1: selectedImg.x, 
                y1: selectedImg.y, 
                x2: wordObj.x, 
                y2: wordObj.y, 
                color: '#a3c4f3' 
            };

            selectedImg.connected = true;
            wordObj.connected = true;

            permanentLines.push(lineData);
            connectedCount++;

            if (connectedCount === 6) {
                evaluateResults();
            } else {
                feedbackMessage = `已連線 ${connectedCount} / 6 題，繼續加油！`;
            }
            break;
        }
    }

    selectedImg = null;
}

// 6 題全部連完後統一結算（對：#b9fbc0，錯：#ad2831）
function evaluateResults() {
    isFinished = true;
    let correctCount = 0;
    let evaluatedLines = [];

    for (let i = 0; i < imgObjects.length; i++) {
        let imgObj = imgObjects[i];
        let correctWord = imgObj.data.word;
        let chosenWord = userAnswers[correctWord];
        let currentLine = permanentLines[i];

        let lineColor = '#ad2831'; // 連錯：紅線
        if (correctWord === chosenWord) {
            correctCount++;
            lineColor = '#b9fbc0'; // 連對：綠線
        }

        evaluatedLines.push({
            x1: currentLine.x1,
            y1: currentLine.y1,
            x2: currentLine.x2,
            y2: currentLine.y2,
            color: lineColor
        });
    }

    permanentLines = evaluatedLines;
    let wrongCount = 6 - correctCount;
    feedbackMessage = `🎉 全部完成！答對 ${correctCount} 題，答錯 ${wrongCount} 題！`;
}

function speakWord(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

function setupTouchEvents() {
    let canvasElt = document.querySelector('canvas');
    if (!canvasElt) return;

    canvasElt.addEventListener('touchstart', (e) => {
        if (!gameStarted || isFinished) return;
        let touch = e.touches[0];
        let rect = canvasElt.getBoundingClientRect();
        let mx = touch.clientX - rect.left;
        let my = touch.clientY - rect.top;

        for (let imgObj of imgObjects) {
            if (!imgObj.connected && imgObj.contains(mx, my)) {
                selectedImg = imgObj;
                break;
            }
        }
        e.preventDefault();
    }, { passive: false });

    canvasElt.addEventListener('touchend', (e) => {
        if (!gameStarted || !selectedImg || isFinished) return;
        let touch = e.changedTouches[0];
        let rect = canvasElt.getBoundingClientRect();
        let mx = touch.clientX - rect.left;
        let my = touch.clientY - rect.top;

        for (let wordObj of wordObjects) {
            if (!wordObj.connected && wordObj.contains(mx, my)) {
                userAnswers[selectedImg.data.word] = wordObj.data.word;
                
                let lineData = { 
                    x1: selectedImg.x, 
                    y1: selectedImg.y, 
                    x2: wordObj.x, 
                    y2: wordObj.y, 
                    color: '#a3c4f3' 
                };

                selectedImg.connected = true;
                wordObj.connected = true;

                permanentLines.push(lineData);
                connectedCount++;

                if (connectedCount === 6) {
                    evaluateResults();
                } else {
                    feedbackMessage = `已連線 ${connectedCount} / 6 題，繼續加油！`;
                }
                break;
            }
        }

        selectedImg = null;
        e.preventDefault();
    }, { passive: false });
}

class ImgWindow {
    constructor(x, y, data) {
        this.x = x;
        this.y = y;
        this.w = 90;
        this.h = 42;
        this.data = data;
        this.connected = false;
    }

    display() {
        push();
        rectMode(CENTER);
        fill(this.connected ? 238 : 244, this.connected ? 244 : 249, 255);
        stroke(163, 196, 243);
        strokeWeight(4);
        rect(this.x, this.y, this.w, this.h, 12);

        noStroke();
        textSize(24);
        text(this.data.emoji, this.x, this.y - 2);
        pop();
    }

    contains(px, py) {
        return (
            px > this.x - this.w / 2 &&
            px < this.x + this.w / 2 &&
            py > this.y - this.h / 2 &&
            py < this.y + this.h / 2
        );
    }
}

class WordWindow {
    constructor(x, y, data) {
        this.x = x;
        this.y = y;
        this.w = 115;
        this.h = 42;
        this.data = data;
        this.connected = false;
    }

    display() {
        push();
        rectMode(CENTER);
        fill(this.connected ? 238 : 255, this.connected ? 244 : 255, 255);
        stroke(163, 196, 243);
        strokeWeight(4);
        rect(this.x, this.y, this.w, this.h, 12);

        noStroke();
        fill(51);
        textSize(17);
        textStyle(BOLD);
        text(this.data.word, this.x, this.y);
        pop();
    }

    contains(px, py) {
        return (
            px > this.x - this.w / 2 &&
            px < this.x + this.w / 2 &&
            py > this.y - this.h / 2 &&
            py < this.y + this.h / 2
        );
    }
}