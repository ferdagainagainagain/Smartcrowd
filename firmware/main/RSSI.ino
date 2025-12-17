#include <WiFi.h>

// =============================================================
// Configuration
// =============================================================
const int WINDOW_SIZE = 10;

// Target Access Points
const char* AP_NAMES[3] = {
  "PortentaAccessPoint1",
  "PortentaAccessPoint2",
  "PortentaAccessPoint3"
};

// =============================================================
// Global RSSI values (accessible from main.ino)
// =============================================================
float globalRSSI1 = NAN;
float globalRSSI2 = NAN;
float globalRSSI3 = NAN;

// =============================================================
// Moving average buffers (one per AP)
// =============================================================
float rssiWindow[3][WINDOW_SIZE];
int windowIndex[3] = {0, 0, 0};
int sampleCount[3] = {0, 0, 0};
int rssiValue[3]= {0,0,0};



// =============================================================
// Utility functions
// =============================================================
float getAverageRSSI(int apIndex) {
  float sum = 0;
  int count = min(sampleCount[apIndex], WINDOW_SIZE);
  if (count == 0) return NAN;

  for (int i = 0; i < count; i++) {
    sum += rssiWindow[apIndex][i];
  }
  return sum / count;
}






void setup_RSSI() {
  // WiFi scanning initialization (Serial already started in main.ino)
}





void getRSSI() {
  int numSsid = WiFi.scanNetworks();

  // Update RSSI windows
  for (int i = 0; i < numSsid; i++) {
    String ssid = WiFi.SSID(i);
    long rssi = WiFi.RSSI(i);

    for (int ap = 0; ap < 3; ap++) {
      if (ssid == AP_NAMES[ap]) {
        rssiValue[ap] = rssi;

      }
    }
  }

  // Update global RSSI values for each AP
  
  

  if (!isnan(rssiValue[0])) {
    globalRSSI1 = rssiValue[0];
  }
  

  if (!isnan(rssiValue[1])) {
    globalRSSI2 = rssiValue[1];
  }
  

  if (!isnan(rssiValue[2])) {
    globalRSSI3 = rssiValue[2];
  }
}






void getRSSI_window() {
  int numSsid = WiFi.scanNetworks();

  // Update RSSI windows
  for (int i = 0; i < numSsid; i++) {
    String ssid = WiFi.SSID(i);
    long rssi = WiFi.RSSI(i);

    for (int ap = 0; ap < 3; ap++) {
      if (ssid == AP_NAMES[ap]) {
        rssiWindow[ap][windowIndex[ap]] = rssi;
        windowIndex[ap] = (windowIndex[ap] + 1) % WINDOW_SIZE;
        sampleCount[ap]++;
      }
    }
  }

  // Update global RSSI values for each AP
  float avgRSSI;
  
  avgRSSI = getAverageRSSI(0);
  if (!isnan(avgRSSI)) {
    globalRSSI1 = avgRSSI;
  }
  
  avgRSSI = getAverageRSSI(1);
  if (!isnan(avgRSSI)) {
    globalRSSI2 = avgRSSI;
  }
  
  avgRSSI = getAverageRSSI(2);
  if (!isnan(avgRSSI)) {
    globalRSSI3 = avgRSSI;
  }
}












