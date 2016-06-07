var request = require('request');

//Schemas are used for parsing incoming messages and contexts so that the system knows what attributes are available and of which
// types they are. Schemas are needed to define precise and consistent analytic rules on the messages and contexts
// 

/**
 * An action that create a new message schema which is used to parse the
 * incoming messages to know its attributes whick will lead to consistent
 * analytics
 * @param      {string}  apiKey         (required)  RTI API Key
 * @param      {string}  authToken      (required)  Authentication token of an IoT RTI instance
 * @param      {string}  name           (optional)  Message schema name (must be unique)
 * @param      {object}  items          (required)  JSON object that describe the schema
 * @return     {Object}                             Done with the result of invokation
 **/

function main(params) {
    var baseUrl = 'https://iotrti-prod.mam.ibmserviceengage.com/api/v2';

    var authorizationHeader = "Basic " + new Buffer(params.apiKey + ":" + params.authToken).toString("base64");

    var body = {
        "name": params.name, //required
        "format": "JSON", //required
        "items": params.items //required
    };

    var options = {
        method: 'POST',
        url: baseUrl + "/message/schema",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };


    request(options, function(err, res, body) {
        if (!err && res.statusCode === 200) {
            console.log(JSON.parse(body));
            whisk.done({
                response: JSON.parse(body)
            });
        } else {
             console.error('http status code:', (res || {}).statusCode);
             console.error('error:', err);
             console.error('body:', body);
             console.error('response',res);
             whisk.error({
                 statusCode: (res || {}).statusCode,
                 error: err,
                 body: body
             });
        }
    });

    return whisk.async();
}