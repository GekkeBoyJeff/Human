const header = document.querySelector('header');
const sideNavToggler = document.querySelector('.sideNavToggler');
const sideNav = document.querySelector('.sideNav');
const selectOn = document.querySelector('.selectOn');

let copyCommandActivated = false;
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

document.addEventListener('click', (event) => {
    console.log('click')
    if (copyCommandActivated) {
        console.log('je kan klikken')
        if (!firstPoint) {
            firstPoint = event.target;
            console.log('firstPoint: ', firstPoint)
        } else if (!secondPoint) {
            secondPoint = event.target;
            const range = document.createRange();
            range.setStart(firstPoint.childNodes[0], 0);
            range.setEnd(secondPoint.childNodes[0], secondPoint.childNodes[0].length);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            console.log('secondPoint: ', secondPoint)
            console.log('selectedText: ', window.getSelection().toString())
        }
    }
});

let mouseMoveTimeout;
document.addEventListener('mousemove', () => {
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
        if (copyCommandActivated && firstPoint && secondPoint) {
            const selectedText = window.getSelection().toString();
            navigator.clipboard.writeText(selectedText);
            copyCommandActivated = false;
            firstPoint = null;
            secondPoint = null;
        }
    }, 3000);
});