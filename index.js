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
};

defaultTask = "findTheStar";

const codeEditor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    lineNumbers: true,
    mode: 'python',
    theme: 'default'
});

window.addEventListener('load', () => {

    // Initialize CodeMirror for the code editor
    codeEditor.on('change', () => {
        codeEditor.save();
        localStorage.setItem("codeEditor", codeEditor.getValue());
    });

    const defaultCode = tasks[defaultTask].code;
    codeEditor.setValue(localStorage.getItem("codeEditor") || defaultCode);

    // Canvas

    const canvas_img = document.querySelector("#input")
    const ctx_img = canvas_img.getContext("2d");
    const canvas = document.querySelector("#output")

    const rgb_picker = document.querySelector("#rgb-color")
    const hsv_picker = document.querySelector("#hsv-color")

    canvas_img.onmousemove = function (event) {
        const x = event.offsetX;
        const y = event.offsetY;

        const img_data = ctx_img.getImageData(x, y, 1, 1).data;
        const R = img_data[0];
        const G = img_data[1];
        const B = img_data[2];
        rgb_picker.innerText = R + ',' + G + ',' + B ;

        const hsv = rgb2hsv(R / 255, G / 255, B / 255)
        const H = Math.round((hsv[0] / 360) * 180);
        const S = Math.round(hsv[1] * 255);
        const V = Math.round(hsv[2] * 255);

        hsv_picker.innerText = H + ',' + S + ',' + V ;
    }

    document.getElementById('image-file').onchange = function (e) {
        make_base();

        function make_base() {
            let base_image = new Image();
            base_image.src = URL.createObjectURL(e.target.files[0]);
            base_image.onload = function () {
                canvas_img.height = canvas_img.width * (base_image.height / base_image.width);

                ctx_img.width = base_image.width;
                ctx_img.height = base_image.height;

                ctx_img.drawImage(base_image, 0, 0, base_image.width, base_image.height,   // source rectangle
                                              0, 0, canvas_img.width, canvas_img.height);  // destination rectangle

                localStorage.setItem("image", getCanvasSrc());
            }

        }
    };

    setImage(localStorage.getItem("image") || tasks[defaultTask].input);
})


function getCanvasSrc() {
    const canvas = document.getElementById("input")
    return canvas.toDataURL()
}

function getMaskSrc() {
    const canvas = document.getElementById("output")
    return canvas.toDataURL()
}


function setCanvasSrc(newSrc) {
    const canvas_paint = document.getElementById("output")
    const context_paint = canvas_paint.getContext('2d');
    context_paint.clearRect(0, 0, canvas_paint.width, canvas_paint.height);

    const canvas = document.getElementById("output")
    let base_image = new Image();

    base_image.src = newSrc;
    base_image.onload = function () {
        canvas.width = base_image.width;
        canvas.height = base_image.height;
        canvas.style.width = `${base_image.innerWidth}px`;
        canvas.style.height = `${base_image.innerHeight}px`;
        const context = canvas.getContext("2d")
        context.drawImage(base_image, 0, 0);
    }
}

function setCanvasDebugSrc(newSrc) {
    const canvas_paint = document.getElementById("debug")
    const context_paint = canvas_paint.getContext('2d');
    context_paint.clearRect(0, 0, canvas_paint.width, canvas_paint.height);

    const canvas = document.getElementById("debug")
    let base_image = new Image();

    base_image.src = newSrc;
    base_image.onload = function () {
        canvas.width = base_image.width;
        canvas.height = base_image.height;
        canvas.style.width = `${base_image.innerWidth}px`;
        canvas.style.height = `${base_image.innerHeight}px`;
        const context = canvas.getContext("2d")
        context.drawImage(base_image, 0, 0);
    }
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

function setImage(src) {
    const canvas_img = document.querySelector("#input")
    const ctx_img = canvas_img.getContext("2d");

    let base_image = new Image();
    base_image.src = src;
    base_image.onload = function () {
        canvas_img.height = canvas_img.width * (base_image.height / base_image.width);

        ctx_img.width = base_image.width;
        ctx_img.height = base_image.height;

        ctx_img.drawImage(base_image, 0, 0, base_image.width, base_image.height,   // source rectangle
            0, 0, canvas_img.width, canvas_img.height);  // destination rectangle

        localStorage.setItem("image", getCanvasSrc());
    }
}

function resetCode() {
    openTask(defaultTask);
}

function openTask(task) {
    const defaultInput = tasks[task].input;
    const defaultCode = tasks[task].code;

    setImage(defaultInput);
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
