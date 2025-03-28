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
// Importing required libraries
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
// Using Express Router Class
const router = express_1.default.Router();
// Temporary route to clear all users (for testing only)
router.delete('/clear-all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield userSchema_1.default.deleteMany({});
        return res.status(200).json({ message: 'All users cleared successfully' });
    }
    catch (err) {
        console.error('Error clearing users:', err);
        return res.status(500).json({ message: 'Error clearing users' });
    }
}));
// The below mentioned function is responsible for allowing users to log in.
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_id, password } = req.body;
        // Checking if both email id and password is entered
        if (!email_id || !password) {
            return res.status(400).json({ message: 'Please enter both email and password' });
        }
        // Checking if Email Id exists and if not request registering as a new account
        const userLogin = yield userSchema_1.default.findOne({ email_id });
        if (!userLogin) {
            return res.status(400).json({ message: 'Invalid Email ID. Please register before signing in' });
        }
        // Comparing the entered password with the one present in dB
        console.log('Comparing passwords...');
        console.log('Input password length:', password.length);
        console.log('DB password length:', userLogin.password.length);
        const isMatched = yield bcryptjs_1.default.compare(password, userLogin.password);
        console.log('Password match result:', isMatched);
        if (!isMatched) {
            return res.status(403).json({ message: 'Access Denied: Invalid Credentials' });
        }
        // Store user information in session
        if (req.session) {
            // Use explicit type assertion
            req.session.userID = userLogin._id.toString();
            req.session.isAuthenticated = true;
        }
        // Return success response with user data
        return res.status(200).json({
            message: 'Login Successful',
            user: {
                name: userLogin.name,
                email_id: userLogin.email_id,
                college_name: userLogin.college_name
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
