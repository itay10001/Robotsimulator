window.RF = window.RF || {};

RF.simulateAuto = function() {
  const c = RF.getConfig();
  const parsed = RF.parseAutoCode();

  if (parsed.errors.length) {
    parsed.errors.forEach(error => RF.log(error, "error"));
    RF.showToast("Auto code has errors");
    return null;
  }

  let sim = { ...RF.state.startPose };
  let points = [{ x: sim.x, y: sim.y }];
  let events = [];
  let animationSegments = [];

  let totalDistance = 0;
  let totalTurn = 0;
  let totalTime = 0;
  let markers = 0;
  let shotsAttempted = 0;
  let boundaryHits = 0;
  let mechanismBattery = 0;
  let strafePenalty = 0;
  let collisionBlocks = 0;

  for (const item of parsed.commands) {
    const cmd = item.command;
    const a = item.args;

    if (cmd === "SET_START") {
      sim = {
        x: RF.clamp(Number(a[0]) || 0, 0, RF.FIELD_SIZE),
        y: RF.clamp(Number(a[1]) || 0, 0, RF.FIELD_SIZE),
        heading: RF.normalizeAngle(Number(a[2]) || 0)
      };
      points = [{ x: sim.x, y: sim.y }];
      events.push({ type: "start", pose: { ...sim } });
      continue;
    }

    if (cmd === "MARK") {
      markers++;
      events.push({ type: "mark", x: sim.x, y: sim.y, label: a.join(" ") || "Marker" });
      continue;
    }

    if (cmd === "WAIT") {
      totalTime += Math.max(0, Number(a[0]) || 0);
      continue;
    }

    if (cmd === "OPEN_GATE") {
      totalTime += 0.35;
      mechanismBattery += 0.18;
      events.push({ type: "openGate" });
      continue;
    }

    if (cmd === "SCORE_BASKET") {
      totalTime += 0.55;
      mechanismBattery += 0.1;
      events.push({ type: "scoreBasket", x: sim.x, y: sim.y });
      continue;
    }

    if (cmd === "TURN") {
      const degrees = Number(a[0]) || 0;
      const power = RF.clamp(Number(a[1]) || 0.5, 0.1, 1);
      const from = { ...sim };
      const turnTime = Math.abs(degrees) / (145 * power);
      sim.heading = RF.normalizeAngle(sim.heading + degrees);
      totalTurn += Math.abs(degrees);
      totalTime += turnTime;
      animationSegments.push({ type: "turn", from, to: { ...sim }, duration: turnTime });
      continue;
    }

    if (cmd === "INTAKE") {
      const seconds = Math.max(0, Number(a[0]) || 0);
      const power = RF.clamp(Number(a[1]) || 0.8, 0.1, 1);
      const factor = RF.clamp(c.intakeMotorRpm / 435, 0.25, 2.5);
      totalTime += seconds / factor;
      mechanismBattery += seconds * power * (c.intakeMotorRpm / 435) * 0.45;
      events.push({ type: "intake", x: sim.x, y: sim.y, seconds, power });
      continue;
    }

    if (cmd === "SHOOT") {
      const target = (a[0] || "BLUE").toUpperCase();
      const power = RF.clamp(Number(a[1]) || 0.9, 0.1, 1);
      const angle = RF.clamp(Number(a[2]) || 42, 10, 80);
      shotsAttempted++;
      totalTime += c.shooterSpinUpTime + 0.35;
      mechanismBattery += (c.shooterSpinUpTime + 0.35) * power * (c.shooterMotorRpm / 2100) * 1.4;
      events.push({ type: "shoot", x: sim.x, y: sim.y, heading: sim.heading, target, power, angle });
      continue;
    }

    if (cmd === "LIFT") {
      const inches = Math.abs(Number(a[0]) || 0);
      const power = RF.clamp(Number(a[1]) || 0.6, 0.1, 1);
      const liftSpeed = Math.max(1, c.liftMotorRpm * 0.018 * power);
      totalTime += inches / liftSpeed;
      mechanismBattery += inches * power * 0.08;
      continue;
    }

    if (["FORWARD", "BACK", "STRAFE"].includes(cmd)) {
      let inches = Number(a[0]) || 0;
      const power = RF.clamp(Number(a[1]) || 0.65, 0.1, 1);
      if (cmd === "BACK") inches *= -1;

      let angle = sim.heading;
      let speedFactor = 1;

      if (cmd === "STRAFE") {
        angle += 90;
        speedFactor = c.driveType === "tank" ? 0.18 : 0.72;
        if (c.driveType === "tank") strafePenalty += 20;
      }

      const rad = angle * RF.DEG_TO_RAD;
      const from = { ...sim };
      const nx = sim.x + Math.sin(rad) * inches;
      const ny = sim.y - Math.cos(rad) * inches;

      const requestedPose = {
        x: RF.clamp(nx, 0, RF.FIELD_SIZE),
        y: RF.clamp(ny, 0, RF.FIELD_SIZE),
        heading: sim.heading
      };

      if (nx !== requestedPose.x || ny !== requestedPose.y) boundaryHits++;

      const resolved = RF.resolveAllowedPoseAlongSegment(from, requestedPose);
      if (resolved.blocked) {
        boundaryHits++;
        collisionBlocks++;
        events.push({ type: "blocked", label: "Field obstacle blocked movement" });
      }

      sim.x = resolved.pose.x;
      sim.y = resolved.pose.y;

      const actualDistance = Math.hypot(sim.x - from.x, sim.y - from.y);
      const moveTime = RF.estimateDriveTime(actualDistance, power, speedFactor);
      totalDistance += actualDistance;
      totalTime += moveTime;

      points.push({ x: sim.x, y: sim.y });
      animationSegments.push({
        type: "move",
        from,
        to: { ...sim, heading: RF.estimateHeadingBetween(from, sim, from.heading) },
        finalHeading: sim.heading,
        duration: moveTime
      });
    }
  }

  const wheelRotations = totalDistance / c.wheelCirc;
  const batteryUse = RF.clamp(totalDistance * 0.018 + totalTurn * 0.006 + totalTime * 0.16 + c.robotWeight * 0.035 + mechanismBattery, 0, 100);
  const direct = Math.hypot(sim.x - points[0].x, sim.y - points[0].y);
  const waste = totalDistance <= 0 ? 0 : 1 - RF.clamp(direct / totalDistance, 0, 1);
  const efficiency = RF.clamp(100 - waste * 28 - RF.clamp(totalTime / 30, 0, 1) * 22 - boundaryHits * 10 - strafePenalty - batteryUse * 0.22 + markers * 2, 0, 100);
  const routeScore = Math.round(efficiency + markers * 8 - boundaryHits * 15 - Math.max(0, totalTime - 30));

  return {
    config: c,
    points,
    events,
    animationSegments,
    finalPose: sim,
    totalDistance,
    totalTurn,
    totalTime,
    markers,
    shotsAttempted,
    boundaryHits,
    collisionBlocks,
    wheelRotations,
    batteryUse,
    efficiency,
    score: routeScore
  };
};

RF.updateAutoStats = function(result) {
  RF.el("timeStat").textContent = RF.round(result.totalTime, 2) + "s";
  RF.el("distanceStat").textContent = RF.round(result.totalDistance, 1) + "in";
  RF.el("turnStat").textContent = RF.round(result.totalTurn, 0) + "°";
  RF.el("batteryStat").textContent = RF.round(result.batteryUse, 1) + "%";
  RF.el("wheelRotStat").textContent = RF.round(result.wheelRotations, 1);
  RF.el("scoreStat").textContent = result.score;
  RF.el("collisionStat").textContent = result.collisionBlocks;
  RF.el("efficiencyMeter").style.width = RF.round(result.efficiency, 0) + "%";

  let text = "Needs work. Reduce wasted motion or slow mechanisms.";
  if (result.efficiency >= 80) text = "Strong route. Short, fast, and clean.";
  else if (result.efficiency >= 60) text = "Usable route. Could still be cleaner.";
  else if (result.efficiency >= 40) text = "Messy route. Reduce turns, waits, or useless movement.";

  if (result.boundaryHits) text += " Boundary or obstacle hit detected.";
  if (result.config.driveType === "tank" && RF.el("codeEditor").value.toUpperCase().includes("STRAFE")) {
    text += " Tank drive cannot strafe cleanly.";
  }

  RF.el("efficiencyText").textContent = text;
};

RF.applyAutoEvents = function(result) {
  result.events.filter(event => event.type === "mark").forEach(event => RF.addWaypoint(event.x, event.y, event.label));

  result.events.filter(event => event.type === "openGate").forEach(() => RF.unlockStoragePieces("auto"));
  result.events.filter(event => event.type === "intake").forEach(event => RF.collectNearbyGamePieces({ x: event.x, y: event.y, heading: 0 }));
  result.events.filter(event => event.type === "shoot").forEach(event => RF.simulateShot(event.target, event.power, event.angle, "auto", event, true));
  result.events.filter(event => event.type === "scoreBasket").forEach(() => RF.scoreInventoryInBasket("auto"));
};

RF.runAuto = async function(animated = true) {
  if (RF.state.isRunning) return;

  const result = RF.simulateAuto();
  if (!result) return;

  RF.state.phase = "auto";
  RF.state.lastResult = result;
  RF.clearPath();

  RF.updateAutoStats(result);
  RF.log("Auto complete: " + RF.round(result.totalTime, 2) + "s, " + RF.round(result.totalDistance, 1) + "in, " + RF.round(result.efficiency, 0) + "% efficiency.");
  if (result.events.some(event => event.type === "blocked")) RF.log("Collision rule: robot was stopped by a field object.", "error");

  if (!animated) {
    RF.drawPath(result.points);
    RF.setRobotPose(result.finalPose, false, true);
    RF.checkParking("auto");
    RF.updateScoreUI();
    return;
  }

  RF.state.isRunning = true;
  RF.el("robot").classList.add("running");

  const liveTrail = [{ x: RF.state.startPose.x, y: RF.state.startPose.y }];
  RF.drawPath(liveTrail);

  for (const segment of result.animationSegments) {
    if (segment.type === "move") {
      await RF.animateRobotTo(segment.to, segment.duration * 1000, liveTrail);
      await RF.animateRobotTo({ ...segment.to, heading: segment.finalHeading }, 120, liveTrail);
    } else if (segment.type === "turn") {
      await RF.animateRobotTo(segment.to, segment.duration * 1000, liveTrail);
    }
  }

  await RF.animateRobotTo(result.finalPose, 160, liveTrail);
  RF.applyAutoEvents(result);
  RF.checkParking("auto");
  RF.updateAutoStats(result);
  RF.updateScoreUI();
  RF.updateAchievements(result);

  RF.el("robot").classList.remove("running");
  RF.state.isRunning = false;
  RF.state.phase = "teleop";
  RF.showToast("Auto simulated: " + RF.round(result.efficiency, 0) + "% efficiency");
};

RF.stepAuto = function() {
  const result = RF.simulateAuto();
  if (!result) return;

  if (RF.state.stepIndex >= result.points.length) {
    RF.state.stepIndex = 0;
    RF.clearPath();
  }

  const partial = result.points.slice(0, RF.state.stepIndex + 1);
  RF.drawPath(partial);

  const point = result.points[RF.state.stepIndex];
  RF.setRobotPose({ x: point.x, y: point.y, heading: RF.state.pose.heading }, false, true);
  RF.log("Step " + RF.state.stepIndex + ": " + RF.round(point.x, 1) + ", " + RF.round(point.y, 1));
  RF.state.stepIndex++;
};

RF.resetRobot = function() {
  RF.clearPath();
  RF.setRobotPose(RF.state.startPose, false, true);
  RF.state.teleopTime = 0;
  RF.state.teleopActions = 0;
  RF.el("teleopTimeStat").textContent = "0.00s";
  RF.el("teleopActionStat").textContent = "0";
  RF.showToast("Robot reset");
  RF.log("Robot reset.");
};
