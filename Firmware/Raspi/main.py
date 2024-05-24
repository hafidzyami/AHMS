import cv2
import sys
from flask import Flask, render_template, Response
from webcamvideostream import WebcamVideoStream
from flask_basicauth import BasicAuth
import time
import threading

app = Flask(__name__)
active_streams = {}  # Dictionary to store active video streams

@app.route('/')
def index():
    return render_template('index.html')

def gen(camera):
    while True:
        if camera.stopped:
            break
        frame = camera.read()
        ret, jpeg = cv2.imencode('.jpg', frame)
        if jpeg is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n\r\n')
        else:
            print("frame is none")

@app.route('/video_feed')
def video_feed():
    if 'video_stream' not in active_streams:
        active_streams['video_stream'] = WebcamVideoStream().start()
    return Response(gen(active_streams['video_stream']),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/shutdown')
def shutdown():
    if 'video_stream' in active_streams:
        active_streams['video_stream'].stop()
        del active_streams['video_stream']
    return 'Server shutting down...'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True, threaded=True)
