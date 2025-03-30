import EmailJob from "../models/EmailJob.js";
import agenda from "../config/agenda.js";

// Schedule a single email (for API endpoint)
export async function scheduleEmail(req, res) {
  try {
    const { to, subject, body, delayHours = 1 } = req.body;

    // Calculate scheduled time
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + delayHours);

    // Create email job record
    const emailJob = new EmailJob({
      to,
      subject,
      body,
      scheduledTime,
      user: req.user._id,
    });

    await emailJob.save();

    // Schedule with Agenda
    agenda.schedule(scheduledTime, "send email", {
      to,
      subject,
      body,
      emailJobId: emailJob._id,
    });

    res.status(201).json({
      message: "Email scheduled successfully",
      scheduledTime,
      emailJob,
    });
  } catch (error) {
    console.error("Schedule email error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Get all scheduled emails
export async function getScheduledEmails(req, res) {
  try {
    const emailJobs = await EmailJob.find({ user: req.user._id }).sort({
      scheduledTime: 1,
    });

    res.json(emailJobs);
  } catch (error) {
    console.error("Get scheduled emails error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
