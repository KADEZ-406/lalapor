const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Laporan = require('./Laporan');
const Comment = require('./Comment');
const Upvote = require('./Upvote');

User.hasMany(Laporan, { foreignKey: 'user_id', as: 'laporan' });
Laporan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Category.hasMany(Laporan, { foreignKey: 'category_id', as: 'laporan' });
Laporan.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Laporan.hasMany(Comment, { foreignKey: 'laporan_id', as: 'comments' });
Comment.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Laporan.hasMany(Upvote, { foreignKey: 'laporan_id', as: 'upvotes' });
Upvote.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });

User.hasMany(Upvote, { foreignKey: 'user_id', as: 'upvotes' });
Upvote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Category,
  Laporan,
  Comment,
  Upvote
};
