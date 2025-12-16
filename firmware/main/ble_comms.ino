#include <ArduinoBLE.h>

// --- Configuration: UUIDs ---
// Service UUID: Identifies the group of data (e.g., "Sensor Data Service")
// Characteristic UUID: Identifies the specific data stream (e.g., "All Sensor Data")
// NOTE: These are standard 128-bit UUIDs. For a real product, you should generate unique ones.

const char* SERVICE_UUID = "D7F10000-8F98-4B86-B9F2-C5E0D6526D3C";
const char* CHARACTERISTIC_UUID = "D7F10001-8F98-4B86-B9F2-C5E0D6526D3C";

// Define the Service and Characteristic objects
BLEService dataService(SERVICE_UUID);

// The characteristic is set to BLENotify, allowing the receiver to subscribe to updates.
// Max length is set to 128 bytes to hold your formatted string.
BLECharacteristic sensorCharacteristic(CHARACTERISTIC_UUID, 
                                       BLENotify, 
                                       128); 

/**
 * @brief Sets up the BLE Service and Characteristic and starts advertising.
 */
void setup_bluetooth() {
  if (!BLE.begin()) {
    Serial.println("Starting BLE failed!");
    while (1);
  }

  // Set advertised local name and service UUID
  BLE.setLocalName("PortentaTracker");
  BLE.setAdvertisedService(dataService);

  // Add the characteristic to the service
  dataService.addCharacteristic(sensorCharacteristic);

  // Add the service to the BLE peripheral
  BLE.addService(dataService);

  // Start advertising
  BLE.advertise();

  Serial.println("BLE advertising started. Name: PortentaTracker");
}

/**
 * @brief Sends the provided string data over the BLE characteristic using Notification.
 * @param data The string (buffer) to be sent.
 */
void send_data_bluetooth(const char* data) {
  // Check if a central device is connected AND if notifications are enabled
  if (BLE.central() && sensorCharacteristic.subscribed()) {
    // writeValue updates the characteristic's value, which triggers a notification 
    // because the characteristic was defined with BLENotify.
    sensorCharacteristic.writeValue((uint8_t*)data, strlen(data));
  }
}

/**
 * @brief Must be called regularly in loop() to keep the BLE stack running.
 */
void loop_bluetooth() {
  // Poll for BLE events (connections, disconnections, subscription changes, etc.)
  BLE.poll(); 
}