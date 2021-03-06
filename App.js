"use strict";
exports.__esModule = true;
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var session = require("express-session");
var CouponsModel_1 = require("./model/CouponsModel");
var UserModel_1 = require("./model/UserModel");
var googlePassport_1 = require("./googlePassport");
var passport = require('passport');
var App = /** @class */ (function () {
    function App() {
        this.googlePassportObj = new googlePassport_1["default"]();
        this.expressApp = express();
        this.middleware();
        this.routes();
        this.idGenerator = 100;
        this.Coupons = new CouponsModel_1.CouponsModel();
        this.Users = new UserModel_1.UserModel();
    }
    App.prototype.middleware = function () {
        this.expressApp.use(logger('dev'));
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
        this.expressApp.use(session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true }
        }));
        this.expressApp.use(passport.initialize());
        this.expressApp.use(passport.session());
    };
    App.prototype.validateAuth = function (req, res, next) {
        if (req.isAuthenticated()) {
            console.log("user is authenticated");
            return next();
        }
        console.log("user is not authenticated");
        res.redirect('/');
    };
    App.prototype.routes = function () {
        var _this = this;
        var router = express.Router();
        router.get('/auth/google', passport.authenticate('google', { scope: ['https://accounts.google.com/o/oauth2/auth', 'email'] }
        //'https://www.googleapis.com/auth/plus.login', 'email'] }
        ));
        router.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/#/welcome', failureRedirect: '/'
        }));
        router.get('/app/user/:userID', function (req, res) {
            var id = req.params.userID;
            console.log('Query single user with id: ' + id);
            _this.Users.getUser(res, { userID: id });
        });
        router.get('/app/coupon/:couponID', function (req, res) {
            var id = req.params.couponID;
            console.log('Query single coupon with id: ' + id);
            _this.Coupons.getCoupon(res, { couponID: id });
            console.log(id);
        });
        router.get('/app/coupons/', function (req, res) {
            console.log('Get all coupons');
            _this.Coupons.retrieveAllCoupons(res);
        });
        router.get('/app/users/', function (req, res) {
            console.log('Get all users');
            _this.Users.retrieveAllUsers(res);
        });
        router.post('/app/coupons', function (req, res) {
            console.log('Post request body: ${req.body}');
            var jsonObj = {};
            jsonObj.couponID = _this.idGenerator;
            jsonObj.product = req.body.product;
            jsonObj.store = req.body.store;
            jsonObj.exp_date = req.body.exp_date;
            jsonObj.discount = req.body.discount;
            jsonObj.is_percent = req.body.is_percent;
            jsonObj.code = req.body.code;
            jsonObj.image = req.body.image;
            jsonObj.token_cost = 5;
            jsonObj.userID = req.body.userID;
            _this.Coupons.model.create([jsonObj], function (err) {
                if (err) {
                    console.log('Object creation failed');
                }
            });
            res.send(jsonObj);
            _this.idGenerator++;
        });
        this.expressApp.use('/', router);
        this.expressApp.use('/app/json/', express.static(__dirname + '/app/json'));
        this.expressApp.use('/images', express.static(__dirname + '/img'));
        this.expressApp.use('/vendor', express.static(__dirname + '/vendor'));
        this.expressApp.use('/', express.static(__dirname + '/dist'));
    };
    return App;
}());
exports.App = App;
