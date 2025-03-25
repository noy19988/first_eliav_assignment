// dana-elazra-208228528-noy-amsalem-207277823


import dotenv from 'dotenv';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import multer from 'multer';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in your .env file");
}

const domainBase = process.env.DOMAIN_BASE;
if (!domainBase) {
  throw new Error("DOMAIN_BASE is not defined in your .env file");
}const port = process.env.PORT || 3000;
const httpsPort = process.env.HTTPS_PORT || 443;
const publicPath = path.join(process.cwd(), 'public');

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

const upload = multer({ dest: "public/uploads/" });

app.use("/uploads", express.static("public/uploads"));
app.use(express.static(path.join(__dirname, '../public'))); 
app.use(express.static(publicPath));

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

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/rest-api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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


app.get('/*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });
  
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });



const startServer = () => {
  if (process.env.NODE_ENV !== 'production') {
    http.createServer(app).listen(port, () => {
      console.log(`Dev server running on http://localhost:${port}`);
    });
  } else {
    console.log("Starting production server...");
    const keyPath = './client-key.pem';
    const certPath = './client-cert.pem';

    const httpsExists = fs.existsSync(keyPath) && fs.existsSync(certPath);
    console.log("Cert exists:", httpsExists);

    if (httpsExists) {
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };

      https.createServer(options, app).listen(httpsPort, () => {
        console.log(`Production server running on ${domainBase}`);
      });
    } else {
      console.warn('HTTPS certificates not found. Falling back to HTTP.');
      http.createServer(app).listen(port, () => {
        console.log(`Production server running on http://${domainBase}`);
      });
    }
  }
};


export default app; 

if (require.main === module) {
  startServer(); 
}