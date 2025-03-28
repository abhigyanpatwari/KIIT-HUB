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
const dotenv_1 = __importDefault(require("dotenv"));
// Configure environment variables at the start
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const otp_1 = __importDefault(require("./src/routes/otp"));
const signin_1 = __importDefault(require("./src/routes/signin"));
const profile_1 = __importDefault(require("./src/routes/profile"));
const socket_io_1 = require("socket.io");
const conn_1 = __importDefault(require("./src/db/conn"));
// Check for required environment variables
if (!process.env.PORT) {
    console.warn("PORT environment variable not found, using default 5000");
}
// Log important configuration
console.log("Server starting with configuration:", {
    port: process.env.PORT || 5000,
    database: process.env.DB ? "Configured" : "Not configured",
    email: process.env.EMAIL ? "Configured" : "Not configured",
});
const app = (0, express_1.default)();
// Configure middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
// Configure error handling for JSON parsing
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: "Invalid JSON in request body" });
    }
    next(err);
});
// Register routes
app.use('/otp', otp_1.default);
app.use('/signin', signin_1.default);
app.use('/profilec', profile_1.default);
// Alloting Port Number
const port = process.env.PORT || 5001;
// Initialize MongoDB connection and start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB first
        yield (0, conn_1.default)();
        // Create the server
        const server = http_1.default.createServer(app);
        const io = new socket_io_1.Server(server, {
            cors: {
                origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost:3004'],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                credentials: true,
                allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
            }
        });
        io.on("connection", (socket) => {
            console.log("New socket connection: ", socket.id);
        });
        // Start listening only after MongoDB is connected
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
});
startServer();
