import asyncio
import base64
import cv2
import json
import js
import numpy as np
import traceback
from js import XMLHttpRequest
from io import BytesIO


def readb64(encoded_data):
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def bytes_to_data_url(img_bytes):
    return base64.b64encode(img_bytes).decode("ascii")


def output(img):
    _, buffer = cv2.imencode(".jpg", img)
    data_url = bytes_to_data_url(buffer)
    js.set_canvas_image("output", f"data:image/jpg;base64,{data_url}", "output")


def debug(img):
    _, buffer = cv2.imencode(".jpg", img)
    data_url = bytes_to_data_url(buffer)
    js.set_canvas_image("debug", f"data:image/jpg;base64,{data_url}", "debug")


def _print(*args):
    js.addToOutput(" ".join(str(i) for i in args) + "\n")


def click_corner(event):
    img = js.getCanvasSrc("input")
    img1 = js.getCanvasSrc("input1")
    img2 = js.getCanvasSrc("input2")
    img3 = js.getCanvasSrc("input3")

    rgb_img = readb64(img[len('data:image/jpg;base64,'):])
    rgb_img1 = readb64(img1[len('data:image/jpg;base64,'):])
    rgb_img2 = readb64(img2[len('data:image/jpg;base64,'):])
    rgb_img3 = readb64(img3[len('data:image/jpg;base64,'):])

    code = js.getUserCode()
    js.clearOutput()

    try:
        exec(code, {
            "cv2": cv2,
            "img": rgb_img,
            "img1": rgb_img1,
            "img2": rgb_img2,
            "img3": rgb_img3,
            "output": output,
            "debug": debug,
            "print": _print,
        })
    except Exception as e:
        tb = traceback.format_exc()
        js.showError(tb)
    else:
        js.hideError()
    
    js.console.log("finish")
