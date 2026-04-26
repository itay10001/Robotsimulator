window.RF = window.RF || {};

RF.inputs = {};

RF.initInputs = function() {
  RF.inputs = {
    driveType: RF.el("driveType"),
    driveMotorRpm: RF.el("driveMotorRpm"),
    intakeMotorRpm: RF.el("intakeMotorRpm"),
    shooterMotorRpm: RF.el("shooterMotorRpm"),
    liftMotorRpm: RF.el("liftMotorRpm"),
    wheelDiameter: RF.el("wheelDiameter"),
    gearRatio: RF.el("gearRatio"),
    robotWeight: RF.el("robotWeight"),
    batteryVoltage: RF.el("batteryVoltage"),
    teleopSpeedScale: RF.el("teleopSpeedScale"),
    controlMode: RF.el("controlMode")
  };
};

RF.getConfig = function() {
  const wheelDiameter = Number(RF.inputs.wheelDiameter.value) || 4;
  const driveMotorRpm = Number(RF.inputs.driveMotorRpm.value) || 312;
  const intakeMotorRpm = Number(RF.inputs.intakeMotorRpm.value) || 435;
  const shooterMotorRpm = Number(RF.inputs.shooterMotorRpm.value) || 1150;
  const liftMotorRpm = Number(RF.inputs.liftMotorRpm.value) || 117;
  const gearRatio = Number(RF.inputs.gearRatio.value) || 1;
  const robotWeight = Number(RF.inputs.robotWeight.value) || 32;
  const batteryVoltage = Number(RF.inputs.batteryVoltage.value) || 12.6;

  const wheelCirc = Math.PI * wheelDiameter;
  const voltageFactor = RF.clamp(batteryVoltage / 12.6, 0.6, 1.08);
  const weightFactor = RF.clamp(36 / robotWeight, 0.55, 1.35);
  const rawSpeed = (driveMotorRpm / gearRatio) * wheelCirc / 60;
  const maxSpeed = rawSpeed * 0.72 * voltageFactor * (0.8 + weightFactor * 0.2);

  return {
    driveType: RF.inputs.driveType.value,
    wheelDiameter,
    driveMotorRpm,
    intakeMotorRpm,
    shooterMotorRpm,
    liftMotorRpm,
    gearRatio,
    robotWeight,
    batteryVoltage,
    wheelCirc,
    maxSpeed
  };
};

RF.updateConfigStats = function() {
  const c = RF.getConfig();
  RF.el("maxSpeedStat").textContent = RF.round(c.maxSpeed, 1);
  RF.el("wheelCircStat").textContent = RF.round(c.wheelCirc, 2);
  RF.el("intakeRpmStat").textContent = c.intakeMotorRpm;
  RF.el("shooterRpmStat").textContent = c.shooterMotorRpm;
};
