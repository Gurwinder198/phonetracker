'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   User.hasMany(models.Group)
    // }
  };
  User.init({
    device_token: DataTypes.TEXT,
    device_id: DataTypes.TEXT,
    device_os: DataTypes.STRING,
    brand_name: DataTypes.STRING,
    status: DataTypes.INTEGER,
    access_token: DataTypes.TEXT,
    refresh_token: DataTypes.TEXT,
    mobile_number:DataTypes.STRING,
    date_of_birth:DataTypes.DATEONLY,
    downloaded_from:DataTypes.STRING,
    app_version:DataTypes.STRING
  }, {
    sequelize,
    tableName:'users',
    modelName: 'User',
  });
  return User;
};