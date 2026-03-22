import express from "express";
import { sendContactMail } from "../config/Mail.js";

const router = express.Router();

// POST /api/contact/send
router.post("/send", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await sendContactMail(name, email, subject, message);

    res.status(200).json({ message: "Message Sent Successfully!" });
  } catch (error) {
    console.error("Contact Error:", error.message);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

export default router;
