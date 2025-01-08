"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// טעינת קובץ הסביבה
dotenv_1.default.config();
// הגדרת האפליקציה
const app = (0, express_1.default)();
// Middleware
app.use(body_parser_1.default.json());
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);
// הגדרות Swagger
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
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // הפניה לקבצי ה-Routes ב-TypeScript
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
// Routes
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const postsRoutes_1 = __importDefault(require("./routes/postsRoutes"));
const commentsRoutes_1 = __importDefault(require("./routes/commentsRoutes"));
app.use('/users', usersRoutes_1.default);
app.use('/post', postsRoutes_1.default);
app.use('/comment', commentsRoutes_1.default);
// חיבור ל-MongoDB
mongoose_1.default
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));
const initApp = () => app; // Return the app instance directly
exports.default = initApp;
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
        console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
    });
}
