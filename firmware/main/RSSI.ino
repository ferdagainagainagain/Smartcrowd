#include <WiFi.h>

// =============================================================
// Configuration
// =============================================================
const int WINDOW_SIZE = 7;
const unsigned long OUTPUT_INTERVAL_MS = 3000;

// Target Access Points
const char* AP_NAMES[3] = {
  "PortentaAccessPoint1",
  "PortentaAccessPoint2",
  "PortentaAccessPoint3"
};

// =============================================================
// Optimized path-loss parameters (FROM PYTHON)
// RSSI = -10 * n * log10(d) + A
// d = 10^((A - RSSI) / (10 * n))
// =============================================================
const float A_PARAMS[3] = {
  -39.87,   // AP1
  -40.21,   // AP2
  -40.00    // AP3
};

const float N_PARAMS[3] = {
  2.10,     // AP1
  2.09,     // AP2
  2.13      // AP3
};

// ==================

// ==================




// =============================================================
// Moving average buffers (one per AP)
// =============================================================
float rssiWindow[3][WINDOW_SIZE];
int windowIndex[3] = {0, 0, 0};
int sampleCount[3] = {0, 0, 0};

// Timing
unsigned long lastOutputTime = 0;

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

float estimateDistance(float avgRSSI, int apIndex) {
  float A = A_PARAMS[apIndex];
  float n = N_PARAMS[apIndex];
  return pow(10.0, (A - avgRSSI) / (10.0 * n));
}

// =============================================================
// Setup
// =============================================================
void setup_RSSI() {
  Serial.begin(9600);
  while (!Serial);

  Serial.println("ScanNetworks – 3 AP Distance Estimation");
  Serial.println("Format: AP,RSSI_AVG,DISTANCE_M");
}

// =============================================================
// Loop
// =============================================================
void getRSSI() {
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

  // Output every 3 seconds
  unsigned long now = millis();
  if (now - lastOutputTime >= OUTPUT_INTERVAL_MS) {
    lastOutputTime = now;

    for (int ap = 0; ap < 3; ap++) {
      float avgRSSI = getAverageRSSI(ap);
      if (!isnan(avgRSSI)) {
        float distance = estimateDistance(avgRSSI, ap);

        Serial.print(AP_NAMES[ap]);
        Serial.print(",");
        Serial.print(avgRSSI, 1);
        Serial.print(",");
        Serial.println(distance, 2);
      }
    }

    Serial.println("---");
  }
}






