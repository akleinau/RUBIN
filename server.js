let servestatic = require('serve-static')
let path = require('path')
let express = require('express')
const cors = require("cors");

let port = process.env.PORT || 3000;
app = express();

app.use(cors());

app.use(servestatic(path.join(path.resolve(), 'dist')));

app.listen(port, () => {console.log("API server started on "+app.get('port'));});