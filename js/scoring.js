window.RF = window.RF || {};

RF.scoreState = {
  autoPoints: 0,
  teleopPoints: 0,
  rankingPoints: 0,
  shotsMade: 0,
  shotsAttempted: 0
};

RF.addScore = function(points, reason, phase = RF.state.phase) {
  if (phase === "auto") RF.scoreState.autoPoints += points;
  else RF.scoreState.teleopPoints += points;

  RF.updateScoreUI();
  RF.log(reason + ": +" + points + " points.");
};

RF.updateScoreUI = function() {
  const totalScore = RF.scoreState.autoPoints + RF.scoreState.teleopPoints;
  let rp = 0;

  if (RF.scoreState.autoPoints >= 15) rp++;
  if (RF.game?.gateOpen) rp++;
  if (RF.game?.scoredPieces >= 3 || RF.scoreState.shotsMade >= 2) rp++;
  if (RF.game?.parkCompleted) rp++;

  RF.scoreState.rankingPoints = rp;

  RF.el("scoreAuto").textContent = RF.scoreState.autoPoints;
  RF.el("scoreTeleop").textContent = RF.scoreState.teleopPoints;
  RF.el("scoreTotal").textContent = totalScore;
  RF.el("scoreRP").textContent = rp;
  RF.el("shotStat").textContent = RF.scoreState.shotsMade + "/" + RF.scoreState.shotsAttempted;
};

RF.updateAchievements = function(result) {
  RF.el("badgeRun").classList.add("unlocked");
  if (result.totalTime < 8) RF.el("badgeFast").classList.add("unlocked");
  if (result.efficiency >= 75) RF.el("badgeEfficient").classList.add("unlocked");
  if (result.markers >= 3) RF.el("badgeMarkers").classList.add("unlocked");
  if (RF.game.gateOpen) RF.el("badgeGate").classList.add("unlocked");
  if (RF.scoreState.shotsMade > 0) RF.el("badgeShot").classList.add("unlocked");
};
