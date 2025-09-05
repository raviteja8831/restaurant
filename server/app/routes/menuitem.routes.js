module.exports = app => {
  const menuitem = require('../controllers/menuitem.controller');
  var router = require('express').Router();

  router.post('/', menuitem.create);
  router.get('/', menuitem.findAll);
  router.get('/:id', menuitem.findOne);
  router.put('/:id', menuitem.update);
  router.delete('/:id', menuitem.delete);

  // Bulk status update route
  router.put('/updateStatus', menuitem.updateStatusBulk);

  app.use('/api/menuitems', router);
};
