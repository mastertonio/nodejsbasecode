const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const upload = require('express-fileupload');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');


const cookieParser = require("cookie-parser");
// const header = new Headers();
const MongoDBSession = require('connect-mongodb-session');
const session = require('express-session');
const cookieSession = require("cookie-session");
const { NO_CONTENT } = require('http-status');


  const app = express();
  

  if (config.env !== 'test') {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
  }

  const MongoSession = MongoDBSession(session)
  const store = new MongoSession({
      uri: config.mongoose.url,
      collection: "Session"
  })

  // set security HTTP headers
  app.use(helmet());
  // set cookie-parser
  app.use(cookieParser(config.cookie))
  // parse json request body
  app.use(express.json({limit:'50mb'}));

  // parse urlencoded request body
  app.use(express.urlencoded({limit:'50mb', extended: true }));

  // sanitize request data
  app.use(xss());
  app.use(mongoSanitize());
  app.use(upload());

  // gzip compression
  app.use(compression());

  // (All)10mins- if no activity
 
  var allowlist = ['http://localhost:3000', 'http://localhost:3001','http://18.234.140.187:3000/','http://18.234.140.187:3000']
  var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true , credentials: true} // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false , credentials: true } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
  }
  // enable cors
  app.use(cors(config.corsOption));
app.use((req,res,next)=>{
  console.log(` token -- - ${req.cookies['session']}`)
  req.headers['authorization'] = `Bearer ${req.cookies['x-access-token']}`;
  res.setHeader('Access-Control-Allow-Origin', ['http://localhost:3000','http://18.234.140.187:3000']);

  // res.headers("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  next();
});
 app.use(
     cookieSession({
       name: "session",
       keys: ["x-access-token"],
         maxAge: 24 * 60 * 60 * 1000,
         secure: false,
         httpOnly: true,
         sameSite:'Lax',
         store:store,
     })
 );



  // jwt authentication
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use('jwt', jwtStrategy);

  // limit repeated failed requests to auth endpoints
  if (config.env === 'production') {
    app.use('/v1/auth', authLimiter);
  }
  // Try contacting the owner of the form if you think this is a mistake.




  // v1 api routes
  app.use('/v1', routes);

  // send back a 404 error for any unknown api request
  app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
  });

  
  // convert error to ApiError, if needed
  app.use(errorConverter);

  // handle error
  app.use(errorHandler);

  module.exports = app;

