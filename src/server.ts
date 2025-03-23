import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import multer from 'multer';
import fileRoutes from "./routes/fileRoutes"; 
import recipeRoutes from "./routes/recipeRoutes";

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined in your .env file");
}

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: process.env.DOMAIN_BASE,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

// Static file serving
const upload = multer({ dest: "public/uploads/" });
app.use("/uploads", express.static("public/uploads"));

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

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/rest-api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
import usersRoutes from './routes/usersRoutes';
import postsRoutes from './routes/postsRoutes';
import commentsRoutes from './routes/commentsRoutes';

app.use("/api/recipes", recipeRoutes);
app.use("/file", fileRoutes);
app.use('/auth', usersRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);
app.use('/comment', commentsRoutes);
app.use("/public", express.static("public"));

app.get("/", (req: Request, res: Response) => {
    res.send("<h1>דנה אלעזרה הנסיכה רצח,ברוך הבא לאתר שלי!</h1><p>האתר עובד כמו שצריך 😃</p>");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ Error connecting to MongoDB:', err.message);
        process.exit(1);
    });

const initApp = (): Application => app;
export default initApp;

if (require.main === module) {
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`🚀 Server running on http://${process.env.DOMAIN_BASE}`);
        console.log(`📄 Swagger docs: http://${process.env.DOMAIN_BASE}/rest-api`);
    });
}
