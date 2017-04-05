var express = require('express');
var lti = require('ims-lti');
var _ = require('lodash');
var path = require('path');

var router = express.Router();

var lti_key = "12345";
var lti_secret = "secret";

var course_uuid = "";
var user_uuid = "";
var system_guid = "";
var shared_css = "";
var return_url = "";

var valid_session = false;

/* Return home page from LTI Launch. */
router.post('/lti', function(req, res, next) {
/*
 * POST LTI Launch Received
 */
console.log('In post function');
  var provider = new lti.Provider(lti_key, lti_secret);
  req.body = _.omit(req.body, '__proto__');

  console.log(req.headers);
  console.log(req.body);

console.log('Check request validity');
  provider.valid_request(req, function(err, isValid) {
     if(err) {
       console.log('Error in LTI Launch:' + err);
        var err = new Error('Error in LTI launch.');
        err.status = 403;
        next(err);
     }
     else {
     	 if (!isValid) {
         console.log('Error: Invalid LTI launch.');
         var err = new Error('Invalid LTI launch.');
         err.status = 422;
         next(err);
       }
       else {
         valid_session = true;

       	 course_uuid = req.body['context_id'];
       	 user_uuid = req.body['user_id'];
         system_guid = req.body['tool_consumer_instance_guid'];
         shared_css = req.body['ext_launch_presentation_css_url'];
       	 return_url = req.body['launch_presentation_return_url'];

       	 if(return_url == undefined) {
       		var parts = url.parse(req.body['caliper_profile_url'], true);
      	    return_url = parts.protocol + '//' + parts.host;
       	 }

         console.log ('{' +
           '"course_uuid" :' + course_uuid + ',' +
           '"user_uuid" :' +  user_uuid + ',' +
           '"system_guid" :' +  system_guid + ',' +
           '"shared_css" :' +  shared_css + ',' +
           '"return_url" :' +  return_url +
         '}');

       	 res.sendFile(path.resolve(__dirname + '/../public/index.html'));
       }
     }
  });
});

/* Supply node variables to angular front end */
router.get('/lti/data', function(req, res, next) {
  if(!valid_session) {
    console.log('No valid session found. Application can only be accessed via LTI.');
    var err = new Error('No valid session found. Application can only be accessed via LTI.');
    err.status = 403;
    next(err);
  }
  else {

    var ltidata = {
      "course_uuid" : course_uuid,
      "user_uuid" : user_uuid,
      "system_guid" : system_guid,
      "shared_css" : shared_css,
      "return_url" : return_url
    };
    console.log(JSON.stringify(ltidata));
    res.json(ltidata);
  };
});

module.exports = router;
