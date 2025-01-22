const User = require('../model/User');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
  const { username, password } = req.body;
  
  // Compruebo si se completaron los campos username y password
  if (!username || !password) return res.status(400).json({ message: 'Los campos username y password son obligatorios.' });

  // Compruebo si el username ya existe en la BD
  const duplicatedUser = await User.findOne({ username });
  if (duplicatedUser) return res.status(409).json({ message: 'Ya existe un usuario con este nombre de usuario.' });

  try {
    // Hasheo la contraseña
    const hashedPassword = await bcrypt.hash(password, 10); // 10 es el salt
  
    // Creo al usuario en la base de datos
    const newUser = await User.create({
      username,
      password: hashedPassword
    });
    res.status(201).json({ message: `Usuario ${newUser.username} creado con éxito!` });
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = registerUser;