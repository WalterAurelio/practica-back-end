const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authUser = async (req, res) => {
  const { username, password } = req.body;
  const cookies = req.cookies;
  console.log('Cookies en la petición: ', JSON.stringify(cookies));

  if (!username || !password) return res.status(401).json({ message: 'Los campos username y password con obligatorios.' });

  const foundUser = await User.findOne({ username });
  if (!foundUser) return res.status(401).json({ message: `No se encontró ningún usuario con el nombre ${username}` });

  const validPassword = await bcrypt.compare(password, foundUser.password);
  if (!validPassword) return res.status(401).json({ message: 'La contraseña es incorrecta.' });

  const roles = Object.values(foundUser.roles);
  const accessToken = jwt.sign(
    { username: foundUser.username, roles },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30s' }
  );
  const newRefreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  let newRefreshTokenArray = !cookies?.jwt ? foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);
  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const foundUser = User.findOne({ refreshToken });
    if (!foundUser) {
      console.log('Se detectó reutilización de refresh token!!');
      newRefreshTokenArray = [];
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });
  }

  foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await foundUser.save();
  res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', maxAge: 1000 * 60 * 60 * 24 });
  res.json({ roles, accessToken });
}

const authUser_2 = async (req, res) => {
  const { username, password } = req.body;
  const cookies = req.cookies;
  console.log('Cookies al hacer la petición: ', JSON.stringify(cookies));

  if (!username || !password) return res.status(400).json({ message: 'Los campos username y password son obligatorios.' });

  const foundUser = await User.findOne({ username });
  if (!foundUser) return res.status(400).json({ message: `No se encontró un usuario con el nombre ${ username }` });

  const validPassword = await bcrypt.compare(password, foundUser.password);
  if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

  const roles = Object.values(foundUser.roles);
  const accessToken = jwt.sign(
    {
      username: foundUser.username,
      roles
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30s' }
  );
  const newRefreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  let newRefreshTokenArray = !cookies?.jwt ? foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);
  if (cookies?.jwt) {
    console.log('Se encontro un refresh token en la petición: ', cookies.jwt);
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      console.log('Se detectó reutilización de refresh token!!!');
      newRefreshTokenArray = [];
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None',  });
  }
  console.log('Soy new refresh token array: ', newRefreshTokenArray);

  foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  const result = await foundUser.save();
  console.log('Soy result. ', result);
  res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', maxAge: 1000 * 60 * 60 * 24 });
  res.json({ accessToken, roles });
}

/* const authUser = async (req, res) => {
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
} */

module.exports = authUser;