const FlightService = require('../../services/Flight.Service');

const {
   TICKET_TYPE,
   TICKET_TYPE_NAME,
} = require('../../constant/flight-constant');
const { sendMail } = require('../../services/SendMail.Service');
const {
   ApiOk,
   ApiErr,
   emailValid,
   phoneValid,
   mailTemplate,
   getUsernameFromToken,
   genTokenByEmailAndTicketId,
   getDataTicketFromToken,
} = require('../../helpers/index');

class AdminFightController {
   //gọi cái này để lấy danh sách chuyến bay trong ngày, hoặc lọc chuyến bay theo điều kiện ở trang tìm vé máy bay
   async GetAllFlight(req, res) {
      try {
         const { dayStart, dayEnd } = req.query;
         const data = await FlightService.getFlightBooking(dayStart, dayEnd);

         //res.send(data);
         return res.render('admin/booking-flight.ejs', { data });
      } catch (err) {
         console.log(err);
         res.send({ code: 500, msg: 'Server error' });
      }
   }

   async GetTicketDetail(req, res) {
      try {
         const flight_booking_id = req.params.flight_booking_id;

         if (!Number.isInteger(Number(flight_booking_id)))
            return ApiErr(
               res,
               'Không tìm thấy',
               'flight_booking_id invalid',
               400
            );
         const data = await FlightService.getBooking(flight_booking_id);
         if (!data) return ApiErr(res, 'Không tìm thấy', 'null_data', 400);

         const status = ['WAITING', 'ACCEPT', 'CANCEL', 'DONE'];

         return res.render('admin/ticket-detail.ejs', { data, status });
      } catch (error) {
         console.log(error);
         return ApiErr(res, 'Lỗi server không tìm thấy vé', error, 500);
      }
   }

   async UpdateFlightTicket(req, res) {
      try {
         const { id, status } = req.query;
         let detail = await FlightService.getBooking(id);
         if (!detail) return ApiErr(res, 'Không tìm thấy', error, 400);

         await FlightService.updateTicketStatus(id, status);
         detail = await FlightService.getBooking(id);
         const htmlContent = mailTemplate(detail, false);
         await sendMail(
            detail.email,
            `Vé máy bay của bạn đã được ADMIN cập nhật trạng thái thành ${status}`,
            htmlContent
         );
         return ApiOk(res, 'Cập nhật thành công', id);
      } catch (error) {
         console.log(error.message);
         return ApiErr(res, 'Server Error', error, 500);
      }
   }
}

module.exports = new AdminFightController();
