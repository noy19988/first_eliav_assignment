import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import multer from 'multer';
import fileRoutes from "./routes/fileRoutes"; 

dotenv.config();

const app: Application = express();

// 📌 Middleware לתמיכה ב-JSON וב-FormData
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📌 הוספת CORS כדי לאפשר חיבור לפרונט
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

// 📌 Middleware לניהול קבצים
const upload = multer({ dest: "public/uploads/" });
app.use("/uploads", express.static("public/uploads"));

// 📌 Swagger Docs

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
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Local server',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/rest-api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 📌 הגדרת נתיבים
import usersRoutes from './routes/usersRoutes';
import postsRoutes from './routes/postsRoutes';
import commentsRoutes from './routes/commentsRoutes';
import fileRouter from "./routes/fileRoutes";

app.use("/file", fileRoutes);
app.use('/auth', usersRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes); // 📌 שינוי נתיב ל-`posts`
app.use('/comment', commentsRoutes);
app.use("/file", fileRouter);
app.use("/public", express.static("public"));

app.get("/", (req: Request, res: Response) => {
    res.send("<h1>ברוך הבא לאתר שלי!</h1><p>האתר עובד כמו שצריך 😃</p>");
});

// 📌 חיבור למסד הנתונים
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });

const initApp = (): Application => app;

export default initApp;

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
        console.log(`Swagger documentation available at http://localhost:${port}/rest-api`);
    });
}
