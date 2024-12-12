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
    }
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

    codeEditor.setValue(localStorage.getItem("codeEditor") || defaultCode);

    // Canvas

    const canvas_img = document.querySelector("#input")
    const ctx_img = canvas_img.getContext("2d");
    const canvas = document.querySelector("#output")

    document.getElementById('image-file').onchange = function (e) {
        make_base();

        function make_base() {
            let base_image = new Image();
            base_image.src = URL.createObjectURL(e.target.files[0]);
            base_image.onload = function () {
                canvas_img.height = canvas.width * (base_image.height / base_image.width);

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
    const defaultInput = tasks[defaultTask].input;
    const defaultCode = tasks[defaultTask].code;

    setImage(defaultInput);
    codeEditor.setValue(defaultCode);
}