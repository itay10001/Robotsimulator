window.RF = window.RF || {};

RF.appendCommand = function(target, command) {
  const editor = target === "teleop" ? RF.el("teleopEditor") : RF.el("codeEditor");
  editor.value = editor.value.trimEnd() + (editor.value.trim() ? "\n" : "") + command;
  editor.focus();
  RF.showToast("Command inserted");
};

RF.saveRun = function() {
  if (!RF.state.lastResult) {
    RF.showToast("Run auto first");
    return;
  }

  RF.state.savedRuns.push({
    ...RF.state.lastResult,
    name: "Run " + (RF.state.savedRuns.length + 1),
    rp: RF.scoreState.rankingPoints,
    shots: RF.scoreState.shotsMade + "/" + RF.scoreState.shotsAttempted
  });

  const table = RF.el("runTable");
  table.innerHTML = "";

  RF.state.savedRuns.forEach(run => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + run.name + "</td>" +
      "<td>" + RF.round(run.totalTime, 2) + "s</td>" +
      "<td>" + RF.round(run.totalDistance, 1) + "in</td>" +
      "<td>" + RF.round(run.batteryUse, 1) + "%</td>" +
      "<td>" + RF.round(run.efficiency, 0) + "%</td>" +
      "<td>" + run.score + "</td>" +
      "<td>" + run.shots + "</td>" +
      "<td>" + run.rp + "</td>";
    table.appendChild(tr);
  });

  RF.showToast("Run saved");
};

RF.exportSummary = function() {
  const r = RF.state.lastResult;

  if (!r) {
    RF.showToast("Run auto first");
    return;
  }

  const summary =
    "Drive RPM: " + r.config.driveMotorRpm +
    " | Intake RPM: " + r.config.intakeMotorRpm +
    " | Shooter RPM: " + r.config.shooterMotorRpm +
    " | Lift RPM: " + r.config.liftMotorRpm +
    " | Time: " + RF.round(r.totalTime, 2) + "s" +
    " | Distance: " + RF.round(r.totalDistance, 1) + "in" +
    " | Efficiency: " + RF.round(r.efficiency, 0) + "%" +
    " | Score: " + r.score +
    " | RP: " + RF.scoreState.rankingPoints +
    " | Shots: " + RF.scoreState.shotsMade + "/" + RF.scoreState.shotsAttempted;

  navigator.clipboard?.writeText(summary);
  RF.log(summary);
  RF.showToast("Summary copied/logged");
};

RF.nudgeRobot = function(dx, dy) {
  RF.setRobotPose({
    x: RF.state.startPose.x + dx,
    y: RF.state.startPose.y + dy,
    heading: RF.state.startPose.heading
  }, true, true);

  RF.log("Start nudged to " + RF.round(RF.state.startPose.x, 1) + ", " + RF.round(RF.state.startPose.y, 1));
};

RF.bindUI = function() {
  RF.el("themeButton").addEventListener("click", () => {
    const light = document.body.classList.toggle("light");
    RF.el("themeButton").textContent = light ? "Dark Mode" : "Light Mode";
    RF.showToast(light ? "Light mode" : "Dark mode");
  });

  RF.el("driverModeButton").addEventListener("click", () => {
    RF.state.driverMode = !RF.state.driverMode;
    RF.el("driverModeButton").textContent = RF.state.driverMode ? "Driver Mode: On" : "Driver Mode: Off";
    document.activeElement?.blur?.();
    RF.showToast(RF.state.driverMode ? "WASD driver mode enabled" : "WASD driver mode disabled");
    RF.log(RF.state.driverMode ? "Driver Mode enabled." : "Driver Mode disabled.");
  });

  RF.el("helpButton").addEventListener("click", () => RF.el("modalBackdrop").classList.add("open"));
  RF.el("closeModalButton").addEventListener("click", () => RF.el("modalBackdrop").classList.remove("open"));
  RF.el("modalBackdrop").addEventListener("click", event => {
    if (event.target === RF.el("modalBackdrop")) RF.el("modalBackdrop").classList.remove("open");
  });

  RF.el("runButton").addEventListener("click", () => RF.runAuto(true));
  RF.el("runTopButton").addEventListener("click", () => RF.runAuto(true));
  RF.el("runHeroButton").addEventListener("click", () => RF.runAuto(true));
  RF.el("runCodeButton").addEventListener("click", () => RF.runAuto(true));
  RF.el("stepButton").addEventListener("click", RF.stepAuto);
  RF.el("resetButton").addEventListener("click", RF.resetRobot);

  RF.el("sampleButton").addEventListener("click", () => RF.loadAutoSample("scorePark"));
  RF.el("teleopSampleButton").addEventListener("click", RF.loadTeleopSample);
  RF.el("runTeleopButton").addEventListener("click", RF.runTeleopScript);
  RF.el("resetTeleopButton").addEventListener("click", RF.resetRobot);
  RF.el("resetGameButton").addEventListener("click", () => { RF.resetRobot(); RF.resetGameObjects(); });
  RF.el("resetPiecesButton").addEventListener("click", RF.resetGameObjects);
  RF.el("openGateButton").addEventListener("click", () => RF.unlockStoragePieces("teleop"));
  RF.el("scoreBasketButton").addEventListener("click", () => RF.scoreInventoryInBasket("teleop"));

  RF.el("formatButton").addEventListener("click", RF.formatAutoCode);
  RF.el("copyButton").addEventListener("click", () => {
    navigator.clipboard?.writeText(RF.el("codeEditor").value);
    RF.showToast("Code copied");
  });
  RF.el("clearCodeButton").addEventListener("click", () => {
    RF.el("codeEditor").value = "";
    RF.showToast("Auto code cleared");
  });

  RF.el("clearLogButton").addEventListener("click", () => {
    RF.el("terminal").innerHTML = '<div class="line">Log cleared.</div>';
  });

  RF.el("saveRunButton").addEventListener("click", RF.saveRun);
  RF.el("exportSummaryButton").addEventListener("click", RF.exportSummary);

  document.querySelectorAll(".command-card").forEach(card => {
    card.addEventListener("click", () => RF.appendCommand(card.dataset.target, card.dataset.command));
  });

  document.querySelectorAll(".mission").forEach(mission => {
    mission.addEventListener("click", () => RF.loadAutoSample(mission.dataset.mission));
  });

  document.querySelectorAll("[data-gamepad]").forEach(button => {
    button.addEventListener("click", () => RF.runTeleopButton(button.dataset.gamepad));
  });

  document.querySelectorAll("[data-drive]").forEach(button => {
    button.addEventListener("click", () => {
      const direction = button.dataset.drive;
      if (direction === "forward") RF.teleopDrive(1, 0, 0);
      if (direction === "back") RF.teleopDrive(-1, 0, 0);
      if (direction === "left") RF.teleopDrive(0, -1, 0);
      if (direction === "right") RF.teleopDrive(0, 1, 0);
      if (direction === "turnLeft") RF.teleopDrive(0, 0, -1);
      if (direction === "turnRight") RF.teleopDrive(0, 0, 1);
    });
  });

  Object.values(RF.inputs).forEach(input => input.addEventListener("input", RF.updateConfigStats));

  window.addEventListener("keydown", event => {
    const tag = document.activeElement.tagName;
    const movementKeys = ["w", "a", "s", "d", "q", "e", "r", "1", "2", "3", "4"];
    const key = event.key.toLowerCase();
    const isTyping = tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT";

    if (isTyping && !(RF.state.driverMode && movementKeys.includes(key))) return;
    if (RF.state.driverMode && movementKeys.includes(key)) event.preventDefault();

    if (event.code === "Space") {
      event.preventDefault();
      RF.runAuto(true);
    }

    if (key === "r") RF.resetRobot();
    if (event.key === "ArrowUp") RF.nudgeRobot(0, -2);
    if (event.key === "ArrowDown") RF.nudgeRobot(0, 2);
    if (event.key === "ArrowLeft") RF.nudgeRobot(-2, 0);
    if (event.key === "ArrowRight") RF.nudgeRobot(2, 0);

    if (key === "w") RF.teleopDrive(1, 0, 0);
    if (key === "s") RF.teleopDrive(-1, 0, 0);
    if (key === "a") RF.teleopDrive(0, -1, 0);
    if (key === "d") RF.teleopDrive(0, 1, 0);
    if (key === "q") RF.teleopDrive(0, 0, -1);
    if (key === "e") RF.teleopDrive(0, 0, 1);

    if (["1", "2", "3", "4"].includes(event.key)) {
      RF.runTeleopButton({ "1": "A", "2": "B", "3": "X", "4": "Y" }[event.key]);
    }
  });
};
