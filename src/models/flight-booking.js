'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
   class FlightBooking extends Model {
      static associate(models) {
         FlightBooking.belongsTo(models.Flight, {
            foreignKey: 'flight_id',
            as: 'flightData',
         });
         FlightBooking.hasMany(models.Passenger, {
            foreignKey: 'flight_booking_id',
            as: 'passengerData',
         });
      }
   }

   FlightBooking.init(
      {
         flight_booking_id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
         },
         customer_id: DataTypes.INTEGER,
         flight_id: DataTypes.INTEGER,
         booking_date: DataTypes.DATE,
         total_price: DataTypes.DOUBLE,
         status: DataTypes.STRING,
         adultCount: DataTypes.INTEGER,
         childCount: DataTypes.INTEGER,
         fullnameCustomer: DataTypes.STRING,
         username: DataTypes.STRING,
         emailCustomer: DataTypes.STRING,
         phoneCustomer: DataTypes.STRING,
         ticketType: DataTypes.STRING,
      },
      {
         sequelize,
         modelName: 'FlightBooking',
         timestamps: false,
      }
   );

   return FlightBooking;
};
