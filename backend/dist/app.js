"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing required libraries
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
// Initiating Connection to the MongoDB
require("./src/db/conn");
// Initialsing and using Socket.io for chat functionality
require("./src/chat/socket_io");
// Importing all routes
const all_listings_1 = __importDefault(require("./src/routes/all_listings"));
const register_1 = __importDefault(require("./src/routes/register"));
const add_item_1 = __importDefault(require("./src/routes/add_item"));
const profile_1 = __importDefault(require("./src/routes/profile"));
const delete_user_1 = __importDefault(require("./src/routes/delete_user"));
const signin_1 = __importDefault(require("./src/routes/signin"));
const logout_1 = __importDefault(require("./src/routes/logout"));
const base_endpoint_1 = __importDefault(require("./src/routes/base_endpoint"));
const otp_1 = __importDefault(require("./src/routes/otp"));
const app = (0, express_1.default)();
// Configure CORS
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost:3004'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Configure session
app.use((0, express_session_1.default)({
    secret: 'kiithub_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    },
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.DATABASE || 'mongodb://localhost:27017/kiithub',
        collectionName: 'sessions'
    })
}));
// Debug route to test server connectivity
app.get('/test', (req, res) => {
    res.status(200).json({ message: 'Server is working!' });
});
// Setting Routes
app.use('/db', all_listings_1.default);
console.log('Mounting add_item route at /add_data');
app.use('/add_data', add_item_1.default);
app.use('/register', register_1.default);
app.use('/profilec', profile_1.default);
app.use('/delete', delete_user_1.default);
app.use('/signin', signin_1.default);
app.use('/logout', logout_1.default);
app.use('/', base_endpoint_1.default);
app.use('/', otp_1.default);
// 404 handler for debugging
app.use((req, res, next) => {
    console.log(`404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});
exports.default = app;
