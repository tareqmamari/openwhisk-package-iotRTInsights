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

/**
 * An action to delete message schema in Real-time Insight service
 *
 * @param      {string}   authToken       (required)    Authentication token of an IoT RTI instance
 * @param      {string}   apiKey          (required)    API Key of an IoT RTI instance
 * @param      {string}   name            (required)    Name of the message schema
 * @return     {Object}                                 Done with the result of invocation
 * */

function main(params) {
    var baseUrl = 'https://iotrti-prod.mam.ibmserviceengage.com/api/v2';

    var authorizationHeader = "Basic " + new Buffer(params.apiKey + ":" + params.authToken).toString("base64");

    getMsgSchemas(baseUrl, authorizationHeader, params.name, function(err, res, body) {
        if (!err && res.statusCode === 200) {
            try {
                var parsedBody = JSON.parse(body);
                for (var schema in parsedBody) {
                    if (parsedBody[schema].name == params.name) {
                        deleteMsgSchema(baseUrl, authorizationHeader, parsedBody[schema].id, function(err, res, body) {

                            if (!err && res.statusCode === 204) {
                                return whisk.done({
                                    "success": "message schema deleted"
                                });
                            } else {
                                return whisk.error({
                                    statusCode: (res || {}).statusCode,
                                    error: err,
                                    body: body
                                });
                            }
                        });
                    }
                }
            } catch (exception) {
                console.error(exception);
                return whisk.error(exception);
            }
        } else {
            if (res) {
                console.error("Message Schema can not be found (Status code: " + res.statusCode + ")");
                console.error(res.body);
                return whisk.error("Message Schema can not be found (Status code: " + res.statusCode + ")");
            } else {
                console.error(err);
                return whisk.error(err);
            }
        }
    });
    return whisk.async();
}

/**
 * A function to get all message schemas in an RTI service instance.
 *
 * @param      {string}    baseUrl              The base Url of RTI REST API
 * @param      {string}    authorizationHeader  The authorization header for RTI
 *                                              service
 * @param      {string}    name                 The name of message schema
 * @param      {Function}  callback             A callback function that pass
 *                                              the error , response as well as
 *                                              the body of the HTTP request
 */
function getMsgSchemas(baseUrl, authorizationHeader, name, callback) {
    var options = {
        method: 'GET',
        url: baseUrl + '/message/schema?' + name,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    require('request')(options, function(err, res, body) {
        return callback(err, res, body);
    });
}

function deleteMsgSchema(baseUrl, authorizationHeader, id, callback) {
    var options = {
        method: 'DELETE',
        url: baseUrl + '/message/schema/' + id,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    require('request')(options, function(err, res, body) {
        return callback(err, res, body);
    });
}
