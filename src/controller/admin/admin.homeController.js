const { response } = require('express');
const e = require('express');
const ADMIN = require('../../services/ADMIN');
const FlightService = require('../../services/Flight.Service');

const jwt = require('jsonwebtoken');

class AdminHomeController {
   // trang chủ
   async Home(req, res) {
      const statistical = await ADMIN.Statistical();
      const statisticalTicketAndFlight =
         await FlightService.statisticalTicketAndFlight();

      const { startDate, endDate } = req.query;

      const getBookingSuccess =
         await FlightService.getBookingsByStatusAndDateRange(
            'đã trả phòng và thanh toán',
            startDate,
            endDate
         );

      let totalAmount = 0;

      for (let i = 0; i < getBookingSuccess.length; i++) {
         const booking = getBookingSuccess[i];
         const total = booking.total.replace(/\D/g, ''); // Loại bỏ các ký tự không phải số trong chuỗi total
         const amount = parseInt(total); // Chuyển đổi chuỗi số thành số nguyên
         totalAmount += amount;
      }

      const getBookingNew = await FlightService.getBookingsByStatusAndDateRange(
         'đã đặt',
         startDate,
         endDate
      );
      const getBookingCheckin =
         await FlightService.getBookingsByStatusAndDateRange(
            'đã nhận phòng',
            startDate,
            endDate
         );
      const getBookingCancel =
         await FlightService.getBookingsByStatusAndDateRange(
            'hủy',
            startDate,
            endDate
         );

      const flightWaiting = await FlightService.getFlightByStatusAndDateRange(
         'WAITING',
         startDate,
         endDate
      );
      const flightAccept = await FlightService.getFlightByStatusAndDateRange(
         'ACCEPT',
         startDate,
         endDate
      );
      const flightCancel = await FlightService.getFlightByStatusAndDateRange(
         'CANCEL',
         startDate,
         endDate
      );
      const flightDone = await FlightService.getFlightByStatusAndDateRange(
         'DONE',
         startDate,
         endDate
      );

      let totalAmountFlight = 0;

      for (let i = 0; i < flightDone.length; i++) {
         const booking = flightDone[i];
         const total = booking.total_price;
         const amount = Number(total); // Chuyển đổi chuỗi số thành số nguyên
         totalAmountFlight += amount;
      }

      // res.send({
      //    totalAmount,
      //    totalAmountFlight,
      //    roomSuccess: getBookingSuccess.length,
      //    roomNew: getBookingNew.length,
      //    roomCheckin: getBookingCheckin.length,
      //    roomCancel: getBookingCancel.length,
      //    flightWaiting: flightWaiting.length,
      //    flightAccept: flightAccept.length,
      //    flightCancel: flightCancel.length,
      //    flightDone: flightDone.length,
      //    data: statistical,
      //    statisticalTicketAndFlight,
      // });

      return res.render('admin/home.ejs', {
         totalAmount,
         totalAmountFlight,
         roomSuccess: getBookingSuccess.length,
         roomNew: getBookingNew.length,
         roomCheckin: getBookingCheckin.length,
         roomCancel: getBookingCancel.length,
         flightWaiting: flightWaiting.length,
         flightAccept: flightAccept.length,
         flightCancel: flightCancel.length,
         flightDone: flightDone.length,
         data: statistical,
         statisticalTicketAndFlight,
      });
   }
   async DataHome(req, res) {
      // let data = await ADMIN.AutoCancelBooking();
      // let ud = await ADMIN.UpdateAllRoom();
      // if (ud) console.log('ADMIN: trạng thái phòng vừa được cập nhật');
      // if (data) console.log('ADMIN: các phòng quá hạn đã được hủy');
      let data = await ADMIN.DataHome();
      res.send(data);
   }
}
module.exports = new AdminHomeController();
