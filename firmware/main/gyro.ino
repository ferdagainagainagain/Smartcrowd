// Basic demo for accelerometer readings from Adafruit MPU6050
// MODIFIED FOR SERIAL PLOTTER

#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <math.h>

Adafruit_MPU6050 mpu;

float accelerarion = 0;


void setupMPU(void) {
  Serial.begin(115200);
  while (!Serial)
    delay(10); 

  // Initializing
  if (!mpu.begin()) {
    while (1) {
      delay(10); // Halt if not found
    }
  }

  // Settings
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  // Give a small delay to settle before plotting starts
  delay(100);
}





float acceleration() {
  /* Get new sensor events with the readings */
  sensors_event_t a, g, temp;
  
  mpu.getEvent(&a, &g, &temp);


  /* --- SERIAL PLOTTER FORMAT ---
     Format: Label:Value \t Label:Value \t ... 
     The plotter sees the tab "\t" as a separator and "Label:" as the legend name.
  */

  // 1. Acceleration
  Serial.print("AccelX:");
  Serial.print(a.acceleration.x);
  Serial.print("\t");
  
  Serial.print("AccelY:");
  Serial.print(a.acceleration.y);
  Serial.print("\t");
  
  Serial.print("AccelZ:");
  Serial.print(a.acceleration.z);
  Serial.print("\t");


  accelerarion = abs(abs(a.acceleration.x) + abs(a.acceleration.y) + abs(a.acceleration.z) - 10.0);
  
  //Serial.print("Acce:");
  //Serial.print(accelerarion);
  //Serial.print("\t");


  // 2. Rotation (Gyro)
  //Serial.print("GyroX:");
  //Serial.print(g.gyro.x);
  //Serial.print("\t");

  //Serial.print("GyroY:");
  //Serial.print(g.gyro.y);
  //Serial.print("\t");

  //Serial.print("GyroZ:");
  //Serial.print(g.gyro.z);

  // 3. End the line (essential for the plotter to step forward)
  Serial.println();

 

return accelerarion;
}
