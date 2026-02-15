// Подключаем Express
const express = require('express');
const app = express();
const port = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Начальные данные: список товаров (игрушки для собак)
let products = [
    { id: 1, name: 'Игрушка для собак "Кость"', price: 450 },
    { id: 2, name: 'Игрушка для собак "Утка"', price: 650 },
    { id: 3, name: 'Игрушка для собак "Теннисный мяч"', price: 350 }
];

app.use((req, res, next) => {
    console.log(`${req.method} запрос на ${req.url}`);
    next();
});

// ============= CRUD операции =============

// 1. GET /products - получить все товары
app.get('/products', (req, res) => {
    res.json(products);
});

// 2. GET /products/:id - получить товар по id
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    
    res.json(product);
});

// 3. POST /products - создать новый товар
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    // Проверяем, что все поля переданы
    if (!name || !price) {
        return res.status(400).json({ message: 'Необходимо указать название и стоимость' });
    }
    
    // Создаём новый товар с уникальным id (на основе времени)
    const newProduct = {
        id: Date.now(),
        name,
        price
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// 4. PUT /products/:id - полностью обновить товар
app.put('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    
    const { name, price } = req.body;
    
    // Проверяем, что все поля переданыы
    if (!name || !price) {
        return res.status(400).json({ message: 'Необходимо указать название и стоимость' });
    }
    
    // Обновляем товар
    product.name = name;
    product.price = price;
    
    res.json(product);
});

// 5. PATCH /products/:id - частично обновить товар
app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    
    const { name, price } = req.body;
    
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    
    res.json(product);
});

// 6. DELETE /products/:id - удалить товар
app.delete('/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id == req.params.id);
    
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Товар не найден' });
    }
    
    products.splice(productIndex, 1);
    res.json({ message: 'Товар удалён' });
});

app.get('/', (req, res) => {
    res.send(`
        <h1>API для магазина игрушек</h1>
        <p>Доступные маршруты:</p>
        <ul>
            <li><b>GET /products</b> - все товары</li>
            <li><b>GET /products/:id</b> - товар по id</li>
            <li><b>POST /products</b> - создать товар (нужен JSON с name и price)</li>
            <li><b>PUT /products/:id</b> - полностью обновить товар</li>
            <li><b>PATCH /products/:id</b> - частично обновить товар</li>
            <li><b>DELETE /products/:id</b> - удалить товар</li>
        </ul>
    `);
});

app.listen(port, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});