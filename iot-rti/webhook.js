var async = require('async');

/**
 * A feed built on top of IoT RTI rules and actions to fire a trigger whenever certain conditions are met.
 * @param      {string}  triggerName    (Provided by the system)       Trigger full name i.e. /namespace/triggerName/
 * @param      {string}  lifeCycle      (optional)                     Feed lifecyle, default: CREATE
 * @param      {string}  apiKey         (required)                     RTI API Key
 * @param      {string}  authToken      (required)                     Authentication token of an IoT RTI instance
 * @param      {string}  schemaName     (required)                     Message Schema name
 * @param      {string}  condition      (required)                     Condition Provided for the trule to trigger the action when this condition met
 * @param      {string}  callbackBody   (optional)                     Event message content, default: {"rule":"{{ruleName}}","condition":"{{ruleCondition}}","message":"{{message}}"}"
 * @param      {string}  description    (optional)                     Rule Description, default: "A rule created by Openwhisk Feed @ " + current date and time
 * @param      {integer} severity       (optional)                     Rule severity, default: 4
 * @return     {Object}                                                Done with the result of invokation
 **/
function main(params) {
    console.log(lifecycleEvent);
    var requiredParams = ["apiKey", "authToken"];

    var baseUrl = 'https://iotrti-prod.mam.ibmserviceengage.com/api/v2';
    var authorizationHeader = "Basic " + new Buffer(params.apiKey + ":" + params.authToken).toString("base64");

    var endpoint = 'openwhisk.ng.bluemix.net';
    var triggerName = params.triggerName.split("/");

    var whiskCallbackUrll = 'https://' + endpoint + '/api/v1/namespaces/' + triggerName[1] + '/triggers/' + triggerName[2];

    var lifecycleEvent = params.lifecycleEvent || 'CREATE';

    var ruleName = "Openwhisk Feed " + triggerName[2];

    var actionName = "Openwhisk Feed " + triggerName[2];

    if (lifecycleEvent == 'DELETE') {

        checkParameters(params, requiredParams, function(missingParams) {
            if (missingParams != "") {
                console.error("Missing required parameters: " + missingParams);
                return whisk.error("Missing required parameters: " + missingParams);
            } else {
                console.log("All required parameters are passed");
                handleTriggerDeletion(triggerName, ruleName, baseUrl, authorizationHeader);
            }

        });

    } else if (lifecycleEvent == 'PAUSE') {
        return whisk.error('PAUSE lifecyle event has not been implemented yet');
    } else if (lifecycleEvent == 'UNPAUSE') {
        return whisk.error('UNPAUSE lifecyle event has not been implemented yet');

    } else if (lifecycleEvent == 'UPDATE') {
        if (!requiredParamseq.length > 2)
            return whisk.error("There is nothing to update");

        handleTriggerUpdating(params, triggerName);

    } else { //Default: CREATE

        requiredParams.push("schemaName", "condition");

        checkParameters(params, requiredParams, function(missingParams) {
            console.log("Required Parameters: " + requiredParams);
            if (missingParams != "") {
                console.error("Missing required parameters: " + missingParams);
                return whisk.error("Missing required parameters: " + missingParams);
            } else
                handleTriggerCreation(triggerName, baseUrl, authorizationHeader, params.schemaName, params.description, whiskCallbackUrl, params.callbackBody, ruleName, actionName, params.severity, params.condition);

        });
    }

    return whisk.async();
}


function handleTriggerCreation(triggerName, baseUrl, authorizationHeader, schemaName, description, whiskCallbackUrl, callbackBody, ruleName, actionName, severity, condition) {
    console.log("Creating Feed: " + triggerName[2]);

    async.series({
            schemaId: function(callback) {
                console.log("Getting Message Schema");
                getMsgSchemas(baseUrl, authorizationHeader, schemaName, function(err, res, body) {
                    if (!err && res.statusCode === 200) {
                        try {
                            var parsedBody = JSON.parse(body);
                            for (var schema in parsedBody) {
                                if (parsedBody[schema].name == schemaName) {
                                    return callback(null, parsedBody[schema].id);
                                }
                            }
                            return callback("Message Schema can not be found", null);
                        } catch (exception) {
                            console.error(exception);
                            return callback(exception, null);
                        }
                    } else {
                        if (res) {
                            console.error("Message Schema can not be found (Status code: " + res.statusCode + ")");
                            console.error(res.body);
                            return callback(res.body, null);
                        } else {
                            console.error(err);
                            return callback(err, null);
                        }
                    }
                });
            },
            actionId: function(callback) {
                console.log("Creating RTI Action: " + actionName);
                createAction(baseUrl, authorizationHeader, actionName, description, whiskCallbackUrl, callbackBody, function(err, res, body) {
                    if (!err && res.statusCode === 200) {
                        try {
                            var parsedBody = JSON.parse(body);
                            return callback(null, parsedBody.id);
                        } catch (exception) {
                            console.error(exception);
                            return callback(exception, null);
                        }
                    } else {
                        if (res) {
                            console.error("RTI action can not be created (Status code: " + res.statusCode + ")");
                            console.error(res.body);
                            return callback(res.body, null);
                        } else {
                            console.error(err);
                            return callback(err, null);
                        }
                    }
                });
            }
        },
        function(err, results) {
            if (err) {
                console.error("Can not create the feed :" + triggerName[2]);
                console.error(err);
                return whisk.error(err);
            }

            console.log("Creating Rule: " + triggerName[2]);
            var body = {
                "name": ruleName,
                "description": description || "A rule created by Openwhisk Feed " + triggerName[2],
                "disabled": false,
                "severity": severity || 4,
                "messageSchemas": [results.schemaId],
                "condition": condition,
                "actions": [results.actionId]
            };

            var options = {
                method: 'POST',
                url: baseUrl + "/rule",
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorizationHeader
                }
            };

            require('request')(options, function(err, res, body) {
                if (!err && res.statusCode === 200) {
                    console.log(JSON.parse(body));
                    whisk.done({
                        response: "Feed created successfully"
                    });
                } else {
                    console.log("Rolling Back the Created RTI Action");
                    deleteAction(baseUrl, authorizationHeader, results.actionId, function(error, res, body) {
                        if (!error && res.statusCode === 204) {
                            try {
                                console.log("Actoin deleted successfully");
                                return whisk.error("Feed can not be created");
                            } catch (exception) {
                                console.error(exception);
                            }
                        } else {
                            console.log("Actoin deleted unsuccessfully");
                            if (res) {
                                console.error("Status code: " + res.statusCode);
                                console.log(res.body);
                            } else {
                                console.error(error);
                            }
                        }
                    });

                    if (res) {
                        console.log("Status code: " + res.statusCode);
                        whisk.error({
                            response: JSON.parse(body)
                        });
                    } else {
                        console.error(err);
                        whisk.error(err);
                    }
                }
            });
        }
    );
}

function handleTriggerUpdating(params, triggerName) {

    console.log("Updating Feed: " + triggerName[2]);

    async.parallel({
            schemaId: function(callback) {
                if (!params.hasOwnProperty("schemaName"))
                    return callback(null, "nothing to update in message schema");

                console.log("Getting Message Schema");

                getMsgSchemas(baseUrl, authorizationHeader, schemaName, function(err, res, body) {
                    if (!err && res.statusCode === 200) {
                        try {
                            var parsedBody = JSON.parse(body);
                            for (var schema in parsedBody) {
                                if (parsedBody[schema].name == schemaName) {
                                    return callback(null, parsedBody[schema].id);
                                }
                            }
                            return callback("Message Schema can not be found", null);
                        } catch (exception) {
                            console.error(exception);
                            return callback(exception, null);
                        }
                    } else {
                        if (res) {
                            console.error("Message Schema can not be found (Status code: " + res.statusCode + ")");
                            console.error(res.body);
                            return callback(res.body, null);
                        } else {
                            console.error(err);
                            return callback(err, null);
                        }
                    }
                });
            },
            actionId: function(callback) {
                if (!params.hasOwnProperty('callbackBody'))
                    return callback(null, "nothing to update in action");

                console.log("Updating RTI Action: " + actionName);

                createAction(baseUrl, authorizationHeader, actionName, description, whiskCallbackUrl, callbackBody, function(err, res, body) {
                    if (!err && res.statusCode === 200) {
                        try {
                            var parsedBody = JSON.parse(body);
                            return callback(null, parsedBody.id);
                        } catch (exception) {
                            console.error(exception);
                            return callback(exception, null);
                        }
                    } else {
                        if (res) {
                            console.error("RTI action can not be updated (Status code: " + res.statusCode + ")");
                            console.error(res.body);
                            return callback(res.body, null);
                        } else {
                            console.error(err);
                            return callback(err, null);
                        }
                    }
                });
            }
        },
        function(err, results) {
            if (err) {
                console.error("Can not update the feed :" + triggerName[2]);
                console.error(err);
                return whisk.error(err);
            }

            console.log("Updating Rule: " + triggerName[2]);

            var msgSchema;

            var body = {
                "description": params.description,
                "severity": params.severity,
                "messageSchemas": [results.schemaId],
                "condition": params.condition,
                "actions": [results.actionId]
            };

            var options = {
                method: 'PUT',
                url: baseUrl + "/rule",
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authorizationHeader
                }
            };

            require('request')(options, function(err, res, body) {
                if (!err && res.statusCode === 200) {
                    console.log(JSON.parse(body));
                    whisk.done({
                        response: "Feed updated successfully"
                    });
                } else {
                    if (res) {
                        console.log("Status code: " + res.statusCode);
                        whisk.error({
                            response: JSON.parse(body)
                        });
                    } else {
                        console.error(err);
                        whisk.error(err);
                    }
                }
            });
        }
    );
}

function handleTriggerDeletion(triggerName, ruleName, baseUrl, authorizationHeader) {
    console.log("Deleting Feed: " + triggerName[2]);

    async.series({
        deleteRule: function(callback) {
            console.log("Deleting Rule: " + ruleName);

            getRuleId(baseUrl, authorizationHeader, ruleName, function(err, ruleId) {
                if (err) {
                    console.error(err);
                    callback(err, null);
                } else {
                    deleteRule(baseUrl, authorizationHeader, ruleId, function(error, res, body) {
                        if (!error && res.statusCode === 204) {
                            try {
                                console.log("Rule deleted successfully");
                                return callback(null, "done");
                            } catch (exception) {
                                console.error(exception);
                                return callback(exception, null);
                            }
                        } else {
                            console.log("Rule deleted unsuccessfully");
                            if (res) {
                                console.error("Status code: " + res.statusCode);
                                return callback(res.body, null);
                            } else {
                                console.error(err);
                                return callback(error, null);
                            }
                        }
                    });
                }
            });
        },
        deleteAction: function(callback) {
            var actionName = "Openwhisk Feed " + triggerName[2];
            console.log("Deleting Action: " + deleteAction);
            getActionId(baseUrl, authorizationHeader, actionName, function(err, actionId) {
                if (err)
                    callback(err, null);
                else {
                    deleteAction(baseUrl, authorizationHeader, actionId, function(error, res, body) {
                        if (!error && res.statusCode === 204) {
                            try {
                                console.log("Action has been deleted successfully");
                                return callback(null, "done");
                            } catch (exception) {
                                console.error(exception);
                                return callback(exception, null);
                            }
                        } else {
                            console.log("Action has been deleted unsuccessfully");
                            if (res) {
                                console.error("Status code: " + res.statusCode);
                                return callback(res.statusCode, null);
                            } else {
                                console.error(error);
                                return callback(error, null);
                            }
                        }
                    });
                }
            });
        }
    }, function(err, result) {
        if (err) {
            console.error(err);
            return whisk.error(err);
        } else
            return whisk.done({
                "result": "Feed has been deleted successfully"
            });
    });
}


/**
 * { function_description }
 *
 * @param      {string}    baseUrl              The base url of RTI REST API
 * @param      {string}    authorizationHeader  The authorization header for RTI
 *                                              service
 * @param      {string}    name                 The name of the RTI action to be
 *                                              created
 * @param      {string}    description          The description of the RTI
 *                                              action to be created
 * @param      {string}    whiskCallbackUrl     The whisk callback url (this
 *                                              feed trigger)
 * @param      {string}    callbackBody         The callback body to be sent
 *                                              when firing this feed trigger
 * @param      {Function}  callback             A callback function that pass
 *                                              the error , response as well as
 *                                              the body of the http request
 */
function createAction(baseUrl, authorizationHeader, name, description, whiskCallbackUrl, callbackBody, callback) {
    // var headers = {
    //     'Authorization': new Buffer(whisk.getAuthKey()).toString("base64")
    // };
    console.log('createAction: started');

    var defaultActionBody = "{ \"rule\" : \"{{ruleName}}\" , \"condition\" : \"{{ruleCondition}}\" , \"message\" : \"{{message}}\" }";

    var actionFields = {
        "url": whiskCallbackUrl,
        "method": "POST",
        "username": whisk.getAuthKey().split(":")[0],
        "password": whisk.getAuthKey().split(":")[1],
        // "headers": JSON.stringify(headers),
        "contentType": "application/json",
        "body": callbackBody || defaultActionBody
    };

    var body = {
        "type": "webhook", //required
        "name": name, //required
        "description": description || "An action created by Openwhisk Feed  @" + new Date, //optional
        "fields": actionFields //required
    };

    var options = {
        method: 'POST',
        url: baseUrl + "/action",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    require('request')(options, function(err, res, body) {
        return callback(err, res, body);
    });
}

/**
 * A function to get all message schemas in an RTI service instance.
 *
 * @param      {string}    baseUrl              The base url of RTI REST API
 * @param      {string}    authorizationHeader  The authorization header for RTI
 *                                              service
 * @param      {string}    name                 The name of message schema
 * @param      {Function}  callback             A callback function that pass
 *                                              the error , response as well as
 *                                              the body of the http request
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

/**
 * a function to delete an RTI action by its Id
 *
 * @param      {string}    baseUrl              The base url of RTI REST API
 * @param      {string}    authorizationHeader  The authorization header for RTI
 *                                              service
 * @param      {string}    actionId             The RTI action id
 * @param      {Function}  callback             A callback function that pass
 *                                              the error , response as well as
 *                                              the body of the http request
 */

function deleteAction(baseUrl, authorizationHeader, actionId, callback) {
    var options = {
        method: 'DELETE',
        url: baseUrl + "/action/" + actionId,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    require('request')(options, function(err, res, body) {
        return callback(err, res, body);
    });
}



/**
 * Get all RTI actions of type webhook.
 *
 * @param      {string}    baseUrl              The base url of RTI REST API
 * @param      {string}    authorizationHeader  The authorization header for RTI
 *                                              service
 * @param      {Function}  callback             A callback function that pass
 *                                              the error , response as well as
 *                                              the body of the http request
 */
function getActions(baseUrl, authorizationHeader, callback) {
    var options = {
        method: 'GET',
        url: baseUrl + "/action?webhook",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    require('request')(options, function(err, res, body) {
        return callback(err, res, body);
    });
}



/**
 * Get an RTI action id by its name
 *
 * @param      {string}    baseUrl              The base url of RTI REST API
 * @param      {string}    authorizationHeader  The authorization header for RTI
 *                                              service
 * @param      {string}    actionName           The RTI action name
 * @param      {Function}  callback             A callback function that pass
 *                                              the error , response as well as
 *                                              the body of the http request
 */
function getActionId(baseUrl, authorizationHeader, actionName, callback) {
    getActions(baseUrl, authorizationHeader, function(err, res, body) {
        if (!err && res.statusCode === 200) {
            try {
                var parsedBody = JSON.parse(body);
                for (var action in parsedBody) {
                    if (parsedBody[action].name == actionName) {
                        return callback(null, parsedBody[action].id);
                    }
                }
            } catch (exception) {
                console.error(exception);
                return callback(exception, null);
            }
        } else {
            if (res) {
                console.error("Action can not be found (Status code: " + res.statusCode + ")");
                console.error(res.body);
                return callback(res.body, null);
            } else {
                console.error(err);
                return callback(err, null);
            }
        }
    });
}



/**
 * Get all rules within RTI service instance
 *
 * @param      {string}    baseUrl              The base url of RTI REST API
 * @param      {string}    authorizationHeader  The authorization header for RTI
 *                                              service
 * @param      {Function}  callback             A callback function that pass
 *                                              the error , response as well as
 *                                              the body of the http request
 */
function getRules(baseUrl, authorizationHeader, callback) {
    var options = {
        method: 'GET',
        url: baseUrl + "/rule",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    require('request')(options, function(err, res, body) {
        return callback(err, res, body);
    });
}

function getRuleId(baseUrl, authorizationHeader, ruleName, callback) {
    getRules(baseUrl, authorizationHeader, function(err, res, body) {
        if (!err && res.statusCode === 200) {
            try {
                var parsedBody = JSON.parse(body);
                for (var rule in parsedBody) {
                    if (parsedBody[rule].name == ruleName) {
                        return callback(null, parsedBody[rule].id);
                    }
                }
            } catch (e) {
                console.error(e);
                return callback(e, null);
            }
        } else {
            if (res) {
                console.error("Action can not be found (Status code: " + res.statusCode + ")");
                console.error(res.body);
                return callback(res.body, null);
            } else {
                console.error(err);
                return callback(err, null);
            }
        }
    });
}


/**
 * A function to delete a rule by it Ids
 *
 * @param      {string}    baseUrl              The base url of RTI REST API
 * @param      {string}    authorizationHeader  The authorization header for RTI service
 * @param      {string}    ruleId               The rule id
 * @param      {Function}  callback             A callback function that pass the error , response as well as the body of the http request
 */
function deleteRule(baseUrl, authorizationHeader, ruleId, callback) {
    var options = {
        method: 'DELETE',
        url: baseUrl + "/rule/" + ruleId,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    require('request')(options, function(err, res, body) {
        return callback(err, res, body);
    });
}


function updateAction(baseUrl, authorizationHeader, actionId, callbackBody, callback) {

    var actionFields = {
        "fields": callbackBody
    };

    var options = {
        method: 'PUT',
        url: baseUrl + "/action",
        body: JSON.stringify(actionFields),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader
        }
    };

    require('request')(options, function(err, res, body) {
        return callback(err, res, body);
    });
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
        if (!params.hasOwnProperty(requiredParams[i])) {
            missingParams.push(requiredParams[i]);
        }
        if (i == 0)
            return callback(missingParams);

    }
}