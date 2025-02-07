const tasks = {
    "findTheStar": {
        "input": "someshapes.jpg",
        "code": `# Find the star!

canny = cv2.Canny(img, 50, 50)
canny = cv2.dilate(canny, (5, 5))

contours, _ = cv2.findContours(
    canny, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
)

c = None

for i, c1 in enumerate(contours):
    peri = cv2.arcLength(c1, True)
    approx = cv2.approxPolyDP(c1, 0.014 * peri, True)

    print(len(approx))
    if len(approx) == 3:
        c = approx

    img = cv2.drawContours(img, approx, -1, (0, 0, 255), 10)

img = cv2.drawContours(img, [c], -1, (0, 255, 0), 3)
output(img)`,
    },
    "fishCount": {
        "input": "fish.png",
        "code": `out = img.copy()

hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
green = cv2.inRange(hsv, (55, 200, 200), (65, 255, 255))

debug(green)

contours, _ = cv2.findContours(
    green, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
)

fish = 0
for c in contours:
  if cv2.contourArea(c) > 50:
    out = cv2.drawContours(out, [c], -1, (255, 0, 0), 3)
    fish = fish + 1

print(fish)
output(out)`,
    },
    "masks": {
        "input": "bj.avif",
        "input1": "sunglasses.png",
        "code": `face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml')

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
faces = face_cascade.detectMultiScale(gray, 1.1, 4)

for (x, y, w, h) in faces:
    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 1)
    mask_resized = cv2.resize(img1, (w, h // 3))

    for i in range(mask_resized.shape[0]):
      for j in range(mask_resized.shape[1]):
        if (mask_resized[i, j] != 0).all():
          img[y + i + h // 3, x + j] = mask_resized[i, j, :3]

output(img)`,
    }
};

defaultTask = "findTheStar";

const codeEditor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    lineNumbers: true,
    mode: 'python',
    theme: 'default',
});
codeEditor.setSize("100%", 450);

window.addEventListener('load', () => {

    let lang = localStorage.getItem("lang");
    if (lang !== null) {
        changeLang(lang);
    }

    // Initialize CodeMirror for the code editor
    codeEditor.on('change', () => {
        codeEditor.save();
        localStorage.setItem("codeEditor", codeEditor.getValue());
    });

    const defaultCode = tasks[defaultTask].code;
    codeEditor.setValue(localStorage.getItem("codeEditor") || defaultCode);

    // Canvas

    let inputCanvases = document.getElementsByClassName('input');
    for (let i = 0; i < inputCanvases.length; ++i) {
        let canvas_img = inputCanvases[i];
        const ctx_img = canvas_img.getContext("2d");

        const rgb_picker = document.querySelector("#rgb-color")
        const hsv_picker = document.querySelector("#hsv-color")

        canvas_img.onmousemove = function (event) {
            const x = event.offsetX;
            const y = event.offsetY;

            const img_data = ctx_img.getImageData(x, y, 1, 1).data;
            const R = img_data[0];
            const G = img_data[1];
            const B = img_data[2];
            rgb_picker.innerText = R + ',' + G + ',' + B;

            const hsv = rgb2hsv(R / 255, G / 255, B / 255)
            const H = Math.round((hsv[0] / 360) * 180);
            const S = Math.round(hsv[1] * 255);
            const V = Math.round(hsv[2] * 255);

            hsv_picker.innerText = H + ',' + S + ',' + V;
        }
    }

    let imageFiles = document.getElementsByClassName('image-file');
    for (let i = 0; i < imageFiles.length; ++i) {
        let item = imageFiles[i];
        let targetCanvas = item.dataset.target;
        item.onchange = function (e) {
            set_canvas_image(targetCanvas, URL.createObjectURL(e.target.files[0]), targetCanvas);
        };

        set_canvas_image(targetCanvas, localStorage.getItem(targetCanvas) || tasks[defaultTask][targetCanvas], targetCanvas);
    }
})


function set_canvas_image(canvas_name, file, saveToLocalstorageName) {
    let canvas_img = document.getElementById(canvas_name);
    const ctx_img = canvas_img.getContext("2d");
    ctx_img.clearRect(0, 0, canvas_img.width, canvas_img.height);

    let base_image = new Image();
    base_image.src = file;
    base_image.onload = function () {
        canvas_img.height = canvas_img.width * (base_image.height / base_image.width);

        ctx_img.width = base_image.width;
        ctx_img.height = base_image.height;

        ctx_img.drawImage(base_image, 0, 0, base_image.width, base_image.height,   // source rectangle
            0, 0, canvas_img.width, canvas_img.height);  // destination rectangle

        localStorage.setItem(saveToLocalstorageName, getCanvasSrc(canvas_name));
    }
}

function getCanvasSrc(name) {
    const canvas = document.getElementById(name)
    return canvas.toDataURL()
}

function getUserCode() {
    return codeEditor.getValue();
}

function showError(err) {
    const errorElement = document.getElementById("error-log");
    errorElement.innerText = err;
    errorElement.style.display = "block";
}

function hideError() {
    const errorElement = document.getElementById("error-log");
    errorElement.style.display = "none";
}

function clearOutput() {
    const outputElement = document.getElementById("output-log");
    outputElement.innerText = "";
    outputElement.style.display = "none";
}

function addToOutput(s) {
    const outputElement = document.getElementById("output-log");
    outputElement.innerText += s;
    outputElement.style.display = "block";
}

function resetCode() {
    openTask(defaultTask);
}

function openTask(task) {
    const defaultCode = tasks[task].code;

    let imageFiles = document.getElementsByClassName('image-file');
    for (let i = 0; i < imageFiles.length; ++i) {
        let item = imageFiles[i];
        let targetCanvas = item.dataset.target;
        set_canvas_image(targetCanvas, tasks[task][targetCanvas], targetCanvas);
    }
    codeEditor.setValue(defaultCode);
}

function askOpenTask(task) {
    if (confirm("Open the " + task + " task?")) {
        openTask(task);
    }
}

// input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
function rgb2hsv(r,g,b) {
    let v=Math.max(r,g,b), c=v-Math.min(r,g,b);
    let h= c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c));
    return [60*(h<0?h+6:h), v&&c/v, v];
}

function startCamera() {
    const video = document.getElementById('video');
    const canvas_img = document.getElementById('input');
    const ctx_img = canvas_img.getContext('2d');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        });

    video.addEventListener('play', () => {
        // canvas.width = video.videoWidth;
        // canvas.height = video.videoHeight;
        setInterval(() => {
            // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas_img.height = canvas_img.width * (video.videoHeight / video.videoWidth);

            ctx_img.width = video.width;
            ctx_img.height = video.height;

            ctx_img.drawImage(video, 0, 0, video.videoWidth, video.videoHeight,   // source rectangle
                0, 0, canvas_img.width, canvas_img.height);  // destination rectangle

            localStorage.setItem("input", getCanvasSrc("input"));
        }, 1000 / 30);
    });
}

function changeLang(lang) {
    window.i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
}

function saveCode() {
    const code = codeEditor.getValue();
    // Create a downloadable file (blob) and trigger download
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = "opencv_sandbox_code.py";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}