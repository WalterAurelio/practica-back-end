require('dotenv').config()
const express = require('express');
const app = express();
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const PORT = process.env.PORT || 3500;
const cookieParser = require('cookie-parser');
const employeesRouter = require('./routes/api/employees');
const registerRouter = require('./routes/register.routes');
const authRouter = require('./routes/auth.routes');
const refreshRouter = require('./routes/refresh.routes');
const logoutRouter = require('./routes/logout.routes');
const verifyJWT = require('./middlewares/verifyJWT');

// Connect to MongoDB
connectDB();

// CORS middleware
app.use(cors(corsOptions));

// Built-in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for json
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

app.use('/', registerRouter);
app.use('/', authRouter);
app.use('/', refreshRouter);
app.use('/', logoutRouter);

// Usamos nuestro middleware para autenticar la JWT (SIEMPRE DESPUÉS DE LAS RUTAS DE AUTENTICACIÓN; DE LO CONTRARIO, NADIE PODRÍA ACCEDER A REGISTRARSE O INICIAR SESIÓN)
app.use(verifyJWT);

app.use('/employees', employeesRouter);

mongoose.connection.once('open', () => {
  console.log('Conectado exitósamente a MongoDB!');
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}...`);
  });
})
