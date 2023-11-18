const db = require('../models/index');
import { nanoid } from 'nanoid';
const { Op, literal } = require('sequelize');
const moment = require('moment');
const {
   convertTimeStringToSeconds,
   getCurrentTimeInSeconds,
} = require('../helpers/index');
const {
   AIRLINE,
   TICKET_TYPE,
   ADULT_PRICE,
   CHILDREN_PRICE,
   TICKET_TYPE_NAME,
} = require('../constant/flight-constant');
const configQuery = {
   raw: false,
   nest: true,
};

class FlightService {
   async getAllFlightToday() {
      try {
         const today = new Date();
         const todayString = `${today.getFullYear()}-${
            today.getMonth() + 1
         }-${today.getDate()}`;

         const include = [
            {
               model: db.Airport,
               as: 'departureAirport',
            },
            {
               model: db.Airport,
               as: 'arrivalAirport',
            },
         ];

         const conditions = {
            [Op.and]: [
               {
                  departure_date: {
                     [Op.eq]: literal(`DATE('${todayString}')`),
                  },
               },
            ],
         };
         const query = await db.Flight.findAll({
            where: conditions,
            include,
            ...configQuery,
         });
         const allFlightToday = filterDataToday(query);
         const first20Items = allFlightToday.slice(0, 20);
         return first20Items;
      } catch (err) {
         console.log(err);
         throw new Error(err);
      }
   }

   getFilteredFlights(
      airline,
      departure_airport_id,
      arrival_airport_id,
      departure_date
   ) {
      return new Promise(async (resolve, reject) => {
         try {
            let conditions = {};

            if (airline > 0) {
               conditions.airline = AIRLINE[airline];
            }
            if (departure_airport_id) {
               conditions.departure_airport_id = departure_airport_id;
            }
            if (arrival_airport_id) {
               conditions.arrival_airport_id = arrival_airport_id;
            }
            if (departure_date) {
               conditions.departure_date = {
                  [Op.eq]: literal(`DATE('${departure_date}')`),
               };
            }

            let query = await db.Flight.findAll({
               where: conditions,
               include: [
                  {
                     model: db.Airport,
                     as: 'departureAirport',
                  },
                  {
                     model: db.Airport,
                     as: 'arrivalAirport',
                  },
               ],
               ...configQuery,
            });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(departure_date) > today) {
               resolve(query);
            } else {
               const data = filterDataToday(query);
               resolve(data);
            }
         } catch (error) {
            reject(error);
         }
      });
   }

   async getFilghtById(flight_id) {
      try {
         const include = [
            {
               model: db.Airport,
               as: 'departureAirport',
            },
            {
               model: db.Airport,
               as: 'arrivalAirport',
            },
         ];
         const data = await db.Flight.findByPk(flight_id, {
            include,
            ...configQuery,
         });
         return data;
      } catch (err) {
         throw new Error(err);
      }
   }

   async getAirports() {
      try {
         const airports = await db.Airport.findAll(configQuery);
         return airports;
      } catch (error) {
         throw new Error(error);
      }
   }

   getFlightBooking(dayStart, dayEnd) {
      return new Promise(async (resolve, reject) => {
         try {
            let startDate, endDate;

            // Kiểm tra nếu dayStart và dayEnd là null, lấy ngày hôm nay
            if (!dayStart && !dayEnd) {
               const today = new Date();
               startDate = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
               );
               endDate = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                  23,
                  59,
                  59,
                  999
               );
            } else {
               // Chuyển đổi dayStart và dayEnd thành đối tượng Date chỉ chứa phần ngày
               startDate = dayStart ? new Date(dayStart) : null;
               endDate = dayEnd ? new Date(dayEnd) : null;

               // Thiết lập thời gian bắt đầu từ 00:00:00
               if (startDate) {
                  startDate.setHours(0, 0, 0, 0);
               }

               // Thiết lập thời gian kết thúc tới 23:59:59
               if (endDate) {
                  endDate.setHours(23, 59, 59, 999);
               }
            }
            let query = await db.FlightBooking.findAll({
               include: [
                  {
                     model: db.Flight,
                     as: 'flightData',
                     include: [
                        {
                           model: db.Airport,
                           as: 'departureAirport',
                        },
                        {
                           model: db.Airport,
                           as: 'arrivalAirport',
                        },
                     ],
                  },
                  {
                     model: db.Passenger,
                     as: 'passengerData',
                  },
               ],
               ...configQuery,
               where: {
                  booking_date: {
                     [db.Sequelize.Op.between]: [startDate, endDate],
                  },
               },
               order: [['flight_booking_id', 'DESC']],
            });

            resolve(query);
         } catch (error) {
            reject(error);
         }
      });
   }

   booking(bookingData) {
      return new Promise(async (resolve, reject) => {
         try {
            // Lưu thông tin đặt chỗ vào bảng FlightBooking
            const flightBooking = await db.FlightBooking.create({
               flight_id: bookingData.flight_id,
               status: 'WAITING',
               username: bookingData.username,
               ticketType: bookingData.ticket_type,
               adultCount: bookingData.adultCount,
               childCount: bookingData.childCount,
               fullnameCustomer: bookingData.fullnameCustomer,
               emailCustomer: bookingData.emailCustomer,
               phoneCustomer: bookingData.phoneCustomer,
               booking_date: new Date(),
               total_price: parseFloat(
                  bookingData.totalPrice.replace(/[^0-9]/g, '')
               ), // Chuyển đổi giá trị thành số
            });

            // Lưu thông tin hành khách vào bảng Passenger
            for (const passengerData of bookingData.passengers) {
               await db.Passenger.create({
                  flight_booking_id: flightBooking.flight_booking_id,
                  type_passenger: passengerData.type,
                  fullname: passengerData.fullname,
                  gender: passengerData.gender,
                  birthdate: passengerData.birthdate,
                  passport: passengerData.passport,
                  idcard: passengerData.idcard,
               });
            }

            resolve(flightBooking);
         } catch (error) {
            reject(error);
         }
      });
   }

   getBooking(id) {
      return new Promise(async (resolve, reject) => {
         try {
            const flightBooking = await db.FlightBooking.findByPk(id, {
               include: [
                  {
                     model: db.Passenger,
                     as: 'passengerData',
                  },
               ],
               ...configQuery,
            });

            resolve(flightBooking);
         } catch (error) {
            reject(error);
         }
      });
   }

   getAllTicketByUsername(username) {
      return new Promise(async (resolve, reject) => {
         try {
            let query = await db.FlightBooking.findAll({
               where: { username },
               order: [['booking_date', 'DESC']],
               include: [
                  {
                     model: db.Passenger,
                     as: 'passengerData',
                  },
               ],
               ...configQuery,
            });

            resolve(query);
         } catch (error) {
            reject(error);
         }
      });
   }

   updateTicketStatus(id, status) {
      {
         return new Promise(async (resolve, reject) => {
            try {
               await db.FlightBooking.update(
                  { status },
                  {
                     where: {
                        flight_booking_id: id,
                     },
                  }
               );
               resolve(true);
            } catch (error) {
               reject(false);
            }
         });
      }
   }

   statisticalTicketAndFlight() {
      return new Promise(async (resolve, reject) => {
         try {
            let countTicket = await db.FlightBooking.findAll();
            let countFlight = await db.Flight.findAll();

            resolve({
               countTicket: countTicket.length,
               countFlight: countFlight.length,
            });
         } catch (error) {
            reject(error);
         }
      });
   }
   async getBookingsByStatusAndDateRange(status, startDate, endDate) {
      try {
         if (!startDate && !endDate) {
            const today = new Date();
            startDate = new Date(
               today.getFullYear(),
               today.getMonth(),
               today.getDate()
            );
            endDate = new Date(
               today.getFullYear(),
               today.getMonth(),
               today.getDate(),
               23,
               59,
               59,
               999
            );
         } else {
            // Chuyển đổi dayStart và dayEnd thành đối tượng Date chỉ chứa phần ngày
            startDate = startDate ? new Date(startDate) : null;
            endDate = endDate ? new Date(endDate) : null;

            // Thiết lập thời gian bắt đầu từ 00:00:00
            if (startDate) {
               startDate.setHours(0, 0, 0, 0);
            }

            // Thiết lập thời gian kết thúc tới 23:59:59
            if (endDate) {
               endDate.setHours(23, 59, 59, 999);
            }
         }

         const bookings = await db.Booking.findAll({
            where: {
               status: status,
               createdAt: {
                  [db.Sequelize.Op.between]: [startDate, endDate],
               },
            },
         });

         return bookings;
      } catch (error) {
         throw error;
      }
   }

   async getFlightByStatusAndDateRange(status, startDate, endDate) {
      try {
         if (!startDate && !endDate) {
            const today = new Date();
            startDate = new Date(
               today.getFullYear(),
               today.getMonth(),
               today.getDate()
            );
            endDate = new Date(
               today.getFullYear(),
               today.getMonth(),
               today.getDate(),
               23,
               59,
               59,
               999
            );
         } else {
            // Chuyển đổi dayStart và dayEnd thành đối tượng Date chỉ chứa phần ngày
            startDate = startDate ? new Date(startDate) : null;
            endDate = endDate ? new Date(endDate) : null;

            // Thiết lập thời gian bắt đầu từ 00:00:00
            if (startDate) {
               startDate.setHours(0, 0, 0, 0);
            }

            // Thiết lập thời gian kết thúc tới 23:59:59
            if (endDate) {
               endDate.setHours(23, 59, 59, 999);
            }
         }

         let query = await db.FlightBooking.findAll({
            where: {
               status: status,
               booking_date: {
                  [db.Sequelize.Op.between]: [startDate, endDate],
               },
            },
         });

         return query;
      } catch (error) {
         throw error;
      }
   }
}

function filterDataToday(query) {
   const currentTime = getCurrentTimeInSeconds();
   const data = query
      .filter((item) => {
         const { start_time } = item;
         const ss = convertTimeStringToSeconds(start_time);
         item.ss = ss;
         return ss > currentTime;
      })
      .map((m) => {
         const { start_time } = m;
         const ss = convertTimeStringToSeconds(start_time);
         m.ss = ss;
         return m;
      });
   data.sort((a, b) => a.ss - b.ss);
   return data;
}

module.exports = new FlightService();
