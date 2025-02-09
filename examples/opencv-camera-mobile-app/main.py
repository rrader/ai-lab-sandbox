import cv2
from pyscript import when
import js
import base64
import numpy as np


@when("click", "#run-btn")
def run(event):
    img_base64 = js.getCanvasSrc("input")
    img = readb64(img_base64[len('data:image/jpg;base64,'):])

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml')

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 1)

    output(img)


def bytes_to_data_url(img_bytes):
    return base64.b64encode(img_bytes).decode("ascii")


def readb64(encoded_data):
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def output(img):
    _, buffer = cv2.imencode(".jpg", img)
    data_url = bytes_to_data_url(buffer)
    js.setCanvasImage(f"data:image/jpg;base64,{data_url}")
