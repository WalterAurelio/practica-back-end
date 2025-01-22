const jwt = require('jsonwebtoken');
const User = require('../model/User');

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  // Verificamos si la petición traía consigo una cookie con un refresh token
  if (!cookies?.jwt) return res.status(401).json({ message: 'No se encontró una cookie con refresh token.' }); // Unauthorized
  const refreshToken = cookies.jwt;

  // Buscamos si existe en la BD un usuario con ese refresh token
  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) return res.status(403).json({ message: 'No se encontró un usuario con ese refresh token.' }); // Forbidden

  // evaluamos el refresh token que venía en la cookie
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    console.log(`Hola, soy decoded: ${JSON.stringify(decoded)}`);
    if (err || foundUser.username !== decoded.username) return res.status(403);

    const accessToken = jwt.sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '40s' }
    );
    res.json({ accessToken });
  });
};

module.exports = handleRefreshToken;