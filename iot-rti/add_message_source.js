/*
 * Copyright 2015-2016 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var request = require('request');

/**
 * An action to add message source to Realtime insight service
 *
 * @param      {string}   orgId           (required)                     Watson IoT platform organization Id
 * @param      {string}   iot_apiKey      (required)                     Watson IoT platform apiKey
 * @param      {string}   iot_authToken   (required)                     Watson IoT platform Authentication token
 * @param      {string}   authToken       (required)                     Authentication token of an IoT RTI instance
 * @param      {string}   apiKey          (required)                     API Key of an IoT RTI instance
 * @param      {string}   name            (optoinal)                     Name of the message source, default: "Message Source "+orgId
 * @param      {boolean}  disabled        (optional)                     Disable or enable the message source, default : false
 * @return     {Object}                                                  Done with the result of invokation
 */
function main(params) {

    var requiredParams = ["apiKey", "authToken", 'orgId', 'iot_apiKey', 'iot_authToken'];

    checkParameters(params, requiredParams, function(missingParams) {
        if (missingParams != "") {
            console.error("Missing required parameters: " + missingParams);
            return whisk.error("Missing required parameters: " + missingParams);
        } else {
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
                    console.error('http status code:', (res || {}).statusCode);
                    console.error('error:', err);
                    console.error('body:', body);
                    console.error('response', res);
                    whisk.error({
                        statusCode: (res || {}).statusCode,
                        error: err,
                        body: body
                    });
                }
            });
        }
    });



    return whisk.async();
}


/**
 *  A function that check whether the parameters passed are required or not
 *
 * @param      {object}    params    An object contains the parameter required
 *                                   in otder to check it and generate a sting
 *                                   that contains list of missing parameters
 * @param      {Function}  callback  the callback function has the generated
 *                                   string or an empyt string if the params is
 *                                   empty
 */
function checkParameters(params, requiredParams, callback) {
    console.log("Checking Existiance of Required Parameters");
    var missingParams = [];
    for (var i = requiredParams.length - 1; i >= 0; i--) {
        console.log(requiredParams[i]);
        if (!params.hasOwnProperty(requiredParams[i])) {
            missingParams.push(requiredParams[i]);
        }
        if (i == 0)
            return callback(missingParams);

    }
}