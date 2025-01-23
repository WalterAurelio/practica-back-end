const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleLogout = async (req, res) => {
  const cookies = req.cookies;

  // Verifico si existe la cookie jwt en la petición; si no existe, simplemente retorno Success, but no content;
  if (!cookies.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  
  // Si existe la cookie jwt con el refresh token, busco si hay un usuario con ese refresh token; si no existe un usuario con ese refresh token, simplemente retorno Success, but no content;
  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) {
    res.clearCookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None' }); // Por las dudas, por más que no exista un usuario con ese refresh token, limpiamos la cookie que tenía el refresh token 
    return res.sendStatus(204);
  }

  // Si se encontró un usuario con ese refresh token, eliminamos ese refresh token del usuario en la BD (sin importar si el refresh token recibido está vencido o no); también debemos limpiar la cookie que nos llegó en la petición y retornamos 204 Success, but no content
  foundUser.refreshToken = '';
  const result = await foundUser.save();
  console.log(result);
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });
  res.sendStatus(204);
}

module.exports = handleLogout;