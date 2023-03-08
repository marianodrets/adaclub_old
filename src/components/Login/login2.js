const jwt = require('jsonwebtoken');

const sequelize = require("./../../../mysql");
const config = require("./../../../config");

const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const data = await sequelize.query(
      `SELECT users.*, users_roles.name role 
            FROM users 
            JOIN users_roles ON users.role_id = users_roles.id
            WHERE username = ?`,
      {replacements: [username], type: sequelize.QueryTypes.SELECT}
    );

    if (data.length) {
        if (result) {
          const token = jwt.sign({
            avatar: data[0].avatar,
            username: data[0].username,
            email: data[0].email,
            role: data[0].role,
            role_id: data[0].role_id,
            id: data[0].id
          }, config.sign);

          return res.send({
            token,
            username
          });
        } else {
          res.status(500).send({ error: 'Usuario o contraseña incorrecto.' });
        }
      
    } else {
      res.status(500).send({ error: 'El usuario no existe.' });
    }
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
};

module.exports = login;