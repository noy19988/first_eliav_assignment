import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import multer from 'multer';
import fs from 'fs';
import https from 'https';
import http from 'http';

// dotenv
dotenv.config();

// בדיקה שחובה
if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined in your .env file");
}

// משתני סביבה עם ברירת מחדל
const domainBase = process.env.DOMAIN_BASE ?? 'http://localhost:3000';
const port = process.env.PORT || 3000;
const httpsPort = process.env.HTTPS_PORT || 443;

// יצירת אפליקציית אקספרס
const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: domainBase,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

// קבצים סטטיים
const upload = multer({ dest: "public/uploads/" });
app.use("/uploads", express.static("public/uploads"));
app.use("/public", express.static("public"));

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
            {
                url: domainBase,
                description: 'Remote HTTP server',
            },
            {
                url: domainBase.replace(/^http:/, 'https:'),
                description: 'Remote HTTPS server',
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/rest-api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// נתיבים
import fileRoutes from './routes/fileRoutes';
import recipeRoutes from './routes/recipeRoutes';
import usersRoutes from './routes/usersRoutes';
import postsRoutes from './routes/postsRoutes';
import commentsRoutes from './routes/commentsRoutes';

app.use("/api/recipes", recipeRoutes);
app.use("/file", fileRoutes);
app.use('/auth', usersRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);
app.use('/comment', commentsRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("<h1>דנה אלעזרה הנסיכה רצח, ברוך הבא לאתר שלי!</h1><p>האתר עובד כמו שצריך 😃</p>");
});

// חיבור למסד הנתונים
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ Error connecting to MongoDB:', err.message);
        process.exit(1);
    });

// הפעלת השרת
const startServer = () => {
    if (process.env.NODE_ENV !== 'production') {
        http.createServer(app).listen(port, () => {
            console.log(`🚀 Development server running on http://localhost:${port}`);
        });
    } else {
        const keyPath = './client-key.pem';
        const certPath = './client-cert.pem';

        const httpsExists = fs.existsSync(keyPath) && fs.existsSync(certPath);

        if (httpsExists) {
            const options = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
            };

            https.createServer(options, app).listen(httpsPort, () => {
                console.log(`🔐 Production server running on https://${domainBase.replace(/^http:/, 'https:')}`);
            });
        } else {
            console.warn('⚠️ HTTPS certificates not found. Falling back to HTTP.');
            http.createServer(app).listen(port, () => {
                console.log(`🚀 Production server running on http://${domainBase}`);
            });
        }
    }
};

startServer();
