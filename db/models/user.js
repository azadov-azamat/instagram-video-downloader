'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({Follower}) {
        User.hasMany(Follower, {foreignKey: 'user_id', as: 'user'});
    }
  }

  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      phone: DataTypes.STRING,
      telegramUsername: DataTypes.STRING,
      instagramUsername: DataTypes.STRING,
      instagramPassword: DataTypes.STRING,
      followersCount: DataTypes.STRING,
      followingCount: DataTypes.STRING,
      profilePicture: DataTypes.STRING,
      selectedLang: DataTypes.STRING,
      isRegistered: DataTypes.BOOLEAN,
      isBlocked: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'User',
      underscored: true,
    }
  );

  return User;
};
