

import express, { Request, Response } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { boolean } from 'webidl-conversions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_prices';

// MongoDB setup
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// MongoDB schema and model
const priceSchema = new mongoose.Schema({
  coin_name: String,
  price_usd: Number,
  price_btc: Number,
}, { timestamps: true });

const Price = mongoose.model('Price', priceSchema);

// Express middleware
app.use(express.json());
app.use(cors());

// Fetch data from CoinGecko API
const fetchPrices = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,ethereum', // Example: bitcoin and ethereum
        vs_currencies: 'usd,btc' // Example: USD and BTC prices
      }
    });

    const data = response.data;
    const prices = Object.keys(data).map((key) => ({
      coin_name: key,
      price_usd: data[key].usd,
      price_btc: data[key].btc,
    }));

    // Insert data into MongoDB
    await Price.insertMany(prices);
    console.log('Data inserted into MongoDB:', prices);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};

// Route to fetch and store data
app.get('/update-prices', async (req: Request, res: Response) => {
  await fetchPrices();
  res.send('Data updated successfully!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
