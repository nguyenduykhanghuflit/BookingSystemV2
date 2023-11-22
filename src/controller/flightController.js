const FlightService = require('../services/Flight.Service');

const {
   TICKET_TYPE,
   TICKET_TYPE_NAME,
} = require('../constant/flight-constant');
const { sendMail } = require('../services/SendMail.Service');
const {
   ApiOk,
   ApiErr,
   emailValid,
   phoneValid,
   mailTemplate,
   getUsernameFromToken,
   genTokenByEmailAndTicketId,
   getDataTicketFromToken,
} = require('../helpers/index');

class FightController {
   //gọi cái này để lấy danh sách chuyến bay trong ngày, hoặc lọc chuyến bay theo điều kiện ở trang tìm vé máy bay
   async GetAllFlight(req, res) {
      try {
         const {
            departure_airport_id,
            arrival_airport_id,
            departure_date,
            airline,
            ticket_type,
         } = req.query;
         const airports = await FlightService.getAirports();
         let flights = [];
         let filter = false;
         if (departure_airport_id && arrival_airport_id && departure_date) {
            flights = await FlightService.getFilteredFlights(
               airline,
               departure_airport_id,
               arrival_airport_id,
               departure_date
            );

            flights = flights.map((item) => {
               const newPrice = parseInt(item.price) + TICKET_TYPE[ticket_type];
               item.price = newPrice;
               return item;
            });
            filter = true;
         } else flights = await FlightService.getAllFlightToday();

         const data = {
            flights,
            airports,
            filter,
         };

         // res.send(flights);
         return res.render('client/flight.ejs', { data, layout: false });
      } catch (err) {
         console.log(err);
         res.send({ code: 500, msg: 'Server error' });
      }
   }

   //lấy thông  tin  chi tiết của chuyến bay
   async GetDetailFlight(req, res) {
      try {
         const { flight_id, ticket_type } = req.query;

         if (!flight_id)
            return res.send({ code: 400, msg: 'flight_id is require' });

         let flightDetail = await FlightService.getFilghtById(flight_id);
         let newPrice =
            parseInt(flightDetail.price) + parseInt(TICKET_TYPE[ticket_type]);

         flightDetail.price = newPrice;
         const data = {
            flightDetail,
         };

         // res.send(data);
         return res.render('client/flight-detail.ejs', { data, layout: false });
      } catch (err) {
         console.log(err);
         res.send({ code: 500, msg: 'Server error' });
      }
   }

   //lấy ra danh sách  đã đặt (chỉ xem tham khảo)
   async GetBooking(req, res) {
      try {
         const data = await FlightService.getFlightBooking();
         res.send({ data });
      } catch (err) {
         res.send(err);
      }
   }

   //api đặt vé máy bay
   async CreateBookingFlight(req, res) {
      try {
         const bookingData = req.body;
         const username = getUsernameFromToken(req);
         bookingData.username = username;

         if (!bookingData.fullnameCustomer)
            return ApiErr(res, 'Vui lòng nhập tên người đặt', null);

         if (!bookingData.phoneCustomer)
            return ApiErr(res, 'Vui lòng nhập số điện thoại người đặt', null);

         if (!bookingData.emailCustomer)
            return ApiErr(res, 'Vui lòng nhập email người đặt', null);

         if (!emailValid(bookingData.emailCustomer))
            return ApiErr(res, 'Vui lòng nhập email hợp lệ', null);

         if (!phoneValid(bookingData.phoneCustomer))
            return ApiErr(res, 'Vui lòng nhập số điện thoại hợp lệ', null);

         for (const passengerData of bookingData.passengers) {
            const type_passenger = passengerData.type;

            if (!passengerData.fullname)
               return ApiErr(res, 'Vui lòng nhập đủ tên hành khách', null);

            if (!passengerData.gender)
               return ApiErr(
                  res,
                  'Vui lòng nhập đầy đủ giới tính hành khách',
                  null
               );

            if (!passengerData.birthdate)
               return ApiErr(
                  res,
                  'Vui lòng nhập đầy đủ ngày sinh hành khách',
                  null
               );

            if (type_passenger == 'adult' && !passengerData.idcard)
               return ApiErr(
                  res,
                  'Vui lòng nhập đầy đủ CMND/CCCD hành khách',
                  null
               );
         }

         const data = await FlightService.booking(bookingData);
         const detail = await FlightService.getBooking(data.flight_booking_id);
         const htmlContent = mailTemplate(detail);

         //gọi service send mail
         await sendMail(
            bookingData.emailCustomer,
            'Bạn đã đặt vé máy bay thành công',
            htmlContent
         );
         //chưa đăng nhập nên khi viewDetail sẽ kèm theo token
         let url_navigation;
         if (!username) {
            const tokenViewDetail = genTokenByEmailAndTicketId(
               detail.emailCustomer,
               detail.flight_booking_id
            );
            url_navigation = `/flights/ticket-detail?flight_booking_id=${detail.flight_booking_id}&tokenViewDetail=${tokenViewDetail}&isBooking=1`;
         } else {
            url_navigation = `/flights/ticket-detail?flight_booking_id=${detail.flight_booking_id}&isBooking=1`;
         }
         return ApiOk(res, 'Đặt chỗ thành công!', { detail, url_navigation });
      } catch (err) {
         console.log(err);
         return ApiErr(res, 'Lỗi server đặt chỗ thất bại', err, 500);
      }
   }

   async GetTicketDetail(req, res) {
      try {
         const username = getUsernameFromToken(req);
         let dataToken = null;
         if (!username) {
            const { tokenViewDetail } = req.query;
            if (!tokenViewDetail)
               if (!data) return ApiErr(res, 'Không tìm thấy', 'no_token', 400);

            dataToken = getDataTicketFromToken(tokenViewDetail);
            if (!dataToken)
               return ApiErr(res, 'Không tìm thấy', 'token_no_data', 400);
         }

         const { flight_booking_id } = req.query;
         if (!Number.isInteger(Number(flight_booking_id)))
            return ApiErr(
               res,
               'Không tìm thấy',
               'flight_booking_id invalid',
               400
            );

         const data = await FlightService.getBooking(flight_booking_id);
         if (!data) return ApiErr(res, 'Không tìm thấy', 'null_data', 400);

         if (username && data.username != username)
            return ApiErr(
               res,
               'Không tìm thấy',
               'ticket_not_belong_to_this_user',
               400
            );

         if (!username && data.emailCustomer != dataToken.email) {
            return ApiErr(
               res,
               'Không tìm thấy',
               'ticket_not_belong_to_this_user',
               400
            );
         }

         return res.render('client/ticket-detail.ejs', { data, layout: false });
      } catch (error) {
         console.log(error);
         return ApiErr(res, 'Lỗi server không tìm thấy vé', error, 500);
      }
   }
   //lấy danh sách vé đã đặt theo username
   async GetFlightTicketByUsername(req, res) {
      try {
         const username = getUsernameFromToken(req);
         if (!username) return res.redirect('/login');
         let data = await FlightService.getAllTicketByUsername(username);

         return res.render('client/my-ticket.ejs', { data, layout: false });
      } catch (err) {
         console.log(err);
         return res.redirect('/login');
      }
   }

   async CancelFlightTicket(req, res) {
      try {
         const username = getUsernameFromToken(req);

         console.log(username)
         const { id, tokenCancel } = req.query;
         console.log(id,tokenCancel)
         if (tokenCancel!=null && tokenCancel && tokenCancel!="null") {
            const data = getDataTicketFromToken(tokenCancel);
            if (data) {
               //getdetail
               let detail = await FlightService.getBooking(id);
               if (detail.emailCustomer == data.email && detail) {
                  await FlightService.updateTicketStatus(id, 'CANCEL');
                  detail = await FlightService.getBooking(id);
                  const htmlContent = mailTemplate(detail, false);

                  await sendMail(
                     data.email,
                     'Bạn đã đặt hủy vé máy bay thành công',
                     htmlContent
                  );
                  return ApiOk(res, 'Hủy thành công', id);
               }

               return ApiErr(res, 'Hủy thất bại', 'not_permission', 401);
            }
         }

         if (username) {
            //get detail where id
            let detail = await FlightService.getBooking(id);

            if (detail && detail.username == username) {
               await FlightService.updateTicketStatus(id, 'CANCEL');
               detail = await FlightService.getBooking(id);
               const htmlContent = mailTemplate(detail, false);

               await sendMail(
                  detail.emailCustomer,
                  'Bạn đã đặt hủy vé máy bay thành công',
                  htmlContent
               );
               return ApiOk(res, 'Hủy thành công', id);
            }

            return ApiErr(res, 'Hủy thất bại', 'not_permission', 401);
         }

         return ApiErr(res, 'Hủy thất bại', 'missing_data', 401);
      } catch (error) {
         console.log(error.message);
         return ApiErr(res, 'Hủy thất bại', error, 500);
      }
   }
}

module.exports = new FightController();
