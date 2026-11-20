
const TechnicianApplication = require("../models/TechnicianApplication");

// SUBMIT TECHNICIAN APPLICATION
const submitTechnicianApplication = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      skills,
      experience,
      message
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !specialization ||
      !skills ||
      !experience
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingApplication = await TechnicianApplication.findOne({
      email: normalizedEmail,
      status: "Pending"
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "A pending application already exists for this email."
      });
    }

    const application = await TechnicianApplication.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      specialization: specialization.trim(),
      skills: skills.trim(),
      experience: experience.trim(),
      message: message || "",
      status: "Pending"
    });

    return res.status(201).json({
      success: true,
      message: "Technician application submitted successfully.",
      application
    });

  } catch (error) {
    console.error("Technician Application Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit application."
    });
  }
};

module.exports = {
  submitTechnicianApplication
};
