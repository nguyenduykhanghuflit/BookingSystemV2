class ErrorController {
   async Err(req, res) {
      let err = req.params['err'];
      res.send(err);
   }
}
module.exports = new ErrorController();
