/*
The circuit:
  gray gnd, orange power
  purple scl, blue sda
*/



#include <BME280I2C.h>
#include <Wire.h>


BME280I2C bme;   // Impostazioni di default
float temp1(NAN);




void setup_temp()
{
  
  Wire.begin();

  while (!bme.begin())
  {
    Serial.println("Could not find BME280 sensor!");
    delay(1000);
  }
}




float temperature()
{
  float hum, pres;   // Variabili necessarie ma non usate

  BME280::TempUnit tempUnit(BME280::TempUnit_Celsius);
  BME280::PresUnit presUnit(BME280::PresUnit_Pa);

  // Lettura sensore (usiamo solo la temperatura)
  bme.read(pres, temp1, hum, tempUnit, presUnit);


  return temp1;
}



