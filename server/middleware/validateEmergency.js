function validateEmergency(req, res, next) {
  const { reporterName, reporterPhone, patient } = req.body;

  if (!reporterName || !reporterPhone) {
    return res.status(400).json({ error: "Reporter name and phone are required." });
  }
  if (!patient || !Array.isArray(patient.symptoms) || patient.symptoms.length === 0) {
    return res.status(400).json({ error: "At least one symptom must be selected." });
  }
  const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
  if (!phoneRegex.test(reporterPhone)) {
    return res.status(400).json({ error: "Invalid phone number format." });
  }
  next();
}
module.exports = validateEmergency;