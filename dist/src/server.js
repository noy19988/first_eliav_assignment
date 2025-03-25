"use strict";
// dana-elazra-208228528-noy-amsalem-207277823
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
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in your .env file");
}
const domainBase = process.env.DOMAIN_BASE;
if (!domainBase) {
    throw new Error("DOMAIN_BASE is not defined in your .env file");
}
const port = process.env.PORT || 3000;
const httpsPort = process.env.HTTPS_PORT || 443;
const publicPath = path_1.default.join(process.cwd(), 'public');
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS
app.use((0, cors_1.default)({
    origin: domainBase,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));
const upload = (0, multer_1.default)({ dest: "public/uploads/" });
app.use("/uploads", express_1.default.static("public/uploads"));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use(express_1.default.static(publicPath));
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'REST API Documentation',
            version: '1.0.0',
            description: 'Documentation for REST API',
        },
        servers: [
            { url: domainBase, description: 'Remote HTTP server' },
            { url: domainBase.replace(/^http:/, 'https:'), description: 'Remote HTTPS server' },
        ],
    },
    apis: ['./src/routes/*.ts'],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/rest-api', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const recipeRoutes_1 = __importDefault(require("./routes/recipeRoutes"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const postsRoutes_1 = __importDefault(require("./routes/postsRoutes"));
const commentsRoutes_1 = __importDefault(require("./routes/commentsRoutes"));
app.use("/api/recipes", recipeRoutes_1.default);
app.use("/file", fileRoutes_1.default);
app.use('/auth', usersRoutes_1.default);
app.use('/users', usersRoutes_1.default);
app.use('/posts', postsRoutes_1.default);
app.use('/comment', commentsRoutes_1.default);
app.get('/*', (req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'public', 'index.html'));
});
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
});
const startServer = () => {
    if (process.env.NODE_ENV !== 'production') {
        http_1.default.createServer(app).listen(port, () => {
            console.log(`Dev server running on http://localhost:${port}`);
        });
    }
    else {
        const keyPath = './client-key.pem';
        const certPath = './client-cert.pem';
        const httpsExists = fs_1.default.existsSync(keyPath) && fs_1.default.existsSync(certPath);
        if (httpsExists) {
            const options = {
                key: fs_1.default.readFileSync(keyPath),
                cert: fs_1.default.readFileSync(certPath),
            };
            https_1.default.createServer(options, app).listen(httpsPort, () => {
                console.log(`Production server running on ${domainBase}`);
            });
        }
        else {
            console.warn('HTTPS certificates not found. Falling back to HTTP.');
            http_1.default.createServer(app).listen(port, () => {
                console.log(`Production server running on http://${domainBase}`);
            });
        }
    }
};
exports.default = app;
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map