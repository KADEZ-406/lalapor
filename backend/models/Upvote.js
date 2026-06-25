const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Upvote = sequelize.define('Upvote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  laporan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'upvotes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'laporan_id']
    }
  ]
});

module.exports = Upvote;
