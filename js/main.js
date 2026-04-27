window.addEventListener("DOMContentLoaded", () => {
  RF.initInputs();
  RF.setRobotPose(RF.state.startPose, true, true);
  RF.updateConfigStats();
  RF.initFieldDragging();
  RF.resetGameObjects();
  RF.bindUI();
  RF.initSmoothDriverControls();
  RF.runAuto(false);
});
