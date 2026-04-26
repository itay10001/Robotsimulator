window.RF = window.RF || {};

RF.FIELD_SIZE = 144;
RF.DEG_TO_RAD = Math.PI / 180;

RF.el = function(id) {
  return document.getElementById(id);
};

RF.clamp = function(value, min, max) {
  return Math.max(min, Math.min(max, value));
};

RF.round = function(value, digits = 2) {
  return Number(value.toFixed(digits));
};

RF.normalizeAngle = function(angle) {
  let value = angle % 360;
  if (value < 0) value += 360;
  return value;
};

RF.wait = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

RF.escapeHtml = function(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

RF.lerp = function(a, b, t) {
  return a + (b - a) * t;
};

RF.shortestAngleLerp = function(a, b, t) {
  const diff = ((b - a + 540) % 360) - 180;
  return RF.normalizeAngle(a + diff * t);
};

RF.estimateHeadingBetween = function(a, b, fallbackHeading) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.hypot(dx, dy) < 0.001) return fallbackHeading;
  return RF.normalizeAngle(Math.atan2(dx, -dy) / RF.DEG_TO_RAD);
};

RF.showToast = function(message) {
  const toast = RF.el("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(RF.showToast.timer);
  RF.showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
};

RF.log = function(message, type = "normal") {
  const terminal = RF.el("terminal");
  const line = document.createElement("div");
  line.className = type === "error" ? "line error" : "line";
  line.textContent = message;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
};
