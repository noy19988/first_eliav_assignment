"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var express_1 = require("express");
var mongoose_1 = require("mongoose");
var cors_1 = require("cors");
var swagger_jsdoc_1 = require("swagger-jsdoc");
var swagger_ui_express_1 = require("swagger-ui-express");
var multer_1 = require("multer");
var fs_1 = require("fs");
var https_1 = require("https");
var http_1 = require("http");
var path_1 = require("path");
// Load environment variables
dotenv_1.default.config();
// Check required env vars
if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined in your .env file");
}
var domainBase = (_a = process.env.DOMAIN_BASE) !== null && _a !== void 0 ? _a : 'http://node115.cs.colman.ac.il';
var port = process.env.PORT || 3000;
var httpsPort = process.env.HTTPS_PORT || 443;
var publicPath = path_1.default.join(process.cwd(), 'public');
var app = (0, express_1.default)();
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
// Multer setup (for uploads)
var upload = (0, multer_1.default)({ dest: "public/uploads/" });
// Static files
app.use("/uploads", express_1.default.static("public/uploads"));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public'))); // ✅ הוספנו את זה - הגשת ה-front מהשורש
app.use(express_1.default.static(publicPath));
// Swagger
var swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'REST API Documentation',
            version: '1.0.0',
            description: 'Documentation for REST API',
        },
        servers: [
            { url: domainBase.replace(/^http:/, 'https:'), description: 'Remote HTTPS server' },
        ],
    },
    apis: ['./src/routes/*.ts'],
};
var swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/rest-api', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
// Routes
var fileRoutes_1 = require("./routes/fileRoutes");
var recipeRoutes_1 = require("./routes/recipeRoutes");
var usersRoutes_1 = require("./routes/usersRoutes");
var postsRoutes_1 = require("./routes/postsRoutes");
var commentsRoutes_1 = require("./routes/commentsRoutes");
app.use("/api/recipes", recipeRoutes_1.default);
app.use("/file", fileRoutes_1.default);
app.use('/auth', usersRoutes_1.default);
app.use('/users', usersRoutes_1.default);
app.use('/posts', postsRoutes_1.default);
app.use('/comment', commentsRoutes_1.default);
app.get('/*', function (req, res) {
    res.sendFile(path_1.default.join(process.cwd(), 'public', 'index.html'));
});
// MongoDB Connection
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(function () { return console.log('✅ Connected to MongoDB'); })
    .catch(function (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
});
// Start Server
var startServer = function () {
    if (process.env.NODE_ENV !== 'production') {
        http_1.default.createServer(app).listen(port, function () {
            console.log("\uD83D\uDE80 Dev server running on http://localhost:".concat(port));
        });
    }
    else {
        var keyPath = './client-key.pem';
        var certPath = './client-cert.pem';
        var httpsExists = fs_1.default.existsSync(keyPath) && fs_1.default.existsSync(certPath);
        if (httpsExists) {
            var options = {
                key: fs_1.default.readFileSync(keyPath),
                cert: fs_1.default.readFileSync(certPath),
            };
            https_1.default.createServer(options, app).listen(httpsPort, function () {
                console.log("\uD83D\uDD10 Production server running on ".concat(domainBase));
            });
        }
        else {
            console.warn('⚠️ HTTPS certificates not found. Falling back to HTTP.');
            http_1.default.createServer(app).listen(port, function () {
                console.log("\uD83D\uDE80 Production server running on http://".concat(domainBase));
            });
        }
    }
};
startServer();
