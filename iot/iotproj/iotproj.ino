#include "DHT.h"
#include <HCSR04.h>
#include <LiquidCrystal_I2C.h>

// Pin Definitions
#define DHTPIN 4
#define TRIGPIN 5
#define ECHOPIN 18
#define BUTTON_PIN 23
#define rainPin 33
#define soilPin 32

// Constants
#define DHTTYPE DHT11
#define SENSOR_INTERVAL 2000  // 2 seconds

int lcdColumns = 16;
int lcdRows = 2;

int lastButtonState = HIGH;
int currentButtonState;

bool showT = false;

unsigned long previousSensorMillis = 0;

DHT dht(DHTPIN, DHTTYPE);
UltraSonicDistanceSensor distanceSensor(TRIGPIN, ECHOPIN);
LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows);

void setup() {
  pinMode(rainPin, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(115200);
  Serial.println(F("DHT11, HCSR04, and Rain Sensor Test!"));

  dht.begin();
  delay(2000); // Allow DHT11 to stabilize

  lcd.init();
  lcd.backlight();      

  Serial.println("Ready!");              
}

void loop() {
  // --- Non-blocking button press detection ---
  currentButtonState = digitalRead(BUTTON_PIN);
  if (lastButtonState == HIGH && currentButtonState == LOW) {
    Serial.println("Button Press Detected!");
    showT = true;
  }
  lastButtonState = currentButtonState;

  // --- Sensor and LCD update every 2 seconds ---
  unsigned long currentMillis = millis();
  if (currentMillis - previousSensorMillis >= SENSOR_INTERVAL) {
    previousSensorMillis = currentMillis;

    Serial.println("----- Sensor Readings -----");

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    float distance = distanceSensor.measureDistanceCm();
    int rainValue = analogRead(rainPin);   // Analog read for rain intensity
    int rainPercent = map(rainValue, 0, 4095, 100, 0);  // 0 = wet, 100 = dry
    int soilValue = analogRead(soilPin);   // Raw analog read (0 = wet, max = dry)

    lcd.clear();

    // Only update display and Serial if sensor values are valid
    if (!isnan(h) && !isnan(t)) {
      float hic = dht.computeHeatIndex(t, h, false);

      Serial.print(F("Humidity: "));
      Serial.print(h);
      Serial.println(F("%"));

      Serial.print(F("Temperature: "));
      Serial.print(t);
      Serial.println(F("°C"));

      Serial.print(F("Heat Index (Celsius): "));
      Serial.print(hic);
      Serial.println(F("°C"));

      lcd.setCursor(0, 0);
      lcd.print("T:");
      lcd.print((int)t);       // Integer temp
      lcd.print("C ");

      lcd.print("H:");
      lcd.print((int)h);       // Integer humidity
      lcd.print("%");
    } else {
      Serial.println(F("Failed to read from DHT sensor!"));
      lcd.setCursor(0, 0);
      lcd.print("Sensor Error");
    }

    lcd.setCursor(0, 1);

    if (distance > 2 && distance < 400) {
      Serial.print("Ultrasonic Distance: ");
      Serial.print(distance);
      Serial.println(" cm");

      lcd.print("D:");
      lcd.print(int(distance));
      lcd.print("cm ");
    } else {
      Serial.println("Ultrasonic out of range.");
      lcd.print("D:- ");
    }

    // --- Soil Moisture Sensor ---
    Serial.print("Soil Raw Value: ");
    Serial.println(soilValue);

    // Convert to percentage (assuming ESP32 12-bit ADC range 0-4095)
    int moisturePercent = map(soilValue, 4095, 0, 0, 100); // 0 (dry) to 100 (wet)
    Serial.print("Soil Moisture: ");
    Serial.print(moisturePercent);
    Serial.println("%");

    // Optional: Display short soil status in LCD if room
    if (moisturePercent > 60) {
      Serial.println("Soil: Wet");
    } else if (moisturePercent > 30) {
      Serial.println("Soil: Moist");
    } else {
      Serial.println("Soil: Dry");
    }

    // --- Soil Moisture ---
    lcd.print("S:");
    lcd.print(moisturePercent);
    lcd.print("% ");

    // --- Rain Sensor ---
    Serial.print("Rain Value: ");
    Serial.print(rainValue);
    Serial.print(" → ");
    Serial.print(rainPercent);
    Serial.println("%");

    if (rainPercent > 30) {
      Serial.println("Rain detected!");
    } else {
      Serial.println("No rain.");
    }

    lcd.print("R:");
    lcd.print(rainPercent);
    lcd.print("%");

    // --- Show 'ALERT' on full screen when button is pressed ---
    if (showT) {
      lcd.clear();
      lcd.setCursor(2, 0);  // Center "ALERT" horizontally
      lcd.print("!! ALERT !!");

      delay(2000); // Show for 2 seconds (non-blocking alternative possible)
      showT = false;
      return; // Skip rest of loop to avoid sensor display overwrite
    }

    Serial.println("---------------------------\n");
  }
}
