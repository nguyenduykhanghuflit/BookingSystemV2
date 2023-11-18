import express from 'express';
let router = express.Router();
const fightController = require('../controller/flightController');

//trang danh sách các chuyến bay
router.get('/', fightController.GetAllFlight);

//trang chi tiết chuyến bay và đặt vé tại đây
router.get('/detail', fightController.GetDetailFlight);

//api đặt vé
router.post('/booking', fightController.CreateBookingFlight);

//lấy thông tin vé sau khi đã đặt thành công
router.get('/ticket-detail', fightController.GetTicketDetail);

//data đặt vé demo
router.get('/get', fightController.GetBooking);

//hủy vé máy bay
router.get('/cancel', fightController.CancelFlightTicket);

module.exports = router;
