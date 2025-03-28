import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/userSchema';

dotenv.config();

const router = express.Router();

// Email configuration with improved debugging
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL || 'kiithub16@gmail.com',
    pass: process.env.EMAIL_PASS || '',
  },
  debug: true, // Enable debug logs
  logger: true // Log to console
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error configuring mail transporter:', error);
    console.log("\n⚠️ Gmail authentication failed! Here's how to fix it:");
    console.log("1. You need to enable 2-Step Verification for your Gmail account");
    console.log("2. Create an App Password specifically for this application");
    console.log("3. Go to: https://myaccount.google.com/security");
    console.log("4. Enable 2-Step Verification if not already enabled");
    console.log("5. Then go to: https://myaccount.google.com/apppasswords");
    console.log("6. Generate a new App Password (select 'Other' and name it 'KiitHub')");
    console.log("7. Copy the 16-character password (no spaces) to your .env file\n");
    console.log("8. Make sure the EMAIL and EMAIL_PASS variables are set correctly in your .env file");
    console.log(`   Current EMAIL value: ${process.env.EMAIL ? `${process.env.EMAIL}` : 'not set'}`);
    console.log(`   EMAIL_PASS appears to be ${process.env.EMAIL_PASS ? 'set' : 'not set'}\n`);
  } else {
    console.log("✅ Mail transporter is ready to send messages");
  }
});

/**
 * Send purchase confirmation emails to both buyer and seller
 */
router.post('/send-purchase-notifications', async (req, res) => {
  console.log('Received request to send purchase notifications:', {
    requestBody: {
      ...req.body,
      // Don't log seller/buyer emails completely for privacy
      buyerEmail: req.body.buyerEmail ? `${req.body.buyerEmail.substring(0, 3)}...` : undefined,
      sellerEmail: req.body.sellerEmail ? `${req.body.sellerEmail.substring(0, 3)}...` : undefined
    }
  });

  try {
    const {
      itemId,
      itemName,
      itemPrice,
      sellerId,
      sellerName,
      sellerEmail: providedSellerEmail,
      buyerId,
      buyerName,
      buyerEmail
    } = req.body;

    // Validate required fields with detailed logging
    const missingFields = [];
    if (!itemName) missingFields.push('itemName');
    if (!itemPrice) missingFields.push('itemPrice');
    if (!sellerId) missingFields.push('sellerId');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields for email notification:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required information for purchase notification: ${missingFields.join(', ')}`
      });
    }

    // Direct attempt to get seller from database if ID is provided
    let sellerEmail = providedSellerEmail;
    let resolvedSellerName = sellerName;
    
    if (sellerId && (!sellerEmail || sellerEmail.trim() === '')) {
      console.log(`Seller email not provided in request, fetching directly from database using ID: ${sellerId}`);
      try {
        // Validate ObjectId
        if (mongoose.Types.ObjectId.isValid(sellerId)) {
          const seller = await User.findById(sellerId);
          if (seller && seller.email_id) {
            sellerEmail = seller.email_id;
            resolvedSellerName = seller.name || sellerName;
            console.log(`Found seller email directly from database: ${sellerEmail.substring(0, 3)}...`);
          } else {
            console.warn(`Seller found but email missing: ${seller ? 'User exists' : 'User not found'}`);
          }
        } else {
          console.warn(`Invalid seller ID format: ${sellerId}`);
        }
      } catch (dbError) {
        console.error('Error fetching seller from database:', dbError);
      }
    }

    if (!buyerEmail && !sellerEmail) {
      console.warn('No recipient email addresses provided, cannot send notifications');
      return res.status(207).json({
        success: false,
        message: 'Neither buyer nor seller email address was provided',
        guidance: 'Provide at least one of buyerEmail or sellerEmail'
      });
    }

    console.log('Preparing to send emails to:', {
      buyer: buyerEmail ? `${buyerName} (${buyerEmail.substring(0, 3)}...)` : 'No buyer email provided',
      seller: sellerEmail ? `${resolvedSellerName} (${sellerEmail.substring(0, 3)}...)` : 'No seller email provided'
    });

    // Generate order reference number (simple implementation)
    const orderRef = `KH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    // Track which emails were sent successfully
    const emailResults = {
      buyerSent: false,
      sellerSent: false
    };

    // Send email to buyer if we have their email
    if (buyerEmail) {
      const buyerMailOptions = {
        from: '"KiitHub" <kiithub16@gmail.com>',
        to: buyerEmail,
        subject: `Your KiitHub Purchase Confirmation: ${itemName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: linear-gradient(to right, rgba(240, 240, 255, 0.4), rgba(230, 230, 250, 0.4));">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4F46E5; margin-bottom: 5px;">Purchase Confirmed!</h1>
              <p style="color: #6B7280; font-size: 16px;">Thank you for shopping with KiitHub</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 0;">Order Details</h2>
              <p><strong>Order Reference:</strong> ${orderRef}</p>
              <p><strong>Item:</strong> ${itemName}</p>
              <p><strong>Price:</strong> ₹${itemPrice}</p>
              <p><strong>Seller:</strong> ${resolvedSellerName}</p>
              <p><strong>Purchase Date:</strong> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 0;">What's Next?</h2>
              <p>The seller has been notified of your purchase and will contact you soon to arrange the delivery or pickup of your item.</p>
              <p>Please keep this email for your records. If you have any questions about your purchase, please contact the seller directly or reach out to our support team.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px;">
              <p>Thank you for using KiitHub - the marketplace for KIIT students!</p>
              <p>&copy; ${new Date().getFullYear()} KiitHub. All rights reserved.</p>
            </div>
          </div>
        `
      };

      try {
        const buyerInfo = await transporter.sendMail(buyerMailOptions);
        console.log('Buyer email sent:', buyerInfo.response);
        emailResults.buyerSent = true;
      } catch (buyerEmailError: any) {
        console.error('Error sending buyer email:', buyerEmailError.message);
      }
    }

    // Send email to seller if we have their email
    if (sellerEmail) {
      console.log(`Attempting to send seller email to: ${sellerEmail.substring(0, 3)}...`);
      
      const sellerMailOptions = {
        from: '"KiitHub" <kiithub16@gmail.com>',
        to: sellerEmail,
        subject: `Your Item Has Been Sold on KiitHub: ${itemName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: linear-gradient(to right, rgba(240, 240, 255, 0.4), rgba(230, 230, 250, 0.4));">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4F46E5; margin-bottom: 5px;">Your Item Has Been Sold!</h1>
              <p style="color: #6B7280; font-size: 16px;">Good news! Someone has purchased your item on KiitHub</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 0;">Sale Details</h2>
              <p><strong>Order Reference:</strong> ${orderRef}</p>
              <p><strong>Item:</strong> ${itemName}</p>
              <p><strong>Sale Price:</strong> ₹${itemPrice}</p>
              <p><strong>Buyer:</strong> ${buyerName}</p>
              <p><strong>Buyer Email:</strong> ${buyerEmail || 'Not available'}</p>
              <p><strong>Sale Date:</strong> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 0;">What's Next?</h2>
              <p>Please contact the buyer as soon as possible to arrange the delivery or pickup of the item.</p>
              <p>The payment will be processed and sent to your account shortly.</p>
              <p>If you have any questions about this sale, please contact our support team.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px;">
              <p>Thank you for using KiitHub - the marketplace for KIIT students!</p>
              <p>&copy; ${new Date().getFullYear()} KiitHub. All rights reserved.</p>
            </div>
          </div>
        `
      };

      try {
        const sellerInfo = await transporter.sendMail(sellerMailOptions);
        console.log('Seller email sent:', sellerInfo.response);
        emailResults.sellerSent = true;
      } catch (sellerEmailError: any) {
        console.error('Error sending seller email:', sellerEmailError.message);
        console.error('Full seller email error:', sellerEmailError);
      }
    } else {
      console.warn('No seller email provided, sending notification to admin as backup');
      
      // Send a copy to admin if seller email is missing
      const adminMailOptions = {
        from: '"KiitHub" <kiithub16@gmail.com>',
        to: 'kiithub16@gmail.com', // admin/backup address
        subject: `[ADMIN] Item Sold But Seller Email Missing: ${itemName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #E11D48; margin-bottom: 5px;">Admin Alert: Missing Seller Email</h1>
              <p style="color: #6B7280; font-size: 16px;">An item was sold but the seller email was not available</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 0;">Sale Details</h2>
              <p><strong>Order Reference:</strong> ${orderRef}</p>
              <p><strong>Item:</strong> ${itemName}</p>
              <p><strong>Sale Price:</strong> ₹${itemPrice}</p>
              <p><strong>Seller ID:</strong> ${sellerId}</p>
              <p><strong>Seller Name:</strong> ${resolvedSellerName}</p>
              <p><strong>Buyer:</strong> ${buyerName}</p>
              <p><strong>Buyer Email:</strong> ${buyerEmail || 'Not available'}</p>
              <p><strong>Sale Date:</strong> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div style="background-color: #FEF2F2; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-left: 4px solid #E11D48;">
              <h2 style="color: #E11D48; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 0;">Admin Action Required</h2>
              <p>The system was unable to send an email notification to the seller because their email address was missing or invalid.</p>
              <p>Please contact the seller manually to inform them about this sale.</p>
            </div>
          </div>
        `
      };
      
      try {
        const adminInfo = await transporter.sendMail(adminMailOptions);
        console.log('Admin notification email sent:', adminInfo.response);
      } catch (adminEmailError: any) {
        console.error('Error sending admin notification:', adminEmailError.message);
      }
    }

    // Determine overall success
    const allSuccessful = (!buyerEmail || emailResults.buyerSent) && (!sellerEmail || emailResults.sellerSent);
    const someSuccessful = emailResults.buyerSent || emailResults.sellerSent;
    
    if (allSuccessful) {
      return res.status(200).json({
        success: true,
        message: 'Purchase notifications sent successfully',
        orderReference: orderRef,
        emailResults
      });
    } else if (someSuccessful) {
      return res.status(207).json({
        success: true,
        message: 'Some purchase notifications were sent successfully',
        orderReference: orderRef,
        emailResults
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send any notification emails',
        orderReference: orderRef,
        emailResults
      });
    }
  } catch (error: any) {
    console.error('Error in purchase notification route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process purchase notifications',
      error: error.message
    });
  }
});

/**
 * Test route to directly check email sending functionality
 */
router.get('/test-email', async (req, res) => {
  console.log('Testing email functionality');
  
  try {
    // Get the test recipient from query params or use default
    const testEmail = req.query.email || 'kiithub16@gmail.com';
    console.log(`Sending test email to ${testEmail}`);
    
    // Simple test email
    const testMailOptions = {
      from: '"KiitHub Test" <kiithub16@gmail.com>',
      to: testEmail as string,
      subject: 'KiitHub Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #4F46E5;">Email Test Successful!</h1>
          <p>If you're seeing this email, it means the KiitHub email system is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
          <p>This is a test email sent from the KiitHub platform.</p>
        </div>
      `
    };
    
    // Send the test email with detailed logging
    const info = await transporter.sendMail(testMailOptions);
    console.log('Test email sent:', info);
    console.log('Response:', info.response);
    console.log('Message ID:', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      emailInfo: {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
        pending: info.pending
      }
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      errorCode: error.code,
      guidance: "You may need to configure an app password for your Gmail account. See https://support.google.com/accounts/answer/185833"
    });
  }
});

export default router; 