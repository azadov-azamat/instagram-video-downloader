'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Follower extends Model {
    static associate({User}) {
        Follower.belongsTo(User, {foreignKey: 'user_id', as: 'user'})
    }
  }

    Follower.init(
    {
      username: DataTypes.STRING,
      profilePicture: DataTypes.STRING,
      isFollowing: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'Follower',
      underscored: true,
    }
  );

  return Follower;
};
