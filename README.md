OpenWhisk Service Enablement
============================
This repository is intended to include all packages to be enableded into Openwhisk.

#Packages List:
 - [IBM Watson IoT Platform](#ibm-watson-iot-platform)
 - [IBM Watson IoT Platform Analytics Real-Time Insights](#ibm-watson-iot-platform-analytics-real-time-insights)
 - Object Storage
 - API Connect

##IBM Watson IoT Platform:

[Watson IoT Platform API](https://docs.internetofthings.ibmcloud.com/swagger/v0002.html)

| Entity | Type | Parameters | Description |
| --- | --- | --- | --- |
| `/whisk.system/iot` | package | apiKey, authToken | Watson IoT Platform Package |
| `/whisk.system/iot/register_device` | action | see action [details](#register-device) | an action to add a new device to the IoT platform |
| `/whisk.system/iot/delete_device` | action | see action [details](#delete-device) | an action to delete a registered device |
| `/whisk.system/iot/send_event` | action | see action [details](#register-device) | an action to send device event |

###Actions:
####Register Device
 An action to register new device to Watson IoT platform.

 | **Parameter**     | **Type** | **Required** | **Description**| **Options** | **Default** | **Example** |
| ------------- | ---- | -------- | ------------ | ------- | ------- |------- |
| apiKey | *string* | yes |  Watson IoT platform apiKey | - | - | "XXXXX" |
| authToken | *string* | yes |  Watson IoT platform authonToken | - | - | "XXXXXXXXX" |
| orgId | *string* | yes |  Watson IoT platform organization ID | - | - | "xvfrw1" |
| deviceId | *string* | yes | Device ID | - | - | "newDevice" |
| typeId | *string* | yes | Device Type ID | - | - |"sampleType" |
| deviceAuthToken | *string* | no | Device authentication token, will be generated if not supplied | - | - | "an_unhackable_token" |
| sn | *string* | no | The serial number of the device | - | - | "10211002XYZ" |
| manufacturer | *string* | no | The manufacturer of the device | - | - | "Texas Instruments |
| model | *string* | no | The model of the device | - | - | "HGI500" |
| deviceClass | *string* | no | The class of the device | false,true | false | false |
| description | *string* | no | The descriptive name of the device | - | - | - |
| fwVersion | *string* | no | The firmware version currently known to be on the device | - | - | "1.0" |
| hwVersion | *string* | no | The hardware version of the device | - | false | "1.0" |
| descriptiveLocation | *string* | no | A descriptive location, such as a room or building number, or a geographical region | - | - | "Office 220, building 16" |
| long | *decimal* | no | Longitude in decimal degrees using the WGS84 system | - | - | 9.038550 |
| lat | *decimal* | no | Latitude in decimal degrees using the WGS84 system | - | - | 48.665390 |
| elev | *decimal* | no |  Elevation in meters using the WGS84 system | 507 |
| accuracy | *decimal* | no | Accuracy of the position in meters | false,true | - | 5 |
| measuredDateTime | *string* | no | Date and time of location measurement (ISO8601) | - | - | "2016-05-19T11:36:42.825Z" |
| metadata | *object* | no | Metadata of the device | - | - | ```javascript {"customField1": "customValue1","customField2": "customValue2"}` |

####Delete Device

####Send Device Event
 
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


 - Create RTI Action
 - Get Message Schema
 - Get Message Sources


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
