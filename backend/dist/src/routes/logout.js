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
// logout.ts
// Importing required libraries
const express_1 = __importDefault(require("express"));
const session_authenticate_1 = __importDefault(require("../middlewares/session_authenticate"));
// Using Express Router Class
const router = express_1.default.Router();
// The below function will be used to logout a user
router.get('/', session_authenticate_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Destroy the session
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ error: 'Failed to logout' });
                }
            });
        }
        // Clear any existing cookies
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
        console.log('logout successful');
    }
    catch (err) {
        console.log(err);
        res
            .status(500)
            .json({ error: 'We are experiencing some server problems!!' });
    }
}));
exports.default = router;
