const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(express.json());

// ===== Хеширование пароля =====
async function hashPassword(password) {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ===== БД в памяти =====
let users = [];
let products = [];

// ===== Swagger =====
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API с аутентификацией',
      version: '1.0.0',
      description: 'API для регистрации, авторизации и управления товарами',
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Локальный сервер' }],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function findUserByEmail(email, res) {
  const user = users.find(u => u.email === email);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  return user;
}

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}

// ========== СХЕМЫ ДЛЯ SWAGGER ==========
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID пользователя
 *         email:
 *           type: string
 *           description: Email (логин)
 *         first_name:
 *           type: string
 *           description: Имя
 *         last_name:
 *           type: string
 *           description: Фамилия
 *         password:
 *           type: string
 *           description: Хешированный пароль
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: ID товара
 *         title:
 *           type: string
 *           description: Название
 *         category:
 *           type: string
 *           description: Категория
 *         description:
 *           type: string
 *           description: Описание
 *         price:
 *           type: number
 *           description: Цена
 */

// ========== АУТЕНТИФИКАЦИЯ ==========

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ivan@mail.ru
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Петров
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Неверные данные или email уже существует
 */
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: nanoid(6),
    email,
    first_name,
    last_name,
    hashedPassword,
  };

  users.push(newUser);
  res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    first_name: newUser.first_name,
    last_name: newUser.last_name,
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ivan@mail.ru
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют поля
 *       401:
 *         description: Неверный пароль
 *       404:
 *         description: Пользователь не найден
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValid = await verifyPassword(password, user.hashedPassword);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  res.status(200).json({ login: true });
});

// ========== ТОВАРЫ ==========

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
app.post('/api/products', (req, res) => {
  const { title, category, description, price } = req.body;

  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newProduct = {
    id: nanoid(6),
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (product) res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Полностью обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Товар обновлён
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const { title, category, description, price } = req.body;
  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  product.title = title.trim();
  product.category = category.trim();
  product.description = description.trim();
  product.price = Number(price);

  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удалён
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products.splice(index, 1);
  res.status(204).send();
});

// ===== Запуск сервера =====
app.listen(port, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${port}`);
  console.log(`📚 Документация Swagger: http://localhost:${port}/api-docs`);
});