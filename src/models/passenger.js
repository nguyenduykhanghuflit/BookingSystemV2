'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
   class Passenger extends Model {
      static associate(models) {
         Passenger.belongsTo(models.FlightBooking, {
            foreignKey: 'flight_booking_id',
            as: 'passengerData',
         });
      }
   }

   Passenger.init(
      {
         passenger_id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
         },
         flight_booking_id: DataTypes.INTEGER,
         type_passenger: DataTypes.STRING,
         fullname: DataTypes.STRING,
         gender: DataTypes.STRING,
         birthdate: DataTypes.DATE,
         passport: DataTypes.STRING,
         idcard: DataTypes.STRING,
      },
      {
         sequelize,
         modelName: 'Passenger',
         timestamps: false,
      }
   );

   return Passenger;
};
