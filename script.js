const lines = document.getElementById("lines");
const lettres = document.getElementById("lettres");
const tries = document.getElementById("tries");
const restartGameBtn = document.getElementById("restart");
const backdrop = document.getElementById("backdrop");
const gameOver = document.getElementById("game-over");
const gameOverTitle = document.querySelector("#game-over h2");
const gameOverText = document.querySelector("#game-over p");
const hangmanPicture = document.getElementById("hangman");

const numberOfTries = 6;
let correctAnswersCount = 0;
let badAnswerCount = 0;
let score = 0;
let gameOutcome = "";
let lettersGuessed = 0;
let lettersArray = [];
let gameActive = true;
let wordToGuess = "";
let letterElements;
let uniqueLetters = [];

const generateRandomWord = async () => {
  const response = await fetch("https://trouve-mot.fr/api/random");
  const generatedWord = await response.json();
  console.log(generatedWord[0].name);
  return generatedWord[0].name;
};

const beginGame = async () => {
  wordToGuess = await generateRandomWord();
  lettersArray = wordToGuess.split("");

  lines.innerHTML = lettersArray
    .map(
      (letter) => `
      <div class="line">
        <div class="letter-in-a-word">${letter}</div>
        <img src="./assets/Line 14.png" alt="Line" />
      </div>
    `
    )
    .join("");

  letterElements = document.querySelectorAll(".letter-in-a-word");

  letterElements.forEach((letterElement) => {
    letterElement.style.display = "none";
  });

  // const correctGuesses = [];

  console.log(lettersArray);
};

const endGame = (gameOutcome, wordToGuess = "") => {
  gameActive = false;
  backdrop.style.display = "block";
  gameOver.style.display = "block";
  if (gameOutcome === "lost") {
    const revelation = document.createElement("span");
    revelation.id = "revelation";
    revelation.textContent = wordToGuess;
    gameOverText.textContent = "Dommage ! Le mot était ";
    gameOverText.appendChild(revelation);
    gameOverText.innerHTML += ". La prochaine fois sera la bonne.";
    gameOverTitle.textContent = "PERDU";
    return;
  }
  if (gameOutcome === "won") {
    score = 100 - badAnswerCount * 10;
    gameOverText.textContent = `Tu as obtenu un score de ${score}/100`;
    gameOverTitle.textContent = "BRAVO";
    return;
  }
};

const restartGame = async () => {
  gameActive = true;
  score = 0;
  badAnswerCount = 0;
  lettersGuessed = 0;
  lettersArray = [];
  backdrop.style.display = "none";
  gameOver.style.display = "none";
  tries.style.display = "none";
  lettres.textContent = "";
  hangmanPicture.src = `./assets/Hangman${badAnswerCount + 1}.png`;
  uniqueLetters = [];

  await beginGame();
};

restartGameBtn.addEventListener("click", () => {
  restartGame();
});

beginGame();

document.addEventListener("keydown", (e) => {
  if (!gameActive) return;
  if (
    uniqueLetters.some(
      (uniqueLetter) => uniqueLetter.toLowerCase() === e.key.toLowerCase()
    )
  ) {
    alert("You already guessed this letter.");
    return;
  }
  if (/^[a-zA-ZéàèêâôîûïçÉÀÈÊÂÔÎÛÏÇ]$/.test(e.key)) {
    const userAnswer = e.key.toLowerCase();

    // Check if the user's answer exists in the word
    if (lettersArray.includes(userAnswer)) {
      // Iterate through each letter and update lines
      uniqueLetters.push(userAnswer);
      for (let i = 0; i < lettersArray.length; i++) {
        if (userAnswer === lettersArray[i]) {
          const line = document.querySelectorAll(".line")[i];
          const letterInWord = line.querySelector(".letter-in-a-word");

          letterInWord.textContent = userAnswer;
          letterElements[i].style.display = "block";

          lettersGuessed++;

          if (lettersGuessed === lettersArray.length) {
            return endGame("won");
          }
        }
      }
    } else {
      tries.style.display = "block";

      // Check if it's the first letter, then no comma is needed
      if (lettres.textContent === "") {
        lettres.textContent += userAnswer.toUpperCase();
      } else {
        lettres.textContent += `, ${userAnswer.toUpperCase()}`;
      }
      badAnswerCount++;
      hangmanPicture.src = `./assets/Hangman${badAnswerCount + 1}.png`;
      if (badAnswerCount === numberOfTries) {
        return endGame("lost", wordToGuess);
      }
    }
    console.log(lettersGuessed, wordToGuess.length);
  }
});

if (!gameActive) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Esc") {
      restartGame();
    }
  });
}
