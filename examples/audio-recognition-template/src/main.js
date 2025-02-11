const tf = require('@tensorflow/tfjs');
const speechCommands = require('@tensorflow-models/speech-commands');
const {listeners} = require("process");
const colormap = require('colormap');

// детальніше за посиланням
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// змінити на свій URL!
const URL = "http://127.0.0.1:5500/examples/audio-recognition-template/docs/";

async function createModel(model) {
    const checkpointURL = URL + model + "model.json"; // топологія моделі
    const metadataURL = URL + model + "metadata.json"; // метадані моделі

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // тип перетворення Фур'є, не варто змінювати
        undefined, // словник команд, не потрібен для ваших моделей
        checkpointURL,
        metadataURL);

    // перевіряємо, що модель та метадані завантажені через HTTPS запити
    await recognizer.ensureModelLoaded();

    return recognizer;
}

async function init() {
    const recognizerVowelsConsonants = await createModel("vowels_and_consonants/");

    const mostProbableContainerVC = document.getElementById("output");
    const button = document.getElementById("startbutton");
    const canvasElem = document.getElementById('spectrogram');

    // встановлюємо текст кнопки
    button.innerHTML = "Listening...";

    recognizerVowelsConsonants.listen(result => {
        const scores = result.scores; // ймовірності передбачення для кожного класу
        const classLabels = recognizerVowelsConsonants.wordLabels(); // отримуємо мітки класів

        const maxScore = Math.max(...scores);
        const maxScoreIndex = scores.indexOf(maxScore);

        if (classLabels[maxScoreIndex] !== "Background Noise") {
            console.log(classLabels[maxScoreIndex]);
            mostProbableContainerVC.innerHTML = classLabels[maxScoreIndex];

            drawSpectrogram(result.spectrogram, canvasElem);
        }

    }, {
        includeSpectrogram: true, // повертати result.spectrogram
        probabilityThreshold: 0.7,
        invokeCallbackOnNoiseAndUnknown: false,
        overlapFactor: 0.50 // рекомендовано між 0.5 та 0.75
    });
}

// масштабування значення в заданому діапазоні
function scaleAcrossRange(x, max, min) {
    return (x - min) / (max - min);
}

async function drawSpectrogram(data, canvasElem) {
    const ctx = canvasElem.getContext("2d");

    const frames = data.data.length / data.frameSize;

    const specWidth = frames;
    const specHeight = data.frameSize / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(canvasElem.width / specWidth, canvasElem.height / specHeight);

    // Створюємо кольорову карту для відображення значень спектру
    const colours = colormap({colormap: 'jet', nshades: 255, format: 'hex'});

    // Обчислюємо діапазон значень для масштабування кольорів
    let maxValue=0, minValue=0;
    for (let a = 0; a < data.data.length; a++) {
        maxValue = Math.max(data.data[a], maxValue);
        minValue = Math.min(data.data[a], minValue);
    }

    for (let o = 0; o < frames; o++) {
        // Ігноруємо половину спектрограми вище частоти Найквіста, оскільки вона надлишкова
        for (let p = 0; p < data.frameSize; p++) {
            // Масштабуємо значення між 0 - 255 для відповідності кольоровій карті
            let scaledValue = Math.round(255 * scaleAcrossRange(data.data[o*data.frameSize + p], maxValue, minValue));

            ctx.fillStyle = colours[scaledValue];
            ctx.fillRect(o, p,1,1);
        }
    }
}

document.getElementById('startbutton').addEventListener('click', init);
