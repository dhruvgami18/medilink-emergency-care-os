function generateTrackingCode() {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ML-${rand}`;
}
module.exports = generateTrackingCode;