"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// mailer.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Check if email credentials are provided
if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.error("EMAIL or EMAIL_PASS environment variables are missing!");
}
console.log("Configuring email transporter with:", {
    email: process.env.EMAIL ? `${process.env.EMAIL.substring(0, 3)}...` : "missing",
    password: process.env.EMAIL_PASS ? "has value" : "missing"
});
// Create a test SMTP transporter for development
// This uses Ethereal - a fake SMTP service, perfect for testing email in a non-production environment
function createTestAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Creating test email account for development...");
        try {
            const testAccount = yield nodemailer_1.default.createTestAccount();
            console.log("Test account created:", testAccount.user);
            return nodemailer_1.default.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }
        catch (error) {
            console.error("Failed to create test account:", error);
            throw error;
        }
    });
}
// Create Gmail transporter
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});
// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error configuring mail transporter:", error);
        console.log("\n⚠️ Gmail authentication failed! Here's how to fix it:");
        console.log("1. You need to enable 2-Step Verification for your Gmail account");
        console.log("2. Create an App Password specifically for this application");
        console.log("3. Go to: https://myaccount.google.com/security");
        console.log("4. Enable 2-Step Verification if not already enabled");
        console.log("5. Then go to: https://myaccount.google.com/apppasswords");
        console.log("6. Generate a new App Password (select 'Other' and name it 'KiitHub')");
        console.log("7. Copy the 16-character password (no spaces) to your .env file\n");
    }
    else {
        console.log("✅ Mail transporter is ready to send messages");
    }
});
exports.default = transporter;
