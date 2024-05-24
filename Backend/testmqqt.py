import paho.mqtt.client as mqtt
import random
import time
import json
import keyboard  # Import the keyboard library

# Define the MQTT broker details
broker = "broker.hivemq.com"
port = 1883
topic = "ahms"

# Create a client instance
client = mqtt.Client()

# Connect to the broker
client.connect(broker, port, 60)

condition_normal = "Tidak terdeteksi urgensi"
condition_urgent = "Terdeteksi urgent, segera hubungi dokter!"

try:
    while True:
        # Check if 'q' is pressed
        if keyboard.is_pressed('q'):
            condition = condition_urgent
            heart = random.randint(95, 100)
            temperature = random.randint(38, 40)
        else:
            condition = condition_normal
            heart = random.randint(80, 90)
            temperature = random.randint(34, 36)

        # Generate random data
        data = {
            "heart": heart,
            "o2": random.randint(98, 100),
            "temperature": temperature,
            "condition": condition
        }

        # Convert the dictionary to a JSON string
        data_json = json.dumps(data)

        # Publish the data to the topic
        client.publish(topic, data_json)

        # Print confirmation
        print(f"Data {data_json} sent to topic {topic} at broker {broker}")

        # Wait for a second before sending the next data
        time.sleep(2)
except KeyboardInterrupt:
    print("Interrupted by user")

# Disconnect from the broker
client.disconnect()
