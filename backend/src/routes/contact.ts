import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL || 'kiithub16@gmail.com',
    pass: process.env.EMAIL_PASS, // Use the correct environment variable that's in the .env file
  },
});

/**
 * POST /contact - Handle contact form submissions
 */
router.post('/', async (req, res) => {
  const { fullName, email, phone, message } = req.body;
  
  // Validate required fields
  if (!fullName || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide name, email, and message' 
    });
  }
  
  try {
    // Set up email data
    const mailOptions = {
      from: 'kiithub16@gmail.com',
      to: 'kiithub16@gmail.com', // Email address that receives the contact form submissions
      replyTo: email, // Reply to the user's email
      subject: `Contact Form Submission from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: linear-gradient(to right, rgba(240, 240, 255, 0.4), rgba(230, 230, 250, 0.4));">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4F46E5; margin-bottom: 5px;">New Contact Form Submission</h1>
            <p style="color: #6B7280; font-size: 16px;">A user has sent you a message</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 0;">Contact Details</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p style="background-color: #F9FAFB; padding: 15px; border-radius: 5px; margin-top: 5px;">${message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px;">
            <p>This is an automated message from KiitHub.</p>
            <p>&copy; ${new Date().getFullYear()} KiitHub. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact form email sent:', info.messageId);
    
    // Set up auto-reply to the user
    const autoReplyOptions = {
      from: 'kiithub16@gmail.com',
      to: email,
      subject: 'Thank You for Contacting KiitHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: linear-gradient(to right, rgba(240, 240, 255, 0.4), rgba(230, 230, 250, 0.4));">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4F46E5; margin-bottom: 5px;">Thank You!</h1>
            <p style="color: #6B7280; font-size: 16px;">We've received your message</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <p>Dear ${fullName},</p>
            <p>Thank you for reaching out to KiitHub. We have received your message and will get back to you as soon as possible.</p>
            <p>For reference, here's a copy of your message:</p>
            <p style="background-color: #F9FAFB; padding: 15px; border-radius: 5px; margin-top: 5px; font-style: italic;">${message}</p>
            <p>If you have any urgent inquiries, please feel free to call us at +91 7717758900.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px;">
            <p>This is an automated response. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} KiitHub. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    // Send the auto-reply email
    await transporter.sendMail(autoReplyOptions);
    
    // Send success response to client
    return res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent! We will get back to you soon.' 
    });
    
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send your message. Please try again later.' 
    });
  }
});

export default router; 