let servestatic = require('serve-static')
let path = require('path')
let express = require('express')

let port = process.env.PORT || 3000;
app = express();

app.use(servestatic(path.join(path.resolve(), 'dist')));

app.listen(port, () => {console.log("API server started on "+app.get('port'));});