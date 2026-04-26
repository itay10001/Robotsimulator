window.RF = window.RF || {};

RF.nearestRenderHeading = function(targetHeading) {
  const normalizedTarget = RF.normalizeAngle(targetHeading);
  const currentRender = RF.state.renderHeading ?? RF.state.pose.heading ?? 0;
  const currentNormalized = RF.normalizeAngle(currentRender);
  const shortestDelta = ((normalizedTarget - currentNormalized + 540) % 360) - 180;
  return currentRender + shortestDelta;
};

RF.getRobotHalfSize = () => RF.FIELD_SIZE * 0.095 / 2;

RF.getRectFromElement = function(element, name) {
  const fieldRect = RF.el("fieldWrap").getBoundingClientRect();
  const rect = element.getBoundingClientRect();

  return {
    name,
    x1: (rect.left - fieldRect.left) / fieldRect.width * RF.FIELD_SIZE,
    y1: (rect.top - fieldRect.top) / fieldRect.height * RF.FIELD_SIZE,
    x2: (rect.right - fieldRect.left) / fieldRect.width * RF.FIELD_SIZE,
    y2: (rect.bottom - fieldRect.top) / fieldRect.height * RF.FIELD_SIZE
  };
};

RF.getObstacleRects = function() {
  const obstacles = [];

  document.querySelectorAll(".basket").forEach(basket => {
    obstacles.push(RF.getRectFromElement(basket, basket.dataset.basket + " basket"));
  });

  if (!RF.game?.gateOpen) {
    document.querySelectorAll(".gate").forEach(gate => {
      obstacles.push(RF.getRectFromElement(gate, "closed gate"));
    });
  }

  // Field border as soft wall handled by clamp; storage zones are not obstacles, baskets/gates are.
  return obstacles;
};

RF.rectContainsPose = function(rect, pose, padding = 0) {
  return pose.x >= rect.x1 - padding && pose.x <= rect.x2 + padding && pose.y >= rect.y1 - padding && pose.y <= rect.y2 + padding;
};

RF.isRobotCollidingWithObstacle = function(x, y) {
  const half = RF.getRobotHalfSize();

  return RF.getObstacleRects().some(rect =>
    x + half > rect.x1 &&
    x - half < rect.x2 &&
    y + half > rect.y1 &&
    y - half < rect.y2
  );
};

RF.resolveAllowedPoseAlongSegment = function(from, to) {
  const target = {
    x: RF.clamp(to.x, 0, RF.FIELD_SIZE),
    y: RF.clamp(to.y, 0, RF.FIELD_SIZE),
    heading: to.heading ?? from.heading
  };

  if (!RF.isRobotCollidingWithObstacle(target.x, target.y)) {
    return { pose: target, blocked: false };
  }

  let best = { ...from };

  for (let i = 1; i <= 100; i++) {
    const t = i / 100;
    const candidate = {
      x: RF.lerp(from.x, target.x, t),
      y: RF.lerp(from.y, target.y, t),
      heading: target.heading
    };

    if (RF.isRobotCollidingWithObstacle(candidate.x, candidate.y)) {
      return { pose: best, blocked: true };
    }

    best = candidate;
  }

  return { pose: best, blocked: true };
};

RF.setRobotPose = function(next, updateStart = false, allowCollision = false) {
  const targetHeading = next.heading ?? RF.state.pose.heading;

  const pose = {
    x: RF.clamp(next.x, 0, RF.FIELD_SIZE),
    y: RF.clamp(next.y, 0, RF.FIELD_SIZE),
    heading: RF.normalizeAngle(targetHeading)
  };

  if (!allowCollision && RF.isRobotCollidingWithObstacle(pose.x, pose.y)) {
    return false;
  }

  RF.state.pose = pose;

  if (updateStart) {
    RF.state.startPose = { ...pose };
  }

  RF.state.renderHeading = RF.nearestRenderHeading(targetHeading);

  const robot = RF.el("robot");
  robot.style.left = (pose.x / RF.FIELD_SIZE * 100) + "%";
  robot.style.top = (pose.y / RF.FIELD_SIZE * 100) + "%";
  robot.style.transform = "translate(-50%, -50%) rotate(" + RF.state.renderHeading + "deg)";
  return true;
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
  RF.el("shotLayer").innerHTML = "";
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
    const start = { ...RF.state.pose, heading: RF.state.renderHeading ?? RF.state.pose.heading };
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

      RF.setRobotPose(currentPose, false, true);

      if (trail && now - lastTrailTime > 24) {
        trail.push({ x: currentPose.x, y: currentPose.y });
        RF.drawPath(trail);
        lastTrailTime = now;
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        RF.setRobotPose(targetPose, false, true);
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
