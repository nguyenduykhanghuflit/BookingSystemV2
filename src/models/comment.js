'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Comment extends Model {
      static associate(models) {
         Comment.belongsTo(models.User, {
            foreignKey: 'username',
            as: 'userComment',
         });
         Comment.belongsTo(models.Type, {
            foreignKey: 'typeID',
            as: 'commentRoom',
         });
      }
   }
   Comment.init(
      {
         cmt_id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
         },
         username: DataTypes.STRING,
         typeID: DataTypes.STRING,
         content: DataTypes.STRING,
      },
      {
         sequelize,
         modelName: 'Comment', //chú ý
         timestamps: true,
      }
   );
   return Comment;
};
