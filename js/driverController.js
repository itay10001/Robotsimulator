window.RF = window.RF || {};

RF.driver = {
  active: false,
  lastTime: 0,
  keys: {
    forward: false,
    back: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false
  }
};

RF.setDriveInput = function(direction, pressed) {
  if (!(direction in RF.driver.keys)) return;
  RF.driver.keys[direction] = pressed;
};

RF.clearDriveInputs = function() {
  Object.keys(RF.driver.keys).forEach(key => {
    RF.driver.keys[key] = false;
  });
};

RF.getDriveVectorFromInputs = function() {
  const forward = (RF.driver.keys.forward ? 1 : 0) + (RF.driver.keys.back ? -1 : 0);
  const strafe = (RF.driver.keys.right ? 1 : 0) + (RF.driver.keys.left ? -1 : 0);
  const turn = (RF.driver.keys.turnRight ? 1 : 0) + (RF.driver.keys.turnLeft ? -1 : 0);

  const driveMagnitude = Math.hypot(forward, strafe);
  const scale = driveMagnitude > 1 ? 1 / driveMagnitude : 1;

  return {
    forward: forward * scale,
    strafe: strafe * scale,
    turn
  };
};

RF.startDriverLoop = function() {
  if (RF.driver.active) return;

  RF.driver.active = true;
  RF.driver.lastTime = performance.now();

  function loop(now) {
    if (!RF.driver.active) return;

    const dt = RF.clamp((now - RF.driver.lastTime) / 1000, 0, 0.05);
    RF.driver.lastTime = now;

    const input = RF.getDriveVectorFromInputs();
    const moving = Math.abs(input.forward) > 0 || Math.abs(input.strafe) > 0 || Math.abs(input.turn) > 0;

    if (moving) {
      RF.teleopDriveContinuous(input.forward, input.strafe, input.turn, dt);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
};

RF.stopDriverLoop = function() {
  RF.driver.active = false;
  RF.clearDriveInputs();
};

RF.initSmoothDriverControls = function() {
  const keyMap = {
    w: "forward",
    s: "back",
    a: "left",
    d: "right",
    q: "turnLeft",
    e: "turnRight"
  };

  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    if (!(key in keyMap)) return;

    const tag = document.activeElement.tagName;
    const isTyping = tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT";

    if (isTyping && !RF.state.driverMode) return;

    event.preventDefault();
    RF.setDriveInput(keyMap[key], true);
  });

  window.addEventListener("keyup", event => {
    const key = event.key.toLowerCase();
    if (!(key in keyMap)) return;

    event.preventDefault();
    RF.setDriveInput(keyMap[key], false);
  });

  document.querySelectorAll("[data-drive]").forEach(button => {
    const direction = button.dataset.drive;

    const start = event => {
      event.preventDefault();
      RF.setDriveInput(direction, true);
    };

    const stop = event => {
      event.preventDefault();
      RF.setDriveInput(direction, false);
    };

    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("pointerleave", stop);
  });

  RF.startDriverLoop();
};
