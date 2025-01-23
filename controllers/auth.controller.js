const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authUser = async (req, res) => {
  const { username, password } = req.body;

  // Compruebo si se completaron los campos username y password
  if (!username || !password) return res.status(400).json({ message: 'Los campos username y password son obligatorios.' });

  // Compruebo si existe el username en la BD
  const foundUser = await User.findOne({ username });
  if (!foundUser) return res.status(400).json({ message: `No existe un usuario llamado ${username}.` });

  // Decodifico la contraseña pasada y la comparo con la que está hasheada en la base de datos
  const validPassword = await bcrypt.compare(password, foundUser.password);
  if (!validPassword) return res.status(400).json({ message: 'Contraseña incorrecta.' });

  // Si coinciden usuario y contraseña, genero los access token y refresh token para el usuario
  const roles = Object.values(foundUser.roles); // Object.values() retorna un arreglo de valores; estos valores son los que tienen las propiedades del objeto que reciba como Object.values() como argumento
  const accessToken = jwt.sign(
    {
      username: foundUser.username,
      roles
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '40s' }
  );
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  // Guardo el refresh token en el usuario
  foundUser.refreshToken = refreshToken;
  await foundUser.save();

  res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 1000 * 60 * 60 * 24 });
  res.json({ accessToken });
}

module.exports = authUser;