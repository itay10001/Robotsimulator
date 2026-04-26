window.addEventListener("DOMContentLoaded", () => {
  RF.initInputs();
  RF.setRobotPose(RF.state.startPose, true);
  RF.updateConfigStats();
  RF.initFieldDragging();
  RF.bindUI();
  RF.runAuto(false);
});
