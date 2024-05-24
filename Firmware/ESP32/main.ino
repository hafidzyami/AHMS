#include <Wire.h>
#include <Adafruit_MLX90614.h>
#include "MAX30100_PulseOximeter.h"
#include <WiFi.h>
#include <PubSubClient.h>

// Deklarasi pin dan konstanta
#define WIFI_SSID "your_SSID"
#define WIFI_PASSWORD "your_PASSWORD"
#define MQTT_SERVER "broker.hivemq.com"
#define MQTT_PORT 1883
#define MQTT_TOPIC "hafidzganteng/afms"

// Inisialisasi objek untuk sensor
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
PulseOximeter pox;

// Timer untuk menghitung refresh rate pulse oximeter
uint32_t tsLastReport = 0;

// Callback untuk pembaruan pulse oximeter
void onBeatDetected()
{
    Serial.println("Beat Detected!");
}

// Inisialisasi WiFi dan MQTT client
WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32Client")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  // Inisialisasi serial untuk debugging
  Serial.begin(115200);

  // Inisialisasi sensor MLX90614
  if (!mlx.begin()) {
    Serial.println("Gagal menginisialisasi MLX90614! Cek sambungan Anda.");
    while (1);
  }

  // Inisialisasi sensor MAX30100
  if (!pox.begin()) {
    Serial.println("Gagal menginisialisasi MAX30100! Cek sambungan Anda.");
    while (1);
  }
  
  // Mengatur callback untuk beat detection
  pox.setOnBeatDetectedCallback(onBeatDetected);

  // Memulai pengukuran pulse oximeter
  pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);

  // Inisialisasi WiFi dan MQTT
  setup_wifi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
}

void loop() {
  // Membaca suhu dari sensor MLX90614
  double tempAmbient = mlx.readAmbientTempC();
  double tempObject = mlx.readObjectTempC();

  // Memperbarui data dari pulse oximeter
  pox.update();

  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Menampilkan data suhu pada serial monitor
  Serial.print("Suhu Ambient: "); Serial.print(tempAmbient); Serial.println(" *C");
  Serial.print("Suhu Object: "); Serial.print(tempObject); Serial.println(" *C");

  // Menampilkan data pulse oximeter pada serial monitor
  Serial.print("BPM: ");
  Serial.print(pox.getHeartRate());
  Serial.print(" | SpO2: ");
  Serial.println(pox.getSpO2());

  // Menyiapkan payload JSON untuk MQTT
  String payload = "{";
  payload += "\"heartRate\":"; payload += pox.getHeartRate(); payload += ",";
  payload += "\"tempObject\":"; payload += tempObject; payload += ",";
  payload += "\"SpO2\":"; payload += pox.getSpO2();
  payload += "}";

  // Mengirim data melalui MQTT
  client.publish(MQTT_TOPIC, payload.c_str());

  // Delay 1 detik
  delay(1000);
}
