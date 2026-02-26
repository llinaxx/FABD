const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// 9 ТОВАРОВ
let products = [
  { id: nanoid(6), name: 'Игрушка для собак "Кость"', category: 'Для собак', description: 'Мягкая кость', price: 490, stock: 20 },
  { id: nanoid(6), name: 'Игрушка для собак "Овца"', category: 'Для собак', description: 'Мягкая овца с пищалкой внутри', price: 690, stock: 12 },
  { id: nanoid(6), name: 'Игрушка для собак "Теннисный мяч"', category: 'Для собак', description: 'Классический теннисный мяч', price: 550, stock: 10 },
  { id: nanoid(6), name: 'Игрушка для собак "Мяч"', category: 'Для собак', description: 'Мяч-канат для активных игр', price: 290, stock: 30 },
  { id: nanoid(6), name: 'Игрушка для собак "Карась"', category: 'Для собак', description: 'Мягкий карась с пищалкой ', price: 430, stock: 8 },
  { id: nanoid(6), name: 'Игрушка для собак "Белка"', category: 'Для собак', description: 'Мягкая белка с пищалкой внутри', price: 610, stock: 15 },
  { id: nanoid(6), name: 'Игрушка для кошек "Мыши"', category: 'Для кошек', description: 'Набор из 2 мягких мышей', price: 390, stock: 25 },
  { id: nanoid(6), name: 'Игрушка для кошек "Воробей"', category: 'Для кошек', description: 'Перьевая игрушка', price: 520, stock: 10 },
  { id: nanoid(6), name: 'Игрушка для кошек "Дразнилка"', category: 'Для кошек', description: 'Палочка с перьями и колокольчиком', price: 350, stock: 18 },
];

// Логирование запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Функция поиска товара
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}

// ----- API -----

// GET /api/products — все товары
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id — товар по ID
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (product) res.json(product);
});

// POST /api/products — создать товар
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock } = req.body;
  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PATCH /api/products/:id — обновить товар
app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const { name, category, description, price, stock } = req.body;
  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);

  res.json(product);
});

// DELETE /api/products/:id — удалить товар
app.delete('/api/products/:id', (req, res) => {
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Product not found' });
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

// 404 для остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});