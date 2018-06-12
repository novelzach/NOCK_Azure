import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as mongodb from 'mongodb';
import * as url from 'url';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';

import {CouponsModel} from './model/CouponsModel';
import {UserModel} from './model/UserModel';
import {DataAccess} from './DataAccess';
import GooglePassportObj from './GooglePassport';

let passport = require('passport');

class App {

  public expressApp: express.Application;
  public Coupons:CouponsModel;
  public Users:UserModel;
  public idGenerator:number;
  public googlePassportObj:GooglePassportObj;

  constructor() {
    this.googlePassportObj = new GooglePassportObj();
    this.expressApp = express();
    this.middleware();
    this.routes();
    this.idGenerator = 100;
    this.Coupons = new CouponsModel();
	this.Users = new UserModel();
  }

  private middleware(): void {
    this.expressApp.use(logger('dev'));
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: false }));
    this.expressApp.use(session({ secret: 'keyboard cat' }));
    this.expressApp.use(passport.initialize());
    this.expressApp.use(passport.session());
  }

  private validateAuth(req, res, next):void {
    if (req.isAuthenticated()) { console.log("user is authenticated"); return next(); }
    console.log("user is not authenticated");
    res.redirect('/');
  }

  private routes(): void {
    let router = express.Router();

    // Google Auth
    router.get('/auth/google', 
        passport.authenticate('google', 
            { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }
        )
    );

    router.get('/auth/google/callback', 
        passport.authenticate('google', 
            { successRedirect: '/#/welcome', failureRedirect: '/'
            }
        )
    );

    // Other
    router.get('/app/user/:userID', (req, res) => {
	    var id = req.params.userID;
	    console.log('Query single user with id: ' + id);
	    this.Users.getUser(res, {userID: id});
	});

	router.get('/app/coupon/:couponID', (req, res) => {
	    var id = req.params.couponID;
	    console.log('Query single coupon with id: ' + id);
	    this.Coupons.getCoupon(res, {couponID: id});
	    console.log(id);
	});

	router.get('/app/coupons/', (req, res) => {
	    console.log('Get all coupons');
	    this.Coupons.retrieveAllCoupons(res);
	});

	router.get('/app/users/', (req,res) => {
	    console.log('Get all users');
	    this.Users.retrieveAllUsers(res);
	});

    this.expressApp.use('/', router);

    this.expressApp.use('/app/json/', express.static(__dirname+'/app/json'));
    this.expressApp.use('/images', express.static(__dirname+'/img'));
    this.expressApp.use('/vendor', express.static(__dirname + '/vendor'));
    this.expressApp.use('/', express.static(__dirname+'/dist'));
    
  }

}

export {App};