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

package packages

import common._
import org.junit.runner.RunWith
import org.scalatest.Matchers
import org.scalatest.junit.JUnitRunner
import spray.json._
import spray.json.DefaultJsonProtocol.StringJsonFormat
import scala.collection.immutable.HashMap
import org.scalatest.Sequential
import org.scalatest.FlatSpecLike

@RunWith(classOf[JUnitRunner])
class IorRtiTests extends TestHelpers with WskTestHelpers with Matchers {

  implicit val wskprops = WskProps()
  val wsk = new Wsk()

  val rtiCredentials = TestUtils.getVCAPcredentials("iot-rti")
  val iotCredentials = TestUtils.getVCAPcredentials("iot")

  val iotApiKey = iotCredentials.get("apiKey")
  val iotApiToken = iotCredentials.get("apiToken")
  val orgId = iotCredentials.get("org")

  val apiKey = rtiCredentials.get("apiKey")
  val authToken= rtiCredentials.get("authToken")
  
  val msgSchema = "messageSchema"
  
  //"": "messageSchema"

  behavior of "Watson IoT Real-time Insights Service Package"

  Sequential

  "add message source" should "add a Watson IoT Platform as a message source to an IoT RTI service instance" in {

    val actionName = "/whisk.system/iot-rti/add_message_source"
    val params = HashMap(
        "apiKey" -> apiKey.toJson,
        "authToken" -> authToken.toJson,
        "orgId" -> orgId.toJson,
        "iot_apiKey" -> iotApiKey.toJson,
        "iot_apiToken" -> iotApiToken.toJson);

    withActivation(wsk.activation, wsk.action.invoke(actionName, params)) {
      _.fields("response").toString should include(s""""orgId": "$orgId"""")
    }
  }

  "add message schema" should "add message schema to IoT RTI service instance" in {

    val actionName = "/whisk.system/iot-rti/add_message_schema"
    val params = HashMap(
        "apiKey" -> apiKey.toJson,
        "authToken" -> authToken.toJson,
        "name" -> msgSchema.toJson,
        "items" -> "[{ \"name\": \"value\", \"description\": \"value\", \"type\": \"int\", \"subItems\": [] }]".toJson 
);

    withActivation(wsk.activation, wsk.action.invoke(actionName, params)) {
      _.fields("response").toString should include(s""""name": "$msgSchema"""")
    }
  }
  
  
  "delete message schema" should "delete message schema in IoT RTI service instance and return success" in {

    val actionName = "/whisk.system/iot-rti/delete_message_schema"
    val params = HashMap(
        "apiKey" -> apiKey.toJson,
        "authToken" -> authToken.toJson,
        "name" -> msgSchema.toJson);

    withActivation(wsk.activation, wsk.action.invoke(actionName, params)) {
      _.fields("response").toString should include(""""success": "message schema deleted"""")
    }
  }
  
  "delete message source" should "delete message source in IoT RTI service instance and return success" in {

    val actionName = "/whisk.system/iot-rti/delete_message_source"
    val params = HashMap(
        "apiKey" -> apiKey.toJson,
        "authToken" -> authToken.toJson,
        "name" -> msgSchema.toJson);

    withActivation(wsk.activation, wsk.action.invoke(actionName, params)) {
      _.fields("response").toString should include(""""success": "message source deleted"""")
    }
  }

}
