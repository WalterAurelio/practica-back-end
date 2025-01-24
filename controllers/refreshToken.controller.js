const jwt = require('jsonwebtoken');
const User = require('../model/User');

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  // Verificamos si existe la cookie jwt en cookies
  if (!cookies?.jwt) return res.status(401).json({ message: 'No se encontró ningún refresh token en la petición.' });
  const refreshToken = cookies.jwt;

  // INICIO RTRotation
  // Después de haber guardado el refresh token (cookies.jwt) en const refreshToken, limpiamos la cookie jwt
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', maxAge: 1000 * 60 * 60 * 24 });

  // Si existe la cookie jwt, verificamos si existe un usuario con ese refresh token
  const foundUser = await User.findOne({ refreshToken });
  
  // RTR: Detectamos que el refresh token fue reutilizado
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Refresh token vencido.' }); // Detectamos token vencido, o...

        const hackedUser = await User.findOne({ username: decoded.username }); // Detectamos que intentan hackear a un usuario, por lo que ubicamos a ese usuario por el username decodificado del refresh token (que no estaba vencido, pero que fue reutilizado); no podemos ubicarlo por su refresh token ya que ese refresh token no forma parte de su documento en la BD
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    );
    return res.sendStatus(403);
  }
  // FIN RTRotation

  // Si no se detectó reutilización de refresh token, para este punto el usuario habrá usado su refresh token y necesitamos darle uno nuevo y eliminar el anterior de la BD
  const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken); // Eliminamos el refresh token recién usado por el usuario

  // verificamos si el refresh token recién usado / recibido no está expirado
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        foundUser.refreshToken = [...newRefreshTokenArray];
        await foundUser.save();
        // return res.status(403).json({ message: 'El token está vencido' });
      }
      if (err || foundUser.username !== decoded.username) return res.status(403).json({ message: 'El token está vencido o no coinciden los username' });

      // Si es válido el refresh token, emitimos un nuevo access token y nuevo refresh token
      const roles = Object.values(foundUser.roles);
      const accessToken = jwt.sign(
        {
          username: foundUser.username,
          roles
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '40s' }
      );
      const newRefreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      // Guardamos el nuevo refresh token en el usuario actual
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
      await foundUser.save();

      res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 1000 * 60 * 60 * 24 });
      res.json({ roles, accessToken });
    }
  );
}

/* const handleRefreshToken = async (req, res) => {
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
 */
module.exports = handleRefreshToken;