var express = require('express');
var router = express.Router();

var app = express();
var catalogController = require('../controller/catalogController.js');

app.use('/',catalogController);
app.use('/catalog',catalogController);
app.use('/about',catalogController);
app.use('/contactUs',catalogController);
app.use('/myItems',catalogController);
app.use('/catalog/item/:id',catalogController);
app.use('/*',catalogController);

module.exports = router;
