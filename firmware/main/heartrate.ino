#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 particleSensor;

const byte RATE_SIZE = 6; 
byte rates[RATE_SIZE]; 
byte rateSpot = 0;
long lastBeat = 0; 

float bpm;
int beatAvg;

void setup_hr()
{
  Serial.begin(115200);

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) 
  {
    while (1); 
  }

  particleSensor.setup(); 
  particleSensor.setPulseAmplitudeRed(0x0A); 
  particleSensor.setPulseAmplitudeGreen(0); 
}

float loop_hr()
{
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true)
  {
    long delta = millis() - lastBeat;
    lastBeat = millis();

    bpm = 60 / (delta / 1000.0);

    if (bpm < 255 && bpm > 20)
    {
      rates[rateSpot++] = (byte)bpm; 
      rateSpot %= RATE_SIZE; 

      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  //Serial.print(", BPM=");
  //Serial.print(bpm);
  //Serial.print(", Avg BPM=");
  //Serial.print(beatAvg);

  if (irValue < 50000)
    Serial.print(" [finger not detected]");
  else 
    Serial.print(" [finger OK]");
 
  return bpm;
}