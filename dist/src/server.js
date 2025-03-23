"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const multer_1 = __importDefault(require("multer"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const recipeRoutes_1 = __importDefault(require("./routes/recipeRoutes"));
dotenv_1.default.config();
if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined in your .env file");
}
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS
app.use((0, cors_1.default)({
    origin: process.env.DOMAIN_BASE,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));
// Static file serving
const upload = (0, multer_1.default)({ dest: "public/uploads/" });
app.use("/uploads", express_1.default.static("public/uploads"));
// Swagger config
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'REST API Documentation',
            version: '1.0.0',
            description: 'Documentation for REST API',
            contact: {
                name: 'Your Name',
                email: 'your-email@example.com',
            },
        },
        servers: [
            { url: process.env.DOMAIN_BASE, description: 'Remote server' }
        ],
    },
    apis: ['./src/routes/*.ts'],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/rest-api', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
// Routes
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const postsRoutes_1 = __importDefault(require("./routes/postsRoutes"));
const commentsRoutes_1 = __importDefault(require("./routes/commentsRoutes"));
app.use("/api/recipes", recipeRoutes_1.default);
app.use("/file", fileRoutes_1.default);
app.use('/auth', usersRoutes_1.default);
app.use('/users', usersRoutes_1.default);
app.use('/posts', postsRoutes_1.default);
app.use('/comment', commentsRoutes_1.default);
app.use("/public", express_1.default.static("public"));
app.get("/", (req, res) => {
    res.send("<h1>דנה אלעזרה הנסיכה רצח,ברוך הבא לאתר שלי!</h1><p>האתר עובד כמו שצריך 😃</p>");
});
// MongoDB Connection
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
});
const initApp = () => app;
exports.default = initApp;
if (require.main === module) {
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`🚀 Server running on http://${process.env.DOMAIN_BASE}`);
        console.log(`📄 Swagger docs: http://${process.env.DOMAIN_BASE}/rest-api`);
    });
}
