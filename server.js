const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
 require("./utilis/dbConnection");
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(cors({ origin: "*" }));
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./utilis/swagger.json');
app.use('/explorer', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/API/task', require('./routes/taskRouter'));
app.get("/",(req,res) => res.json({messge:"heeloworld"}))
app.listen(process.env.PORT, () => console.log(`Application server listening to port ${process.env.PORT}`));
module.exports = app
//}