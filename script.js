const API_URL = "https://opentdb.com/api.php?amount=50";
const progressBar = document.getElementById("progress-bar");
const questionBox = document.getElementById("question-box");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const skipBtn = document.getElementById("skip-btn");
const answeredCountEl = document.getElementById("answered-count");
const totalCountEl = document.getElementById("total-count");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");

let questions = [];
let current = 0;
let answered = 0;
let statusArr = Array(50).fill(null); // null: not answered, true: answered, false: skipped
let timer = null;
let timeLeft = 15;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function renderProgress() {
  progressBar.innerHTML = "";
  for (let i = 0; i < statusArr.length; i++) {
    const box = document.createElement("span");
    box.className = "progress-checkbox";
    if (statusArr[i] === true) box.classList.add("answered");
    else if (statusArr[i] === false) box.classList.add("skipped");
    progressBar.appendChild(box);
  }
}

function renderStatus() {
  answeredCountEl.textContent = answered;
}

function renderQuestion() {
  if (current >= questions.length) {
    finishQuiz();
    return;
  }
  renderProgress();
  renderStatus();
  timeLeft = 15;
  timerEl.textContent = timeLeft;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      markSkipped();
    }
  }, 1000);

  const q = questions[current];
  questionEl.innerHTML = decodeHTML(q.question);
  answersEl.innerHTML = "";
  let options = q.incorrect_answers.concat(q.correct_answer);
  shuffle(options);
  options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.innerHTML = decodeHTML(option);
    btn.onclick = () => {
      markAnswered(option === q.correct_answer);
    };
    answersEl.appendChild(btn);
  });
}

function markAnswered(isCorrect) {
  clearInterval(timer);
  statusArr[current] = true;
  answered++;
  renderProgress();
  renderStatus();
  nextQuestion();
}

function markSkipped() {
  clearInterval(timer);
  statusArr[current] = false;
  renderProgress();
  nextQuestion();
}

function nextQuestion() {
  current++;
  renderQuestion();
}

function finishQuiz() {
  questionBox.style.display = "none";
  resultEl.style.display = "block";
  const skipped = statusArr.filter(x => x === false).length;
  resultEl.innerHTML = `
    <h2>Quiz Finished!</h2>
    <p>Answered: ${answered} / ${questions.length}</p>
    <p>Skipped: ${skipped}</p>
  `;
}

skipBtn.onclick = markSkipped;

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Fetch questions and start quiz
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    questions = data.results;
    totalCountEl.textContent = questions.length;
    renderQuestion();
  })
  .catch(() => {
    questionBox.innerHTML = "Failed to load questions. Please refresh.";
  });