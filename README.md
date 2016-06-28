OpenWhisk Service Enablement
============================
This repository is intended to document all actions and feeds withing Watson IoT Reatime-insights service.

Looking for Watson IoT Platform ? [Here](https://github.com/tareqmamari/openwhisk-package-iot)

##IBM Watson IoT Platform Analytics Real-Time Insights
Reference: [IoT Real-Time Insights API](https://iotrti-prod.mam.ibmserviceengage.com/apidoc/)

### Getting Started:
In order to be able to use this package, you should have the following as a prerequisite:

  1. An up and running Watson IoT RTI service instance [Bluemix Catalog](https://console.ng.bluemix.net/catalog/).
  2. Service API Key and Authentication Token, this can be done by one of the following:

  - **Using CF:**
```bash
   # Create new service key if you haven't done that before 
   cf create-service-key service_instance_name service_key_name
    # Get the created key
   cf service-key service_instance_name service_key_name
```
  - **Application-Service Bindings:** If you bind the RTI service instance to any application, you will be able to get service credentials through the application dashboard under *Environment Variables*


| Entity | Type | Parameters | Description |
| --- | --- | --- | --- |
| `/whisk.system/iot-rti` | package | apiKey, authToken  | IoT Real time insight service package |
| `/whisk.system/iot-rti/webhook` | feed | see webhook [details](#webhook) | a feed to register for events by RTI, this will fire a trigger whenever specific conditions are met |
| `/whisk.system/iot-rti/add_message_source` | action | see action [details](#add-message-source) | Adddd a message source ( Watson IoT Platform) to Real-time insights service |
| `/whisk.system/iot-rti/delete_message_source` | action | see action [details](#delete-message-source) | Delete a message source|
| `/whisk.system/iot-rti/add_message_schema` | action | see action [details](#add-message-schema) | An action to add a message schema|
| `/whisk.system/iot-rti/delete_message_schema` | action | see action [details](#delete-message-schema) | Delete a message schema|

###Actions:
####Add Message Source:
`/whisk.system/iot-rti/add_message_source` is an action to add a message source ( Watson IoT Platform) to Real-time insight service.

#####Parameters

| **Parameter**     | **Type** | **Required** | **Description**| **Options** | **Default** | **Example** |
| ------------- | ---- | -------- | ------------ | ------- | ------- |------- |
| orgId | *string* | yes  |  Watson IoT platform organization Id | - | - | "XXXXX" |
| iot_apiKey | *string* | yes  |  RTI Api key | - | - | "XXXXXXXXX" |
| iot_apiToken | *string* | yes  |  RTI Api key | - | - | "YYYYYYYYYY" |
| apiKey | *string* | yes  |  RTI Api key | - | - | "XXXXXXXXX" |
| authToken | *string* | yes  | RTI servvice authentication token| - | - |"YYYYYYY" |
| name | *string* | no | name of the message source | - | "Message Source "+orgId |"Message Source htpsa" |
| disabled | *boolean* | no | disable or enable the message source | false,true | false | false |

#####Usage
```bash
wsk action invoke /whisk.system/iot-rti/add_message_source -p orgId 'xxxxx' -p apiKey 'yyyyyy' -p authToken 'zzzzzzzz' -p typeId 'sampleiot' -p deviceId "deviceId" --blocking
```

Example of success response:
```javascript
{
  "apiKey": "XXXXX",
  "authToken": "YYYYY",
  "created": "27 Jun 2016 17:20:35 GMT",
  "disabled": false,
  "id": "grNwDDKD",
  "name": "source1",
  "orgId": "zxdo1w",
  "updated": "27 Jun 2016 17:20:35 GMT"
}
```


####Delete Message Source:
`/whisk.system/iot-rti/delete_message_source` is an action to delete a message source.

#####Parameters

| **Parameter**     | **Type** | **Required** | **Description**| **Options** | **Default** | **Example** |
| ------------- | ---- | -------- | ------------ | ------- | ------- |------- |
| apiKey | *string* | yes  |  RTI Api key | - | - | "XXXXXXXXX" |
| authToken | *string* | yes  | RTI servvice authentication token| - | - |"YYYYYYY" |
| name | *string* | no | name of the message source | - | -  |"message_source_name" |

#####Usage
```bash
wsk action invoke /whisk.system/iot-rti/delete_message_source -p apiKey 'yyyyyy' -p authToken 'zzzzzzzz' -p name 'source1' --blocking
```

Example of success response:
```javascript
{"success": "message source deleted"}
```


####Add Message Schema
An action that create a new message schema which is used to parse the incoming messages to know its attributes.

| **Parameter** | **Type** | **Required** | **Description**| **Options** | **Default** | **Example** |
| ------------- | ---- | -------- | ------------ | ------- | ------- |------- |
| apiKey | *string* | yes  |  RTI Api key | - | - | "XXXXXXXXX" |
| authToken | *string* | yes  | RTP authentication token | - | - | "YYYYYYY" |
| name | *string* | yes | message schema name ( mmust be unique) | - | - | "message schema" |
| items | *object* | yes | JSON object that describe the schema | -  | -  | `[{ "name": "value", "description": "value", "type": "int", "subItems": [] }]` |

Example:
```javascript
{
  "created": "27 Jun 2016 14:47:03 GMT",
  "deviceType": null,
  "format": "JSON",
  "id": "YPtEVgFY",
  "items": [
    {
      "composite": false,
      "description": "value",
      "event": null,
      "formula": null,
      "id": 1,
      "keyIndex": false,
      "length": null,
      "metaui": null,
      "name": "value2",
      "subItems": [
        
      ],
      "subType": null,
      "timestamp": false,
      "type": "int"
    }
  ],
  "name": "messageSchemaName",
  "updated": "27 Jun 2016 14:47:03 GMT"
}
```

#####Usage
```bash
wsk action invoke /whisk.system/iot-rti/add_message_schema -p name 'messageSchemaName' -p items "$(cat items.json)" -p apiKey 'XXXXXX' -p authToken 'YYYYYY' --blocking
```

where items.json contains
```javascript
[{ "name": "value", "description": "value of event", "type": "int", "subItems": [] }]
```

####Delete Message Schema
An action that delete an existing message schema.

| **Parameter** | **Type** | **Required** | **Description**| **Options** | **Default** | **Example** |
| ------------- | ---- | -------- | ------------ | ------- | ------- |------- |
| apiKey | *string* | yes  |  RTI Api key | - | - | "XXXXXXXXX" |
| authToken | *string* | yes  | RTP authentication token | - | - | "YYYYYYY" |
| name | *string* | yes | message schema name ( mmust be unique) | - | - | "message schema" |
#####Usage
```bash
wsk action invoke /whisk.system/iot-rti/add_message_schema -p name 'messageSchemaName' -p apiKey 'XXXXXX' -p authToken 'YYYYYY' --blocking
```

###Feeds:
####Webhook:
 A feed which create an RTI rule and an RTI action to fire a trigger whenever the provided conditions are met.

 **Note:** there are two ways to create for an RTI webhook:
  - From Openwhisk: by using this feed action,
  - Or, from RTI service instance dashboard, while creating an RTI action you can specify openwhisk as a type and select the action or trigger to be invoked whenever there is an event. 

| **Parameter**     | **Type** | **Required** | **Binding Time** | **Description**| **Options** | **Default** | **Example** |
| ------------- | ---- | -------- | ------------ | ------- | ------- | ------- |------- |
| apiKey | *string* | yes | yes |  RTI Api key | - | - | "XXXXXXXX" |
| authToken | *string* | yes | yes | RTP authentication token| - | - |"YYYYYYY" |
| schemaName | *string* | yes | yes| Messages Schema name  | - |  - |"schema" |
| condition | *string* | yes | yes | is a predicate or some conditions joined with binary logical operators | - | - |"schema.value>1" |
| callbackBody | *string* | no | no | message body of the triggered event | - | "{ "rule" : "{{ruleName}}" , "condition" : "{{ruleCondition}}" , "message" : "{{message}}" }"| "{ "rule" : "{{ruleName}}" , "condition" : "{{ruleCondition}}" , "message" : "{{message}}" }" |
| description | *string* | no | no | rule description | - | "A rule created by Openwhisk Feed @ current date and time" | "A rule created by Openwshisk feed" |
| severity | *integer* | no | no | severity of the rule, higher number means lower priority | 1,2,3,4 | 4 | 4 |

Example of creation:
```bash
wsk trigger create rtiFeed --feed /whisk.system/iot-rti/webhook -p apiKey 'XXXXXXXX' -p authToken 'YYYYYYYY' -p schemaName 'schema'  -p condition 'schema.value>1'
```

### Local Deployment:
This package contains an install script that will create a package and add the actions into it, to do so :
```bash
git clone https://github.com/tareqmamari/openwhisk-package-iotRTInsights
cd openwhisk-package-iotRTInsights
./install.sh <apihost> <authkey> <pathtowskcli>
```

* **apihost**: endpoint of openwhisk,
* **authkey**: authentication key e.g. $(cat $OPENWHISK_HOME/config/keys/auth.whisk.system) for whisk.system auth key,
* **pathtowskcli**: path of Openwhisk CLI e.g. $OPENWHISK_HOME/bin/wsk
