window.RF = window.RF || {};

RF.state = {
  pose: { x: 18, y: 118, heading: 0 },
  startPose: { x: 18, y: 118, heading: 0 },
  routePoints: [],
  lastResult: null,
  savedRuns: [],
  dragged: false,
  isRunning: false,
  teleopTime: 0,
  teleopActions: 0,
  stepIndex: 0,
  driverMode: false
};
