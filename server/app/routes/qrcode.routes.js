module.exports = app => {
  const router = require('express').Router();
  const qrcode = require('../controllers/qrcode.controller');

  router.get('/', qrcode.listQRCodes);
  router.post('/', qrcode.createQRCode);
  router.get('/:qrcodeId/orders', qrcode.getQRCodeOrders);

  app.use('/api/qrcodes', router);
};
