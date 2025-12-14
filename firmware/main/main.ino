/*
The circuit:
  light: red gnd, brown d13
  bottom: orange gnd, blue d2
*/

int buttonState = HIGH;        
int lastButtonState = HIGH;
int buttonPushCounter = 0;
const int buttonLed = 13;

float heartrate = 999;
float accelerario = 0;

// --- NEW VARIABLES FOR TIMING ---
unsigned long lastRSSITime = 0;
// Set this to how often you want RSSI updates (e.g., 2000ms = 2 seconds)
const unsigned long RSSI_INTERVAL = 2000; 

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(buttonLed, OUTPUT);
  Serial.begin(9600);

  setupMPU();
  setup_RSSI();
  setup_hr();
}

void loop() {
  // 1. BUTTON LOGIC
  buttonState = digitalRead(2);

  if (buttonState != lastButtonState) {
    if (buttonState == LOW) { 
      buttonPushCounter += 1;
    }
    delay(20); // Debounce
  }
  lastButtonState = buttonState;

  // 2. STATE MANAGEMENT
  if (buttonPushCounter % 2 == 1) {
    // --- LED ON MODE ---
    digitalWrite(buttonLed, HIGH);

    // --- THE FIX: NON-BLOCKING TIMER ---
    // Instead of running getRSSI() every loop, we check if 2 seconds have passed.
    if (millis() - lastRSSITime > RSSI_INTERVAL) {
      lastRSSITime = millis(); // Reset timer
      getRSSI();               // This will still freeze for 4s, but only ONCE every 2 seconds
    }
    
  } else {
    // --- LED OFF MODE ---
    digitalWrite(buttonLed, LOW);
  }

  // 3. READ OTHER SENSORS (These run fast)
  heartrate = loop_hr();
  accelerario = acceleration();
   
  // 4. PRINT
  
  Serial.print("Acce:");
  Serial.print(accelerario);
  Serial.print("\t");
  Serial.print("HR:");
  Serial.print(heartrate);
  Serial.print("\t");
  Serial.println();
}