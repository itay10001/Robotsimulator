window.RF = window.RF || {};

RF.inputs = {};

RF.initInputs = function() {
  RF.inputs = {
    driveType: RF.el("driveType"),
    driveMotorRpm: RF.el("driveMotorRpm"),
    intakeMotorRpm: RF.el("intakeMotorRpm"),
    shooterMotorRpm: RF.el("shooterMotorRpm"),
    shooterWheelDiameter: RF.el("shooterWheelDiameter"),
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
  const shooterMotorRpm = Number(RF.inputs.shooterMotorRpm.value) || 2100;
  const shooterWheelDiameter = Number(RF.inputs.shooterWheelDiameter.value) || 4;
  const liftMotorRpm = Number(RF.inputs.liftMotorRpm.value) || 117;
  const gearRatio = Number(RF.inputs.gearRatio.value) || 1;
  const robotWeight = Number(RF.inputs.robotWeight.value) || 32;
  const batteryVoltage = Number(RF.inputs.batteryVoltage.value) || 12.6;

  const wheelCirc = Math.PI * wheelDiameter;
  const shooterWheelCirc = Math.PI * shooterWheelDiameter;

  const voltageFactor = RF.clamp(batteryVoltage / 12.6, 0.6, 1.08);
  const weightFactor = RF.clamp(36 / robotWeight, 0.55, 1.35);

  const rawSpeed = (driveMotorRpm / gearRatio) * wheelCirc / 60;
  const maxSpeed = rawSpeed * 0.72 * voltageFactor * (0.8 + weightFactor * 0.2);
  const driveAcceleration = RF.clamp(82 * voltageFactor * weightFactor, 30, 145);

  const shooterExitSpeed = (shooterMotorRpm * shooterWheelCirc / 60) * 0.78 * voltageFactor;
  const shooterSpinUpTime = RF.clamp(1.35 * (2100 / Math.max(200, shooterMotorRpm)) / voltageFactor, 0.35, 3.0);

  return {
    driveType: RF.inputs.driveType.value,
    wheelDiameter,
    driveMotorRpm,
    intakeMotorRpm,
    shooterMotorRpm,
    shooterWheelDiameter,
    liftMotorRpm,
    gearRatio,
    robotWeight,
    batteryVoltage,
    wheelCirc,
    shooterWheelCirc,
    maxSpeed,
    driveAcceleration,
    shooterExitSpeed,
    shooterSpinUpTime
  };
};

RF.estimateDriveTime = function(distance, power, speedFactor = 1) {
  const c = RF.getConfig();
  const maxSpeed = Math.max(1, c.maxSpeed * RF.clamp(power, 0.1, 1) * speedFactor);
  const accel = Math.max(1, c.driveAcceleration * RF.clamp(power, 0.1, 1));
  const accelDistance = (maxSpeed * maxSpeed) / (2 * accel);

  if (Math.abs(distance) <= 2 * accelDistance) {
    return 2 * Math.sqrt(Math.abs(distance) / accel);
  }

  return (2 * maxSpeed / accel) + ((Math.abs(distance) - 2 * accelDistance) / maxSpeed);
};

RF.updateConfigStats = function() {
  const c = RF.getConfig();
  RF.el("maxSpeedStat").textContent = RF.round(c.maxSpeed, 1);
  RF.el("driveAccelStat").textContent = RF.round(c.driveAcceleration, 0);
  RF.el("wheelCircStat").textContent = RF.round(c.wheelCirc, 2);
  RF.el("shooterSpeedStat").textContent = RF.round(c.shooterExitSpeed, 1);
};
