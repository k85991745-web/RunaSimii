/* =========================================================
   RUNASIMI
   Lunéa
========================================================= */


/* =========================================================
   VOCABULARIO
========================================================= */

const vocabulary = [

  {
    id: 1,
    quechua: "Rimaykullayki",
    spanish: "Hola / saludo",
    variety: "Por verificar",
    unit: 1,
    stage: 1
  },

  {
    id: 2,
    quechua: "Allin p'unchay",
    spanish: "Buenos días",
    variety: "Por verificar",
    unit: 1,
    stage: 1
  },

  {
    id: 3,
    quechua: "Allin tuta",
    spanish: "Buenas noches",
    variety: "Por verificar",
    unit: 1,
    stage: 1
  },

  {
    id: 4,
    quechua: "Tupananchiskama",
    spanish: "Hasta luego",
    variety: "Por verificar",
    unit: 1,
    stage: 1
  }

];


/* =========================================================
   ETAPAS
========================================================= */

const stages = [

  {
    id: 1,
    title: "Primeros saludos",
    description: "Aprende tus primeras palabras.",
  },

  {
    id: 2,
    title: "Reconoce los saludos",
    description: "Identifica expresiones básicas.",
  },

  {
    id: 3,
    title: "Relaciona",
    description: "Relaciona cada palabra con su significado.",
  },

  {
    id: 4,
    title: "Completa",
    description: "Completa expresiones sencillas.",
  },

  {
    id: 5,
    title: "Repaso",
    description: "Repasa lo aprendido.",
  },

  {
    id: 6,
    title: "Nuevos ejemplos",
    description: "Conoce palabras en contexto.",
  },

  {
    id: 7,
    title: "Traducción",
    description: "Practica la traducción.",
  },

  {
    id: 8,
    title: "Comprensión",
    description: "Comprende expresiones.",
  },

  {
    id: 9,
    title: "Gran repaso",
    description: "Pon a prueba todo lo aprendido.",
  },

  {
    id: 10,
    title: "Desafío de unidad",
    description: "Completa el desafío final."

  }

];


/* =========================================================
   ESTADO
========================================================= */

const defaultState = {

  xp: 0,

  streak: 0,

  lives: 5,

  maxLives: 5,

  lifeRegenerationStartedAt: null,

  profileName: "Estudiante",

  profileEmoji: "🌸",

  theme: "light",

  dictionary: [],

  lessonsCompleted: 0,

  totalCorrect: 0,

  totalIncorrect: 0,

  stageProgress: {},

  completedStages: []

};


let state = loadState();


/* =========================================================
   ESTADO DE LECCIÓN
========================================================= */

let currentStage = null;
let currentUnit = 1;

let currentLearnIndex = 0;

let currentWord = null;

let currentQuestionIndex = 0;

let selectedAnswer = null;

let lessonQuestions = [];

let lessonCorrect = 0;

let lessonIncorrect = 0;

let lessonXP = 0;

let wordCardRevealed = false;

let lifeTimerInterval = null;


/* =========================================================
   INICIO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  applyTheme();

  checkLifeRegeneration();

  updateUI();

  renderLearningPath();

  renderDictionary();

  renderProfile();

  showScreen("homeScreen");

});


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadState() {

  const saved = localStorage.getItem("runasimiState");

  if (!saved) {

    return {
      ...defaultState,
      stageProgress: {}
    };

  }

  try {

    const parsed = JSON.parse(saved);

    return {
      ...defaultState,
      ...parsed
    };

  } catch (error) {

    console.error(
      "No se pudo cargar el progreso:",
      error
    );

    return {
      ...defaultState,
      stageProgress: {}
    };

  }

}


function saveState() {

  localStorage.setItem(
    "runasimiState",
    JSON.stringify(state)
  );

}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function showScreen(screenId) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.remove("active");

    });


  const screen = document.getElementById(screenId);

  if (screen) {

    screen.classList.add("active");

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.remove("active");

      if (
        item.dataset.screen === screenId
      ) {

        item.classList.add("active");

      }

    });


  if (screenId === "homeScreen") {
    currentUnit = 1;
    renderLearningPath();
  }

  if (screenId === "resourcesScreen") {

    renderDictionary();

  }

  if (screenId === "accountScreen") {

    renderProfile();

  }

}


function goHome() {

  showScreen("homeScreen");

}


/* =========================================================
   ACTUALIZAR UI
========================================================= */

function updateUI() {

  checkLifeRegeneration();

  document.getElementById("xpValue").textContent =
    state.xp;

  document.getElementById("streakValue").textContent =
    state.streak;

  updateHeartsUI();

  renderLearningPath();

  updateUnitProgress();

}


/* =========================================================
   VIDAS
========================================================= */

/*
   Sistema:

   5 vidas máximas.

   Error:
   -1 vida.

   Al llegar a 0:
   - empieza contador de 20 minutos
   - se bloquean nuevas lecciones
   - al terminar, vuelve a 5 vidas
*/


function updateHeartsUI() {

  const hearts = getHeartsString();

  const button =
    document.getElementById("heartsButton");

  if (button) {

    button.textContent = hearts;

  }


  const learnHearts =
    document.getElementById("learnHearts");

  if (learnHearts) {

    learnHearts.textContent = hearts;

  }


  const practiceHearts =
    document.getElementById("practiceHearts");

  if (practiceHearts) {

    practiceHearts.textContent = hearts;

  }

}


function getHeartsString() {

  let result = "";

  for (
    let i = 0;
    i < state.maxLives;
    i++
  ) {

    if (i < state.lives) {

      result += "❤️";

    } else {

      result += "🖤";

    }

  }

  return result;

}


/* =========================================================
   COMPROBAR REGENERACIÓN
========================================================= */

function checkLifeRegeneration() {

  if (
    state.lives > 0 ||
    !state.lifeRegenerationStartedAt
  ) {

    return;

  }


  const started =
    Number(state.lifeRegenerationStartedAt);

  const now = Date.now();

  const regenerationTime =
    20 * 60 * 1000;

  const elapsed =
    now - started;


  if (elapsed >= regenerationTime) {

    state.lives = state.maxLives;

    state.lifeRegenerationStartedAt = null;

    saveState();

    stopLifeTimer();

    closeNoLives();

    updateUI();

  }

}


/* =========================================================
   QUITAR VIDA
========================================================= */

function loseLife() {

  checkLifeRegeneration();


  if (state.lives <= 0) {

    return false;

  }


  state.lives--;

  saveState();

  updateHeartsUI();


  if (state.lives === 0) {

    startLifeRegeneration();

    return false;

  }


  return true;

}


/* =========================================================
   INICIAR REGENERACIÓN
========================================================= */

function startLifeRegeneration() {

  if (!state.lifeRegenerationStartedAt) {

    state.lifeRegenerationStartedAt =
      Date.now();

  }

  saveState();

  showNoLives();

}


/* =========================================================
   AVISO SIN VIDAS
========================================================= */

function showNoLives() {

  const overlay =
    document.getElementById("noLivesOverlay");

  if (!overlay) return;

  overlay.classList.remove("hidden");

  updateLifeTimer();

  stopLifeTimer();

  lifeTimerInterval =
    setInterval(() => {

      updateLifeTimer();

    }, 1000);

}


/* =========================================================
   TEMPORIZADOR
========================================================= */

function updateLifeTimer() {

  if (!state.lifeRegenerationStartedAt) {

    return;

  }


  const regenerationTime =
    20 * 60 * 1000;

  const elapsed =
    Date.now() -
    Number(state.lifeRegenerationStartedAt);

  const remaining =
    Math.max(
      0,
      regenerationTime - elapsed
    );


  if (remaining <= 0) {

    state.lives = state.maxLives;

    state.lifeRegenerationStartedAt = null;

    saveState();

    stopLifeTimer();

    closeNoLives();

    updateUI();

    return;

  }


  const totalSeconds =
    Math.ceil(remaining / 1000);

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;


  const formatted =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


  const timer =
    document.getElementById("lifeTimer");

  if (timer) {

    timer.textContent = formatted;

  }

}


function stopLifeTimer() {

  if (lifeTimerInterval) {

    clearInterval(lifeTimerInterval);

    lifeTimerInterval = null;

  }

}


/* =========================================================
   CERRAR AVISO
========================================================= */

function closeNoLives() {

  const overlay =
    document.getElementById("noLivesOverlay");

  if (overlay) {

    overlay.classList.add("hidden");

  }

  stopLifeTimer();

}


/* =========================================================
   INFORMACIÓN DE VIDAS
========================================================= */

function showHeartsInfo() {

  checkLifeRegeneration();


  if (state.lives > 0) {

    alert(
      `Tienes ${state.lives} de ${state.maxLives} vidas ❤️`
    );

    return;

  }


  showNoLives();

}


/* =========================================================
   APERTURA DE ETAPA
========================================================= */

function openStage(stageId) {

  checkLifeRegeneration();


  if (state.lives <= 0) {

    showNoLives();

    return;

  }


  const stage =
    stages.find(
      item => item.id === stageId
    );


  if (!stage) return;


  if (!isStageUnlocked(stageId)) {

    return;

  }


  currentStage = stage;

  currentLearnIndex = 0;

  currentQuestionIndex = 0;

  lessonCorrect = 0;

  lessonIncorrect = 0;

  lessonXP = 0;

  selectedAnswer = null;

  wordCardRevealed = false;


  /*
    IMPORTANTE:

    Registramos las palabras de la etapa
    cuando empiezan a aparecer en APRENDE.
  */


  showScreen("learnScreen");

  loadLearnWord();

}


/* =========================================================
   LECCIÓN — APRENDE
========================================================= */

function loadLearnWord() {

  /*
    Por ahora todas las etapas usan este vocabulario
    provisional.

    Más adelante podemos asignar vocabulario diferente
    a cada etapa.
  */

  const words =
    getStageVocabulary(currentStage.id);


  if (
    currentLearnIndex >= words.length
  ) {

    startPractice();

    return;

  }


  currentWord =
    words[currentLearnIndex];


  wordCardRevealed = false;


  const word =
    document.getElementById("learnWord");

  const meaning =
    document.getElementById("learnMeaning");

  const hint =
    document.getElementById("learnHint");


  word.textContent =
    currentWord.quechua;

  meaning.textContent =
    currentWord.spanish;


  meaning.classList.add("hidden");

  hint.textContent =
    "Toca para descubrir";


  /*
    AQUÍ se añade automáticamente al diccionario.

    No importa si el estudiante después responde bien
    o mal.
  */

  registerLearnedWord(currentWord);


  const progress =
    (
      currentLearnIndex /
      words.length
    ) * 100;


  document.getElementById(
    "learnProgress"
  ).style.width =
    `${progress}%`;


  updateHeartsUI();

}


/* =========================================================
   MOSTRAR SIGNIFICADO
========================================================= */

function flipWordCard() {

  wordCardRevealed =
    !wordCardRevealed;


  const meaning =
    document.getElementById("learnMeaning");

  const hint =
    document.getElementById("learnHint");


  if (wordCardRevealed) {

    meaning.classList.remove("hidden");

    hint.textContent =
      "Significado descubierto";

  } else {

    meaning.classList.add("hidden");

    hint.textContent =
      "Toca para descubrir";

  }

}


/* =========================================================
   SIGUIENTE PALABRA
========================================================= */

function nextLearnWord() {

  currentLearnIndex++;

  loadLearnWord();

}


/* =========================================================
   VOCABULARIO DE ETAPA
========================================================= */

function getStageVocabulary(stageId) {
  // La Unidad 2 reutiliza vocabulario conocido en ejercicios contextualizados.
  const learned = vocabulary.filter(word => word.unit === 1);
  return learned.length ? learned : vocabulary;
}


/* =========================================================
   DICCIONARIO AUTOMÁTICO
========================================================= */

function registerLearnedWord(word) {

  const alreadyExists =
    state.dictionary.some(
      item => item.id === word.id
    );


  if (alreadyExists) {

    return;

  }


  state.dictionary.push({

    ...word,

    learned: true

  });


  saveState();

  renderDictionary();

}


/* =========================================================
   PRACTICA
========================================================= */

function startPractice() {

  showScreen("lessonScreen");

  currentQuestionIndex = 0;

  lessonCorrect = 0;

  lessonIncorrect = 0;

  lessonXP = 0;

  selectedAnswer = null;


  lessonQuestions =
    createQuestions();


  loadQuestion();

}


/* =========================================================
   CREAR PREGUNTAS
========================================================= */

function createQuestions() {
  const available = vocabulary.filter(word => word.unit === 1);
  if (!available.length) return [];
  if (currentUnit === 2) {
    const contexts = [
      {prompt:'Llegas a un lugar y saludas a alguien. ¿Qué expresión elegirías?', wordId:1},
      {prompt:'Es temprano y quieres saludar por la mañana. ¿Qué expresión corresponde?', wordId:2},
      {prompt:'Te despides al terminar una visita por la noche. ¿Qué expresión corresponde?', wordId:3},
      {prompt:'Te vas y quieres decir “hasta luego”. ¿Qué expresión elegirías?', wordId:4},
      {prompt:'En una tarjeta aparece un saludo general. ¿Cuál es su significado?', wordId:1},
      {prompt:'En un diálogo ocurre el saludo durante la mañana. ¿Qué frase encaja?', wordId:2},
      {prompt:'Una persona se despide antes de ir a dormir. ¿Qué expresión aparece en el vocabulario?', wordId:3},
      {prompt:'Una conversación termina con una despedida equivalente a “hasta luego”. ¿Cuál es?', wordId:4},
      {prompt:'Relaciona la situación “saludar al llegar” con la expresión correcta.', wordId:1},
      {prompt:'Relaciona la situación “despedirse para volver a verse” con la expresión correcta.', wordId:4}
    ];
    return contexts.map((context, index) => {
      const word = available.find(item => item.id === context.wordId) || available[index % available.length];
      const wrongAnswers = shuffleArray(available.filter(item => item.id !== word.id).map(item => item.spanish)).slice(0, 2);
      return {word, prompt:context.prompt, answers:shuffleArray([word.spanish, ...wrongAnswers]), correctAnswer:word.spanish};
    });
  }
  const pool = shuffleArray(available).slice(0, 10);
  const questions = pool.map(word => {
    const wrongAnswers = shuffleArray(available.filter(item => item.id !== word.id).map(item => item.spanish)).slice(0, 2);
    return {word, prompt:'¿Qué significa esta expresión?', answers:shuffleArray([word.spanish, ...wrongAnswers]), correctAnswer:word.spanish};
  });
  while (questions.length < 10) {
    const word = available[questions.length % available.length];
    const wrongAnswers = shuffleArray(available.filter(item => item.id !== word.id).map(item => item.spanish)).slice(0, 2);
    questions.push({word, prompt:'Repaso: elige el significado de la expresión.', answers:shuffleArray([word.spanish, ...wrongAnswers]), correctAnswer:word.spanish});
  }
  return questions;
}


/* =========================================================
   CARGAR PREGUNTA
========================================================= */

function loadQuestion() {

  /*
    Si no hay vidas, no dejamos continuar.
  */

  checkLifeRegeneration();


  if (state.lives <= 0) {

    showNoLives();

    return;

  }


  if (
    currentQuestionIndex >=
    lessonQuestions.length
  ) {

    finishStage();

    return;

  }


  selectedAnswer = null;


  const question =
    lessonQuestions[
      currentQuestionIndex
    ];


  currentWord =
    question.word;


  const questionNumber =
    document.getElementById(
      "questionNumber"
    );


  questionNumber.textContent =
    `Pregunta ${currentQuestionIndex + 1} de ${lessonQuestions.length}`;


  /*
    Progreso visual
  */

  const progress =
    (
      currentQuestionIndex /
      lessonQuestions.length
    ) * 100;


  document.getElementById(
    "practiceProgress"
  ).style.width =
    `${progress}%`;


  /*
    Pregunta
  */

  const questionContainer =
    document.getElementById(
      "questionContainer"
    );


  questionContainer.innerHTML = `

    <div class="question-card">

      <h2>
        ¿Qué significa
        <button
          class="translation-word"
          onclick="toggleTranslation(${question.word.id})"
        >
          ${escapeHTML(question.word.quechua)}
        </button>
        ?
      </h2>

      <div
        id="translation-${question.word.id}"
        class="word-popup hidden"
      >
        ${escapeHTML(question.word.quechua)}
        → 
        ${escapeHTML(question.word.spanish)}
      </div>

      <p class="question-sentence">
        ${escapeHTML(question.prompt || "Selecciona la traducción correcta.")}
      </p>

    </div>

  `;


  /*
    Respuestas
  */

  const answersContainer =
    document.getElementById(
      "answersContainer"
    );


  answersContainer.innerHTML = "";


  question.answers.forEach(
    answer => {

      const button =
        document.createElement("button");


      button.className =
        "answer-button";


      button.textContent =
        answer;


      button.onclick = () =>
        selectAnswer(
          answer,
          button
        );


      answersContainer.appendChild(
        button
      );

    }
  );


  document.getElementById(
    "checkButton"
  ).disabled = true;


  updateHeartsUI();

}


/* =========================================================
   TRADUCCIÓN DENTRO DE LA LECCIÓN
========================================================= */

function toggleTranslation(wordId) {

  const popup =
    document.getElementById(
      `translation-${wordId}`
    );


  if (!popup) return;


  popup.classList.toggle("hidden");

}


/* =========================================================
   SELECCIONAR RESPUESTA
========================================================= */

function selectAnswer(
  answer,
  button
) {

  document
    .querySelectorAll(".answer-button")
    .forEach(
      item =>
        item.classList.remove(
          "selected"
        )
    );


  button.classList.add("selected");


  selectedAnswer =
    answer;


  document.getElementById(
    "checkButton"
  ).disabled = false;

}


/* =========================================================
   COMPROBAR RESPUESTA
========================================================= */

function checkAnswer() {

  if (!selectedAnswer) {

    return;

  }


  /*
    Evitamos comprobar dos veces.
  */

  const checkButton =
    document.getElementById(
      "checkButton"
    );


  checkButton.disabled = true;


  const question =
    lessonQuestions[
      currentQuestionIndex
    ];


  const isCorrect =
    selectedAnswer ===
    question.correctAnswer;


  const buttons =
    document.querySelectorAll(
      ".answer-button"
    );


  buttons.forEach(button => {

    if (
      button.textContent ===
      question.correctAnswer
    ) {

      button.classList.add(
        "correct"
      );

    }

  });


  if (isCorrect) {

    handleCorrectAnswer();

  } else {

    handleIncorrectAnswer();

  }


  setTimeout(() => {

    /*
      Si nos quedamos sin vidas,
      no seguimos con la siguiente pregunta.
    */

    if (state.lives <= 0) {

      showNoLives();

      return;

    }


    currentQuestionIndex++;

    loadQuestion();

  }, 650);

}


/* =========================================================
   RESPUESTA CORRECTA
========================================================= */

function handleCorrectAnswer() {

  lessonCorrect++;

  state.totalCorrect++;

  lessonXP += 2;

  state.xp += 2;


  saveState();

}


/* =========================================================
   RESPUESTA INCORRECTA
========================================================= */

function handleIncorrectAnswer() {

  lessonIncorrect++;

  state.totalIncorrect++;


  /*
    RESTAR UNA VIDA
  */

  const stillHasLives =
    loseLife();


  /*
    Marcamos visualmente la respuesta elegida.
  */

  document
    .querySelectorAll(".answer-button")
    .forEach(button => {

      if (
        button.textContent ===
        selectedAnswer
      ) {

        button.classList.add(
          "incorrect"
        );

      }

    });


  /*
    Si fue la última vida,
    la lección termina inmediatamente.
  */

  if (!stillHasLives) {

    saveState();

    return;

  }


  saveState();

}


/* =========================================================
   TERMINAR ETAPA
========================================================= */

function finishStage() {

  const percentage =
    Math.round(
      (
        lessonCorrect /
        lessonQuestions.length
      ) * 100
    );


  /*
    Marcamos la etapa completa.
  */

  setStageProgress(
    currentStage.id,
    100
  );


  const completedKey = `${currentUnit}-${currentStage.id}`;
  if (!state.completedStages.includes(completedKey)) {
    state.completedStages.push(completedKey);

    state.lessonsCompleted++;

    state.streak++;

    state.xp += 20;

    lessonXP += 20;

  }


  saveState();


  showResult(
    percentage
  );

}


/* =========================================================
   RESULTADO
========================================================= */

function showResult(percentage) {

  showScreen("resultScreen");


  document.getElementById(
    "resultPercentage"
  ).textContent =
    `${percentage}%`;


  document.getElementById(
    "circleScoreText"
  ).textContent =
    `${percentage}%`;


  document.getElementById(
    "correctResult"
  ).textContent =
    lessonCorrect;


  document.getElementById(
    "incorrectResult"
  ).textContent =
    lessonIncorrect;


  document.getElementById(
    "xpResult"
  ).textContent =
    lessonXP;


  const message =
    getResultMessage(
      percentage
    );


  document.getElementById(
    "resultMessage"
  ).textContent =
    message;


  document.getElementById(
    "scoreCircle"
  ).style.strokeDashoffset =
    314 -
    (
      314 *
      percentage /
      100
    );


  document.getElementById(
    "resultBar"
  ).style.width =
    `${percentage}%`;

}


/* =========================================================
   MENSAJES DE RESULTADO
========================================================= */

function getResultMessage(
  percentage
) {

  if (percentage >= 90) {

    return "¡Excelente! Dominas muy bien esta etapa.";

  }

  if (percentage >= 70) {

    return "¡Muy bien! Sigue avanzando.";

  }

  if (percentage >= 50) {

    return "Buen trabajo. Un poco más de práctica y lo tendrás.";

  }

  return "Sigue practicando. Cada error también ayuda a aprender.";

}


/* =========================================================
   FINALIZAR RESULTADO
========================================================= */

function finishResult() {

  currentStage = null;

  showScreen("homeScreen");

  updateUI();

}


/* =========================================================
   PROGRESO DE ETAPAS
========================================================= */

function getStageProgress(
  stageId
) {

  return Number(
    state.stageProgress[`${currentUnit}-${stageId}`] || (currentUnit === 1 ? state.stageProgress[stageId] : 0) || 0
  );

}


function setStageProgress(
  stageId,
  progress
) {

  state.stageProgress[`${currentUnit}-${stageId}`] =
    Math.max(
      0,
      Math.min(
        100,
        progress
      )
    );


  saveState();

}


/* =========================================================
   DESBLOQUEO
========================================================= */

function isStageUnlocked(stageId) {
  if (stageId === 1) {
    if (currentUnit === 1) return true;
    return stages.every(stage => Number(state.stageProgress[`1-${stage.id}`] || state.stageProgress[stage.id] || 0) >= 100);
  }
  return getStageProgress(stageId - 1) >= 100;
}


/* =========================================================
   RUTA DE APRENDIZAJE
========================================================= */

function renderLearningPath() {

  const container =
    document.getElementById(
      "learningPath"
    );


  if (!container) return;


  container.innerHTML = "";


  stages.forEach(stage => {

    const node =
      document.createElement(
        "button"
      );


    const progress =
      getStageProgress(
        stage.id
      );


    const unlocked =
      isStageUnlocked(
        stage.id
      );


    node.className =
      "path-node";


    if (!unlocked) {

      node.classList.add(
        "locked"
      );

    } else if (progress >= 100) {

      node.classList.add(
        "completed"
      );

    } else {

      node.classList.add(
        "available"
      );

    }


    /*
      Anillo de progreso parcial.
    */

    if (
      progress > 0 &&
      progress < 100
    ) {

      node.innerHTML = `

        <div
          class="path-progress"
          style="--progress:${progress}%"
        ></div>

        <span>
          ${stage.id}
        </span>

      `;

    } else if (progress >= 100) {

      node.innerHTML = `
        ✓
      `;

    } else if (!unlocked) {

      node.innerHTML = `
        🔒
      `;

    } else {

      node.innerHTML = `
        ${stage.id}
      `;

    }


    if (unlocked) {

      node.onclick = () =>
        openStage(
          stage.id
        );

    }


    container.appendChild(
      node
    );

  });


  updateUnitProgress();

}


/* =========================================================
   LISTA DE ETAPAS
========================================================= */

function renderStageList() {

  const container =
    document.getElementById(
      "stageList"
    );


  if (!container) return;


  container.innerHTML = "";
  const unitTitle = document.querySelector("#unitScreen .page-title h1");
  const unitLabel = document.querySelector("#unitScreen .page-title .unit-label");
  const unitDescription = document.querySelector("#unitScreen .page-title p");
  if (unitTitle) unitTitle.textContent = currentUnit === 2 ? "Palabras en contexto" : "Primeros pasos";
  if (unitLabel) unitLabel.textContent = `UNIDAD ${currentUnit}`;
  if (unitDescription) unitDescription.textContent = currentUnit === 2 ? "Usa las palabras aprendidas en situaciones." : "Saludos y expresiones básicas";

  stages.forEach(stage => {

    const progress =
      getStageProgress(
        stage.id
      );


    const unlocked =
      isStageUnlocked(
        stage.id
      );


    const card =
      document.createElement(
        "div"
      );


    card.className =
      "stage-card";


    if (progress >= 100) {

      card.classList.add(
        "completed"
      );

    }


    if (!unlocked) {

      card.classList.add(
        "locked"
      );

    }


    card.innerHTML = `

      <div class="stage-number">

        ${
          progress >= 100
            ? "✓"
            : unlocked
              ? stage.id
              : "🔒"
        }

      </div>

      <div>

        <h3>
          ${stage.title}
        </h3>

        <p>
          ${stage.description}
        </p>

      </div>

      <div class="stage-percent">
        ${progress}%
      </div>

    `;


    if (unlocked) {

      card.onclick = () =>
        openStage(
          stage.id
        );

    }


    container.appendChild(
      card
    );

  });

}


/* =========================================================
   PROGRESO DE UNIDAD
========================================================= */

function updateUnitProgress() {

  const total =
    stages.length;


  const completed =
    stages.filter(
      stage =>
        getStageProgress(
          stage.id
        ) >= 100
    ).length;


  const percentage =
    Math.round(
      (completed / total) * 100
    );


  const text =
    document.getElementById(
      "unitProgressText"
    );


  const bar =
    document.getElementById(
      "unitProgressBar"
    );


  if (text) {

    text.textContent =
      `${percentage}%`;

  }


  if (bar) {

    bar.style.width =
      `${percentage}%`;

  }

}


/* =========================================================
   RECURSOS / DICCIONARIO
========================================================= */

function renderDictionary() {

  const container =
    document.getElementById(
      "dictionaryList"
    );


  if (!container) return;


  const searchInput =
    document.getElementById(
      "dictionarySearch"
    );


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const words =
    state.dictionary.filter(
      word => {

        if (!search) {

          return true;

        }


        return (

          word.quechua
            .toLowerCase()
            .includes(search)

          ||

          word.spanish
            .toLowerCase()
            .includes(search)

        );

      }
    );


  if (words.length === 0) {

    container.innerHTML = `

      <div class="empty-dictionary">

        <div style="font-size:40px;">
          📖
        </div>

        <h3>
          Todavía no hay palabras aquí
        </h3>

        <p>
          Las palabras aparecerán automáticamente
          cuando las descubras durante tus lecciones.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML = "";


  words.forEach(word => {

    const item =
      document.createElement(
        "div"
      );


    item.className =
      "dictionary-item";


    item.innerHTML = `

      <div>

        <h3>
          ${escapeHTML(word.quechua)}
        </h3>

        <p>
          ${escapeHTML(word.spanish)}
        </p>

      </div>

      <div class="dictionary-meta">

        Unidad ${word.unit}<br>
        Etapa ${word.stage}

      </div>

    `;


    container.appendChild(
      item
    );

  });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  text
) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   PERFIL
========================================================= */

function renderProfile() {

  const name =
    document.getElementById(
      "profileName"
    );

  const avatar =
    document.getElementById(
      "profileAvatar"
    );


  if (name) {

    name.textContent =
      state.profileName;

  }


  if (avatar) {

    avatar.textContent =
      state.profileEmoji;

  }

}


function openProfileModal() {

  const modal =
    document.getElementById(
      "profileModal"
    );


  const input =
    document.getElementById(
      "profileNameInput"
    );


  input.value =
    state.profileName;


  modal.classList.remove(
    "hidden"
  );

}


function closeProfileModal() {

  document
    .getElementById(
      "profileModal"
    )
    .classList.add(
      "hidden"
    );

}


let selectedProfileEmoji =
  state.profileEmoji;


function selectProfileEmoji(
  emoji
) {

  selectedProfileEmoji =
    emoji;

}


function saveProfile() {

  const input =
    document.getElementById(
      "profileNameInput"
    );


  const name =
    input.value.trim();


  if (name) {

    state.profileName =
      name;

  }


  state.profileEmoji =
    selectedProfileEmoji;


  saveState();

  renderProfile();

  closeProfileModal();

}


/* =========================================================
   CONFIGURACIÓN
========================================================= */

function showSettings() {

  showScreen(
    "settingsScreen"
  );

}


function setTheme(
  theme
) {

  state.theme =
    theme;

  saveState();

  applyTheme();

}


function applyTheme() {

  document.body.classList.remove(
    "dark",
    "blue"
  );


  if (
    state.theme === "dark"
  ) {

    document.body.classList.add(
      "dark"
    );

  }


  if (
    state.theme === "blue"
  ) {

    document.body.classList.add(
      "blue"
    );

  }

}


/* =========================================================
   SALIR DE LECCIÓN
========================================================= */

function leaveLesson() {

  const shouldLeave =
    confirm(
      "¿Quieres salir de la lección? El progreso de esta lección se perderá."
    );


  if (!shouldLeave) {

    return;

  }


  currentStage = null;

  showScreen(
    "homeScreen"
  );

}


/* =========================================================
   REINICIAR PROGRESO
========================================================= */

function resetProgress() {

  const confirmed =
    confirm(
      "¿Seguro que quieres reiniciar todo tu progreso?"
    );


  if (!confirmed) {

    return;

  }


  state = {
    ...defaultState,
    stageProgress: {}
  };


  saveState();

  updateUI();

  renderDictionary();

  renderProfile();

  alert(
    "Tu progreso ha sido reiniciado."
  );

}


/* =========================================================
   UTILIDADES
========================================================= */

function shuffleArray(
  array
) {

  return [...array].sort(
    () => Math.random() - 0.5
  );

}


/* =========================================================
   ABRIR UNIDAD
========================================================= */

function openUnit() {

  renderStageList();

  showScreen(
    "unitScreen"
  );

}


/* =========================================================
   COMPATIBILIDAD
========================================================= */

/*
  Si quieres usar openUnit() desde cualquier botón
  posteriormente, queda disponible globalmente.
*/


/* =========================================================
   ACTUALIZACIÓN AUTOMÁTICA DE VIDAS
========================================================= */

setInterval(() => {

  checkLifeRegeneration();

  updateHeartsUI();

}, 1000);
/* =========================================================
   UNIDAD 2 Y SOPORTE
========================================================= */
function openUnitTwo() {
  currentUnit = 2;
  renderStageList();
  showScreen("unitScreen");
}

function submitBugReport(event) {
  event.preventDefault();
  const type = document.getElementById("bugType").value;
  const details = document.getElementById("bugDetails").value.trim();
  const contact = document.getElementById("bugContact").value.trim();
  if (!type || !details) {
    alert("Completa el tipo de problema y la descripción.");
    return;
  }
  const subject = encodeURIComponent(`[RunaSimi] Reporte: ${type}`);
  const body = encodeURIComponent(`Reporte de RunaSimi\nTipo: ${type}\nDescripción: ${details}\nCorreo de contacto: ${contact || "No indicado"}`);
  const destination = prompt("Escribe el correo oficial de contacto de Lunéa:");
  if (!destination || !destination.includes("@")) {
    alert("No se abrió el correo. Puedes copiar tu reporte y enviarlo cuando tengas el contacto oficial.");
    return;
  }
  window.location.href = `mailto:${destination}?subject=${subject}&body=${body}`;
  alert("Se preparó el reporte en tu aplicación de correo. Recuerda enviarlo desde allí.");
}
