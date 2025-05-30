import paho.mqtt.client as mqtt
import cv2
from datetime import datetime
import os
import requests

def capture_image():
    os.makedirs("captures", exist_ok=True)
    cam = cv2.VideoCapture(0)
    ret, frame = cam.read()
    if ret:
        filename = f"captures/capture_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        cv2.imwrite(filename, frame)
        print(f"📸 Captured: {filename}")
        upload_image(filename)
    else:
        print("❌ Failed to capture image")
    cam.release()

def send_sensor_data(data):
    print("trynna send")
    url = "http://172.20.10.2:8000/api/sensor-logs"
    payload = {
        'device_id': 'esp32-001',

        'humidity': data.get('humidity'),
        'soil_moisture_percent': data.get('soil'),
        'rain_percent': data.get('rain'),
        'distance_cm': data.get('distance'),
        'recorded_at': datetime.now().isoformat()
    }

    try:
        res = requests.post(url, json=payload)
        print(f"📡 Sent: {res.status_code}, sent")
    except Exception as e:
        print("💀 Failed to send sensor data:", e)


def upload_image(filepath):
    url = "http://172.20.10.2:8000/api/alerts/upload"
    with open(filepath, "rb") as img:
        files = {'image': img}
        data = {
            'device_id': 'esp32-logger-1',
            'timestamp': datetime.now().isoformat()
        }
        try:
            res = requests.post(url, files=files, data=data)
            print("🔥 Upload status:", res.status_code)
            print(res.text)
        except Exception as e:
            print("💀 Upload failed:", e)

def on_connect(client, userdata, flags, rc):
    print("✅ Connected to MQTT Broker")
    client.subscribe("camera/trigger")
    client.subscribe("sensor/data")  # SUBSCRIBE to sensor data stream too
    

def on_message(client, userdata, msg):
    # print(f"📩 Received message on {msg.topic}: {msg.payload.decode()}")
    # if msg.payload.decode() == "TRIGGER":
    #     capture_image()
    topic = msg.topic
    payload = msg.payload.decode()

    print(f"📩 MQTT [{topic}]: {payload}")

    if topic == "camera/trigger" and payload == "TRIGGER":
        capture_image()

    elif topic == "sensor/data":
        try:
            parts = payload.strip().split(",")
            if len(parts) == 5:
                data = {
                    'temperature': float(parts[0]),
                    'humidity': float(parts[1]),
                    'soil': float(parts[2]),
                    'rain': float(parts[3]),
                    'distance': float(parts[4])
                }
                send_sensor_data(data)
                # Check distance condition for auto-capture
                if data['distance'] < 10.0:
                    print("🚨 Distance under 10cm — auto-capturing image!")
                    capture_image()
            else:
                print("⚠️ Unexpected sensor payload format")
        except Exception as e:
            print("💀 Failed to parse sensor MQTT payload:", e)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", 1883, 60)
client.loop_forever()
