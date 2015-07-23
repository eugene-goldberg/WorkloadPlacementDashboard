'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	requestUrl = require('url'),
    ObjectID = require('mongodb').ObjectID,
    format = require('date-format'),
    nodemailer = require('nodemailer'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path');

    var pdf = require('html-pdf');

    var swig  = require('swig');

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'dcdmmailer@gmail.com',
            pass: 'Kpss1s0k'
        }
    });

    //var mailOptions = {
    //    from: 'DCDM Mailer <dcdmmailer@gmail.com>', // sender address
    //    to: 'ygoldberg@csc.com,', // list of receivers
    //    subject: 'All emails will now go to you', // Subject line
    //    text: 'All emails will now go to you!', // plaintext body
    //    html: '<b>All emails will now go to you!</b>' // html body
    //};

var multer  = require('multer');
var myParser = require('excel-file-parser');

var mongodb = require('mongodb');
var assert = require('assert');
var MongoClient = mongodb.MongoClient;

    // Import events module
    var events = require('events');
    // Create an eventEmitter object
    var eventEmitter = new events.EventEmitter();

var url = 'mongodb://localhost/datamanager-03-test';

module.exports = function(db) {
	// Initialize express app
	var app = express();

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	app.use(multer({ dest: './uploads/',
		rename: function (fieldname, filename) {
			return filename+Date.now();
		},
		onFileUploadStart: function (file) {
			console.log(file.originalname + ' is starting ...');
		},
		onFileUploadComplete: function (file) {
			console.log(file.fieldname + ' uploaded to  ' + file.path);
			var fileName = file.name;
			var done=true;
		}
	}));

	app.use(bodyParser.urlencoded(
		{extended: true, limit: '50mb'}
	));

	app.use(bodyParser.json(
		{limit: '50mb'}
	));

	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		})
	}));

	function translateToString(input){
		var result="";
		input.forEach(function(item){
			result = result.concat(',').concat(item.name);
		});
		return result.slice(1);
	}

	app.get('/mongodata', function(req, res){
        console.log('Request Successful');
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);

        var skip = parseInt(req._parsedUrl.query.split('&')[3]);

        var url_parts =  requestUrl.parse(req.url, true);
        var query = url_parts.query;

        var dataVersion = req.query.dataVersion;

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection(query.collectionName);

                if(query.dataVersion && query.subject){
                    collection.find({DataVersion: query.dataVersion,
                        Subject: query.subject
                    }).limit(500).skip(skip).toArray(function(err, docs) {
                        //console.log(docs);
                        res.json(docs);
                        assert.equal(null, err);
                        //db.close();
                    });
                }

                //if(query.dataVersion && query.subject){
                //    collection.find({DataVersion: query.dataVersion,
                //        Subject: query.subject
                //    }).toArray(function(err, docs) {
                //        //console.log(docs);
                //        res.json(docs);
                //        assert.equal(null, err);
                //        //db.close();
                //    });
                //}

                //if(query.dataVersion){
                //	collection.find({DataVersion: query.dataVersion
                //	}).limit(500).skip(skip).toArray(function(err, docs) {
                //		//console.log(docs);
                //		res.json(docs);
                //		assert.equal(null, err);
                //		//db.close();
                //	});
                //}

                //if(query.subject){
                //	collection.find({Subject: query.subject
                //	}).toArray(function(err, docs) {
                //		//console.log(docs);
                //		res.json(docs);
                //		assert.equal(null, err);
                //		//db.close();
                //	});
                //}
            }
        });
    });

    app.get('/gambi_salesforce_data', function(req, res){
        console.log('Request Successful');
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);

        var skip = parseInt(req._parsedUrl.query.split('&')[3]);

        var url_parts =  requestUrl.parse(req.url, true);
        var query = url_parts.query;

        var dataVersion = req.query.dataVersion;

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('SalesforceData');

                if(query.Subject){
                    var endResult = [];
                    collection.find({Subject: query.Subject
                    }).toArray(function(err, docs) {
                        docs.forEach(function(doc){
                            if(doc.DataCenters){
                                var dataCenters = [];
                                doc.DataCenters.forEach(function(dc){
                                    dc.CSCOpportunityId = doc.CSCOpportunityId;
                                    dc.OpportunityName = doc.OpportunityName;
                                    dc.AccountName = doc.AccountName;
                                    dc.OpportunityOwner = doc.OpportunityOwner;
                                    dc.Stage = doc.Stage;
                                    dc.Industry = doc.Industry;
                                    dc.ACV = doc.ACV;
                                    dc.RevenueStartDate = doc.RevenueStartDate;
                                    dc.RevenueTerm = doc.RevenueTerm;
                                    dc.ProbabilityPct = doc.ProbabilityPct;
                                    dc.DealRegion = doc.DealRegion;
                                    dc.DocumentAuthor = doc.DocumentAuthor;
                                    dc.TabName = doc.TabName;
                                    dc.SubjectCategory = doc.SubjectCategory;
                                    dc.Subject = doc.Subject;
                                    dc.DateDocumentProduced = doc.DateDocumentProduced;
                                    dc.DateDocumentReceived = doc.DateDocumentReceived;
                                    dc.DocumentSubmitter = doc.DocumentSubmitter;
                                    dc.DocumentReviewer = doc.DocumentReviewer;
                                    dc.OriginalSource = doc.OriginalSource;
                                    dc.DataVersion = doc.DataVersion;
                                    dc.DataFields = doc.DataFields;
                                    dataCenters.push(dc);
                                    endResult.push(dc);
                                });
                            }
                        });
                        res.json(endResult);
                        assert.equal(null, err);
                        //db.close();
                    });
                }

            }
        });
    });

    app.get('/distinct_subject', function(req, res){
        console.log('Request Successful');
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);

        var skip = parseInt(req._parsedUrl.query.split('&')[2]);

        var url_parts =  requestUrl.parse(req.url, true);
        var query = url_parts.query;

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection(req._parsedUrl.query);

                    collection.distinct('Subject'
                    ,function(err, docs) {
                        //console.log(docs);
                        res.json(docs);
                        assert.equal(null, err);
                        db.close();
                    });
            }
        });
    });

    app.get('/opportunities', function(req,res){
        var url_parts = requestUrl.parse(req.url, true);
        var query = url_parts.query;
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('SalesforceData');

                var opportunityDetail = {};

                collection.find({CSCOpportunityID: query.opportunityId},
                    function(err, docs) {
                        var opportunityDetail = {};
                        docs.forEach(function(doc){
                            for(var prop in doc){
                                console.log('opportunity prop name: ' + prop);
                                console.log('prop value is  : ' + doc[prop]);
                                if(prop === 'OpportunityNmae' || prop === 'AccountName'){
                                    opportunityDetail.CSCOpportunityID = doc['CSCOpportunityID'];
                                    opportunityDetail.OpportunityName = doc['OpportunityName'];
                                    opportunityDetail.AccountName = doc['AccountName'];
                                    opportunityDetail.OpportunityOwner = doc['OpportunityOwner'];
                                    opportunityDetail.SolutionExecutiveName = doc['SolutionExecutiveName'];
                                    opportunityDetail.SolutionArchitectName = doc['SolutionArchitectName'];
                                    opportunityDetail.NoDcInTheDeal = doc['NoDcInTheDeal'];

                                    opportunityDetail.kwFY16 = doc['kwFY16'];
                                    opportunityDetail.kwFY17 = doc['kwFY17'];
                                    opportunityDetail.kwFY18 = doc['kwFY18'];
                                    opportunityDetail.kwFY19 = doc['kwFY19'];
                                    opportunityDetail.kwFY20 = doc['kwFY20'];
                                    opportunityDetail.kwFY21 = doc['kwFY21'];
                                    opportunityDetail.kwFY22 = doc['kwFY22'];
                                    opportunityDetail.kwFY23 = doc['kwFY23'];
                                    opportunityDetail.kwFY24 = doc['kwFY24'];
                                    opportunityDetail.kwFY25 = doc['kwFY25'];

                                    opportunityDetail.cbFY16 = doc['cbFY16'];
                                    opportunityDetail.cbFY17 = doc['cbFY17'];
                                    opportunityDetail.cbFY18 = doc['cbFY18'];
                                    opportunityDetail.cbFY19 = doc['cbFY19'];
                                    opportunityDetail.cbFY20 = doc['cbFY20'];
                                    opportunityDetail.cbFY21 = doc['cbFY21'];
                                    opportunityDetail.cbFY22 = doc['cbFY22'];
                                    opportunityDetail.cbFY23 = doc['cbFY23'];
                                    opportunityDetail.cbFY24 = doc['cbFY24'];
                                    opportunityDetail.cbFY25 = doc['cbFY25'];

                                    opportunityDetail.DCCountry = doc['DCCountry'];
                                    opportunityDetail.DCSiteCode = doc['DCSiteCode'];
                                    opportunityDetail.DCSKU = doc['DCSKU'];

                                    res.json(opportunityDetail);
                                    assert.equal(null, err);
                                }
                            }
                        });
                    });
            }
        });
    });

    app.get('/users', function(req,res){
        MongoClient.connect(url, function (err, db) {
            var users = [];

            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                var collection = db.collection('users');
                collection.find({}).toArray(function(err, docs) {
                    docs.forEach(function(user){
                        var roles;
                        user.roles.forEach(function(role){

                            if(roles !== undefined){
                                roles = roles + ',' + role;
                            }
                            else {
                                roles = role;
                            }

                        });
                        users.push(
                            {
                                FirstName:user.firstName,
                                LastName:user.lastName,
                                DisplayName:user.displayName,
                                Email:user.email,
                                Roles:roles
                            }
                        );
                    });
                    res.json(users);
                });


            }
        });
    });

    app.get('/roles', function(req,res){
        MongoClient.connect(url, function (err, db) {
            var users = [];

            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                var collection = db.collection('roles');
                collection.find({},{_id:0}).toArray(function(err, docs) {
                    res.json(docs);
                });


            }
        });
    });

    app.get('/access_requests_listing', function(req,res){
        console.log('access requests listing is being requested');
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                var collection = db.collection('AccessRequests');
                collection.find({},{_id:0}).toArray(function(err, docs) {
                    res.json(docs);
                });


            }
        });
    });

    app.get('/new_functionality_requests_listing', function(req,res){
        console.log('access requests listing is being requested');
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                var collection = db.collection('NewFunctionalityRequests');
                collection.find({},{_id:0}).toArray(function(err, docs) {
                    res.json(docs);
                });


            }
        });
    });

    app.get('/opportunity_ids', function(req, res){
        console.log('opportunity_idsRequest Successful');
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);

        var url_parts = requestUrl.parse(req.url, true);
        var query = url_parts.query;

        var dataVersion = req.query.dataVersion;

        var user = req.user;

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                var collection = db.collection('users');
                collection.find({}).toArray(function(err, docs) {
                    docs.forEach(function(user){
                        //console.log('user id:  ' + user._id.toString());
                        if(user._id.toString() === req.session.passport.user){
                            console.log('found our current user:  ' + user.username);
                            var isAdmin = user.roles.indexOf('admin');

                            if(isAdmin > 0){
                                var collection = db.collection('SalesforceData');

                                collection.distinct('CSCOpportunityID',
                                    (function(err, docs) {
                                        //console.log(docs);
                                        var idList = [];
                                        docs.forEach(function(doc){
                                            idList.push({name: doc});
                                        });
                                        res.json(idList);
                                        assert.equal(null, err);
                                        db.close();
                                    }));
                            }
                            else {
                                var collection = db.collection('SalesforceData');

                                collection.distinct('CSCOpportunityID', {OpportunityOwner: user.username},
                                    (function(err, docs) {
                                        //console.log(docs);
                                        var idList = [];
                                        docs.forEach(function(doc){
                                            idList.push({name: doc});
                                        });
                                        res.json(idList);
                                        assert.equal(null, err);
                                        db.close();
                                    }));
                            }


                        }
                    });

                });
            }
        });
    });

	app.get('/environment', function(req, res){

		var env = process.env.NODE_ENV;

		console.log('OUR ENVIRONMENT IS:  ' + env);

		res.send({environment: env});
	});

	app.get('/collections_metadata', function(req, res){
		console.log('Request Successful');
		console.log('_parsedUrl.query:  ' + req._parsedUrl.query);

		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				console.log('Connection established to', url);

				var collection = db.collection('collections_metadata');

				collection.find({collectionName: req._parsedUrl.query}).toArray(function(err, docs) {
					//console.log(docs);
					res.json(docs);
					assert.equal(null, err);
					db.close();
				});

			}
		});
	});

	app.post('/collections_metadata', function(req, res){
		console.log('Request Successful');
		console.log('_parsedUrl.query:  ' + req._parsedUrl.query);

		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				console.log('Connection established to', url);

				//re-calculate the distinct value of 'DataFialds':

				var distinctDataFields;

				var collection = db.collection('Fixed_Asset_Register');

				collection.distinct('DataFields',function(err, docs){
					console.log('Distinct Data Fields:  ' + docs);
					distinctDataFields = docs;
					assert.equal(null, err);
				});

			}
		});
	});

    app.get('/playcards_dc_list', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('PlaycardsData');

                collection.find().toArray(function(err, docs) {
                    //console.log(docs);
                    res.json(docs);
                    assert.equal(null, err);
                    db.close();
                });
            }
        });
    });

    app.get('/salesforce_dc_data', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);
        var query = req._parsedUrl.query.split("&");
        var opportunityId = query[0].split("=")[1];
        var dcName = query[1].split("=")[1];
        var p = 0;
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('SalesforceData');

                collection.find({CSCOpportunityID:opportunityId}).toArray(function(err, docs) {
                    if(dcName.indexOf('%20') !== -1){
                        dcName = dcName.replace(/%20/g,' ')
                    }
                    docs.forEach(function(doc){
                        if(doc.DataCenters){
                            if(doc.DataCenters.length > 0){
                                var match = false;
                                doc.DataCenters.forEach(function(dc){
                                    if(dc.DataCenterName === dcName){
                                        match = true;
                                        res.json(dc);
                                    }
                                });

                                if(!match){
                                    res.send("no-match");
                                }
                            }
                        }
                        else {
                            res.send("no-match");
                        }
                    });

                    assert.equal(null, err);
                    db.close();
                });
            }
        });
    });

    app.get('/dc_data', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);
        var query = req._parsedUrl.query.split("&");
        var opportunityId = query[0].split("=")[1];
        var dcName = query[1].split("=")[1];
        var p = 0;
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('SalesforceData');

                collection.find({CSCOpportunityID:opportunityId}).toArray(function(err, docs) {
                    if(dcName.indexOf('%20') !== -1){
                        dcName = dcName.replace(/%20/g,' ')
                    }
                    docs.forEach(function(doc){
                        if(doc.DataCenters){
                            if(doc.DataCenters.length > 0){
                                var match = false;
                                doc.DataCenters.forEach(function(dc){
                                    if(dc.DataCenterName === dcName){
                                        match = true;
                                        res.json(dc);
                                    }
                                });

                                if(!match){
                                    res.send("no-match");
                                }
                            }
                        }
                        else {
                            res.send("no-match");
                        }
                    });

                    assert.equal(null, err);
                    db.close();
                });
            }
        });
    });

    app.get('/playcards_data', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);
        var dcName = req._parsedUrl.query.split("=");
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('PlaycardsData');

                var name = dcName[1].replace(/%20/g,' ');

                collection.find({DataCenterName:name}).toArray(function(err, docs) {
                    //console.log(docs);
                    res.json(docs);
                    assert.equal(null, err);
                    db.close();
                });
            }
        });
    });

    app.get('/internal_dc_demand_data', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('InternalDcDemand');

                collection.find({}).toArray(function(err, docs) {
                    res.json(docs);
                    assert.equal(null, err);
                    db.close();
                });
            }
        });
    });

    app.get('/internal_dc_demand_detail', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);
        var requestTitle = req._parsedUrl.query.split('=')[1];
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('InternalDcDemand');

                collection.find({RequestTitle: requestTitle.replace(/%20/g,' ') }).toArray(function(err, docs) {
                    res.json(docs);
                    assert.equal(null, err);
                    db.close();
                });
            }
        });
    });

    app.get('/dc_inventory', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('DcInventory');

                collection.find({}).toArray(function(err, docs) {

                    var dcRecords = [];

                    docs.forEach(function (doc) {
                        dcRecords.push({
                            DataCenterName: doc.DataCenterName,
                            DcSiteCode: doc.DcSiteCode,
                            DcAddress: doc.DcAddress,
                            DcRegion: doc.DcRegion,
                            DcCountry: doc.DcCountry
                        });
                    });
                    res.json(dcRecords);
                    assert.equal(null, err);
                    db.close();
                });
            }
        });
    });

    app.get('/salesforce_quote', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);
        var file = fs.createReadStream('public/modules/datacollectors/' + req._parsedUrl.query.split('=')[1]);
        var stat = fs.statSync('public/modules/datacollectors/' + req._parsedUrl.query.split('=')[1]);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
        file.pipe(res);
    });

    app.get('/internal_dc_quote', function(req, res){
        console.log('_parsedUrl.query:  ' + req._parsedUrl.query);
        var file = fs.createReadStream('public/modules/datacollectors/' + req._parsedUrl.query.split('=')[1]);
        var stat = fs.statSync('public/modules/datacollectors/' + req._parsedUrl.query.split('=')[1]);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
        file.pipe(res);
    });

    app.post('/salesforce_update', function(req, res){
        console.log('Salesforce DC update Request Received');
        console.log('request body:  ' + req.body);

            var kWLeased2016 = Math.round(((Number(req.body.kwRequired_2016) * 185) * 12));
            var kWLeased2017 = Math.round(((Number(req.body.kwRequired_2017) * 185) * 12));
            var kWLeased2018 = Math.round(((Number(req.body.kwRequired_2018) * 185) * 12));
            var kWLeased2019 = Math.round(((Number(req.body.kwRequired_2019) * 185) * 12));
            var kWLeased2020 = Math.round(((Number(req.body.kwRequired_2020) * 185) * 12));
            var kWLeased2021 = Math.round(((Number(req.body.kwRequired_2021) * 185) * 12));
            var kWLeased2022 = Math.round(((Number(req.body.kwRequired_2022) * 185) * 12));
            var kWLeased2023 = Math.round(((Number(req.body.kwRequired_2023) * 185) * 12));
            var kWLeased2024 = Math.round(((Number(req.body.kwRequired_2024) * 185) * 12));
            var kWLeased2025 =  Math.round(((Number(req.body.kwRequired_2025) * 185) * 12));

            var electricBudget2016 = Math.round((((Number(req.body.kwRequired_2016) * 720) * 12) * 0.09));
            var electricBudget2017 = Math.round((((Number(req.body.kwRequired_2017) * 720) * 12) * 0.09));
            var electricBudget2018 = Math.round((((Number(req.body.kwRequired_2018) * 720) * 12) * 0.09));
            var electricBudget2019 = Math.round((((Number(req.body.kwRequired_2019) * 720) * 12) * 0.09));
            var electricBudget2020 = Math.round((((Number(req.body.kwRequired_2020) * 720) * 12) * 0.09));
            var electricBudget2021 = Math.round((((Number(req.body.kwRequired_2021) * 720) * 12) * 0.09));
            var electricBudget2022 = Math.round((((Number(req.body.kwRequired_2022) * 720) * 12) * 0.09));
            var electricBudget2023 = Math.round((((Number(req.body.kwRequired_2023) * 720) * 12) * 0.09));
            var electricBudget2024 = Math.round((((Number(req.body.kwRequired_2024) * 720) * 12) * 0.09));
            var electricBudget2025 = Math.round((((Number(req.body.kwRequired_2025) * 720) * 12) * 0.09));

        var httpResponse = res;

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                var collection = db.collection('SalesforceData');
                var matchingRecords;

                var userName;
                var dcRegion;
                var userCollection = db.collection('users');
                userCollection.find({_id: ObjectID(req.session.passport.user)}).toArray(function(err, docs) {
                    userName = docs[0].username;
                });

                var dcInventoryCollection = db.collection('DcInventory');

                dcInventoryCollection.find({DcCountry: req.body.dcCountry}).toArray(function(err, docs) {
                    dcRegion = docs[0].DcRegion;
                });

                collection.update(
                    {
                        CSCOpportunityID: req.body.opportunityId
                    },
                    {$set:
                    {
                        OpportunityName: req.body.opportunityName,
                        AccountName: req.body.accountName,
                        OpportunityOwner: req.body.opportunityOwner,
                        SolutionExecutiveName: req.body.solutionExecutiveName,
                        SolutionArchitectName: req.body.solutionArchitectName,
                        NoDcInTheDeal: req.body.noDcInTheDeal
                    }

                    },
                    {upsert:true},

                    function(err, result){
                        if(err){
                            console.log('err:  ' + err);
                        }
                        else{
                            console.log('update result:  ' + result);
                        }
                    });

                collection.find(
                    {
                        CSCOpportunityID:  req.body.opportunityId,
                        "DataCenters.DataCenterName": req.body.dcName
                    }
                ).toArray(function(err, docs) {
                        if(err){
                            console.log('err: ' + err);
                        }
                        //console.log(docs);
                        //res.json(docs);
                        assert.equal(null, err);
                        if(docs.length === 0){
                            var m = 0;
                            collection.update(
                                {
                                    CSCOpportunityID: req.body.opportunityId
                                },
                                {
                                    $addToSet:

                                    {
                                        DataCenters:
                                        {
                                            "DataCenterName": req.body.dcName,
                                            "DCCountry": req.body.dcCountry,
                                            "DCSiteCode": req.body.dcSiteCode,
                                            "DCSKU": req.body.dcSku,

                                            "kwFY16": req.body.kwRequired_2016,
                                            "kwFY17": req.body.kwRequired_2017,
                                            "kwFY18": req.body.kwRequired_2018,
                                            "kwFY19": req.body.kwRequired_2019,
                                            "kwFY20": req.body.kwRequired_2020,
                                            "kwFY21": req.body.kwRequired_2021,
                                            "kwFY22": req.body.kwRequired_2022,
                                            "kwFY23": req.body.kwRequired_2023,
                                            "kwFY24": req.body.kwRequired_2024,
                                            "kwFY25": req.body.kwRequired_2025,

                                            "cbFY16": req.body.cbRequired_2016,
                                            "cbFY17": req.body.cbRequired_2017,
                                            "cbFY18": req.body.cbRequired_2018,
                                            "cbFY19": req.body.cbRequired_2019,
                                            "cbFY20": req.body.cbRequired_2020,
                                            "cbFY21": req.body.cbRequired_2021,
                                            "cbFY22": req.body.cbRequired_2022,
                                            "cbFY23": req.body.cbRequired_2023,
                                            "cbFY24": req.body.cbRequired_2024,
                                            "cbFY25": req.body.cbRequired_2025,

                                            cloudCompute:   req.body.cloudCompute,
                                            bizCloudHc: req.body.bizCloudHc,
                                            bizCloud:   req.body.bizCloud,
                                            storageAsAService:  req.body.storageAsAService,
                                            mainframe:  req.body.mainframe,
                                            unixFarm:   req.body.unixFarm,
                                            windowsFarm: req.body.windowsFarm,
                                            as400:  req.body.as400,
                                            myWorkstyle: req.body.myWorkstyle,
                                            cyber:  req.body.cyber,
                                            serviceManagement: req.body.serviceManagement,
                                            lan:    req.body.lan,
                                            wan:    req.body.wan
                                        }
                                    }
                                },
                                function(err, result){
                                    if(err){
                                        console.log('err:  ' + err);
                                    }
                                    else{
                                        console.log('update result:  ' + result);
                                        var fileName = 'quote_' + Math.random() + '.pdf';
                                        var html = fs.readFileSync('public/modules/datacollectors/template.html', 'utf8');

                                        var tmpl = swig.compileFile('public/modules/datacollectors/template.html'),
                                            renderedHtml = tmpl({
                                                DcName: req.body.dcName,
                                                DcRegion: dcRegion,
                                                DcCountry: req.body.dcCountry,
                                                DcSiteCode: req.body.dcSiteCode,
                                                OpportunityId:  req.body.opportunityId,
                                                userName:  userName,
                                                quoteDate:    format('MM/dd/yyyy', new Date()),
                                                kWLeased2016: Math.round(((Number(req.body.kwRequired_2016) * 185) * 12)),
                                                kWLeased2017: Math.round(((Number(req.body.kwRequired_2017) * 185) * 12)),
                                                kWLeased2018: Math.round(((Number(req.body.kwRequired_2018) * 185) * 12)),
                                                kWLeased2019: Math.round(((Number(req.body.kwRequired_2019) * 185) * 12)),
                                                kWLeased2020: Math.round(((Number(req.body.kwRequired_2020) * 185) * 12)),
                                                kWLeased2021: Math.round(((Number(req.body.kwRequired_2021) * 185) * 12)),
                                                kWLeased2022: Math.round(((Number(req.body.kwRequired_2022) * 185) * 12)),
                                                kWLeased2023: Math.round(((Number(req.body.kwRequired_2023) * 185) * 12)),
                                                kWLeased2024: Math.round(((Number(req.body.kwRequired_2024) * 185) * 12)),
                                                kWLeased2025: Math.round(((Number(req.body.kwRequired_2025) * 185) * 12)),

                                                electricBudget2016: Math.round((((Number(req.body.kwRequired_2016) * 720) * 12) * 0.09)),
                                                electricBudget2017: Math.round((((Number(req.body.kwRequired_2017) * 720) * 12) * 0.09)),
                                                electricBudget2018: Math.round((((Number(req.body.kwRequired_2018) * 720) * 12) * 0.09)),
                                                electricBudget2019: Math.round((((Number(req.body.kwRequired_2019) * 720) * 12) * 0.09)),
                                                electricBudget2020: Math.round((((Number(req.body.kwRequired_2020) * 720) * 12) * 0.09)),
                                                electricBudget2021: Math.round((((Number(req.body.kwRequired_2021) * 720) * 12) * 0.09)),
                                                electricBudget2022: Math.round((((Number(req.body.kwRequired_2022) * 720) * 12) * 0.09)),
                                                electricBudget2023: Math.round((((Number(req.body.kwRequired_2023) * 720) * 12) * 0.09)),
                                                electricBudget2024: Math.round((((Number(req.body.kwRequired_2024) * 720) * 12) * 0.09)),
                                                electricBudget2025: Math.round((((Number(req.body.kwRequired_2025) * 720) * 12) * 0.09)),

                                                kWlTotal: (kWLeased2016 + kWLeased2017 + kWLeased2018 + kWLeased2019 + kWLeased2020 + kWLeased2021 + kWLeased2022 + kWLeased2023
                                                + kWLeased2024 + kWLeased2025),
                                                electricalBudgetTotal: (electricBudget2016 + electricBudget2017 + electricBudget2017 + electricBudget2019 + electricBudget2020
                                                + electricBudget2021 + electricBudget2022 + electricBudget2023 + electricBudget2024 + electricBudget2025)
                                            });



                                        var options = { filename: 'public/modules/datacollectors/' + fileName, format: 'Letter',orientation: 'landscape' };
                                        pdf.create(renderedHtml, options).toFile(function(err, res) {
                                            if (err){
                                                console.log(res);
                                                httpResponse.send(500);
                                            }
                                            else {
                                                httpResponse.send(201,fileName);
                                            }
                                        });
                                    }
                                });
                        }
                        else {
                            var p = 0;
                            collection.update(
                                {
                                    CSCOpportunityID:  req.body.opportunityId,
                                    "DataCenters.DataCenterName": req.body.dcName
                                },
                                {$set:
                                {
                                    "DataCenters.$.kwFY16": req.body.kwRequired_2016,
                                    "DataCenters.$.kwFY17": req.body.kwRequired_2017,
                                    "DataCenters.$.kwFY18": req.body.kwRequired_2018,
                                    "DataCenters.$.kwFY19": req.body.kwRequired_2019,
                                    "DataCenters.$.kwFY20": req.body.kwRequired_2020,
                                    "DataCenters.$.kwFY21": req.body.kwRequired_2021,
                                    "DataCenters.$.kwFY22": req.body.kwRequired_2022,
                                    "DataCenters.$.kwFY23": req.body.kwRequired_2023,
                                    "DataCenters.$.kwFY24": req.body.kwRequired_2024,
                                    "DataCenters.$.kwFY25": req.body.kwRequired_2025,

                                    "DataCenters.$.cbFY16": req.body.cbRequired_2016,
                                    "DataCenters.$.cbFY17": req.body.cbRequired_2017,
                                    "DataCenters.$.cbFY18": req.body.cbRequired_2018,
                                    "DataCenters.$.cbFY19": req.body.cbRequired_2019,
                                    "DataCenters.$.cbFY20": req.body.cbRequired_2020,
                                    "DataCenters.$.cbFY21": req.body.cbRequired_2021,
                                    "DataCenters.$.cbFY22": req.body.cbRequired_2022,
                                    "DataCenters.$.cbFY23": req.body.cbRequired_2023,
                                    "DataCenters.$.cbFY24": req.body.cbRequired_2024,
                                    "DataCenters.$.cbFY25": req.body.cbRequired_2025,

                                    "DataCenters.$.DCCountry": req.body.dcCountry,
                                    "DataCenters.$.DCSiteCode": req.body.dcSiteCode,
                                    "DataCenters.$.DCSKU": req.body.dcSku,

                                    "DataCenters.$.cloudCompute":   req.body.cloudCompute,
                                    "DataCenters.$.bizCloudHc": req.body.bizCloudHc,
                                    "DataCenters.$.bizCloud":   req.body.bizCloud,
                                    "DataCenters.$.storageAsAService":  req.body.storageAsAService,
                                    "DataCenters.$.mainframe":  req.body.mainframe,
                                    "DataCenters.$.unixFarm":   req.body.unixFarm,
                                    "DataCenters.$.windowsFarm": req.body.windowsFarm,
                                    "DataCenters.$.as400":  req.body.as400,
                                    "DataCenters.$.myWorkstyle": req.body.myWorkstyle,
                                    "DataCenters.$.cyber":  req.body.cyber,
                                    "DataCenters.$.serviceManagement": req.body.serviceManagement,
                                    "DataCenters.$.lan":    req.body.lan,
                                    "DataCenters.$.wan":    req.body.wan
                                }

                                },
                                {upsert:true},
                                function(err, result){
                                    if(err){
                                        console.log('err:  ' + err);
                                    }
                                    else{
                                        console.log('update result:  ' + result);

                                        var fileName = 'quote_' + Math.random() + '.pdf';
                                        var html = fs.readFileSync('public/modules/datacollectors/template.html', 'utf8');
                                        var tmpl = swig.compileFile('public/modules/datacollectors/template.html'),
                                            renderedHtml = tmpl({
                                                DcName: req.body.dcName,
                                                DcRegion: dcRegion,
                                                DcCountry: req.body.dcCountry,
                                                DcSiteCode: req.body.dcSiteCode,
                                                OpportunityId:  req.body.opportunityId,
                                                userName:  userName,
                                                quoteDate:    format('MM/dd/yyyy', new Date()),
                                                kWLeased2016: Math.round(((Number(req.body.kwRequired_2016) * 185) * 12)),
                                                kWLeased2017: Math.round(((Number(req.body.kwRequired_2017) * 185) * 12)),
                                                kWLeased2018: Math.round(((Number(req.body.kwRequired_2018) * 185) * 12)),
                                                kWLeased2019: Math.round(((Number(req.body.kwRequired_2019) * 185) * 12)),
                                                kWLeased2020: Math.round(((Number(req.body.kwRequired_2020) * 185) * 12)),
                                                kWLeased2021: Math.round(((Number(req.body.kwRequired_2021) * 185) * 12)),
                                                kWLeased2022: Math.round(((Number(req.body.kwRequired_2022) * 185) * 12)),
                                                kWLeased2023: Math.round(((Number(req.body.kwRequired_2023) * 185) * 12)),
                                                kWLeased2024: Math.round(((Number(req.body.kwRequired_2024) * 185) * 12)),
                                                kWLeased2025: Math.round(((Number(req.body.kwRequired_2025) * 185) * 12)),

                                                electricBudget2016: Math.round((((Number(req.body.kwRequired_2016) * 720) * 12) * 0.09)),
                                                electricBudget2017: Math.round((((Number(req.body.kwRequired_2017) * 720) * 12) * 0.09)),
                                                electricBudget2018: Math.round((((Number(req.body.kwRequired_2018) * 720) * 12) * 0.09)),
                                                electricBudget2019: Math.round((((Number(req.body.kwRequired_2019) * 720) * 12) * 0.09)),
                                                electricBudget2020: Math.round((((Number(req.body.kwRequired_2020) * 720) * 12) * 0.09)),
                                                electricBudget2021: Math.round((((Number(req.body.kwRequired_2021) * 720) * 12) * 0.09)),
                                                electricBudget2022: Math.round((((Number(req.body.kwRequired_2022) * 720) * 12) * 0.09)),
                                                electricBudget2023: Math.round((((Number(req.body.kwRequired_2023) * 720) * 12) * 0.09)),
                                                electricBudget2024: Math.round((((Number(req.body.kwRequired_2024) * 720) * 12) * 0.09)),
                                                electricBudget2025: Math.round((((Number(req.body.kwRequired_2025) * 720) * 12) * 0.09)),

                                                kWlTotal: (kWLeased2016 + kWLeased2017 + kWLeased2018 + kWLeased2019 + kWLeased2020 + kWLeased2021 + kWLeased2022 + kWLeased2023
                                                + kWLeased2024 + kWLeased2025),
                                                electricalBudgetTotal: (electricBudget2016 + electricBudget2017 + electricBudget2017 + electricBudget2019 + electricBudget2020
                                                + electricBudget2021 + electricBudget2022 + electricBudget2023 + electricBudget2024 + electricBudget2025)
                                            });
                                        var options = { filename: 'public/modules/datacollectors/' + fileName, format: 'Letter',orientation: 'landscape' };
                                        pdf.create(renderedHtml, options).toFile(function(err, res) {
                                            if (err){
                                                console.log(res);
                                                httpResponse.send(500);
                                            }
                                            else {
                                                httpResponse.send(201,fileName);
                                            }
                                        });
                                    }
                                });
                        }
                        //db.close();
                    });
            }
        });
    });

    app.post('/internal_dc_demand_update', function(req, res){
        console.log('Internal DC request update Received');
        console.log('request body:  ' + req.body);

        var httpResponse = res;

        var kWLeased2016 = Math.round(((Number(req.body.kwRequired_2016) * 185) * 12));
        var kWLeased2017 = Math.round(((Number(req.body.kwRequired_2017) * 185) * 12));
        var kWLeased2018 = Math.round(((Number(req.body.kwRequired_2018) * 185) * 12));
        var kWLeased2019 = Math.round(((Number(req.body.kwRequired_2019) * 185) * 12));
        var kWLeased2020 = Math.round(((Number(req.body.kwRequired_2020) * 185) * 12));
        var kWLeased2021 = Math.round(((Number(req.body.kwRequired_2021) * 185) * 12));
        var kWLeased2022 = Math.round(((Number(req.body.kwRequired_2022) * 185) * 12));
        var kWLeased2023 = Math.round(((Number(req.body.kwRequired_2023) * 185) * 12));
        var kWLeased2024 = Math.round(((Number(req.body.kwRequired_2024) * 185) * 12));
        var kWLeased2025 =  Math.round(((Number(req.body.kwRequired_2025) * 185) * 12));

        var electricBudget2016 = Math.round((((Number(req.body.kwRequired_2016) * 720) * 12) * 0.09));
        var electricBudget2017 = Math.round((((Number(req.body.kwRequired_2017) * 720) * 12) * 0.09));
        var electricBudget2018 = Math.round((((Number(req.body.kwRequired_2018) * 720) * 12) * 0.09));
        var electricBudget2019 = Math.round((((Number(req.body.kwRequired_2019) * 720) * 12) * 0.09));
        var electricBudget2020 = Math.round((((Number(req.body.kwRequired_2020) * 720) * 12) * 0.09));
        var electricBudget2021 = Math.round((((Number(req.body.kwRequired_2021) * 720) * 12) * 0.09));
        var electricBudget2022 = Math.round((((Number(req.body.kwRequired_2022) * 720) * 12) * 0.09));
        var electricBudget2023 = Math.round((((Number(req.body.kwRequired_2023) * 720) * 12) * 0.09));
        var electricBudget2024 = Math.round((((Number(req.body.kwRequired_2024) * 720) * 12) * 0.09));
        var electricBudget2025 = Math.round((((Number(req.body.kwRequired_2025) * 720) * 12) * 0.09));

        ///////////////Update Finished Handler

        var internalDcDemandUpdateFinishedHandler = function internalDcDemandUpdateFinished() {
            console.log('internal Dc Demand Update Finished');
            var fileName = 'quote_' + Math.random() + '.pdf';
            var html = fs.readFileSync('public/modules/datacollectors/template.html', 'utf8');

            var tmpl = swig.compileFile('public/modules/datacollectors/template.html'),
                renderedHtml = tmpl({
                    DcName: req.body.dcName,
                    DcCountry: req.body.dcCountry,
                    DcSiteCode: req.body.dcSiteCode,
                    OpportunityId:  req.body.opportunityId,
                    OpportunityName:  req.body.opportunityName,
                    AccountName:    req.body.accountName,
                    kWLeased2016: Math.round(((Number(req.body.kwRequired_2016) * 185) * 12)),
                    kWLeased2017: Math.round(((Number(req.body.kwRequired_2017) * 185) * 12)),
                    kWLeased2018: Math.round(((Number(req.body.kwRequired_2018) * 185) * 12)),
                    kWLeased2019: Math.round(((Number(req.body.kwRequired_2019) * 185) * 12)),
                    kWLeased2020: Math.round(((Number(req.body.kwRequired_2020) * 185) * 12)),
                    kWLeased2021: Math.round(((Number(req.body.kwRequired_2021) * 185) * 12)),
                    kWLeased2022: Math.round(((Number(req.body.kwRequired_2022) * 185) * 12)),
                    kWLeased2023: Math.round(((Number(req.body.kwRequired_2023) * 185) * 12)),
                    kWLeased2024: Math.round(((Number(req.body.kwRequired_2024) * 185) * 12)),
                    kWLeased2025: Math.round(((Number(req.body.kwRequired_2025) * 185) * 12)),

                    electricBudget2016: Math.round((((Number(req.body.kwRequired_2016) * 720) * 12) * 0.09)),
                    electricBudget2017: Math.round((((Number(req.body.kwRequired_2017) * 720) * 12) * 0.09)),
                    electricBudget2018: Math.round((((Number(req.body.kwRequired_2018) * 720) * 12) * 0.09)),
                    electricBudget2019: Math.round((((Number(req.body.kwRequired_2019) * 720) * 12) * 0.09)),
                    electricBudget2020: Math.round((((Number(req.body.kwRequired_2020) * 720) * 12) * 0.09)),
                    electricBudget2021: Math.round((((Number(req.body.kwRequired_2021) * 720) * 12) * 0.09)),
                    electricBudget2022: Math.round((((Number(req.body.kwRequired_2022) * 720) * 12) * 0.09)),
                    electricBudget2023: Math.round((((Number(req.body.kwRequired_2023) * 720) * 12) * 0.09)),
                    electricBudget2024: Math.round((((Number(req.body.kwRequired_2024) * 720) * 12) * 0.09)),
                    electricBudget2025: Math.round((((Number(req.body.kwRequired_2025) * 720) * 12) * 0.09)),

                    kWlTotal: (kWLeased2016 + kWLeased2017 + kWLeased2018 + kWLeased2019 + kWLeased2020 + kWLeased2021 + kWLeased2022 + kWLeased2023
                    + kWLeased2024 + kWLeased2025),
                    electricalBudgetTotal: (electricBudget2016 + electricBudget2017 + electricBudget2017 + electricBudget2019 + electricBudget2020
                    + electricBudget2021 + electricBudget2022 + electricBudget2023 + electricBudget2024 + electricBudget2025)
                });

            var options = { filename: 'public/modules/datacollectors/' + fileName, format: 'Letter' };
            pdf.create(renderedHtml, options).toFile(function(err, res) {
                if (err){
                    return console.log(err);
                    //console.log(res);
                }
                else {
                    httpResponse.send(201,fileName);
                }
            });

        };

        eventEmitter.on('internalDcDemandUpdateFinishedEvent', internalDcDemandUpdateFinishedHandler);

        /////////////// End of Update Finished Handler ////////

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                var collection = db.collection('InternalDcDemand');
                var matchingRecords;

                collection.update(
                    {
                        RequestTitle: req.body.requestTitle
                    },
                    {$set:
                    {
                        RequestDescription: req.body.requestDescription,
                        RequestorName: req.body.requestorName,

                        "DataCenterName": req.body.dcName,
                        "DCCountry": req.body.dcCountry,
                        "DCSiteCode": req.body.dcSiteCode,
                        "DCSKU": req.body.dcSku,

                        "kwFY16": req.body.kwRequired_2016,
                        "kwFY17": req.body.kwRequired_2017,
                        "kwFY18": req.body.kwRequired_2018,
                        "kwFY19": req.body.kwRequired_2019,
                        "kwFY20": req.body.kwRequired_2020,
                        "kwFY21": req.body.kwRequired_2021,
                        "kwFY22": req.body.kwRequired_2022,
                        "kwFY23": req.body.kwRequired_2023,
                        "kwFY24": req.body.kwRequired_2024,
                        "kwFY25": req.body.kwRequired_2025,

                        "cbFY16": req.body.cbRequired_2016,
                        "cbFY17": req.body.cbRequired_2017,
                        "cbFY18": req.body.cbRequired_2018,
                        "cbFY19": req.body.cbRequired_2019,
                        "cbFY20": req.body.cbRequired_2020,
                        "cbFY21": req.body.cbRequired_2021,
                        "cbFY22": req.body.cbRequired_2022,
                        "cbFY23": req.body.cbRequired_2023,
                        "cbFY24": req.body.cbRequired_2024,
                        "cbFY25": req.body.cbRequired_2025,

                        cloudCompute:   req.body.cloudCompute,
                        bizCloudHc: req.body.bizCloudHc,
                        bizCloud:   req.body.bizCloud,
                        storageAsAService:  req.body.storageAsAService,
                        mainframe:  req.body.mainframe,
                        unixFarm:   req.body.unixFarm,
                        windowsFarm: req.body.windowsFarm,
                        as400:  req.body.as400,
                        myWorkstyle: req.body.myWorkstyle,
                        cyber:  req.body.cyber,
                        serviceManagement: req.body.serviceManagement,
                        lan:    req.body.lan,
                        wan:    req.body.wan

                    }

                    },
                    {upsert:true},

                    function(err, result){
                        if(err){
                            console.log('err:  ' + err);
                        }
                        else{
                            console.log('update result:  ' + result);

                            eventEmitter.emit('internalDcDemandUpdateFinishedEvent');
                        }
                    });
            }
        });
    });

    app.post('/playcard_update', function(req, res){
        console.log('Playcard update Request Received');
        console.log('request body:  ' + req.body);

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);
                console.log('req.body.kwRequired_2016}', req.body.kwRequired_2016);
                var collection = db.collection('PlaycardsData');
                var dcInventoryCollection = db.collection('DcInventory');
                var translatedValue = translateToString(req.body.StrategicNaturesOfDc);
                var keyAccounts;
                if(req.body.KeyAccounts !== undefined){
                    keyAccounts = req.body.KeyAccounts;
                }
                else {
                    keyAccounts = '';
                }


                var consolidationStrategy;
                if(req.body.ConsolidationStrategy !== undefined){
                    consolidationStrategy = req.body.ConsolidationStrategy;
                }
                else {
                    consolidationStrategy = '';
                }

                var cscBu;

                if(req.body.CscBu.length > 0){
                    cscBu = req.body.CscBu[0].name;
                }
                else {
                    cscBu = '';
                }

                var tenancyType;

                if(req.body.TenancyTypes !== undefined){
                    if(req.body.TenancyTypes[0] !== undefined){
                        tenancyType = req.body.TenancyTypes[0].name;
                    }
                }
                else {
                    tenancyType = '';
                }

                var dcTier;
                if(req.body.DcTier[0] !== undefined){
                    dcTier = req.body.DcTier[0].name;
                }
                else {
                    dcTier = '';
                }

                var networkNodeTypes;
                if(req.body.NetworkNodeTypes[0]){
                    if(req.body.NetworkNodeTypes.length > 1){
                        req.body.NetworkNodeTypes.forEach(function(type){
                            if(networkNodeTypes !== undefined){
                                networkNodeTypes = networkNodeTypes + ',' + type.name;
                            }
                            else {
                                networkNodeTypes = type.name;
                            }

                            var nnt = networkNodeTypes;
                        })
                    }
                    else {
                        networkNodeTypes = req.body.NetworkNodeTypes[0].name;
                    }

                    //networkNodeTypes = req.body.NetworkNodeTypes[0].name;
                }
                else {
                    networkNodeTypes = '';
                }

                dcInventoryCollection.update(
                    {
                        DataCenterName: req.body.DataCenterName[0].name
                    },
                    {
                        $set:
                        {
                            DcSiteCode: req.body.DcSiteCode,
                            DcAddress: req.body.DcAddress,
                            DcRegion: translateToString(req.body.DcRegion),
                            DcCountry: req.body.DcCountry
                        }
                    },
                    function(err, result){
                        if(err){
                            console.log('DcInventory update err:  ' + err);
                        }
                        else{
                            console.log('DcInventory update result:  ' + result);
                        }
                    }
                );

                collection.update(
                    {
                        DataCenterName: req.body.DataCenterName[0].name
                    },
                    {$set:
                    {
                        DcSiteCode: req.body.DcSiteCode,
                        DcAddress: req.body.DcAddress,
                        DcRegion: translateToString(req.body.DcRegion),
                        DcCountry: req.body.DcCountry,

                        //DataCenterName: translateToString(req.body.DataCenterName),
                        StrategicNaturesOfDc: translateToString(req.body.StrategicNaturesOfDc),
                        AnnualDirectLeaseCost: req.body.AnnualDirectLeaseCost,
                        DataCenterTypes: translateToString(req.body.DataCenterTypes),
                        TenancyTypes: tenancyType,
                        NetworkNodeTypes: networkNodeTypes,
                        KeyAccounts: keyAccounts,
                        SqFtCapacity: req.body.SqFtCapacity,
                        SqFtRaised: req.body.SqFtRaised,
                        PctUtilization: req.body.PctUtilization,
                        DcTier: dcTier,
                        ContractTypes: translateToString(req.body.ContractTypes),
                        LeaseEnds: req.body.LeaseEnds,
                        KwLeasedUtilized: req.body.KwLeasedUtilized,


                        AnnualCost: req.body.AnnualCost,
                        KWL: req.body.$kWL,
                        Certifications: req.body.Certifications,
                        DcManager: req.body.DcManager,
                        DcRegionalHead: req.body.DcRegeonalHead,
                        CscSecurityLead: req.body.CscSecurityLead,
                        ConsolidationStrategy: consolidationStrategy,
                        OverallStrategies: translateToString(req.body.OverallStrategies),
                        //Region: translateToString(req.body.Region),
                        BuildDate: req.body.BuildDate,
                        Vendor: req.body.Vendor,
                        ValueOfUtilization: req.body.ValueOfUtilization,
                        //DatacenterAddress: req.body.DatacenterAddress,

                        DcProvider: req.body.DcProvider,
                        DcProviderContact: req.body.DcProviderContact,
                        AnnualTaxBill: req.body.AnnualTaxBill,
                        ContractEndDate: req.body.ContractEndDate,
                        CscBu: cscBu,
                        SqFtContracted: req.body.SqFtContracted,
                        SqFtReservedForNewBusiness: req.body.SqFtReservedForNewBusiness,
                        Workloads: translateToString(req.body.Workloads),

                        SqFtPctContracted:  req.body.SqFtPctContracted,
                        KwCapacity:   req.body.KwCapacity,
                        KwContracted:   req.body.KwContracted,
                        KwReservedForNewBusiness:    req.body.KwReservedForNewBusiness,
                        KwPctContracted:    req.body.KwPctContracted,
                        Kw$PerHour:    req.body.Kw$PerHour,
                        OperationsCost: req.body.OperationsCost,
                        AnnualPowerCost:    req.body.AnnualPowerCost,
                        DcOfferingGm:   req.body.DcOfferingGm
                    }
                    },
                    {upsert: true},
                    function(err, result){
                        if(err){
                            console.log('err:  ' + err);
                        }
                        else{
                            console.log('update result:  ' + result);
                            res.send(201);
                        }
                    });
            }
        });
    });

    app.post('/access_request', function(req, res) {
        console.log('Access Request post Received');
        console.log('request body:  ' + req.body);

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {

                var collection = db.collection('AccessRequests');

                collection.update(
                    {
                        email: req.body.email
                    },
                    {
                        $set: {
                            FirstName: req.body.firstName,
                            LastName: req.body.lastName,
                            UserName: req.body.username,
                            Email: req.body.email,
                            Reason: req.body.reason,
                            RequestedRoles: req.body.roles
                        }
                    },
                    {upsert: true},
                    function (err, result) {
                        if (err) {
                            console.log('err:  ' + err);
                        }
                        else {
                            console.log('update result:  ' + result);

                            var messageSubject = 'A New User Access Request has been entered';
                            var messageText = 'A New User Access Request has been entered by  ' + req.body.email;
                            var messageHtml = '<b> A new user is requesting access: ' +   'Requestor email:' + req.body.email + '</b>';

                            var mailOptions = {
                                from: 'DCDM Mailer <dcdmmailer@gmail.com>', // sender address
                                to: 'jtabeling@csc.com,', // list of receivers
                                subject: messageSubject, // Subject line
                                text: messageText, // plaintext body
                                html: messageHtml // html body
                            };

                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){
                                    console.log(error);
                                }else{
                                    console.log('Message sent: ' + info.response);
                                }
                            });

                            res.send(201);
                        }
                    });
            }
        })
    });

    app.post('/remove_access_request', function(req, res) {
        console.log('Remove Access Request post Received');
        console.log('request body:  ' + req.body);

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {

                var collection = db.collection('AccessRequests');

                collection.remove(
                    {
                        email: req.body.userEmail
                    },
                    function (err, result) {
                        if (err) {
                            console.log('err:  ' + err);
                        }
                        else {
                            console.log('update result:  ' + result);
                            res.send(201);
                        }
                    });
            }
        })
    });

    app.post('/remove_users', function(req, res) {
        console.log('Remove User post Received');
        console.log('request body:  ' + req.body);

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {

                var collection = db.collection('users');

                collection.remove(
                    {
                        email: req.body.email
                    },
                    function (err, result) {
                        if (err) {
                            console.log('err:  ' + err);
                        }
                        else {
                            console.log('update result:  ' + result);
                            res.send(201);
                        }
                    });
            }
        })
    });

    app.post('/new_functionality_request', function(req, res) {
        console.log('New Functionality Request post Received');
        console.log('request body:  ' + req.body);
        var appAreas;

        req.body.appAreas.forEach(function(area){
            if(appAreas !== undefined){
                appAreas = appAreas + ',' + area.name;
            }
            else {
                appAreas = area.name;
            }
            var p = 0;
        });

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {

                var collection = db.collection('NewFunctionalityRequests');

                collection.insert(
                    {
                            RequestTitle: req.body.requestTitle,
                            RequestedDeliveryDate: req.body.requestedDeliveryDate,
                            RequestorEmail: req.body.email,
                            RequestorFirstName: req.body.firstName,
                            RequestorLastName: req.body.lastName,
                            RequestorUserName: req.body.username,
                            Description: req.body.description,
                            AppAreas: appAreas,
                            Criticality: req.body.criticality[0].name,

                            StakeholderFirstName: req.body.stakeholderFirstName,
                            StakeholderLastName: req.body.stakeholderLastName,
                            StakeholderUserName: req.body.stakeholderUserName,
                            StakeholderEmail: req.body.stakeholderEmail,

                            ReviewedOn: '',
                            Status: '',
                            AssignedTo: '',
                            Comments: ''

                    },
                    //{upsert: true},
                    function (err, result) {
                        if (err) {
                            console.log('err:  ' + err);
                        }
                        else {
                            console.log('update result:  ' + result);

                            var messageSubject = 'A New Functionality Request has been entered';
                            var messageText = req.body.requestTitle;
                            var messageHtml = '<b>Request Title:    ' + req.body.requestTitle + '   Requestor email:' + req.body.email + '</b>';

                            var mailOptions = {
                                from: 'DCDM Mailer <dcdmmailer@gmail.com>', // sender address
                                to: 'jtabeling@csc.com,', // list of receivers
                                subject: messageSubject, // Subject line
                                text: messageText, // plaintext body
                                html: messageHtml // html body
                            };

                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){
                                    console.log(error);
                                }else{
                                    console.log('Message sent: ' + info.response);
                                }
                            });


                            res.send(201);
                        }
                    });
            }
        })
    });

    app.post('/new_functionality_request_update', function(req, res) {
        console.log('New Functionality Request post Received');
        console.log('request body:  ' + req.body);
        //var appAreas;

        //req.body.appAreas.forEach(function(area){
        //    if(appAreas !== undefined){
        //        appAreas = appAreas + ',' + area.name;
        //    }
        //    else {
        //        appAreas = area.name;
        //    }
        //    var p = 0;
        //});

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {

                var collection = db.collection('NewFunctionalityRequests');

                collection.update(
                    {
                        RequestTitle: req.body.requestTitle
                    },
                    {
                       $set: {
                           ReviewedOn: req.body.reviewedOn,
                           Status: req.body.status,
                           AssignedTo: req.body.assignedTo,
                           Comments: req.body.comments

                       }
                    }
                    ,
                    {upsert: true},
                    function (err, result) {
                        if (err) {
                            console.log('err:  ' + err);
                        }
                        else {
                            console.log('update result:  ' + result);
                            res.send(201);
                        }
                    });
            }
        })
    });

    app.post('/generate_playcards', function(req, res) {
        console.log('Generate Playcards Request Received');
        console.log('request body:  ' + req.body);

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('DcInventory');

                var playcardCollection = db.collection('PlaycardsData');

                collection.find({}).toArray(function (err, docs) {
                    docs.forEach(function (doc) {
                        var playcard = {
                            DataCenterName: doc.DataCenterName,
                            DcSiteCode: doc.DcSiteCode,
                            DcAddress: doc.DcAddress,
                            Region: doc.DcRegion,
                            DcCountry: doc.DcCountry
                        };
                            playcardCollection.update(
                                {
                                    DataCenterName: doc.DataCenterName
                                },
                                {
                                    $set:{
                                        DataCenterName: doc.DataCenterName,
                                        DcSiteCode: doc.DcSiteCode,
                                        DcAddress: doc.DcAddress,
                                        DcRegion: doc.DcRegion,
                                        DcCountry: doc.DcCountry
                                    }
                                },
                                {upsert: true},
                                function(err, result) {
                                    if (err) {
                                        console.log('err:  ' + err);
                                    }
                                    else {
                                        console.log('update result:  ' + result);
                                    }
                                }
                            );
                    });
                    res.send(201);
                    assert.equal(null, err);

                });

            }
        });
    });

    app.post('/grant_requested_roles', function(req, res) {
        console.log('Grant Requested Roles Request Received');
        console.log('request body:  ' + req.body);

        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                var collection = db.collection('users');

                var roles = [];

                if (typeof req.body.requestedRoles[0] === 'string' || req.body.requestedRoles[0] instanceof String){
                    roles.push(req.body.requestedRoles);
                }
                else {
                    roles = req.body.requestedRoles.split(',');
                }

                if(typeof req.body.requestedRoles === 'string' || req.body.requestedRoles instanceof String){
                    if(req.body.requestedRoles.indexOf(',') > 0){
                        roles = req.body.requestedRoles.split(',');
                    }
                    else {
                        roles = req.body.requestedRoles;
                    }
                }
                //var roles = req.body.requestedRoles.split(',');

                if(Array.isArray(roles)){
                    roles.forEach(function(role){
                        var r;
                        if(Array.isArray(role)){
                            r = role[0];
                        }
                        else {
                            r = role;
                        }
                        collection.update(
                            {
                                email: req.body.userEmail
                            },
                            {
                                $push: { roles: r }
                            },
                            {upsert: true},
                            function(err, result) {
                                if (err) {
                                    console.log('err:  ' + err);
                                }
                                else {
                                    console.log('update result:  ' + result);

                                }
                            }
                        );
                    });
                }
                else {
                        collection.update(
                            {
                                email: req.body.userEmail
                            },
                            {
                                $push: { roles: roles }
                            },
                            {upsert: true},
                            function(err, result) {
                                if (err) {
                                    console.log('err:  ' + err);
                                }
                                else {
                                    console.log('update result:  ' + result);
                                }
                            }
                        );
                }
                res.send(201);
                assert.equal(null, err);
            }
        });
    });

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		})
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});

	if (process.env.NODE_ENV === 'secure') {
		// Log SSL usage
		console.log('Securely using https protocol');

		// Load SSL key and certificate
		var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}

	// Return Express server instance
	return app;
};
