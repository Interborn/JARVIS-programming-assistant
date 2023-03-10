import bot from './assets/bot.svg'
import user from './assets/user.svg'
import starAnim from './assets/star-anim.gif'
import starBlank from './assets/star-blank.gif'
import star from './assets/star.png'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat-container')

// Disable right-click for copying content
document.addEventListener('contextmenu', event => event.preventDefault());

let loadInterval; 

function handleClick() {
    // if (document.querySelector('#favorite-icon').src == './assets/star-blank.png') {
    //     setTimeout(function(){
    //         document.querySelector('#favorite-icon').src = './assets/star.png';
    //     }, 1000);
    //     document.querySelector('#favorite-icon').src = './assets/star-anim.gif'
    // } else {
    //     setTimeout(function(){
    //         document.querySelector('#favorite-icon').src = './assets/star-blank.gif';
    //     }, 1000);
    //     document.querySelector('#favorite-icon').src = './assets/star-reverse.gif'
    // }
    document.querySelector('#favorite-icon').src == './assets/star.png'
}

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}"
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
                <div>
                    <img 
                        src=${starBlank}
                        alt="favorite this message"
                        class="favorite-icon"
                        onclick="handleClick()"
                    />
                </div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    // === CHANGE THIS TO YOUR OWN SERVER TO HANDLE THE REQUESTS === //
    const response = await fetch('https://jarvis-programming-assistant.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode == 13 && !e.shiftKey) {
        handleSubmit(e)
    }
})