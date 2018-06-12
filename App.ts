import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as mongodb from 'mongodb';
import * as url from 'url';
import * as bodyParser from 'body-parser';

import {CouponsModel} from './model/CouponsModel';
import {UserModel} from './model/UserModel';
import {DataAccess} from './DataAccess';

class App {

  public expressApp: express.Application;
  public Coupons:CouponsModel;
  public Users:UserModel;
  public idGenerator:number;

  constructor() {
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
  }

  private routes(): void {
    let router = express.Router();
    router.get('/user/:userID', (req, res) => {
	    var id = req.params.userID;
	    console.log('Query single user with id: ' + id);
	    this.Users.getUser(res, {userID: id});
	});

	router.get('/coupon/:couponID', (req, res) => {
	    var id = req.params.couponID;
	    console.log('Query single coupon with id: ' + id);
	    this.Coupons.getCoupon(res, {couponID: id});
	    console.log(id);
	});

	router.get('/coupons/', (req, res) => {
	    console.log('Get all coupons');
	    this.Coupons.retrieveAllCoupons(res);
	});

	router.get('/users/', (req,res) => {
	    console.log('Get all users');
	    this.Users.retrieveAllUsers(res);
	});

	router.post('/coupons', (req, res) => {
	    console.log('Post request body: ${req.body}');
	    var jsonObj: any = {};
	    jsonObj.couponID = this.idGenerator;
	    jsonObj.product = req.body.product;
	    jsonObj.store = req.body.store;
	    jsonObj.exp_date = req.body.exp_date;
	    jsonObj.discount = req.body.discount;
	    jsonObj.is_percent = req.body.is_percent;
	    jsonObj.code = req.body.code;
	    jsonObj.image = req.body.image;
	    jsonObj.token_cost = 5;
	    jsonObj.userID = req.body.userID;
	    this.Coupons.model.create([jsonObj], (err) => {
		if (err) {
		    console.log('Object creation failed');
		}
	    });
	    res.send(jsonObj);
	    this.idGenerator++;
	});

    this.expressApp.use('/app', router);

    this.expressApp.use('/app/json/', express.static(__dirname+'/app/json'));
    this.expressApp.use('/images', express.static(__dirname+'/img'));
    this.expressApp.use('/vendor', express.static(__dirname + '/vendor'));
    this.expressApp.use('/', express.static(__dirname+'/dist'));
    
  }

}

export {App};
