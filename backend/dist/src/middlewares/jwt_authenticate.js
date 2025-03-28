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
// jwt_authenticate.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
// The jwt_Authenticate function is a middleware that authenticates requests using JSON Web Tokens (JWT)
const jwt_Authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve the JWT from the cookies sent with the request
        const token = req.cookies.jwtoken;
        console.log('JWT token received:', token ? 'Present' : 'Missing');
        // Check if process.env.JWT_KEY has a value
        if (!process.env.JWT_KEY) {
            console.error('No secret key provided in process.env.JWT_KEY');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        // Verify the JWT using the secret key
        const verifyToken = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        console.log('Token verified successfully');
        // Check if verifyToken is an object and has the _id property
        if (typeof verifyToken === 'object' && '_id' in verifyToken) {
            // Narrow down the type of verifyToken to JwtPayload
            const payload = verifyToken;
            // Find a user in the database with the same _id as in the verified JWT and with a matching token
            const rootUser = yield userSchema_1.default.findOne({
                _id: payload._id,
                'tokens.token': token,
            });
            // If no user is found, throw an error
            if (!rootUser) {
                console.error('User not found for token');
                return res.status(401).json({ message: 'User not found' });
            }
            // If a user is found, add the token, rootUser, and userID to the request object.
            req.token = token;
            req.rootUser = rootUser;
            req.userID = rootUser._id;
            console.log('User authenticated successfully:', rootUser.email_id);
            next();
        }
        else {
            // Handle the case where verifyToken is not a valid JwtPayload
            console.error('Invalid JWT payload');
            return res.status(401).json({ message: 'Invalid token format' });
        }
    }
    catch (err) {
        console.error('JWT authentication error:', err);
        // If there is an error, respond with a 401 status code and an error message
        res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
    }
});
exports.default = jwt_Authenticate;
