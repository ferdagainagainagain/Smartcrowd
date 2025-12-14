

float accelerario = 0 ;


void loop() {

accelerario = acceleration();

  Serial.print("Acce:");
  Serial.print(accelerario);
  Serial.print("\t");

 delay(50);

}