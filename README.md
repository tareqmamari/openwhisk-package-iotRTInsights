OpenWhisk Service Enablement
============================
This repository is intended to document all actions and feeds withing Watson IoT Platform RTI service.

##IBM Watson IoT Platform Analytics Real-Time Insights
[IoT Real-Time Insights API](https://iotrti-prod.mam.ibmserviceengage.com/apidoc/)

| Entity | Type | Parameters | Description |
| --- | --- | --- | --- |
| `/whisk.system/iot-rti` | package | apiKey, authToken  | IoT Real time insight service package |
| `/whisk.system/iot-rti/webhook` | feed | see webhook [details](#webhook) | a feed to register for events by RTI, this will fire a trigger whenever specific conditions are met |
| `/whisk.system/iot-rti/add_message_source` | action | see action [details](#add-message-source) | An action to add a message source ( Watson IoT Platform) to Real-time insight service |

###Actions:
####Add Message Source:
An action to add a message source ( Watson IoT Platform) to Real-time insight service.

| **Parameter**     | **Type** | **Required** | **Description**| **Options** | **Default** | **Example** |
| ------------- | ---- | -------- | ------------ | ------- | ------- |------- |
| orgId | *string* | yes  |  Watson IoT platform organization Id | - | - | "XXXXX" |
| iot_apiKey | *string* | yes  |  RTI Api key | - | - | "XXXXXXXXX" |
| iot_authToken | *string* | yes  |  RTI Api key | - | - | "YYYYYYYYYY" |
| apiKey | *string* | yes  |  RTI Api key | - | - | "XXXXXXXXX" |
| authToken | *string* | yes  | RTP authentication token| - | - |"YYYYYYY" |
| name | *string* | no | name of the message source | - | "Message Source "+orgId |"Message Source htpsa" |
| disabled | *boolean* | no | disable or enable the message source | false,true | false | false |

####Add Message Schema
An action that create a new message schema which is used to parse the incoming messages to know its attributes whick will lead to consistent analytics.

| **Parameter** | **Type** | **Required** | **Description**| **Options** | **Default** | **Example** |
| ------------- | ---- | -------- | ------------ | ------- | ------- |------- |
| apiKey | *string* | yes  |  RTI Api key | - | - | "XXXXXXXXX" |
| authToken | *string* | yes  | RTP authentication token | - | - | "YYYYYYY" |
| name | *string* | yes | message schema name ( mmust be unique) | - | - | "message schema" |
| items | *object* | yes | JSON object that describe the schema | -  | -  | `[{ "name": "value", "description": "value", "type": "int", "subItems": [] }]` |

###Feeds:
####Webhook:
 A feed that will create a rule and an RTI action to fire a trigger whenever the provided device conditions are met.

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
wsk trigger create rtiFeed --feed /whisk.system/iot/rtiWebhook -p apiKey 'XXXXXXXX' -p authToken 'YYYYYYYY' -p schemaName 'schema'  -p condition 'schema.value>1'
```
