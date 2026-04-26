window.RF = window.RF || {};

RF.getTargetPose = function(targetName) {
  const target = String(targetName || "BLUE").toUpperCase();
  const selector = target === "RED" ? ".red-basket" : ".blue-basket";
  const rect = RF.getRectFromElement(document.querySelector(selector), target.toLowerCase() + " basket");
  return {
    x: (rect.x1 + rect.x2) / 2,
    y: (rect.y1 + rect.y2) / 2,
    height: 30
  };
};

RF.simulateShot = function(targetName = "BLUE", power = 0.9, angleDeg = 42, phase = RF.state.phase, originPose = RF.state.pose, render = true) {
  const c = RF.getConfig();
  const target = RF.getTargetPose(targetName);
  const dx = target.x - originPose.x;
  const dy = target.y - originPose.y;
  const horizontalDistance = Math.hypot(dx, dy);
  const angle = RF.clamp(Number(angleDeg) || 42, 10, 80) * RF.DEG_TO_RAD;
  const powerValue = RF.clamp(Number(power) || 0.9, 0.1, 1);

  const v = c.shooterExitSpeed * powerValue;
  const vx = v * Math.cos(angle);
  const vy = v * Math.sin(angle);
  const launchHeight = 12;
  const targetHeight = target.height;
  const travelTime = horizontalDistance / Math.max(1, vx);
  const predictedHeight = launchHeight + vy * travelTime - 0.5 * RF.GRAVITY * travelTime * travelTime;
  const heightError = Math.abs(predictedHeight - targetHeight);
  const made = heightError <= 8 && horizontalDistance <= 120 && horizontalDistance >= 8;

  RF.scoreState.shotsAttempted++;
  if (made) {
    RF.scoreState.shotsMade++;
    RF.addScore(8, "Shot made into " + targetName + " basket", phase);
  } else {
    RF.log("Shot missed: height error " + RF.round(heightError, 1) + "in at target.", "error");
  }

  RF.updateScoreUI();

  if (render) {
    RF.drawShotArc(originPose, target, made);
  }

  RF.log("Shot " + (made ? "made" : "missed") + ": target=" + targetName + ", power=" + powerValue + ", angle=" + angleDeg + "°, distance=" + RF.round(horizontalDistance, 1) + "in.");
  RF.showToast(made ? "Shot made" : "Shot missed");

  return { made, horizontalDistance, heightError, travelTime, predictedHeight };
};

RF.drawShotArc = function(origin, target, made) {
  const layer = RF.el("shotLayer");
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const midX = (origin.x + target.x) / 2;
  const midY = (origin.y + target.y) / 2 - 14;
  const d = "M " + origin.x + " " + origin.y + " Q " + midX + " " + midY + " " + target.x + " " + target.y;
  line.setAttribute("d", d);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", made ? "#86efac" : "#fb7185");
  line.setAttribute("stroke-width", "1.4");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("stroke-dasharray", made ? "0" : "3 2");
  layer.appendChild(line);

  setTimeout(() => {
    line.style.opacity = "0.25";
  }, 1200);
};
