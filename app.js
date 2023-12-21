require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// ทำการเชื่อมต่อ MongoDB
mongoose.connect('mongodb+srv://'+process.env.DBADMIN+':'+process.env.DBPASS+'@cluster0.r9t6yjm.mongodb.net/test?retryWrites=true&w=majority');

// กำหนด Schema สำหรับ MongoDB
const productsSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String
});

const Product = mongoose.model('Product', productsSchema, 'products');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// 3. Routes for EJS views
// Use the Product model instead of Liquor
app.get('/', async (req, res) => {
  const products = await Product.find({});
  res.render('index', { products });
});

app.post('/search', async (req, res) => {
  const searchQuery = req.body.search;
  const products = await Product.find({ name: { $regex: new RegExp(searchQuery, 'i') } });
  res.render('index', { products });
});

app.post('/filter', async (req, res) => {
  const minPrice = req.body.minPrice;
  const maxPrice = req.body.maxPrice;
  const products = await Product.find({ price: { $gte: minPrice, $lte: maxPrice } });
  res.render('index', { products });
});

// 5. RESTful API routes
// GET all liquors
app.get('/api/liquors', async (req, res) => {
  const liquors = await Liquor.find({});
  res.json(liquors);
});

// POST new liquor
app.post('/api/liquors', async (req, res) => {
  const newLiquor = new Liquor(req.body);
  await newLiquor.save();
  res.json(newLiquor);
});

// PUT update liquor
app.put('/api/liquors/:id', async (req, res) => {
  const updatedLiquor = await Liquor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedLiquor);
});

// DELETE liquor
app.delete('/api/liquors/:id', async (req, res) => {
  await Liquor.findByIdAndRemove(req.params.id);
  res.json({ message: 'Liquor deleted successfully' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
