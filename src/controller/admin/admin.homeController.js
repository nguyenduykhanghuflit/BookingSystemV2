const { response } = require('express');
const e = require('express');
const ADMIN = require('../../services/ADMIN');

const jwt = require('jsonwebtoken');

class AdminHomeController {
   // trang chủ
   async Home(req, res) {
      // let data = await ADMIN.AutoCancelBooking();
      // // let ud = await ADMIN.UpdateAllRoom();
      // // if (ud) console.log('ADMIN: trạng thái phòng vừa được cập nhật');
      // if (data) console.log('ADMIN: các phòng quá hạn đã được hủy');
      const statistical = await ADMIN.Statistical();

      return res.render('admin/home.ejs', { data: statistical });
   }
   async DataHome(req, res) {
      let data = await ADMIN.DataHome();
      res.send(data);
   }
}
module.exports = new AdminHomeController();
