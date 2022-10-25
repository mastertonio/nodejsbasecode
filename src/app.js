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
 
  // enable cors
  app.use(cors());
  // app.options('*', cors());
  app.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
  }));

  app.use((req,res,next)=>{
    req.headers['authorization'] = `Bearer ${req.cookies['x-access-token']}`;
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

    // res.headers("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    next();
  });
  app.use(
    session({
        secret: config.cookie,
        resave: false,
        saveUninitialized: false,
        store:store
   })
  );

  // jwt authentication
  app.use(passport.initialize());
  passport.use('jwt', jwtStrategy);

  // limit repeated failed requests to auth endpoints
  if (config.env === 'production') {
    app.use('/v1/auth', authLimiter);
  }
  


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

