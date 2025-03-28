// routes/otp.ts
import { Router, Request, Response } from "express";
import transporter from "../../mailer";
import nodemailer from "nodemailer";
import User, { IUser } from '../models/userSchema';
import bcrypt from 'bcryptjs';
const router = Router();

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

router.post("/send-otp", async (req: Request, res: Response) => {
  try {
    const { email_id } = req.body;
    console.log("Received request to send OTP to:", email_id);

    // Validate that email_id is provided and has the correct domain
    if (!email_id) {
      return res.status(400).json({ message: "Email is required." });
    }
    
    if (!email_id.endsWith("@kiit.ac.in")) {
      return res.status(400).json({ message: "Only KIIT emails allowed." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`Generated OTP for ${email_id}: ${otp}`);

    // Store OTP with timestamp
    otpStore.set(email_id, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Prepare the mail options
    const mailOptions = {
      from: process.env.EMAIL,
      to: email_id,
      subject: "Your OTP for KIIT Registration",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h1 style="color: #3f51b5; text-align: center;">KIIT Hub Registration</h1>
          <p>Hello,</p>
          <p>Thank you for registering with KIIT Hub. Your One Time Password (OTP) is:</p>
          <div style="text-align: center; padding: 10px; background-color: #f5f5f5; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <p>Regards,<br>KIIT Hub Team</p>
        </div>
      `
    };

    console.log("Attempting to send email...");

    // Send the email with timeout to prevent hanging
    try {
      // Create a promise that will resolve or reject in 15 seconds
      const emailPromise = new Promise((resolve, reject) => {
        // Set a timeout for 15 seconds
        const timeout = setTimeout(() => {
          reject(new Error("Email sending timed out after 15 seconds"));
        }, 15000);

        // Try to send the email
        transporter.sendMail(mailOptions, (err, info) => {
          clearTimeout(timeout); // Clear the timeout regardless of result
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        });
      });

      const info = await emailPromise as nodemailer.SentMessageInfo;
      console.log("Email sent successfully:", info.response);
      
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError);
      
      // Provide more specific error messages based on error type
      if (emailError.code === 'EAUTH') {
        return res.status(500).json({ 
          message: "Authentication failed with email provider", 
          error: "Incorrect email credentials. Please verify app password."
        });
      } else if (emailError.code === 'ESOCKET' || emailError.code === 'ETIMEDOUT') {
        return res.status(500).json({ 
          message: "Connection to email server failed", 
          error: "Network error or firewall issue. Check your connection."
        });
      } else if (emailError.message && emailError.message.includes('timeout')) {
        return res.status(500).json({ 
          message: "Email sending timed out", 
          error: "Request took too long. Check network connection."
        });
      }

      // For development purposes, allow OTP to proceed even if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log("DEV MODE: Returning OTP despite email failure:", otp);
        return res.status(200).json({ 
          message: "OTP generated (email failed but proceeding in dev mode)", 
          otp 
        });
      }
      
      throw emailError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error("Error in OTP route:", error);
    // Make sure we return a proper JSON response even in case of error
    return res.status(500).json({ 
      message: "Error sending OTP", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Verify OTP and handle registration
router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { name, email_id, password, otp } = req.body;

    // Validate required fields
    if (!name || !email_id || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email domain
    if (!email_id.endsWith("@kiit.ac.in")) {
      return res.status(400).json({ message: "Only KIIT institutional email IDs are allowed" });
    }

    // Check if OTP exists and is valid
    const otpData = otpStore.get(email_id);
    if (!otpData) {
      return res.status(400).json({ message: "No OTP found. Please request a new OTP" });
    }

    // Check if OTP has expired (5 minutes)
    if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
      otpStore.delete(email_id);
      return res.status(400).json({ message: "OTP has expired. Please request a new one" });
    }

    // Convert input OTP to number for comparison
    const inputOTP = parseInt(otp);
    if (otpData.otp !== inputOTP) {
      otpData.attempts++;
      if (otpData.attempts >= 3) {
        otpStore.delete(email_id);
      }
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if user already exists with timeout
    const existingUser = await Promise.race([
      User.findOne({ email_id }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 15000)
      )
    ]);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    console.log('Creating new user with password:', password);
    
    // Create new user with timeout
    const user = await Promise.race([
      new User({
        name,
        email_id,
        password, // Plain password - will be hashed by pre-save middleware
        college_name: "KIIT University"
      }).save(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timed out')), 15000)
      )
    ]) as IUser;

    console.log('User created with hashed password:', user.password);

    // Clear OTP from store
    otpStore.delete(email_id);

    // Generate auth token
    const token = await user.generateAuthToken();

    // Set cookie
    res.cookie('jwtoken', token, {
      expires: new Date(Date.now() + 25892000000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(201).json({ 
      message: "Registration successful",
      user: {
        name: user.name,
        email_id: user.email_id,
        college_name: user.college_name
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.message === 'Database operation timed out') {
      return res.status(500).json({ 
        message: 'Database operation failed', 
        error: 'Operation timed out. Please try again.' 
      });
    }
    return res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message || 'An unknown error occurred'
    });
  }
});

export default router;
