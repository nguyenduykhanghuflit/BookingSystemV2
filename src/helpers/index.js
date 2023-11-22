const jwt = require('jsonwebtoken');
const fs = require('fs');
const publicKey = fs.readFileSync('./key/publickey.crt');
const { TICKET_TYPE_NAME } = require('../constant/flight-constant');
function convertTimeStringToSeconds(timeString) {
   const timeParts = timeString.split(':');
   const hours = parseInt(timeParts[0], 10);
   const minutes = parseInt(timeParts[1], 10);
   const seconds = parseInt(timeParts[2], 10);

   const totalSeconds = hours * 3600 + minutes * 60 + seconds;
   return totalSeconds;
}
function getCurrentTimeInSeconds() {
   const currentDate = new Date();
   const hours = currentDate.getHours();
   const minutes = currentDate.getMinutes();
   const seconds = currentDate.getSeconds();

   const totalSeconds = hours * 3600 + minutes * 60 + seconds;
   return totalSeconds;
}
function phoneValid(phone) {
   return /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(phone);
}
function emailValid(email) {
   return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
   );
}
function getUsernameFromToken(req) {
   const token = req.cookies.token;
 
   if (!token) return null;
   const deccoded = jwt.verify(token, publicKey, { algorithm: 'RS256' });
   return deccoded?.username || null;
}

function mailTemplate(detail, booking = true) {
   const tokenCancel = genTokenByEmailAndTicketId(
      detail.emailCustomer,
      detail.flight_booking_id
   );

   let aTag = '';
   if (booking) {
      aTag = `<a href="http://localhost:8080/Flights/cancel?id=${detail.flight_booking_id}&tokenCancel=${tokenCancel}">Hủy vé tại đây (liên kết chỉ tồn tại trong 10 ngày)</a>`;
   }

   const passengersHtml = detail.passengerData
      .map(
         (passenger) => `
         <li style="margin-top:15px; padding:15px;border-bottom:1px solid red">
            <tr>
               <td style="font-weight: bold;">Loại hành khách:</td>
               <td>${
                  passenger.type_passenger == 'adult' ? 'Người lớn' : 'Trẻ em'
               }</td>
            </tr>
           
           
            <tr>
               <td style="font-weight: bold;">Giới tính:</td>
               <td>${passenger.gender == 'male' ? 'Nam' : 'Nữ'}</td>
            </tr>
            <tr>
               <td style="font-weight: bold;">Ngày sinh:</td>
               <td>${new Intl.DateTimeFormat('vi-VN').format(
                  new Date(passenger.birthdate)
               )}</td>
            </tr>
            <tr>
               <td style="font-weight: bold;">Passport:</td>
               <td>${passenger.passport ? passenger.passport : 'Không có'}</td>
            </tr>
            <tr>
               <td style="font-weight: bold;">Chứng minh nhân dân:</td>
               <td>${passenger.idcard ? passenger.idcard : 'Không có'}</td>
            </tr>
            </li>
         `
      )
      .join('\n');

   return `
      <div style="padding: 20px; border-radius: 15px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
        <div style="display:flex">
        <div>
        <h2 style="color: rgb(241, 69, 69);">Thông tin vé máy bay</h2>
        <p style="color: rgb(241, 69, 69);"><strong>Mã vé:</strong> ${
           detail.flight_booking_id
        }</p>
        <p><strong>Tên hành khách:</strong> ${detail.fullnameCustomer}</p>
        <p><strong>Trạng thái:</strong> ${detail.status}</p>
        <p><strong>Email:</strong> ${detail.emailCustomer}</p>
        <p><strong>SĐT:</strong> ${detail.phoneCustomer}</p>
        <p><strong>Tổng giá:</strong> ${new Intl.NumberFormat('vi-VN', {
           style: 'currency',
           currency: 'VND',
        }).format(detail.total_price)}</p>

        
        <p>
           <strong>Ngày đặt:</strong> 
           ${new Intl.DateTimeFormat('vi-VN').format(
              new Date(detail.booking_date)
           )}
        </p>
        <p><strong>Loại vé:</strong> ${TICKET_TYPE_NAME[detail.ticketType]}</p>
        <p><strong>Số người lớn:</strong> ${detail.adultCount}</p>
        <p><strong>Số trẻ em:</strong> ${detail.childCount}</p>
        </div>
        <div style="margin-left:20px">
        <h3 style="margin-top: 20px;">Danh sách hành khách</h3>
        <ul style="border-collapse: collapse; width: 100%; text-align: left;">
           ${passengersHtml}
        </ul>
        </div>
        </div>
        
       ${aTag}
      </div>
   `;
}
function genTokenByEmailAndTicketId(email, ticketId) {
   const secretKey = 'phuchoang';
   const payload = {
      email: email,
      ticketId: ticketId,
   };
   const options = {
      expiresIn: '36000s',
   };
   const token = jwt.sign(payload, secretKey, options);
   return token;
}

function getDataTicketFromToken(token) {
   const secretKey = 'phuchoang';
   try {
      const decoded = jwt.verify(token, secretKey);
      return decoded;
   } catch (error) {
      console.log('Lỗi xác thực token:', error.message);
      return null;
   }
}
function ApiOk(res, msg, data) {
   return res.status(200).json({
      success: true,
      result: data,
      message: msg,
   });
}
function ApiErr(res, msg, data, code = 400) {
   return res.status(code).json({
      success: false,
      result: data,
      message: msg,
   });
}

module.exports = {
   convertTimeStringToSeconds,
   getCurrentTimeInSeconds,
   ApiOk,
   ApiErr,
   emailValid,
   phoneValid,
   mailTemplate,
   getUsernameFromToken,
   genTokenByEmailAndTicketId,
   getDataTicketFromToken,
};
