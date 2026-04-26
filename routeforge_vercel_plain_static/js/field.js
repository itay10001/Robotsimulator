window.RF = window.RF || {};

RF.setRobotPose = function(next, updateStart = false) {
  const pose = {
    x: RF.clamp(next.x, 0, RF.FIELD_SIZE),
    y: RF.clamp(next.y, 0, RF.FIELD_SIZE),
    heading: RF.normalizeAngle(next.heading ?? RF.state.pose.heading)
  };

  RF.state.pose = pose;
  if (updateStart) RF.state.startPose = { ...pose };

  const robot = RF.el("robot");
  robot.style.left = (pose.x / RF.FIELD_SIZE * 100) + "%";
  robot.style.top = (pose.y / RF.FIELD_SIZE * 100) + "%";
  robot.style.transform = "translate(-50%, -50%) rotate(" + pose.heading + "deg)";
};

RF.setRobotTransition = function(enabled) {
  RF.el("robot").style.transition = enabled
    ? "left 0.14s linear, top 0.14s linear, transform 0.14s linear"
    : "none";
};

RF.clearPath = function() {
  RF.state.routePoints = [];
  RF.el("pathLine").setAttribute("points", "");
  RF.el("waypointLayer").innerHTML = "";
  RF.state.stepIndex = 0;
};

RF.drawPath = function(points) {
  RF.state.routePoints = points.map(p => ({ x: p.x, y: p.y }));
  RF.el("pathLine").setAttribute("points", RF.state.routePoints.map(p => p.x + "," + p.y).join(" "));
};

RF.addWaypoint = function(x, y, label) {
  const point = document.createElement("div");
  point.className = "waypoint";
  point.style.left = (x / RF.FIELD_SIZE * 100) + "%";
  point.style.top = (y / RF.FIELD_SIZE * 100) + "%";
  point.innerHTML = "<span>" + RF.escapeHtml(label) + "</span>";
  RF.el("waypointLayer").appendChild(point);
};

RF.animateRobotTo = function(targetPose, durationMs, trail = null) {
  return new Promise(resolve => {
    const start = { ...RF.state.pose };
    const duration = Math.max(90, durationMs);
    const started = performance.now();
    let lastTrailTime = 0;
    RF.setRobotTransition(false);

    function frame(now) {
      const t = RF.clamp((now - started) / duration, 0, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const currentPose = {
        x: RF.lerp(start.x, targetPose.x, eased),
        y: RF.lerp(start.y, targetPose.y, eased),
        heading: RF.shortestAngleLerp(start.heading, targetPose.heading ?? start.heading, eased)
      };

      RF.setRobotPose(currentPose);

      if (trail && now - lastTrailTime > 24) {
        trail.push({ x: currentPose.x, y: currentPose.y });
        RF.drawPath(trail);
        lastTrailTime = now;
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        RF.setRobotPose(targetPose);
        if (trail) {
          trail.push({ x: targetPose.x, y: targetPose.y });
          RF.drawPath(trail);
        }
        RF.setRobotTransition(true);
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
};

RF.initFieldDragging = function() {
  const fieldWrap = RF.el("fieldWrap");
  const robot = RF.el("robot");

  fieldWrap.addEventListener("pointerdown", event => {
    if (!event.target.closest("#robot")) return;
    RF.state.dragged = true;
    robot.setPointerCapture?.(event.pointerId);
  });

  fieldWrap.addEventListener("pointermove", event => {
    if (!RF.state.dragged) return;

    const rect = fieldWrap.getBoundingClientRect();
    const x = RF.clamp((event.clientX - rect.left) / rect.width * RF.FIELD_SIZE, 0, RF.FIELD_SIZE);
    const y = RF.clamp((event.clientY - rect.top) / rect.height * RF.FIELD_SIZE, 0, RF.FIELD_SIZE);

    RF.setRobotPose({ x, y, heading: RF.state.startPose.heading }, true);
  });

  window.addEventListener("pointerup", () => {
    if (RF.state.dragged) {
      RF.log("Start dragged to " + RF.round(RF.state.startPose.x, 1) + ", " + RF.round(RF.state.startPose.y, 1));
    }
    RF.state.dragged = false;
  });
};
