"use strict";
exports.__esModule = true;
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var session = require("express-session");
var CouponsModel_1 = require("./model/CouponsModel");
var UserModel_1 = require("./model/UserModel");
var GooglePassport_1 = require("./GooglePassport");
var FacebookPassport_1 = require("./FacebookPassport");
var passport = require('passport');

var App = /** @class */ (function () {
    
    function App() {
        this.facebookPassportObj = new FacebookPassport_1["default"]();
        this.googlePassportObj = new GooglePassport_1["default"]();
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
        this.expressApp.use(session({ secret: 'keyboard cat' }));
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

        router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
        router.get('/auth/google/callback', passport.authenticate('google', { successRedirect: 'https://nockapps.azurewebsites.net', failureRedirect: '/'
        }));
        router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
        router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/', successRedirect: '/welcome' }));
        
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
        this.expressApp.use('/', router);
        this.expressApp.use('/app/json/', express.static(__dirname + '/app/json'));
        this.expressApp.use('/images', express.static(__dirname + '/img'));
        this.expressApp.use('/vendor', express.static(__dirname + '/vendor'));
        this.expressApp.use('/', express.static(__dirname + '/dist'));
    };
    return App;
}());
exports.App = App;
