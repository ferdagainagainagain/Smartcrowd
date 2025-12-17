/*
The circuit:
  light: red gnd, brown d13
  bottom: orange gnd, blue d2
*/


//Button variables 
int buttonState = HIGH;        
int lastButtonState = HIGH;
int buttonPushCounter = 0;


unsigned long buttonPressStart = 0;
const unsigned long LONG_PRESS_TIME = 3000;
bool longPressTriggered = false;




void setup_button() {

  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);

}



bool shortPressDetected() {
  static bool lastState = HIGH;
  bool currentState = digitalRead(button);

  if (lastState == HIGH && currentState == LOW) {
    lastState = currentState;
    return true; // fronte di discesa → click breve
  }

  lastState = currentState;
  return false;
}


bool longPressDetected() {
  bool currentState = digitalRead(button);

  if (currentState == LOW) {
    if (buttonPressStart == 0) {
      buttonPressStart = millis();
      longPressTriggered = false;
    } else if ((millis() - buttonPressStart >= LONG_PRESS_TIME) && !longPressTriggered) {
      longPressTriggered = true;
      return true;
    }
  } else {
    buttonPressStart = 0;
    longPressTriggered = false;
  }
  return false;
}