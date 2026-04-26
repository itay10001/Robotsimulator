window.RF = window.RF || {};

RF.game = {
  pieces: [],
  inventory: { purple: 0, green: 0, capacity: 4 },
  intakeRange: 10,
  gateOpen: false,
  collectedCount: 0,
  scoredPieces: 0,
  parkCompleted: false
};

RF.createInitialPieces = function() {
  return [
    { id: "p1", type: "purple", x: 58, y: 20, collected: false, scored: false },
    { id: "g1", type: "green",  x: 58, y: 26, collected: false, scored: false },
    { id: "p2", type: "purple", x: 58, y: 32, collected: false, scored: false },

    { id: "p3", type: "purple", x: 82, y: 20, collected: false, scored: false },
    { id: "g2", type: "green",  x: 82, y: 26, collected: false, scored: false },
    { id: "p4", type: "purple", x: 82, y: 32, collected: false, scored: false },

    { id: "p5", type: "purple", x: 110, y: 20, collected: false, scored: false },
    { id: "p6", type: "purple", x: 110, y: 26, collected: false, scored: false },
    { id: "g3", type: "green",  x: 110, y: 32, collected: false, scored: false },

    { id: "p7", type: "purple", x: 58, y: 112, collected: false, scored: false },
    { id: "p8", type: "purple", x: 58, y: 118, collected: false, scored: false },
    { id: "g4", type: "green",  x: 58, y: 124, collected: false, scored: false },

    { id: "p9", type: "purple", x: 82, y: 112, collected: false, scored: false },
    { id: "g5", type: "green",  x: 82, y: 118, collected: false, scored: false },
    { id: "p10", type: "purple", x: 82, y: 124, collected: false, scored: false },

    { id: "g6", type: "green",  x: 110, y: 112, collected: false, scored: false },
    { id: "p11", type: "purple", x: 110, y: 118, collected: false, scored: false },
    { id: "p12", type: "purple", x: 110, y: 124, collected: false, scored: false },

    { id: "p13", type: "purple", x: 132, y: 4, collected: false, scored: false, locked: true },
    { id: "g7", type: "green",  x: 137, y: 4, collected: false, scored: false, locked: true },
    { id: "p14", type: "purple", x: 142, y: 4, collected: false, scored: false, locked: true },

    { id: "p15", type: "purple", x: 132, y: 140, collected: false, scored: false, locked: true },
    { id: "g8", type: "green",  x: 137, y: 140, collected: false, scored: false, locked: true },
    { id: "p16", type: "purple", x: 142, y: 140, collected: false, scored: false, locked: true }
  ];
};

RF.resetGameObjects = function() {
  RF.game.pieces = RF.createInitialPieces();
  RF.game.inventory.purple = 0;
  RF.game.inventory.green = 0;
  RF.game.gateOpen = false;
  RF.game.collectedCount = 0;
  RF.game.scoredPieces = 0;
  RF.game.parkCompleted = false;
  RF.scoreState.autoPoints = 0;
  RF.scoreState.teleopPoints = 0;
  RF.scoreState.shotsMade = 0;
  RF.scoreState.shotsAttempted = 0;
  RF.scoreState.rankingPoints = 0;
  RF.el("gateTop").classList.remove("open");
  RF.el("gateBottom").classList.remove("open");
  RF.renderGameObjects();
  RF.updateInventoryUI();
  RF.updateScoreUI();
  RF.log("Game reset: pieces respawned, gate closed, score cleared.");
};

RF.renderGameObjects = function() {
  const layer = RF.el("gamePieceLayer");
  layer.innerHTML = "";

  RF.game.pieces.forEach(piece => {
    if (piece.collected || piece.scored) return;

    const node = document.createElement("div");
    node.className = "game-piece " + piece.type + (piece.locked ? " locked" : "");
    node.dataset.id = piece.id;
    node.style.left = (piece.x / RF.FIELD_SIZE * 100) + "%";
    node.style.top = (piece.y / RF.FIELD_SIZE * 100) + "%";
    node.title = piece.locked ? piece.type + " locked behind gate" : piece.type;
    layer.appendChild(node);
  });
};

RF.getInventoryCount = () => RF.game.inventory.purple + RF.game.inventory.green;

RF.updateInventoryUI = function() {
  const count = RF.getInventoryCount();
  RF.el("inventoryPurple").textContent = RF.game.inventory.purple;
  RF.el("inventoryGreen").textContent = RF.game.inventory.green;
  RF.el("inventoryTotal").textContent = count + "/" + RF.game.inventory.capacity;
  RF.el("inventoryFill").style.width = (count / RF.game.inventory.capacity * 100) + "%";
  RF.el("gateState").textContent = RF.game.gateOpen ? "Open" : "Closed";
};

RF.unlockStoragePieces = function(phase = RF.state.phase) {
  if (RF.game.gateOpen) {
    RF.log("Gate is already open.");
    return;
  }

  RF.game.gateOpen = true;
  let unlocked = 0;

  RF.game.pieces.forEach(piece => {
    if (piece.locked) {
      piece.locked = false;
      unlocked++;
    }
  });

  RF.el("gateTop").classList.add("open");
  RF.el("gateBottom").classList.add("open");
  RF.renderGameObjects();
  RF.updateInventoryUI();
  RF.addScore(5, "Gate opened", phase);
  RF.log("Gate opened: " + unlocked + " stored pieces are now collectable.");
  RF.showToast("Gate opened");
};

RF.collectNearbyGamePieces = function(sourcePose = RF.state.pose, options = {}) {
  const range = options.range ?? RF.game.intakeRange;
  const capacityLeft = RF.game.inventory.capacity - RF.getInventoryCount();

  if (capacityLeft <= 0) {
    RF.log("Intake tried to collect, but inventory is full.", "error");
    RF.showToast("Inventory full");
    return [];
  }

  const available = RF.game.pieces
    .filter(piece => !piece.collected && !piece.scored && !piece.locked)
    .map(piece => ({ piece, distance: Math.hypot(piece.x - sourcePose.x, piece.y - sourcePose.y) }))
    .filter(entry => entry.distance <= range)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, capacityLeft);

  available.forEach(entry => {
    entry.piece.collected = true;
    RF.game.inventory[entry.piece.type]++;
    RF.game.collectedCount++;
  });

  if (available.length > 0) {
    RF.renderGameObjects();
    RF.updateInventoryUI();
    RF.log("Collected " + available.length + " piece(s): " + available.map(entry => entry.piece.type).join(", ") + ".");
    RF.showToast("Collected " + available.length + " piece(s)");
  } else {
    RF.log("Intake ran, but no unlocked pieces were in range.");
  }

  return available.map(entry => entry.piece);
};

RF.getBasketRects = function() {
  return Array.from(document.querySelectorAll(".basket")).map(basket =>
    RF.getRectFromElement(basket, basket.dataset.basket + " basket")
  );
};

RF.scoreInventoryInBasket = function(phase = RF.state.phase) {
  const count = RF.getInventoryCount();

  if (count <= 0) {
    RF.log("Score attempt failed: inventory empty.", "error");
    RF.showToast("Inventory empty");
    return 0;
  }

  const pose = RF.state.pose;
  const nearBasket = RF.getBasketRects().some(rect => {
    const cx = (rect.x1 + rect.x2) / 2;
    const cy = (rect.y1 + rect.y2) / 2;
    return Math.hypot(cx - pose.x, cy - pose.y) <= 18;
  });

  if (!nearBasket) {
    RF.log("Score attempt failed: robot is not close enough to a basket.", "error");
    RF.showToast("Not near basket");
    return 0;
  }

  const scored = count;
  RF.game.inventory.purple = 0;
  RF.game.inventory.green = 0;
  RF.game.scoredPieces += scored;
  RF.updateInventoryUI();
  RF.addScore(scored * 5, "Basket scored " + scored + " carried piece(s)", phase);
  RF.log("Basket score: " + scored + " piece(s).");
  RF.showToast("Scored " + scored);
  return scored;
};

RF.checkParking = function(phase = RF.state.phase) {
  const pose = RF.state.pose;
  const zones = Array.from(document.querySelectorAll(".parking-zone")).map(zone => RF.getRectFromElement(zone, "parking"));
  const parked = zones.some(rect => RF.rectContainsPose(rect, pose, RF.getRobotHalfSize()));

  if (parked && !RF.game.parkCompleted) {
    RF.game.parkCompleted = true;
    RF.addScore(10, "Parking completed", phase);
    RF.log("Parking objective completed.");
  }

  return parked;
};
