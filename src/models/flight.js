'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
   class Flight extends Model {
      static associate(models) {
         Flight.hasMany(models.FlightBooking, {
            foreignKey: 'flight_id',
            as: 'flightData',
         });
         Flight.belongsTo(models.Airport, {
            foreignKey: 'departure_airport_id',
            as: 'departureAirport',
         });

         Flight.belongsTo(models.Airport, {
            foreignKey: 'arrival_airport_id',
            as: 'arrivalAirport',
         });
      }
   }

   Flight.init(
      {
         flight_id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
         },
         flight_code: DataTypes.STRING,
         airline: DataTypes.STRING,
         airline_logo: DataTypes.TEXT,
         departure_airport_id: DataTypes.INTEGER,
         arrival_airport_id: DataTypes.INTEGER,
         start_time: DataTypes.TIME,
         end_time: DataTypes.TIME,
         departure_date: DataTypes.DATE,
         price: DataTypes.DOUBLE,
      },
      {
         sequelize,
         modelName: 'Flight',
         timestamps: false,
      }
   );

   return Flight;
};
