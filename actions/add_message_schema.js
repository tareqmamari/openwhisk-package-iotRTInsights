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
 * An action that create a new message schema which is used to parse the
 * incoming messages to know its attributes which will lead to consistent
 * analytics
 * @param      {string}  apiKey         (required)  RTI API Key
 * @param      {string}  authToken      (required)  Authentication token of an IoT RTI service instance
 * @param      {object}  items          (required)  JSON object that describe the schema
 * @param      {string}  name           (optional)  Message schema name (must be unique)
 * @return     {Object}                             Done with the result of invocation
 **/

function main(params) {

    var requiredParams = ["apiKey", "authToken", 'items'];

    checkParameters(params, requiredParams, function(missingParams) {
        if (missingParams != "") {
            console.error("Missing required parameters: " + missingParams);
            return whisk.error("Missing required parameters: " + missingParams);
        } else {
            var baseUrl = 'https://iotrti-prod.mam.ibmserviceengage.com/api/v2';

            var authorizationHeader = "Basic " + new Buffer(params.apiKey + ":" + params.authToken).toString("base64");

            var body = {
                "name": params.name,
                "format": "JSON",
                "items": params.items
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
                    var b = JSON.parse(body);
                    whisk.done(b);
                } else {
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
 *                                   in order to check it and generate a string
 *                                   that contains a list of missing parameters
 * @param      {Function}  callback  the callback function has the generated
 *                                   array or an empty one if the params is
 *                                   empty or nothing is missing
 */
function checkParameters(params, requiredParams, callback) {
    console.log("Checking Existence of Required Parameters");
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
