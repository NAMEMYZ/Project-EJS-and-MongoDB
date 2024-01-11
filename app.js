// app.js
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

productsSchema.add({ imagePath: String })
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
app.get('/api/products', async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// POST new product
app.post('/api/products', async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json(newProduct);
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedProduct);
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
