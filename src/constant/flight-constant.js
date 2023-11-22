const AIRLINE = {
   1: 'Vietnam Airline',
   2: 'Bamboo Airways',
   3: 'Vietravel Airlines',
   4: 'Vietjet Air',
   5: 'Jetstar Pacific Airlines',
};

const TICKET_TYPE = {
   type1: 0,
   type2: 500, //cộng thêm 500
   type3: 1000,
   type4: 1500,
};
const TICKET_TYPE_NAME = {
   type1: 'Phổ thông',
   type2: 'Phổ thông cao cấp',
   type3: 'Thương gia',
   type4: 'Hạng nhất',
};

const ADULT_PRICE = {
   1: 0,
   2: 10, //giảm 100%
   3: 20, //giảm 20%
};

const CHILDREN_PRICE = {
   0: 0,
   1: 10,
   2: 20,
};

module.exports = {
   AIRLINE,
   TICKET_TYPE,
   ADULT_PRICE,
   CHILDREN_PRICE,
   TICKET_TYPE_NAME,
};
