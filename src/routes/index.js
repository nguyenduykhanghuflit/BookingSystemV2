import homeRouter from './homeRouter';
import roomRouter from './roomRouter';
import loginRouter from './loginRouter';
import errRouter from './errRouter';
import adminRouter from './admin/admin.homeRouter';
import flightRouter from './flightRouter';

function route(app) {
   app.use('/', homeRouter);
   app.use('/admin', adminRouter);
   app.use('/error', errRouter);
   app.use('/rooms', roomRouter);
   app.use('/login', loginRouter);
   app.use('/flights', flightRouter);
}

module.exports = route;
