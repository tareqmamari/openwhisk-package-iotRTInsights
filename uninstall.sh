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
    echo "Usage: ./uninstall.sh <apihost> <authkey> <pathtowskcli>"
fi

APIHOST="$1"
AUTH="$2"
WSK_CLI="$3"

PACKAGE_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo Uninstalling Watson IoT Real-Time insights Package \

$WSK_CLI --apihost "$APIHOST" action delete --auth "$AUTH"  iot-rti/add_message_source

$WSK_CLI --apihost "$APIHOST" action delete --auth "$AUTH"  iot-rti/delete_message_source

$WSK_CLI --apihost "$APIHOST" action delete --auth "$AUTH"  iot-rti/add_message_schema

$WSK_CLI --apihost "$APIHOST" action delete --auth "$AUTH"  iot-rti/delete_message_schema

$WSK_CLI --apihost "$APIHOST" action delete --auth "$AUTH"  iot-rti/webhook

$WSK_CLI --apihost "$APIHOST" package delete --auth "$AUTH" iot-rti \


