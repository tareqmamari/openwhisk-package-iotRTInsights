#!/bin/bash

#/
# Copyright 2015-2016 IBM Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#/

# To run this command
# WHISKPROPS_FILE="$OPENWHISK_HOME/whisk.properties"
# WSK_CLI=$OPENWHISK_HOME/bin/wsk
# AUTH_KEY=$(cat $OPENWHISK_HOME/config/keys/auth.whisk.system)
# EDGE_HOST=$(grep '^edge.host=' $WHISKPROPS_FILE | cut -d'=' -f2)

set -e
set -x

if [ $# -eq 0 ]
then
    echo "Usage: ./install.sh <apihost> <authkey> <pathtowskcli>"
fi

APIHOST="$1"
AUTH="$2"
WSK_CLI="$3"

PACKAGE_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo Installing Watson IoT Real-Time insights Package \

$WSK_CLI --apihost "$APIHOST" package update --auth "$AUTH" --shared yes iot-rti \
    -a description "Watson IoT Real-Time insights Package" \
    -a parameters '[{"name":"apiKey","required":true,"bindTime":true,"description":"Watson IoT-RTI service API key"},{"name":"authToken","required":true,"bindTime":true,"type":"password","description":"Watson IoT-RTI service authentication token"}]'


$WSK_CLI --apihost "$APIHOST" action update --auth "$AUTH" --shared yes iot-rti/add_message_source "$PACKAGE_HOME/iot-rti/add_message_source.js" \
    -a description 'Add message source' \
    -a parameters '[{"name":"apiKey","required":true,"bindTime":true,"description":"API Key Watson IoT RTI service"},{"name":"authToken","required":true,"bindTime":true,"description":"Authentication token of an Watson IoT RTI service","type":"password"},{"name":"iot_apiKey","required":true,"bindTime":true,"description":"API Key of Watson IoT Platform service (message source)"},{"name":"iot_apiToken","required":true,"bindTime":true,"description":"Authentication token of Watson IoT Platform service (message source)","type":"password"},{"name":"orgId","required":true,"bindTime":true,"description":"Org Id of Watson IoT Platform service (message source)"},{"name":"name","required":false,"bindTime":false,"description":"Name of the message source, default: Message Source +orgId "},{"name":"disabled","required":false,"bindTime":false,"description":"Disable or enable the message source, default : false"}]' \
    -a sampleInput '{"apiKey":"XXXXXX","authToken":"YYYYYY","iot_apiKey":"XXXXXX","iot_apiToken":"YYYYYY","orgId":"ZZZZ","name":"source1"}' \
    -a sampleOutput '{"apiKey":"XXXXX","authToken":"YYYYY","created":"27 Jun 2016 17:20:35 GMT","disabled":false,"id":"grNwDDKD","name":"source1","orgId":"zxdo1w","updated":"27 Jun 2016 17:20:35 GMT"}'


$WSK_CLI --apihost "$APIHOST" action update --auth "$AUTH" --shared yes iot-rti/delete_message_source "$PACKAGE_HOME/iot-rti/delete_message_source.js" \
    -a description 'Delete Message Source' \
    -a parameters '[{"name":"apiKey","required":true,"bindTime":true,"description":"API Key Watson IoT RTI service"},{"name":"authToken","required":true,"bindTime":true,"description":"Authentication token of an Watson IoT RTI service","type":"password"},{"name":"name","required":false,"bindTime":false,"description":"Name of the message source"}]' \
    -a sampleInput '{"apiKey":"XXXXXX","authToken":"YYYYYY","name":"source1"}' \
    -a sampleOutput '{"success": "message source deleted"}'


$WSK_CLI --apihost "$APIHOST" action update --auth "$AUTH" --shared yes iot-rti/add_message_schema "$PACKAGE_HOME/iot-rti/add_message_schema.js" \
    -a description 'Add Message Schema' \
    -a parameters '[{"name":"apiKey","required":true,"bindTime":true,"description":"API Key Watson IoT RTI service"},{"name":"authToken","required":true,"bindTime":true,"description":"Authentication token of an Watson IoT RTI service","type":"password"},{"name":"name","required":false,"bindTime":false,"description":"Name of the message source"}]' \
    -a sampleInput '{"apiKey":"XXXXXX","authToken":"YYYYYY","name":"source1"}' \
    -a sampleOutput '{"created":"27 Jun 2016 14:47:03 GMT","deviceType":null,"format":"JSON","id":"YPtEVgFY","items":[{"composite":false,"description":"value","event":null,"formula":null,"id":1,"keyIndex":false,"length":null,"metaui":null,"name":"value2","subItems":[],"subType":null,"timestamp":false,"type":"int"}],"name":"messageSchemaName","updated":"27 Jun 2016 14:47:03 GMT"}'
