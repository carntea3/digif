const db = require('../config/db')
const { DataTypes } = require('sequelize')

const user = db.define("user", {
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true
  },
  saldo: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "member",
  },
}, {
  id: false,
})

module.exports = user;
