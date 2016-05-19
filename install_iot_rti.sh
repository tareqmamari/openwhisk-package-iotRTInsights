#!/bin/bash
#
# use the command line interface to install Git package.
#
: ${WHISK_SYSTEM_AUTH:?"WHISK_SYSTEM_AUTH must be set and non-empty"}
AUTH_KEY=$WHISK_SYSTEM_AUTH

SCRIPTDIR="$(cd $(dirname "$0")/ && pwd)"
CATALOG_HOME=$SCRIPTDIR
source "$CATALOG_HOME/util.sh"

echo Installing IoT Platform and Real-Time insights .

createPackage iot \
    -a description "Package which contains actions and a feed for IoT IoT Platform and Real-Time insights services"

waitForAll

install "$CATALOG_HOME/iot/rti_webhook.js" \
    github/webhook \
    -a feed true \
    -a description 'Creates a rule and an RTI action to get messages whenever the condition is met' \
    -a parameters '[{
    "name": "apiKey",
    "required": true,
    "bindTime": true
}, {
    "name": "authToken",
    "required": true,
    "bindTime": true
}, {
    "name": "schemaName",
    "required": true,
    "bindTime": true
}, {
    "name": "condition",
    "required": true,
    "bindTime": true
},
{
    "name": "callbackBody",
    "required": false,
    "bindTime": false
}, {
    "name": "name",
    "required": false,
    "bindTime": false
}, {
    "name": "description",
    "required": false,
    "bindTime": false
}, {
    "name": "severity",
    "required": false,
    "bindTime": false
}]' \
    -a sampleInput '{
    "apiKey": "ABCDEF",
    "authToken": "IamCovert",
    "schemaName": "schema",
    "condition": "schema.value>1"
}'

waitForAll

echo IoT package ERRORS = $ERRORS
exit $ERRORS
