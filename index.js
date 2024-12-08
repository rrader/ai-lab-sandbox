window.addEventListener('load', () => {

    const canvas_img = document.querySelector("#input")
    const ctx_img = canvas_img.getContext("2d");


    const canvas = document.querySelector("#output")
    const ctx = canvas.getContext("2d");

    let painting = false;

    document.getElementById('image-file').onchange = function (e) {
        console.log("e >> ", e.target.files[0]);

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
            }

        }


    };

    let base_image = new Image();
    base_image.src = "someshapes.jpg";
    base_image.onload = function () {
        canvas_img.height = canvas.width * (base_image.height / base_image.width);

        ctx_img.width = base_image.width;
        ctx_img.height = base_image.height;

        ctx_img.drawImage(base_image, 0, 0, base_image.width, base_image.height,   // source rectangle
                                        0, 0, canvas_img.width, canvas_img.height);  // destination rectangle
    }


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


// Initialize CodeMirror for the code editor
const codeEditor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    lineNumbers: true,
    mode: 'python',
    theme: 'default'
});
