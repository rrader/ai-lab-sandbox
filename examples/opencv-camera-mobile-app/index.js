function startCamera() {
    const video = document.getElementById('video');
    const canvas_img = document.getElementById('input');
    console.log(canvas_img);
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
        }, 1000 / 30);
    });
}

function getCanvasSrc() {
    const canvas = document.getElementById("input")
    return canvas.toDataURL()
}

function setCanvasImage(file) {
    let canvas_img = document.getElementById("output");
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
    }
}