* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #080914;
  --panel: rgba(255,255,255,0.075);
  --panel2: rgba(255,255,255,0.12);
  --border: rgba(255,255,255,0.15);
  --text: #ffffff;
  --muted: rgba(255,255,255,0.66);
  --accent: #67e8f9;
  --purple: #c084fc;
  --good: #86efac;
  --warn: #fde047;
  --bad: #fb7185;
  --blue: #2563eb;
  --red: #ef4444;
}

body.light {
  --bg: #edf6ff;
  --panel: rgba(15,23,42,0.065);
  --panel2: rgba(15,23,42,0.11);
  --border: rgba(15,23,42,0.16);
  --text: #07111f;
  --muted: rgba(15,23,42,0.68);
}

html { scroll-behavior: smooth; }

body {
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
  background: var(--bg);
  color: var(--text);
  overflow-x: hidden;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background:
    radial-gradient(circle at 8% 0%, rgba(103,232,249,0.18), transparent 30%),
    radial-gradient(circle at 100% 15%, rgba(192,132,252,0.18), transparent 32%),
    linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: auto, auto, 54px 54px, 54px 54px;
}

.container { width: min(1500px, calc(100% - 28px)); margin: 0 auto; }

nav {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 18px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(18px);
}

.logo { display: flex; align-items: center; gap: 12px; }
.logo-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--panel2);
  box-shadow: 0 0 30px rgba(103,232,249,0.2);
  font-size: 24px;
}
.logo strong { display: block; font-size: 19px; letter-spacing: -0.04em; }
.logo span { display: block; color: var(--muted); font-size: 12px; }

.nav-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

.button {
  border: 0;
  border-radius: 15px;
  padding: 12px 16px;
  background: var(--accent);
  color: #07111f;
  font-weight: 900;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.16s ease;
  white-space: nowrap;
}

.button:hover { transform: translateY(-2px); filter: brightness(1.06); }
.button.secondary { background: var(--panel); color: var(--text); border: 1px solid var(--border); }
.button.danger { background: var(--bad); color: white; }
.button.small { padding: 9px 12px; border-radius: 12px; font-size: 13px; }

.hero {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 18px;
  padding: 20px 0;
}

.card, .panel {
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 26px;
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 70px rgba(0,0,0,0.14);
}

.card { padding: 28px; }
.panel { padding: 18px; }

.pill {
  display: inline-flex;
  border: 1px solid var(--border);
  background: var(--panel2);
  color: var(--accent);
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  margin-bottom: 20px;
}

h1 { font-size: clamp(42px, 5.4vw, 76px); line-height: 0.94; letter-spacing: -0.07em; }
h2 { font-size: 25px; letter-spacing: -0.04em; margin-bottom: 10px; }
h3 { font-size: 17px; margin-bottom: 8px; }
p, .hint { color: var(--muted); line-height: 1.65; }
.hero p { margin-top: 20px; font-size: 17px; }

.actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 18px; }
.no-margin { margin-top: 0; }
.label { color: var(--accent); font-size: 12px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 9px; }

.guide-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px; }
.guide-item { border: 1px solid var(--border); background: rgba(255,255,255,0.06); border-radius: 18px; padding: 15px; }
body.light .guide-item { background: rgba(15,23,42,0.06); }
.guide-item strong { display: block; margin-bottom: 6px; }
.guide-item span { color: var(--muted); line-height: 1.45; }

.main-grid {
  display: grid;
  grid-template-columns: 360px minmax(520px, 1fr) 420px;
  gap: 18px;
  align-items: start;
  padding-bottom: 36px;
}

.form-grid { display: grid; gap: 12px; margin-top: 14px; }

.input-row {
  display: grid;
  grid-template-columns: 1fr 105px;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.055);
  border-radius: 17px;
  padding: 12px;
}
.input-row.stacked { margin-top: 12px; grid-template-columns: 1fr 120px; }
body.light .input-row { background: rgba(15,23,42,0.055); }

label { display: block; font-weight: 900; margin-bottom: 4px; }
small { color: var(--muted); line-height: 1.35; }

input, select, textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: rgba(0,0,0,0.16);
  color: var(--text);
  border-radius: 13px;
  padding: 10px 11px;
  font: inherit;
  outline: none;
}

body.light input, body.light select, body.light textarea { background: rgba(255,255,255,0.58); }
textarea { min-height: 245px; resize: vertical; font-family: Consolas, Monaco, monospace; font-size: 14px; line-height: 1.55; }

.field-toolbar { display: flex; justify-content: space-between; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }

.field-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  min-height: 520px;
  border-radius: 22px;
  border: 2px solid rgba(255,255,255,0.2);
  overflow: hidden;
  background: #555;
  box-shadow: inset 0 0 30px rgba(0,0,0,0.34), 0 24px 60px rgba(0,0,0,0.18);
  touch-action: none;
}

.field {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent calc(16.666% - 2px), #f97316 calc(16.666% - 2px), #f97316 calc(16.666% + 2px), transparent calc(16.666% + 2px)),
    linear-gradient(90deg, transparent calc(33.333% - 2px), #f97316 calc(33.333% - 2px), #f97316 calc(33.333% + 2px), transparent calc(33.333% + 2px)),
    linear-gradient(90deg, transparent calc(50% - 2px), #f97316 calc(50% - 2px), #f97316 calc(50% + 2px), transparent calc(50% + 2px)),
    linear-gradient(90deg, transparent calc(66.666% - 2px), #f97316 calc(66.666% - 2px), #f97316 calc(66.666% + 2px), transparent calc(66.666% + 2px)),
    linear-gradient(90deg, transparent calc(83.333% - 2px), #f97316 calc(83.333% - 2px), #f97316 calc(83.333% + 2px), transparent calc(83.333% + 2px)),
    linear-gradient(transparent calc(20% - 2px), #facc15 calc(20% - 2px), #facc15 calc(20% + 2px), transparent calc(20% + 2px)),
    linear-gradient(transparent calc(40% - 2px), #facc15 calc(40% - 2px), #facc15 calc(40% + 2px), transparent calc(40% + 2px)),
    linear-gradient(transparent calc(60% - 2px), #facc15 calc(60% - 2px), #facc15 calc(60% + 2px), transparent calc(60% + 2px)),
    linear-gradient(transparent calc(80% - 2px), #facc15 calc(80% - 2px), #facc15 calc(80% + 2px), transparent calc(80% + 2px)),
    #5b5b5b;
}

.field::before, .field::after {
  content: "";
  position: absolute;
  top: 25%;
  width: 34%;
  height: 2px;
  background: rgba(255,255,255,0.72);
  transform-origin: center;
}
.field::before { left: 10%; transform: rotate(45deg); }
.field::after { right: 10%; transform: rotate(-45deg); }

.corner { position: absolute; width: 15%; height: 15%; top: 0; opacity: 0.95; }
.corner.blue { left: 0; background: linear-gradient(135deg, #1d4ed8 0 49%, transparent 50%); }
.corner.red { right: 0; background: linear-gradient(225deg, #ef4444 0 49%, transparent 50%); }
.goal { position: absolute; width: 12%; height: 12%; bottom: 18%; border: 4px solid; }
.goal.red { border-color: var(--red); left: 19%; border-right: 0; }
.goal.blue { border-color: var(--blue); right: 19%; border-left: 0; }

.pixel {
  position: absolute;
  width: 3.8%; height: 3.8%;
  border-radius: 50%;
  background: var(--purple);
  box-shadow: 0 0 10px rgba(192,132,252,0.8);
  transform: translate(-50%, -50%);
}
.pixel.green { background: #22c55e; box-shadow: 0 0 10px rgba(34,197,94,0.8); }

.path-layer, .waypoint-layer { position: absolute; inset: 0; pointer-events: none; z-index: 5; }

.waypoint {
  position: absolute;
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  background: var(--warn);
  transform: translate(-50%, -50%);
  box-shadow: 0 0 15px rgba(253,224,71,0.85);
}

.waypoint span {
  position: absolute;
  left: 16px;
  top: -10px;
  color: white;
  background: rgba(0,0,0,0.58);
  padding: 3px 6px;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}

.robot {
  position: absolute;
  width: 9.5%; height: 9.5%;
  left: 50%; top: 50%;
  border-radius: 16%;
  border: 3px solid var(--accent);
  background: rgba(8,145,178,0.28);
  box-shadow: 0 0 24px rgba(103,232,249,0.55);
  display: grid;
  place-items: center;
  z-index: 7;
  cursor: grab;
  transform-origin: 50% 50%;
  transform: translate(-50%, -50%) rotate(0deg);
  transition: left 0.14s linear, top 0.14s linear, transform 0.14s linear;
}
.robot.running { animation: pulse 0.7s ease-in-out infinite; }

.robot-arrow {
  width: 0; height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 23px solid var(--accent);
  transform: translateY(-2px);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(103,232,249,0.45); }
  50% { box-shadow: 0 0 42px rgba(103,232,249,0.85); }
}

.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 13px; }
.stat { border: 1px solid var(--border); background: rgba(255,255,255,0.055); border-radius: 17px; padding: 13px; }
body.light .stat { background: rgba(15,23,42,0.055); }
.stat strong { display: block; font-size: 24px; margin-bottom: 4px; letter-spacing: -0.04em; }
.stat span { color: var(--muted); font-size: 13px; line-height: 1.35; }

.meter { height: 12px; border-radius: 999px; background: rgba(255,255,255,0.12); overflow: hidden; margin-top: 10px; }
.meter-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--bad), var(--warn), var(--good)); transition: width 0.3s ease; }

.command-list { display: grid; gap: 9px; margin-top: 12px; }
.command-card, .mission, .gamepad-button {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.055);
  color: var(--text);
  border-radius: 15px;
  padding: 12px;
  cursor: pointer;
  transition: 0.16s ease;
}
body.light .command-card, body.light .mission, body.light .gamepad-button { background: rgba(15,23,42,0.055); }
.command-card:hover, .mission:hover, .gamepad-button:hover { transform: translateX(4px); border-color: rgba(103,232,249,0.5); }
.command-card code { color: var(--accent); font-weight: 900; display: block; margin-bottom: 5px; }
.command-card small, .mission small { color: var(--muted); display: block; line-height: 1.4; }

.terminal {
  min-height: 165px;
  max-height: 260px;
  overflow: auto;
  border: 1px solid var(--border);
  background: rgba(0,0,0,0.3);
  border-radius: 18px;
  padding: 13px;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.55;
  color: #dcfce7;
  margin-top: 12px;
}
body.light .terminal { background: rgba(15,23,42,0.86); }
.line::before { content: "> "; color: var(--accent); }
.line.error { color: #fecdd3; }
.line.error::before { content: "! "; color: var(--bad); }

.teleop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
.driver-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.driver-pad .blank { min-height: 38px; }
.gamepad-buttons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.gamepad-button { font-weight: 900; text-align: center; }
.gamepad-button.a { color: var(--good); }
.gamepad-button.b { color: var(--bad); }
.gamepad-button.x { color: var(--accent); }
.gamepad-button.y { color: var(--warn); }

.badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.badge { border: 1px solid var(--border); border-radius: 999px; padding: 7px 10px; color: var(--muted); font-size: 12px; font-weight: 900; }
.badge.unlocked { background: var(--good); color: #052e16; border-color: transparent; }

table { width: 100%; border-collapse: collapse; min-width: 520px; }
th, td { padding: 11px; border-bottom: 1px solid var(--border); color: var(--muted); text-align: left; font-size: 14px; }
th { color: var(--text); background: rgba(255,255,255,0.055); }
.comparison { overflow-x: auto; margin-top: 12px; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: none;
  place-items: center;
  padding: 18px;
  background: rgba(0,0,0,0.58);
  backdrop-filter: blur(12px);
}
.modal-backdrop.open { display: grid; }
.modal { width: min(720px, 100%); border: 1px solid var(--border); border-radius: 26px; background: var(--bg); padding: 24px; }
.modal ul { margin: 14px 0; padding-left: 18px; }
.modal li { color: var(--muted); line-height: 1.7; }
.kbd { display: inline-flex; border: 1px solid var(--border); background: var(--panel); border-radius: 8px; padding: 2px 7px; color: var(--text); font-family: Consolas, Monaco, monospace; font-size: 12px; }

.toast {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 90;
  max-width: min(430px, calc(100vw - 36px));
  background: var(--text);
  color: var(--bg);
  border-radius: 18px;
  padding: 14px 16px;
  font-weight: 900;
  box-shadow: 0 18px 50px rgba(0,0,0,0.22);
  transform: translateY(120px);
  opacity: 0;
  transition: 0.25s ease;
}
.toast.show { transform: translateY(0); opacity: 1; }

.compact { margin-bottom: 10px; }
.field-hint { margin-top: 12px; }
.top-gap { margin-top: 12px; }
.bottom-panel { margin-bottom: 70px; }

@media (max-width: 1260px) {
  .main-grid { grid-template-columns: 360px 1fr; }
  .right-column { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
}

@media (max-width: 930px) {
  nav { flex-direction: column; align-items: flex-start; }
  .hero, .main-grid, .right-column { grid-template-columns: 1fr; }
  .field-wrap { min-height: unset; }
}

@media (max-width: 620px) {
  .guide-grid, .stats-grid, .teleop-grid { grid-template-columns: 1fr; }
  .input-row, .input-row.stacked { grid-template-columns: 1fr; }
  .card, .panel { padding: 16px; border-radius: 22px; }
}
