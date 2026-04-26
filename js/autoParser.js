window.RF = window.RF || {};

RF.parseAutoCode = function() {
  const codeEditor = RF.el("codeEditor");
  const errors = [];
  const commands = [];
  const allowed = ["SET_START", "FORWARD", "BACK", "STRAFE", "TURN", "WAIT", "MARK", "INTAKE", "SHOOT", "LIFT"];

  codeEditor.value.split("\n").forEach((raw, index) => {
    const line = raw.split("#")[0].trim();
    if (!line) return;

    const parts = line.split(/\s+/);
    const command = parts[0].toUpperCase();

    if (!allowed.includes(command)) {
      errors.push("Line " + (index + 1) + ": unknown command " + command);
    } else {
      commands.push({ command, args: parts.slice(1), line: index + 1 });
    }
  });

  return { commands, errors };
};

RF.formatAutoCode = function() {
  const codeEditor = RF.el("codeEditor");
  codeEditor.value = codeEditor.value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.replace(/\s+/g, " ").replace(/^\w+/, match => match.toUpperCase()))
    .join("\n");

  RF.showToast("Auto code formatted");
};

RF.loadAutoSample = function(type = "scorePark") {
  const codeEditor = RF.el("codeEditor");

  if (type === "park") {
    codeEditor.value = "SET_START 18 118 0\nFORWARD 34 0.8\nINTAKE 0.8 0.7\nSTRAFE 28 0.7\nMARK Park";
  } else if (type === "fastCycle") {
    codeEditor.value = "SET_START 18 118 0\nMARK Start\nFORWARD 42 0.95\nINTAKE 0.9 0.9\nSTRAFE 42 0.85\nTURN 90 0.7\nFORWARD 28 0.9\nSHOOT 3 0.9\nMARK Cycle\nBACK 22 0.85\nTURN -90 0.7\nFORWARD 30 0.95\nMARK Park";
  } else {
    codeEditor.value = "SET_START 18 118 0\nMARK Start\nFORWARD 28 0.75\nINTAKE 1.2 0.8\nSTRAFE 32 0.65\nTURN 90 0.5\nFORWARD 18 0.55\nSHOOT 2 0.85\nMARK Score\nWAIT 0.4\nTURN -90 0.55\nFORWARD 24 0.8\nMARK Park";
  }

  RF.showToast("Auto sample loaded");
};
