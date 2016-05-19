var request = require('request');


/**
 * An action to add message source to Realtime insight service
 *
// @param      {string}   orgId           (required)                     Watson IoT platform organization Id 
// @param      {string}   iot_apiKey      (required)                     Watson IoT platform apiKey
// @param      {string}   iot_authToken   (required)                     Watson IoT platform Authentication token
// @param      {string}   authToken       (required)                     Authentication token of an IoT RTI instance
// @param      {string}   apiKey          (required)                     apiKey of an IoT RTI instance
// @param      {string}   name            (optoinal)                     name of the message source, default: "Message Source "+orgId 
// @param      {boolean}  disabled        (optional)                     disable or enable the message source, default : false
 * @return     {Object}                                                  describe result of invokation
 */
function main(params) {
    var baseUrl = 'https://iotrti-prod.mam.ibmserviceengage.com/api/v2';

    var authorizationHeader = "Basic " + new Buffer(params.apiKey + ":" + params.authToken).toString("base64");

    var body = {
        "name": params.name || "Message source: " + params.orgId, //required
        "orgId": params.orgId, //required
        "apiKey": params.iot_apiKey, //required
        "authToken": params.iot_authToken, //required
        "disabled": params.disabled || false
    };

    var options = {
        method: 'POST',
        url: baseUrl + "/message/source",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    request(options, function(err, res, body) {
        if (!err && res.statusCode === 200) {
            console.log(JSON.parse(body));
            return whisk.done({
                response: JSON.parse(body)
            });
        } else {
            if (res) {
                console.error("Status code: " + res.statusCode);
                console.error(res.body);
                whisk.error({
                    response: body
                });
            } else {
                console.error(err);
                whisk.error(err);
            }
        }
    });

    return whisk.async();
}