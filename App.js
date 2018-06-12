"use strict";
exports.__esModule = true;
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var CouponsModel_1 = require("./model/CouponsModel");
var UserModel_1 = require("./model/UserModel");
// Creates and configures an ExpressJS web server.
var App = /** @class */ (function () {
    //Run configuration methods on the Express instance.
    function App() {
        this.expressApp = express();
        this.middleware();
        this.routes();
        this.idGenerator = 100;
        this.Coupons = new CouponsModel_1.CouponsModel();
        this.Users = new UserModel_1.UserModel();
    }
    // Configure Express middleware.
    App.prototype.middleware = function () {
        this.expressApp.use(logger('dev'));
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
    };
    // Configure API endpoints.
    App.prototype.routes = function () {
        var _this = this;
        var router = express.Router();
        router.get('/user/:userID', function (req, res) {
            var id = req.params.userID;
            console.log('Query single user with id: ' + id);
            _this.Users.getUser(res, { userID: id });
        });
        router.get('/coupon/:couponID', function (req, res) {
            var id = req.params.couponID;
            console.log('Query single coupon with id: ' + id);
            _this.Coupons.getCoupon(res, { couponID: id });
            console.log(id);
        });
        router.get('/coupons/', function (req, res) {
            console.log('Get all coupons');
            _this.Coupons.retrieveAllCoupons(res);
        });
        router.get('/users/', function (req, res) {
            console.log('Get all users');
            _this.Users.retrieveAllUsers(res);
        });
        this.expressApp.use('/app', router);
        this.expressApp.use('/app/json/', express.static(__dirname + '/app/json'));
        this.expressApp.use('/images', express.static(__dirname + '/img'));
        this.expressApp.use('/', express.static(__dirname + '/dist'));
    };
    return App;
}());
exports.App = App;
