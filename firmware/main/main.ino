

//button pin
const int buttonLed = 13;
const int button = 2;

//Sensors variables
float hr = 60;
float acc = 0;
float temp = 36; 

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
  acc = acceleration();
  temp = temperature();





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
    // --- LED ON MODE ---
    digitalWrite(buttonLed, HIGH);

    // --- THE FIX: NON-BLOCKING TIMER ---
    // Instead of running getRSSI() every loop, we check if 2 seconds have passed.
    if (millis() - lastRSSITime > RSSI_INTERVAL) {
      lastRSSITime = millis(); // Reset timer
      getRSSI();   
      Serial.print("RSSI1:");
      Serial.print(globalRSSI1, 2);
      Serial.print("\t");
      Serial.print("RSSI2:");
      Serial.print(globalRSSI2, 2);
      Serial.print("\t");
      Serial.print("RSSI3:");
      Serial.print(globalRSSI3, 2); 
      Serial.println();
               // This will still freeze for 4s, but only ONCE every 2 seconds
    }
    
  } else {
    // --- LED OFF MODE ---
    digitalWrite(buttonLed, LOW);
    Serial.print("Acce:");
    Serial.print(acc);
    Serial.print("\t");

    Serial.print("HR:");
    Serial.print(hr);
    Serial.print("\t");

    Serial.print("temp:");
    Serial.print(temp);
    Serial.print("\t");
    Serial.println();
  }




   
  // 5. PRINT (includes last known RSSI values)

}