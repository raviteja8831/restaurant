module.exports = app => {
  const table = require('../controllers/table.controller');
  var router = require('express').Router();

  router.post('/', table.create);
  router.get('/', table.findAll);
  router.get('/:id', table.findOne);
  router.put('/:id', table.update);
  router.delete('/:id', table.delete);

  app.use('/api/tables', router);
};
