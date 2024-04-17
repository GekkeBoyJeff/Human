const header = document.querySelector('header');
const sideNavToggler = document.querySelector('.sideNavToggler');
const sideNav = document.querySelector('.sideNav');
const selectOn = document.querySelector('.selectOn');
const theme = document.querySelector('.theme');
const clipBoardToggler = document.querySelector('.clipBoardToggler');
const clipboardSection = document.querySelector('.clipboardSection');
const askAI = document.querySelector('.askAI');
const askAiDialog = document.querySelector('.askAIDialog');

const enlarge = document.querySelector('.enlarge');
const shrink = document.querySelector('.shrink');

let copyCommandActivated = false;
let firstPoint, secondPoint;

let isRecognitionRunning = false;

sideNavToggler.addEventListener('click', toggleSideNav);
clipBoardToggler.addEventListener('click', () => {
    clipboardSection.classList.toggle('hidden');
});

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
    recognition.lang = 'nl-NL';
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

    recognition.onspeechend = function () {
        stopRecognition(recognition);
    }

    recognition.onnomatch = function (event) {
        console.log("Word niet herkend: " + event);
    }

    recognition.onerror = function (event) {
        console.log('Er is iets fout gegaan: ' + event.error);
    }

    return recognition;
}

const recognition = setupSpeechRecognition();

askAI.addEventListener('click', () => {
    toggleHeader();
    if (isRecognitionRunning) {
        stopRecognition(recognition);
    } else {
        recognition.start();
        isRecognitionRunning = true;
    }
});

selectOn.addEventListener('click', (event) => {
    event.stopPropagation();
    copyCommandActivated = true;
    console.log("copy command activated: ", copyCommandActivated);
});

document.addEventListener('click', startSelecting);

let copiedTexts = [];

async function startSelecting(event) {
    // Check if the copyCommandActivated is false
    if (!copyCommandActivated || event.target === selectOn) {
        return;
    }

    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    range.expand('word');
    const point = { node: range.startContainer, offset: range.startOffset };

    if (!firstPoint) {
        firstPoint = point;
        console.log(firstPoint)
    } else {
        const secondRange = document.createRange();
        secondRange.setStart(point.node, point.offset);
        secondRange.expand('word');

        point.node = secondRange.endContainer;
        point.offset = secondRange.endOffset;

        selectText(firstPoint, point);
        const selectedText = window.getSelection().toString();
        copiedTexts.push(selectedText);
        navigator.clipboard.writeText(selectedText).then(() => {
            localStorage.setItem('copiedTexts', JSON.stringify(copiedTexts));
            updateClipboardSection();
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
        resetSelection();
    }
};

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

function updateClipboardSection() {
    const ul = clipboardSection.querySelector('ul');
    ul.innerHTML = '';
    const copiedTexts = JSON.parse(localStorage.getItem('copiedTexts')) || [];
    copiedTexts.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        li.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Text copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });

        ul.appendChild(li);
    });
}


// async function OpenaiFetchAPI() {
//     const url = 'https://nodejs-serverless-function-express-kappa-rouge.vercel.app/api/hello';

//     const userContent = 'Kun je me een grap vertellen?';

//     const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             userContent,
//         }),
//     });

//     const data = await response.json();

//     console.log(data); // Bevat de response van de OpenAI API
// }

// OpenaiFetchAPI();

async function OpenaiFetchAPI(userContent) {
    console.log("Calling GPT3 with user content:", userContent);

    const url = "https://api.openai.com/v1/chat/completions";
    // const url = "https://api.openai.com/v1/assistants"
    const bearer =
        "Bearer " + "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";

    // const body = JSON.stringify({
    //     model: "gpt-3.5-turbo",
    //     temperature: 1,
    //     top_p: 1,
    //     name: 'assistent',
    //     description: 'Dit is een assistent die vragen beantwoordt over het web. Wees uitgebreid, duidelijk en vriendelijk mogelijk en probeer de vragen zo goed mogelijk te beantwoorden met heel veel informatie en details over de vraag. Dus als iemand vraagt om een locatie, geef aan waar, biedt details over de plek inclusief dingen waar ze voor uit moet kijken',
    //     instructions: 'Beantwoord de vragen van de gebruiker zo goed mogelijk',
    //     tools: [
    //         {
    //             "type": "retrieval",
    //         }
    //     ]
    // });

    const body = JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 1,
        top_p: 1,
        max_tokens: 2048,
        "messages": [
            {
                "role": "system",
                "content": "Je bent een behulpvolle assistent die vragen beantwoordt over het web. Wees uitgebreid, duidelijk en vriendelijk mogelijk en probeer de vragen zo goed mogelijk te beantwoorden met heel veel informatie en details over de vraag. Dus als iemand vraagt om een locatie, geef aan waar, biedt details over de plek inclusief dingen waar ze voor uit moet kijken"
            },
            {
                "role": "user",
                "content": userContent
            }
        ],
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
            // 'OpenAI-Beta': 'assistants=v1',
        },
        body,
    });

    const data = await response.json();
    console.log(data); // Bevat de response van de OpenAI API
    console.log(data.choices[0].message.content); // Bevat de response van de OpenAI API
}

// OpenaiFetchAPI("Hoi, ik wil graag weten waar ik mijn fiets met beperking kan parkeren in Amsterdam. Kan je mij vertellen waar ik dat kan?");


let currentFontSize = localStorage.getItem('fontSize') || 16;
const maxFontSize = 64;

enlarge.addEventListener('click', () => {
    // const userContent = copiedTexts.join(' ');
    // OpenaiFetchAPI("Waar kan ik mijn fiets met beperking parkeren in Amsterdam?");

    currentFontSize += 8;
    if (currentFontSize > maxFontSize) {
        currentFontSize = maxFontSize;
    }

    document.querySelector('main section').style.fontSize = `${currentFontSize}px`;
    localStorage.setItem('fontSize', currentFontSize);
});

shrink.addEventListener('click', () => {
    currentFontSize -= 8;
    if (currentFontSize < 16) {
        currentFontSize = 16;
    }

    document.querySelector('main section').style.fontSize = `${currentFontSize}px`;
    localStorage.setItem('fontSize', currentFontSize);
});

theme.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLightTheme = document.body.classList.contains('light');
    localStorage.setItem('isLightTheme', isLightTheme);
});

const localStorageChecker = () => {
    updateClipboardSection();
    const isLightTheme = localStorage.getItem('isLightTheme') === 'true';
    const fontSize = localStorage.getItem('fontSize');
    if (fontSize) {
        console.log(fontSize)
        document.querySelector('main section').style.fontSize = `${fontSize}px`;
    }
    if (isLightTheme) {
        document.body.classList.toggle('light');
    }
}

localStorageChecker();