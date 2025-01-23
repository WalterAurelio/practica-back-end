const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.status(401).json({ message: 'No se recibieron roles en la petición.' });
    const allowedRolesArray = [...allowedRoles];
    const userRoles = req.roles;
    
    // const boolArr = userRoles.map(rol => allowedRolesArray.includes(rol));
    // const result = boolArr.find(value => value === true);
    const isUserAllowed = userRoles.find(role => allowedRolesArray.includes(role));    
    if (!isUserAllowed) return res.status(401).json({ message: 'No tiene permiso de acceder a esta ruta debido a su rol.' });
    
    next();
  }
}

module.exports = verifyRoles;