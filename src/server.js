const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 3333;
const routes = require('./routes');
const app = express();

app.set('trust proxy', true);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});