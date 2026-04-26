window.RF = window.RF || {};

RF.parseTeleopBindings = function() {
  const bindings = {};

  RF.el("teleopEditor").value.split("\n").forEach(raw => {
    const line = raw.split("#")[0].trim();
    if (!line) return;

    const parts = line.split(/\s+/);
    if (parts[0].toUpperCase() !== "BIND") return;

    const button = (parts[1] || "").toUpperCase();
    const action = (parts[2] || "").toUpperCase();

    if (["A", "B", "X", "Y"].includes(button)) {
      bindings[button] = { action, args: parts.slice(3) };
    }
  });

  return bindings;
};

RF.runTeleopButton = function(button) {
  const c = RF.getConfig();
  const bind = RF.parseTeleopBindings()[button];

  if (!bind) {
    RF.log("No binding for " + button, "error");
    RF.showToast("No binding for " + button);
    return;
  }

  RF.state.teleopActions++;
  RF.el("teleopActionStat").textContent = RF.state.teleopActions;

  if (bind.action === "INTAKE") {
    const seconds = Math.max(0, Number(bind.args[0]) || 1);
    const power = RF.clamp(Number(bind.args[1]) || 0.8, 0.1, 1);
    RF.state.teleopTime += seconds / RF.clamp(c.intakeMotorRpm / 435, 0.25, 2.5);
    RF.log("TeleOp " + button + ": INTAKE " + seconds + "s at " + power);
  } else if (bind.action === "SHOOT") {
    const shots = Math.max(0, Number(bind.args[0]) || 1);
    const power = RF.clamp(Number(bind.args[1]) || 0.85, 0.1, 1);
    RF.state.teleopTime += (0.75 + shots * 0.55) / RF.clamp(c.shooterMotorRpm / 1150, 0.25, 2.8);
    RF.log("TeleOp " + button + ": SHOOT " + shots + " at " + power);
  } else if (bind.action === "LIFT") {
    const inches = Math.abs(Number(bind.args[0]) || 6);
    const power = RF.clamp(Number(bind.args[1]) || 0.6, 0.1, 1);
    RF.state.teleopTime += inches / Math.max(1, c.liftMotorRpm * 0.018 * power);
    RF.log("TeleOp " + button + ": LIFT " + inches + "in at " + power);
  } else if (bind.action === "MARK") {
    RF.addWaypoint(RF.state.pose.x, RF.state.pose.y, bind.args.join(" ") || button);
    RF.log("TeleOp " + button + ": marker dropped.");
  } else {
    RF.log("Unknown TeleOp binding action: " + bind.action, "error");
  }

  RF.el("teleopTimeStat").textContent = RF.round(RF.state.teleopTime, 2) + "s";
  RF.showToast("TeleOp " + button + " executed");
};

RF.teleopDrive = function(forward, strafe, turn, seconds = 0.22, power = null) {
  const c = RF.getConfig();
  const scale = RF.clamp(Number(RF.inputs.teleopSpeedScale.value) || 0.75, 0.1, 1);
  const p = RF.clamp(power ?? scale, 0.1, 1);
  const distance = c.maxSpeed * p * seconds;

  const controlMode = RF.inputs.controlMode.value;
  const movementHeading = controlMode === "field" ? 0 : RF.state.pose.heading;

  const fRad = movementHeading * RF.DEG_TO_RAD;
  const sRad = (movementHeading + 90) * RF.DEG_TO_RAD;

  const dx = Math.sin(fRad) * forward * distance + Math.sin(sRad) * strafe * distance;
  const dy = -Math.cos(fRad) * forward * distance - Math.cos(sRad) * strafe * distance;

  const next = {
    x: RF.state.pose.x + dx,
    y: RF.state.pose.y + dy,
    heading: RF.normalizeAngle(RF.state.pose.heading + turn * 120 * seconds * p)
  };

  if (!RF.state.routePoints.length) {
    RF.state.routePoints.push({ x: RF.state.pose.x, y: RF.state.pose.y });
  }

  RF.state.routePoints.push({
    x: RF.clamp(next.x, 0, RF.FIELD_SIZE),
    y: RF.clamp(next.y, 0, RF.FIELD_SIZE)
  });

  RF.drawPath(RF.state.routePoints);
  RF.setRobotPose(next);

  RF.state.teleopTime += seconds;
  RF.el("teleopTimeStat").textContent = RF.round(RF.state.teleopTime, 2) + "s";
  RF.log("TeleOp drive [" + controlMode + "-centric]: f=" + forward + " s=" + strafe + " turn=" + turn);
};

RF.runTeleopScript = function() {
  RF.clearPath();
  RF.state.routePoints = [{ x: RF.state.pose.x, y: RF.state.pose.y }];
  RF.state.teleopTime = 0;
  RF.state.teleopActions = 0;
  RF.el("teleopActionStat").textContent = "0";

  RF.el("teleopEditor").value.split("\n").forEach(raw => {
    const line = raw.split("#")[0].trim();
    if (!line) return;

    const p = line.split(/\s+/);
    if (p[0].toUpperCase() === "TELEOP_DRIVE") {
      RF.teleopDrive(
        Number(p[1]) || 0,
        Number(p[2]) || 0,
        Number(p[3]) || 0,
        Math.max(0, Number(p[4]) || 0.4),
        RF.clamp(Number(p[5]) || Number(RF.inputs.teleopSpeedScale.value) || 0.75, 0.1, 1)
      );
    }
  });

  RF.showToast("TeleOp script simulated");
};

RF.loadTeleopSample = function() {
  RF.el("teleopEditor").value =
    "# forward strafe turn seconds power\n" +
    "TELEOP_DRIVE 1 0 0 1.0 0.75\n" +
    "TELEOP_DRIVE 0 1 0 0.8 0.65\n" +
    "TELEOP_DRIVE 0 0 1 0.5 0.55\n" +
    "BIND A INTAKE 1.0 0.8\n" +
    "BIND B SHOOT 1 0.85\n" +
    "BIND X LIFT 8 0.6\n" +
    "BIND Y MARK TeleOp Marker";

  RF.showToast("TeleOp sample loaded");
};
