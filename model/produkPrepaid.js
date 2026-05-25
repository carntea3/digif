const { DataTypes } = require('sequelize')
const db = require('../config/db.js')

const produkPrepaid = db.define("Prepaid", {
  product_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  buyer_sku_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unlimited_stock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  multi: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  start_cut_off: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  end_cut_off: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
  }, {
    timestamps: false,
  })
  
module.exports = produkPrepaid;