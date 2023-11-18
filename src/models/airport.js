'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
   class Airport extends Model {
      static associate(models) {
         Airport.hasMany(models.Flight, {
            foreignKey: 'departure_airport_id',
            as: 'departureAirport',
         });

         Airport.hasMany(models.Flight, {
            foreignKey: 'arrival_airport_id',
            as: 'arrivalAirport',
         });
      }
   }

   Airport.init(
      {
         ariport_id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
         },
         airport: DataTypes.STRING,
         province: DataTypes.STRING,
         code: DataTypes.STRING,
      },
      {
         sequelize,
         modelName: 'Airport',
         timestamps: false,
      }
   );

   return Airport;
};
