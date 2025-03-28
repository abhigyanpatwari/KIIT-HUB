import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail as the email service
  auth: {
    user: process.env.EMAIL || 'kiithub16@gmail.com', // Your Gmail address
    pass: process.env.EMAIL_PASS || '', // Your Gmail password or app password
  },
});

interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Send contact form email
 * @param formData Contact form data
 * @returns Promise with the email send status
 */
export const sendContactEmail = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  const { fullName, email, phone, message } = formData;
  
  try {
    // Verify that the required fields are present
    if (!fullName || !email || !message) {
      return {
        success: false,
        message: 'Missing required fields',
      };
    }

    // Email options
    const mailOptions = {
      from: `"${fullName}" <${email}>`, // Use the sender's name
      replyTo: email, // Make sure replies go to the sender's email
      to: 'kiithub16@gmail.com', // Your email address (recipient)
      subject: `KiitHub Contact Form: ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #ffd700; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ffd700; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #333;">Message:</h3>
              <p style="white-space: pre-line;">${message}</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            <p>This email was sent from the KiitHub contact form.</p>
          </div>
        </div>
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Failed to send email',
    };
  }
}; 