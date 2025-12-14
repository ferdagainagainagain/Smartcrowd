
/*
The circuit:
  light: red gnd, brown d13
  bottom: orange gnd, blue d2
*/


int buttonState = HIGH;        // con INPUT_PULLUP: a riposo è HIGH
int lastButtonState = HIGH;
int buttonPushCounter = 0;
const int buttonLed = 13;


void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(buttonLed, OUTPUT);      // <--- cambiato
  Serial.begin(9600);

  setupMPU();

  setup_hr();
}




// ##################################### the upper part is for the button #################################



float accelerario = 0 ;


void loop() {



 buttonState = digitalRead(2);

  if (buttonState != lastButtonState) {
    // se lo stato è cambiato
    if (buttonState == LOW) {  // <--- ora LOW = pulsante premuto
      buttonPushCounter += 1;
    }
    delay(20);                 // un po’ più di debounce (es. 20 ms)
  }

  lastButtonState = buttonState;

  if (buttonPushCounter % 2 == 1) {
    digitalWrite(buttonLed, HIGH);

    accelerario = acceleration();
    heartrate = loop_hr();

  Serial.print("Acce:");
  Serial.print(accelerario);
  Serial.print("\t");
  Serial.print("HR:");
  Serial.print(heartrate);
  Serial.print("\t");
  delay(50);




  } else {
    digitalWrite(buttonLed, LOW);
  }



}