

//button pin
const int buttonLed = 13;
const int button = 2;

//Sensors variables
float hr = 60;
float temp = 36; 


// External acceleration variables from gyro.ino
extern float acc = 0;
extern float accX = 0;
extern float accY = 0;
extern float accZ = 0;


// External RSSI variables from RSSI.ino
extern float globalRSSI1;
extern float globalRSSI2;
extern float globalRSSI3;


// RSSI time interval
unsigned long lastRSSITime = 0;
// Set this to how often you want RSSI updates (e.g., 2000ms = 2 seconds)
const unsigned long RSSI_INTERVAL = 2000; 

// Emergency thresholds
const float HR_EMERGENCY = 120.0;      
const float ACC_EMERGENCY = 7.5;
const float TEMP_EMERGENCY = 30;        

// emergency state variable 
bool emergencyActive = false;


bool systemOn = false;




void setup() {

  Serial.begin(9600);

  setup_gyro();
  setup_RSSI();
  setup_heartRate();
  setup_button();
  setup_temp();
  setup_bluetooth();
}




void loop() {


  // 1. BUTTON LOGIC

  if (!systemOn && shortPressDetected()) {    //power on
    systemOn = true;
  }

  if (systemOn && longPressDetected()) {     //power off
    systemOn = false;
    digitalWrite(buttonLed, LOW);
    delay (1000);
  }



  // 2. READ OTHER SENSORS (These run fast)

  hr = heartRate();
  temp = temperature();
  getAcceleration();

  





  // 3. EMERGENCY DETECTION

  if (acc > ACC_EMERGENCY && !systemOn) {

    emergencyActive = true;
    unsigned long emergencyStart = millis();
    bool emergencyCancelled = false;


    // 15 seconds window to cancel the request
    while (millis() - emergencyStart < 15000) {

      // pulsing led 
      digitalWrite(buttonLed, (millis() / 300) % 2);

      // longPress -> cancel the emergency
      if (longPressDetected()) {
        emergencyCancelled = true;
        break;
      }
    }


    // emergency not cacelled -> system on
    if (!emergencyCancelled) {
      systemOn = true;
    }
    else { 
      digitalWrite(buttonLed, LOW);
      delay(1000);
    }


  }






 

  // 4. STATE MANAGEMENT
  if (systemOn) {
    
    digitalWrite(buttonLed, HIGH);

    if (millis() - lastRSSITime > RSSI_INTERVAL) {
      lastRSSITime = millis(); // Reset timer
      getRSSI();   
    }
    
  } 





  

  // Serial.print("[");
  // Serial.print(systemOn);
  // Serial.print("; ");
  // Serial.print(acc);
  // Serial.print("; ");
  // Serial.print(accX);
  // Serial.print("; ");
  // Serial.print(accY);
  // Serial.print("; ");
  // Serial.print(accZ);
  // Serial.print("; ");
  // Serial.print(hr);
  // Serial.print("; ");
  // Serial.print(temp);
  // Serial.print("; ");
  // Serial.print(globalRSSI1);
  // Serial.print("; ");
  // Serial.print(globalRSSI2);
  // Serial.print("; ");
  // Serial.print(globalRSSI3);
  // Serial.print("]");
  // Serial.println();

  char buffer[128]; // Make sure the buffer is large enough for all your data

  // Format the data into the buffer 
  snprintf(buffer, sizeof(buffer), 
           "[%d; %.2f; %.2f; %.2f; %.2f; %.1f; %.1f; %.1f; %.1f; %.1f]",
           systemOn, acc, accX, accY, accZ, hr, temp, globalRSSI1, globalRSSI2, globalRSSI3
          );
  
  send_data_bluetooth(buffer); 
  
  // Optionally, still print to the serial monitor for debugging
  Serial.println(buffer); 

  
  
   
  // 6. BLE Polling
  loop_bluetooth(); // <-- IMPORTANT: Keeps the BLE communication active

   
  // 5. PRINT (includes last known RSSI values)

}