import dotenv from 'dotenv';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app: Application = express();

app.use(bodyParser.json());


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
    apis: ['./src/routes/*.ts'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/rest-api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Routes
import usersRoutes from './routes/usersRoutes';
import postsRoutes from './routes/postsRoutes';
import commentsRoutes from './routes/commentsRoutes';


app.use('/auth', usersRoutes);  
app.use('/users', usersRoutes);
app.use('/post', postsRoutes);
app.use('/comment', commentsRoutes);

mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));

    const initApp = (): Application => app; 

export default initApp;
    
    if (require.main === module) {
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Swagger documentation available at http://localhost:${port}/rest-api`);
        });
}

