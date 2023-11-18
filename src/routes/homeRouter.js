import express from 'express';
let router = express.Router();
const homeController = require('../controller/homeController');
const authController = require('../controller/authController');
const flightController = require('../controller/flightController');

router.get('/', homeController.Home);

//vị trí hotel
router.get('/location', homeController.Location);

//thông tin hoteel
router.get('/hotel', homeController.Hotel);

//thông tin khách hàng đã đăng nhập
router.get('/info', authController.ReturnInfoUser);

//update thông tin
router.post('/info/update', authController.UpdateInfo);

//danh sách hotel đã đặt
router.get('/my-booking', authController.GetBookingByUsername);

//danh sách vé máy bay đã đặt
router.get('/my-ticket', flightController.GetFlightTicketByUsername);

//hủy phòng
router.get('/cancel/:bookingID', authController.Cancel);
//hủy vé
router.get('/cancel-ticket/:id', flightController.CancelFlightTicket);

//trang đăng ký
router.get('/register', authController.Register);

//api đăng ký
router.post('/register', authController.HandleRegister);

//data test
router.get('/data', authController.CheckLogin, homeController.data);

//api get info  user
router.post('/info', authController.GetInfoUser);

//logout
router.get('/logout', authController.Logout);

module.exports = router;
