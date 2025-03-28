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
const userSchema_1 = __importDefault(require("../models/userSchema"));
// Using Express Router Class
const router = express_1.default.Router();
// Test route that doesn't require authentication
router.get('/test', (req, res) => {
    console.log('Test route reached');
    res.status(200).json({ message: 'Add item route is working!' });
});
// Simple add item handler that doesn't require authentication for testing
router.post('/simple', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Simple add item route reached with body:', req.body);
        const { item_name, item_price, item_age, item_condition, item_image, item_tag, item_description, } = req.body;
        // Check if all required fields are present
        if (!item_name ||
            !item_price ||
            !item_age ||
            !item_condition ||
            !item_image ||
            !item_tag ||
            !item_description) {
            return res.status(400).json({
                error: 'Bad Request: Please enter all the required data.',
            });
        }
        // Just return success for testing
        res.status(200).json({ message: 'Item data received successfully' });
    }
    catch (err) {
        console.error('Error in simple route:', err);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Main add item handler - support both POST and PATCH
const addItemHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { item_name, item_price, item_age, item_condition, item_image, item_tag, item_description, } = req.body;
        // Log the request for debugging
        console.log('Received add item request:', req.body);
        console.log('User ID:', req.userID || 'Not authenticated');
        // Check if all required fields are present
        if (!item_name ||
            !item_price ||
            !item_age ||
            !item_condition ||
            !item_image ||
            !item_tag ||
            !item_description) {
            return res.status(400).json({
                error: 'Bad Request: Please enter all the required data.',
            });
        }
        // Check if item_tag is a valid value
        const validItemTags = [
            'Others',
            'Clothing_essentials',
            'Books',
            'Daily-use',
            'Sports',
            'Stationary',
        ];
        if (!validItemTags.includes(item_tag)) {
            return res.status(400).json({
                error: 'Bad Request: Invalid item tag.',
            });
        }
        const newItem = {
            item_name,
            item_price,
            item_age,
            item_condition,
            item_image,
            item_tag,
            item_description,
        };
        // If not authenticated, still accept the data for testing
        if (!req.userID) {
            console.log('User not authenticated, but accepting data for testing');
            return res.status(201).json({
                message: 'Item received (not stored - authentication required)',
                data: newItem
            });
        }
        // Update the user's list with the new item
        yield userSchema_1.default.findOneAndUpdate({
            _id: req.userID,
        }, {
            $addToSet: {
                list: newItem,
            },
        });
        res
            .status(201)
            .json({ message: 'Listing successfully added on the website' });
    }
    catch (err) {
        console.log(err);
        res
            .status(500)
            .json({ error: 'We are experiencing some server problems!!' });
    }
});
// Support multiple HTTP methods for flexibility
router.post('/', addItemHandler);
router.patch('/', addItemHandler);
router.put('/', addItemHandler);
exports.default = router;
