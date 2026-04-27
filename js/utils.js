window.RF = window.RF || {};

RF.FIELD_SIZE = 144;
RF.DEG_TO_RAD = Math.PI / 180;
RF.GRAVITY = 386.09; // in/s^2

RF.el = id => document.getElementById(id);

RF.clamp = (value, min, max) => Math.max(min, Math.min(max, value));

RF.round = (value, digits = 2) => Number(value.toFixed(digits));

RF.normalizeAngle = angle => {
  let value = angle % 360;
  if (value < 0) value += 360;
  return value;
};

RF.wait = ms => new Promise(resolve => setTimeout(resolve, ms));

RF.escapeHtml = text => String(text)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

RF.lerp = (a, b, t) => a + (b - a) * t;

RF.shortestAngleLerp = (a, b, t) => {
  const diff = ((b - a + 540) % 360) - 180;
  return RF.normalizeAngle(a + diff * t);
};

RF.estimateHeadingBetween = (a, b, fallbackHeading) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.hypot(dx, dy) < 0.001) return fallbackHeading;
  return RF.normalizeAngle(Math.atan2(dx, -dy) / RF.DEG_TO_RAD);
};

RF.showToast = message => {
  const toast = RF.el("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(RF.showToast.timer);
  RF.showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
};

RF.log = (message, type = "normal") => {
  const terminal = RF.el("terminal");
  const line = document.createElement("div");
  line.className = type === "error" ? "line error" : "line";
  line.textContent = message;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
};
