import asyncio
import base64
import cv2
import json
import js
import numpy as np
import traceback


def readb64(encoded_data):
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def bytes_to_data_url(img_bytes):
    return base64.b64encode(img_bytes).decode("ascii")


def output(img):
    _, buffer = cv2.imencode(".jpg", img)
    data_url = bytes_to_data_url(buffer)
    js.setCanvasSrc(f"data:image/jpg;base64,{data_url}")


def _print(*args):
    js.addToOutput(" ".join(str(i) for i in args) + "\n")


def click_corner(event):
    img = js.getCanvasSrc()
    rgb_img = readb64(img[len('data:image/jpg;base64,'):])

    code = js.getUserCode()
    js.clearOutput()

    try:
        exec(code, {
            "cv2": cv2,
            "img": rgb_img,
            "output": output,
            "print": _print
        })
    except Exception as e:
        tb = traceback.format_exc()
        js.showError(tb)
    else:
        js.hideError()
    
    js.console.log("finish")
