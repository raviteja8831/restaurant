module.exports = app => {
  const router = require('express').Router();
  const qrcode = require('../controllers/qrcode.controller');

  router.get('/', qrcode.listQRCodes);
  router.post('/', qrcode.createQRCode);
  router.put('/:id', qrcode.updateQRCode);
  router.delete('/:id', qrcode.deleteQRCode);
  router.get('/:qrcodeId/orders', qrcode.getQRCodeOrders);

  app.use('/api/qrcodes', router);
};
