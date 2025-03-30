import Agenda from "agenda";
import emailService from "../services/emailService.js";
import EmailJob from "../models/EmailJob.js";
import { mongoURI } from "./config.js";

const agenda = new Agenda({
  db: {
    address: mongoURI,
    collection: "agendaJobs",
  },
});

// Define email sending job
agenda.define("send email", async (job) => {
  try {
    const { to, subject, body, emailJobId } = job.attrs.data;
    await emailService.sendEmail(to, subject, body);

    // Update job status in database
    await EmailJob.findByIdAndUpdate(emailJobId, { status: "sent" });
  } catch (error) {
    console.error("Error sending email:", error);

    // Update job status to failed
    await EmailJob.findByIdAndUpdate(job.attrs.data.emailJobId, {
      status: "failed",
    });
  }
});

// Start agenda
await agenda.start();

// ✅ Correct Export
export default agenda; 
