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
Object.defineProperty(exports, "__esModule", { value: true });
const session_Authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if session exists and user is authenticated
        if (!req.session || !req.session.userID) {
            return res.status(401).json({ error: 'Unauthorized: Please log in' });
        }
        // Add userID to request for use in routes
        req.userID = req.session.userID;
        next();
    }
    catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
});
exports.default = session_Authenticate;
