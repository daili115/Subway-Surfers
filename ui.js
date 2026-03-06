export class UIManager {
  constructor() {
    this.scoreEl = document.getElementById('score');
    this.bestEl = document.getElementById('best-score');
    this.finalScoreEl = document.getElementById('final-score');
    this.finalBestScoreEl = document.getElementById('final-best-score');

    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');

    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.volumeSlider = document.getElementById('volume');
    this.muteBtn = document.getElementById('mute-btn');

    this.bestScore = Number(localStorage.getItem('neon_subway_best') || 0);
    this.bestEl.textContent = this.bestScore;
  }

  showStart() {
    this.startScreen.classList.add('visible');
    this.gameOverScreen.classList.remove('visible');
  }

  hideStart() {
    this.startScreen.classList.remove('visible');
  }

  showGameOver(score) {
    this.finalScoreEl.textContent = Math.floor(score);
    this.finalBestScoreEl.textContent = this.bestScore;
    this.gameOverScreen.classList.add('visible');
  }

  hideGameOver() {
    this.gameOverScreen.classList.remove('visible');
  }

  updateScore(score) {
    this.scoreEl.textContent = Math.floor(score);
    if (score > this.bestScore) {
      this.bestScore = Math.floor(score);
      this.bestEl.textContent = this.bestScore;
      localStorage.setItem('neon_subway_best', String(this.bestScore));
    }
  }

  setMuteLabel(muted) {
    this.muteBtn.textContent = muted ? 'Unmute' : 'Mute';
  }
}
