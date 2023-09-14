window.onload = function () {
  const startButton = document.getElementById("start-button");
  const restartButtons = document.getElementsByClassName("restart-button");
  let game;

  startButton.addEventListener("click", function () {
    startGame();
  });

  for (const restartButton of restartButtons) {
    restartButton.addEventListener("click", function () {
      startGame();
    });
  }

  function startGame() {
    console.log("start game");
    game = new Game();
    game.startGame();
  }

  window.addEventListener("keydown", (e) => handleKeydown(e, game.player));
  window.addEventListener("keyup", (e) => handleKeyup(e, game.player));

  function handleKeydown(e, player) {
    if (e.key === "ArrowUp") {
      player.directionY = -6;
    } else if (e.key === "ArrowDown") {
      player.directionY = 6;
    } else if (e.key === " ") {
      player.shoot();
    }
  }

  function handleKeyup(e, player) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      player.directionY = 0;
    }
  }
};

class Game {
  constructor() {
    this.startScreen = document.getElementById("game-intro");
    this.gameScreen = document.getElementById("game-screen");
    this.gameEnd = document.getElementById("game-end");
    this.winScreen = document.getElementById("game-win");
    this.statScreen = document.getElementById("game-container");
    this.gameStats = document.getElementById("game-stats");
    this.introSong = new Audio("./audio/Justice.mp4");
    this.winSong = new Audio("./audio/win.mp3");
    this.loseSong = new Audio("./audio/lose.wav");
    this.explosionSFX = new Audio("./audio/explosion.mp3");
    this.height = 700;
    this.width = 1200;
    this.enemy = [];
    this.bullets = [];
    this.explosionArr = [];
    this.enemyCounter = 0;
    this.bulletCounter = 0;
    this.score = 0;
    this.lives = 3;
    this.gameIsOver = false;
    this.scoreBoard = document.getElementById("game-score");
    this.livesBoard = document.getElementById("game-lives");
    this.player = new Player(
      this.gameScreen,
      80,
      100,
      350,
      30,
      "./images/spaceship.png",
      this
    );
  }

  startGame() {
    this.gameScreen.style.height = `${this.height}px`;
    this.gameScreen.style.width = `${this.width}px`;

    this.startScreen.style.display = "none";
    this.gameEnd.style.display = "none";
    this.winScreen.style.display = "none";
    this.gameScreen.style.display = "block";
    this.statScreen.style.display = "flex";
    this.gameStats.style.display = "block";
    this.introSong.play();
    this.gameLoop();
  }

  gameLoop() {
    this.updateGame();

    if (this.gameIsOver) {
      return;
    }

    this.enemyCounter++;
    if (this.enemyCounter % 40 === 0) {
      this.enemy.push(new Enemy(this.gameScreen));
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = this.enemy.length - 1; j >= 0; j--) {
        if (this.didCollide(this.bullets[i], this.enemy[j])) {
          this.explosionSFX.currentTime = 0;
          this.explosionSFX.volume = 0.5;
          this.explosionSFX.play();
          this.explosionArr.push(
            new Explosion(this.gameScreen, this.bullets[i], this.explosionArr)
          );
          this.bullets[i].element.remove();
          this.bullets.splice(i, 1);
          this.enemy[j].element.remove();
          this.enemy.splice(j, 1);
          this.score += 100;
          break;
        }
      }
    }

    for (let i = this.enemy.length - 1; i >= 0; i--) {
      if (this.didCollide(this.player, this.enemy[i])) {
        this.loseSong.currentTime = 0;
        this.loseSong.play();
        this.enemy[i].element.remove();
        this.enemy.splice(i, 1);
        this.lives--;
        break;
      }
    }

    this.enemy.forEach((element, i) => {
      element.move();
      if (element.right > 1300) {
        this.enemy.splice(i, 1);
      }
    });

    this.bullets.forEach((bullet, i) => {
      bullet.move();
      if (bullet.left > 1300) {
        this.bullets.splice(i, 1);
      }
    });

    window.requestAnimationFrame(() => this.gameLoop());
  }

  didCollide(obj1, obj2) {
    const obj1Properties = obj1.element.getBoundingClientRect();
    const obj2Properties = obj2.element.getBoundingClientRect();

    if (
      obj1Properties.left < obj2Properties.right &&
      obj1Properties.right > obj2Properties.left &&
      obj1Properties.top < obj2Properties.bottom &&
      obj1Properties.bottom > obj2Properties.top
    ) {
      return true;
    } else {
      return false;
    }
  }

  addBullet(left, top) {
    const bullet = new Bullet(this.gameScreen, left, top);
    this.bullets.push(bullet);
  }

  updateGame() {
    this.player.move();

    if (this.lives <= 0) {
      this.endGame();
    } else if (this.score >= 2000) {
      this.winGame();
    }

    this.scoreBoard.innerHTML = this.score;
    this.livesBoard.innerHTML = this.lives;
  }

  winGame() {
    this.introSong.pause();
    this.explosionSFX.pause();
    this.winSong.play();
    this.player.element.remove();
    this.enemy.forEach(function (enemy) {
      enemy.element.remove();
    });
    this.bullets.forEach(function (bullets) {
      bullets.element.remove();
    });
    this.gameIsOver = true;
    this.gameScreen.style.display = "none";
    this.gameStats.style.display = "none";
    this.winScreen.style.display = "flex";
  }

  endGame() {
    this.introSong.pause();
    this.player.element.remove();
    this.enemy.forEach(function (enemy) {
      enemy.element.remove();
    });
    this.bullets.forEach(function (bullets) {
      bullets.element.remove();
    });
    this.gameIsOver = true;
    this.gameScreen.style.display = "none";
    this.gameStats.style.display = "none";
    this.gameEnd.style.display = "flex";
  }
}

class Player {
  constructor(gameScreen, height, width, top, left, imgSrc, game) {
    this.gameScreen = gameScreen;
    this.game = game;
    this.height = height;
    this.width = width;
    this.top = top;
    this.left = left;
    this.directionY = 0;
    this.element = document.createElement("img");
    this.element.src = imgSrc;
    this.element.style.position = "absolute";
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
    this.gameScreen.appendChild(this.element);
  }

  move() {
    this.top += this.directionY;

    if (this.top < 0) {
      this.top = 0;
    } else if (this.top > this.gameScreen.offsetHeight - this.height) {
      this.top = this.gameScreen.offsetHeight - this.height;
    }

    this.updatePosition();
  }

  shoot() {
    const bulletLeft = this.left + this.width;
    const bulletTop = this.top + this.height / 2 - 10;
    this.game.addBullet(bulletLeft, bulletTop);
    let shootSFX = new Audio("./audio/shoot.mp3");
    shootSFX.play();
  }

  updatePosition() {
    this.element.style.left = `${this.left}px`;
    this.element.style.top = `${this.top}px`;
  }
}

class Enemy {
  constructor(gameScreen) {
    this.gameScreen = gameScreen;
    this.top = Math.abs(Math.random() * 700 - 80);
    this.right = 0;
    this.height = 80;
    this.width = 100;
    this.element = document.createElement("img");
    this.element.src = "./images/enemy.png";
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.right = `${this.right}px`;
    this.element.style.top = `${this.top}px`;
    this.gameScreen.appendChild(this.element);
  }
  move() {
    this.right += 10;
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.right = `${this.right}px`;
    this.element.style.top = `${this.top}px`;
  }
}

class Bullet {
  constructor(gameScreen, left, top) {
    this.gameScreen = gameScreen;
    this.top = top;
    this.left = left;
    this.height = 20;
    this.width = 30;
    this.element = document.createElement("img");
    this.element.src = "./images/laser.png";
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.left = `${this.left}px`;
    this.element.style.top = `${this.top}px`;
    this.gameScreen.appendChild(this.element);
  }
  move() {
    this.left += 5;
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.left}px`;
    this.element.style.top = `${this.top}px`;
  }
}

class Explosion {
  constructor(gameScreen, enemy, arr) {
    this.gameScreen = gameScreen;
    this.left = enemy.left;
    this.top = enemy.top;
    this.width = 80;
    this.height = 100;
    this.element = document.createElement("img");
    this.element.src = "./images/explode-boom.gif";
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.left = `${this.left}px`;
    this.element.style.top = `${this.top}px`;
    this.gameScreen.appendChild(this.element);

    this.arr = arr;
    setTimeout(() => {
      this.element.remove();
      this.arr.pop();
    }, 1000);
  }
}
