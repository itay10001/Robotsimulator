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
  let shots = 0;
  let boundaryHits = 0;
  let mechanismBattery = 0;
  let strafePenalty = 0;

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
      continue;
    }

    if (cmd === "SHOOT") {
      const count = Math.max(0, Number(a[0]) || 0);
      const power = RF.clamp(Number(a[1]) || 0.85, 0.1, 1);
      const factor = RF.clamp(c.shooterMotorRpm / 1150, 0.25, 2.8);
      const time = (0.75 + count * 0.55) / factor;
      totalTime += time;
      shots += count;
      mechanismBattery += time * power * (c.shooterMotorRpm / 1150) * 1.25;
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
      const cx = RF.clamp(nx, 0, RF.FIELD_SIZE);
      const cy = RF.clamp(ny, 0, RF.FIELD_SIZE);

      if (nx !== cx || ny !== cy) boundaryHits++;

      sim.x = cx;
      sim.y = cy;

      const moveTime = Math.abs(inches) / Math.max(1, c.maxSpeed * power * speedFactor);
      totalDistance += Math.abs(inches);
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
  const score = Math.round(efficiency + markers * 8 + shots * 6 - boundaryHits * 15 - Math.max(0, totalTime - 30));

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
    shots,
    boundaryHits,
    wheelRotations,
    batteryUse,
    efficiency,
    score
  };
};

RF.updateAutoStats = function(result) {
  RF.el("timeStat").textContent = RF.round(result.totalTime, 2) + "s";
  RF.el("distanceStat").textContent = RF.round(result.totalDistance, 1) + "in";
  RF.el("turnStat").textContent = RF.round(result.totalTurn, 0) + "°";
  RF.el("batteryStat").textContent = RF.round(result.batteryUse, 1) + "%";
  RF.el("wheelRotStat").textContent = RF.round(result.wheelRotations, 1);
  RF.el("scoreStat").textContent = result.score;
  RF.el("efficiencyMeter").style.width = RF.round(result.efficiency, 0) + "%";

  let text = "Needs work. Reduce wasted motion or slow mechanisms.";
  if (result.efficiency >= 80) text = "Strong route. Short, fast, and clean.";
  else if (result.efficiency >= 60) text = "Usable route. Could still be cleaner.";
  else if (result.efficiency >= 40) text = "Messy route. Reduce turns, waits, or useless movement.";

  if (result.boundaryHits) text += " Boundary hit detected.";
  if (result.config.driveType === "tank" && RF.el("codeEditor").value.toUpperCase().includes("STRAFE")) {
    text += " Tank drive cannot strafe cleanly.";
  }

  RF.el("efficiencyText").textContent = text;
};

RF.runAuto = async function(animated = true) {
  if (RF.state.isRunning) return;

  const result = RF.simulateAuto();
  if (!result) return;

  RF.state.lastResult = result;
  RF.clearPath();

  result.events
    .filter(event => event.type === "mark")
    .forEach(event => RF.addWaypoint(event.x, event.y, event.label));

  RF.updateAutoStats(result);
  RF.updateAchievements(result);
  RF.log("Auto complete: " + RF.round(result.totalTime, 2) + "s, " + RF.round(result.totalDistance, 1) + "in, " + RF.round(result.efficiency, 0) + "% efficiency.");
  RF.showToast("Auto simulated: " + RF.round(result.efficiency, 0) + "% efficiency");

  if (!animated) {
    RF.drawPath(result.points);
    RF.setRobotPose(result.finalPose);
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

  RF.el("robot").classList.remove("running");
  RF.state.isRunning = false;
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
  RF.setRobotPose({ x: point.x, y: point.y, heading: RF.state.pose.heading });
  RF.log("Step " + RF.state.stepIndex + ": " + RF.round(point.x, 1) + ", " + RF.round(point.y, 1));
  RF.state.stepIndex++;
};

RF.resetRobot = function() {
  RF.clearPath();
  RF.setRobotPose(RF.state.startPose);
  RF.state.teleopTime = 0;
  RF.state.teleopActions = 0;
  RF.el("teleopTimeStat").textContent = "0.00s";
  RF.el("teleopActionStat").textContent = "0";
  RF.showToast("Robot reset");
  RF.log("Robot reset.");
};
