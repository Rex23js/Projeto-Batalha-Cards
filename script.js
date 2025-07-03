// =====================================
// TÓPICO 1: SELEÇÃO DE ELEMENTOS DO DOM
// =====================================

const arena1 = document.getElementById("arena1");
const arena2 = document.getElementById("arena2");
const visu = document.querySelector(".Visu");
const containerCards = document.querySelector(".Container_Cards");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const allCards = document.querySelectorAll(".Card");

let draggedCardId = null;
let cardInArena1 = null;
let cardInArena2 = null;

// Variável para controlar se uma batalha está em andamento
let isBattleInProgress = false;

// =====================================
// TÓPICO 2: CLASSE PARA OS CARDS
// =====================================

class CharacterCard {
  constructor(id, name, type, atk, def, imgSrc) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.baseAtk = atk; // Atk base
    this.baseDef = def; // Defesa base (também o valor inicial da "vida" do card)
    this.currentAtk = atk; // Atk atual
    this.currentDef = def; // Defesa atual, que funcionará como HP durante a batalha
    this.imgSrc = imgSrc;
  }

  // Método para resetar os atributos do card para os valores base
  resetStats() {
    this.currentAtk = this.baseAtk;
    this.currentDef = this.baseDef; // Reseta a defesa/vida para o valor base
  }
}

// =====================================
// TÓPICO 3: DADOS DOS CARDS
// =====================================

const cardData = [];

allCards.forEach((cardElement) => {
  const id = cardElement.id;
  const name = cardElement.querySelector(".Card__title").textContent;
  const type = cardElement.querySelector(".Card__type").textContent;
  const atk = parseInt(
    cardElement
      .querySelector(".Card__stats span:nth-child(1)")
      .textContent.replace("Atk: ", "")
  );
  const def = parseInt(
    cardElement
      .querySelector(".Card__stats span:nth-child(2)")
      .textContent.replace("Def: ", "")
  );
  const imgSrc = cardElement.querySelector("img").src;

  cardData.push(new CharacterCard(id, name, type, atk, def, imgSrc));
});

console.log("Cards Carregados:", cardData);

// =====================================
// TÓPICO 4: FUNÇÕES DE DRAG AND DROP E TROCA DE CARDS
// =====================================

function dragStart(event) {
  // Se uma batalha está em andamento, não permite arrastar cards
  if (isBattleInProgress) {
    event.preventDefault();
    updateLog(
      "Batalha em andamento! Não é possível mover cards agora. Use o botão RESET para reiniciar."
    );
    return;
  }
  draggedCardId = event.target.id;
  event.dataTransfer.setData("text/plain", draggedCardId);
  console.log(`Iniciando arraste do card: ${draggedCardId}`);
  setTimeout(() => event.target.classList.add("dragging"), 0);
}

function dragOver(event) {
  event.preventDefault();
  if (!isBattleInProgress && event.target.classList.contains("Arena")) {
    event.target.classList.add("drag-over");
  }
}

function dragLeave(event) {
  event.target.classList.remove("drag-over");
}

function drop(event) {
  event.preventDefault();
  event.target.classList.remove("drag-over");

  if (isBattleInProgress) {
    updateLog(
      "Batalha em andamento! Não é possível mover cards agora. Use o botão RESET para reiniciar."
    );
    return;
  }

  if (event.target.classList.contains("Arena")) {
    const arenaId = event.target.id;
    const cardId = event.dataTransfer.getData("text/plain");
    const originalCardElement = document.getElementById(cardId);
    const cardObject = cardData.find((card) => card.id === cardId);

    // --- Lógica para substituir um card existente ---
    let currentCardInArena = null;
    let currentArenaElement = null;

    if (arenaId === "arena1") {
      currentCardInArena = cardInArena1;
      currentArenaElement = arena1;
    } else {
      currentCardInArena = cardInArena2;
      currentArenaElement = arena2;
    }

    if (currentCardInArena) {
      // Se já tem um card, reabilita o card original que estava na arena
      const oldCardOriginalElement = document.getElementById(
        currentCardInArena.id
      );
      if (oldCardOriginalElement) {
        oldCardOriginalElement.draggable = true;
        oldCardOriginalElement.style.opacity = "1";
        oldCardOriginalElement.style.cursor = "grab";
      }
      updateLog(`"${currentCardInArena.name}" removido da ${arenaId}.`);
    }

    // --- Coloca o novo card na arena ---
    const clonedCard = originalCardElement.cloneNode(true);
    clonedCard.classList.remove("dragging");
    clonedCard.draggable = false;
    clonedCard.style.cursor = "default";

    currentArenaElement.innerHTML = ""; // Limpa o conteúdo da arena
    currentArenaElement.appendChild(clonedCard);

    if (arenaId === "arena1") {
      cardInArena1 = cardObject;
      updateLog(`Card "${cardObject.name}" posicionado na Arena 1.`);
    } else {
      cardInArena2 = cardObject;
      updateLog(`Card "${cardObject.name}" posicionado na Arena 2.`);
    }

    // Desabilita o card original que foi arrastado
    originalCardElement.draggable = false;
    originalCardElement.style.opacity = "0.5";
    originalCardElement.style.cursor = "not-allowed";

    draggedCardId = null;

    // Adiciona um listener de clique ao card CLONADO na arena para removê-lo
    clonedCard.addEventListener("click", () =>
      removeCardFromArena(clonedCard.id, arenaId)
    );
  }
}

// =====================================
// TÓPICO 4.1: FUNÇÃO PARA REMOVER CARD DA ARENA
// =====================================
function removeCardFromArena(cardIdToRemove, arenaId) {
  if (isBattleInProgress) {
    updateLog(
      "Batalha em andamento! Não é possível remover cards agora. Use o botão RESET para reiniciar."
    );
    return;
  }

  const originalCardElement = document.getElementById(cardIdToRemove);
  let removedCardName = "";

  if (
    arenaId === "arena1" &&
    cardInArena1 &&
    cardInArena1.id === cardIdToRemove
  ) {
    arena1.innerHTML = "Arena 1"; // Limpa a arena visualmente
    removedCardName = cardInArena1.name;
    cardInArena1 = null; // Remove a referência ao card no JS
  } else if (
    arenaId === "arena2" &&
    cardInArena2 &&
    cardInArena2.id === cardIdToRemove
  ) {
    arena2.innerHTML = "Arena 2"; // Limpa a arena visualmente
    removedCardName = cardInArena2.name;
    cardInArena2 = null; // Remove a referência ao card no JS
  } else {
    return; // Card não encontrado ou não corresponde à arena
  }

  // Reabilita o card original na lista (container de cards)
  if (originalCardElement) {
    originalCardElement.draggable = true;
    originalCardElement.style.opacity = "1";
    originalCardElement.style.cursor = "grab";
  }
  updateLog(`"${removedCardName}" removido da ${arenaId}.`);
}

// =====================================
// TÓPICO 5: FUNÇÃO DE LOG DA BATALHA
// =====================================

function updateLog(message) {
  const logEntry = document.createElement("p");
  logEntry.textContent = message;
  logEntry.classList.add("log-entry");
  visu.appendChild(logEntry);
  visu.scrollTop = visu.scrollHeight;

  logEntry.style.opacity = "0";
  let opacity = 0;
  const fadeInInterval = setInterval(() => {
    if (opacity < 1) {
      opacity += 0.05;
      logEntry.style.opacity = opacity;
    } else {
      clearInterval(fadeInInterval);
    }
  }, 30);
}

// =====================================
// TÓPICO 6: LÓGICA DE BATALHA (ALTERADA: Ataque diminui Defesa diretamente)
// =====================================

function startBattle() {
  if (!cardInArena1 || !cardInArena2) {
    updateLog(
      "Por favor, posicione um card em cada arena para iniciar a batalha."
    );
    return;
  }

  if (isBattleInProgress) {
    updateLog("A batalha já está em andamento!");
    return;
  }
  isBattleInProgress = true; // Define que a batalha começou

  updateLog("--- INICIANDO BATALHA! ---");
  startButton.disabled = true;
  startButton.style.opacity = "0.5";

  let turn = 1;
  const maxTurns = 3; // Mantido para segurança, mas a batalha deve acabar antes

  // Exibindo Defesa inicial no log
  updateLog(
    `Defesa inicial de "${cardInArena1.name}": ${cardInArena1.currentDef}`
  );
  updateLog(
    `Defesa inicial de "${cardInArena2.name}": ${cardInArena2.currentDef}`
  );

  const battleInterval = setInterval(() => {
    if (
      turn > maxTurns ||
      cardInArena1.currentDef <= 0 ||
      cardInArena2.currentDef <= 0
    ) {
      // Fim da batalha
      clearInterval(battleInterval);
      isBattleInProgress = false; // Batalha terminou

      if (cardInArena1.currentDef <= 0 && cardInArena2.currentDef <= 0) {
        updateLog("Ambos os combatentes caíram! É um empate mortal!");
      } else if (cardInArena1.currentDef <= 0) {
        updateLog(`"${cardInArena2.name}" VENCEU a batalha!`);
      } else {
        updateLog(`"${cardInArena1.name}" VENCEU a batalha!`);
      }
      updateLog("--- BATALHA ENCERRADA ---");
      // O botão de reset agora RECARREGA A PÁGINA, então não precisamos reabilitá-lo aqui.
      // Ele está sempre ativo para recarregar.
      return;
    }

    updateLog(`--- Turno ${turn} ---`);

    // Turno do Card 1 atacando Card 2
    // O ataque do Card 1 diminui diretamente a defesa do Card 2
    cardInArena2.currentDef -= cardInArena1.currentAtk;
    updateLog(
      `"${cardInArena1.name}" atacou "${cardInArena2.name}" causando ${cardInArena1.currentAtk} de dano.`
    );
    updateLog(
      `Defesa de "${cardInArena2.name}": ${Math.max(
        0,
        cardInArena2.currentDef
      )}`
    );

    // Verifica se Card 2 ainda está "vivo" para revidar
    if (cardInArena2.currentDef > 0) {
      // Turno do Card 2 atacando Card 1
      // O ataque do Card 2 diminui diretamente a defesa do Card 1
      cardInArena1.currentDef -= cardInArena2.currentAtk;
      updateLog(
        `"${cardInArena2.name}" atacou "${cardInArena1.name}" causando ${cardInArena2.currentAtk} de dano.`
      );
      updateLog(
        `Defesa de "${cardInArena1.name}": ${Math.max(
          0,
          cardInArena1.currentDef
        )}`
      );
    }

    turn++;
  }, 2000); // Intervalo de 2 segundos entre os turnos
}

// =====================================
// TÓPICO 7: FUNÇÃO DE RESET DO JOGO (ALTERADA: Recarrega a página)
// =====================================

function resetGame() {
  // Recarrega a página completamente.
  // Isso reseta o estado do JavaScript, do DOM, e de todos os cards para o início.
  location.reload();
  // Qualquer código abaixo desta linha não será executado, pois a página será recarregada.
}

// =====================================
// TÓPICO 8: ADIÇÃO DE LISTENERS DE EVENTOS
// =====================================

// Para cada card, adicione o listener para quando o arraste começar
allCards.forEach((card) => {
  card.addEventListener("dragstart", dragStart);
});

// Para cada arena, adicione listeners para arrastar sobre, sair e soltar
arena1.addEventListener("dragover", dragOver);
arena1.addEventListener("dragleave", dragLeave);
arena1.addEventListener("drop", drop);

arena2.addEventListener("dragover", dragOver);
arena2.addEventListener("dragleave", dragLeave);
arena2.addEventListener("drop", drop);

// Listener para o botão de iniciar batalha
startButton.addEventListener("click", startBattle);

// Listener para o botão de resetar (agora recarrega a página)
resetButton.addEventListener("click", resetGame);

// O botão de reset estará sempre ativo para recarregar a página
resetButton.disabled = false; // Garante que o botão de reset esteja sempre clicável
resetButton.style.opacity = "1"; // Garante opacidade total

// Mensagem inicial no log
updateLog("Bem-vindo à Batalha Dead Cells! Arraste cards para as arenas.");
