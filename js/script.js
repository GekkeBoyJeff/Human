const header = document.querySelector('header');
const sideNavToggler = document.querySelector('.sideNavToggler');
const sideNav = document.querySelector('.sideNav');
const selectOn = document.querySelector('.selectOn');
const theme = document.querySelector('.theme');

let copyCommandActivated = true;
let firstPoint, secondPoint;

let isRecognitionRunning = false; 

sideNavToggler.addEventListener('click', toggleSideNav);



function toggleSideNav() {
    sideNav.classList.toggle('open');
}

function toggleHeader() {
    header.classList.toggle('selectOn');
}

function stopRecognition(recognition) {
    recognition.stop();
    isRecognitionRunning = false; 
    if (header.classList.contains('selectOn')) {
        toggleHeader();
    }
}

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const commands = ['copy', 'kopieer', 'klipbord', 'opnieuw'];
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    // recognition.lang = 'nl-NL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        for (let i = 0; i < event.results.length; i++) {
            let speechResult = event.results[i][0].transcript;
            console.log('Speech result: ', speechResult);
        
            const commandFound = commands.find(command => speechResult.toLowerCase().includes(command.toLowerCase()));
        
            if (commandFound) {
                console.log('Commando: ', commandFound)
                stopRecognition(recognition);
                if (commandFound === 'copy') {
                    copyCommandActivated = true;
                    console.log(copyCommandActivated)
                }
            }
        }
    };

    recognition.onspeechend = function() {
        stopRecognition(recognition);
    }

    recognition.onnomatch = function(event) {
        console.log("Word niet herkend: " + event);
    }

    recognition.onerror = function(event) {
        console.log('Er is iets fout gegaan: ' + event.error);
    }

    return recognition;
}

const recognition = setupSpeechRecognition();

selectOn.addEventListener('click', () => {
    toggleHeader();
    if (isRecognitionRunning) {
        stopRecognition(recognition);
    } else {
        recognition.start();
        isRecognitionRunning = true;
    }
});

let copiedTexts = [];

document.addEventListener('click', event => {
    if (!copyCommandActivated) return;

    const point = { node: event.target.childNodes[0], offset: getClickOffset(event) };

    if (!firstPoint) {
        firstPoint = point;
    } else {
        selectText(firstPoint, point);
        const selectedText = window.getSelection().toString();
        copiedTexts.push(selectedText);
        navigator.clipboard.writeText(selectedText).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
        resetSelection();
    }
});

function getClickOffset(event) {
    return document.caretRangeFromPoint(event.clientX, event.clientY).startOffset;
}

function selectText(start, end) {
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function resetSelection() {
    firstPoint = null;
    copyCommandActivated = false;
}
