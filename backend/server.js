import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import programRouter from './routes/programRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import path from 'path'; 
import { fileURLToPath } from 'url'; 

// ⭐ AJOUTEZ CECI pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/user', userRouter);
app.use('/api/program', programRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.get('/', (req, res) => {
  res.send("API Working");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error'
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(port, () => {
  console.log('Server started on PORT : ' + port);
});