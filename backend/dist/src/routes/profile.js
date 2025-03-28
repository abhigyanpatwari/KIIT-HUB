"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing required libraries
const express_1 = __importDefault(require("express"));
const jwt_authenticate_1 = __importDefault(require("../middlewares/jwt_authenticate"));
// Using Express Router Class
const router = express_1.default.Router();
// form page to get profile details after verifying the JWT token using middle Ware
router.get('/', jwt_authenticate_1.default, (req, res) => {
    try {
        console.log('Profile request received');
        console.log('User data:', req.rootUser);
        if (!req.rootUser) {
            console.error('No user data found in request');
            return res.status(404).json({ message: 'User not found' });
        }
        // Remove sensitive information
        const userData = Object.assign({}, req.rootUser.toObject());
        delete userData.password;
        delete userData.tokens;
        console.log('Sending profile data');
        res.status(200).json(userData);
    }
    catch (error) {
        console.error('Profile route error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
