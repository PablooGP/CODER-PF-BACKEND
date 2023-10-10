const FADE_TIME = 150
const TYPING_TIMER_LENGTH = 400
const COLORS = [
    '#e21400',
    '#91580f',
    '#f8a700',
    '#f78b00',
    '#58dc00',
    '#287b00',
    '#a8f07a',
    '#4ae8c4',
    '#3b88eb',
    '#3824aa',
    '#a700ff',
    '#d300e7'
];

function fadeIn(element, duration) {
    element.style.opacity = 0;
    element.style.display = 'block';

    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);

        if (progress < duration) {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', function () {
    const windowElement = window;
    const usernameInput = document.querySelector('.usernameInput')
    const messages = document.querySelector('.messages')
    const inputMessage = document.querySelector('.inputMessage')

    const loginPage = document.querySelector('.login.page')
    const chatPage = document.querySelector('.chat.page')

    const socket = io()

    let username
    let connected = false
    let typing = false
    let lastTypingTime
    let currentInput = usernameInput

    const addParticipantsMessage = data => {
        let message = ''
        if (data.numUsers === 1) {
            message += 'Participantes en la sala 1';
        } else {
            message += `Hay ${data.numUsers} participantes en la sala`;
        }
        log(message);
    }
    const setUsername = () => {
        username = cleanInput(usernameInput.value.trim())
        if (username) {
            loginPage.style.display = 'none'
            chatPage.style.display = 'block'
            loginPage.removeEventListener('click', setUsername)
            currentInput = inputMessage
            socket.emit('add user', username)
        }
    }
    const sendMessage = () => {
        let message = inputMessage.value
        message = cleanInput(message)
        if (message && connected) {
            inputMessage.value = ''
            addChatMessage({
                username,
                message
            });
            socket.emit('new message', message)
        }
    }
    const log = (message, options) => {
        const el = document.createElement('li')
        el.classList.add('log')
        el.textContent = message
        addMessageElement(el, options)
    }
    const addChatMessage = (data, options = {}) => {
        const typingMessages = getTypingMessages(data)
        if (typingMessages.length !== 0) {
            options.fade = false
            typingMessages.forEach(function (message) {
                message.remove()
            })
        }

        const usernameDiv = document.createElement('span')
        usernameDiv.classList.add('username')
        usernameDiv.textContent = data.username
        usernameDiv.style.color = getUsernameColor(data.username)

        const messageBodyDiv = document.createElement('span')
        messageBodyDiv.classList.add('messageBody')
        messageBodyDiv.textContent = data.message

        const typingClass = data.typing ? 'typing' : 't'

        const messageDiv = document.createElement('li')
        messageDiv.classList.add('message')
        messageDiv.dataset.username = data.username
        messageDiv.classList.add(typingClass)
        messageDiv.appendChild(usernameDiv)
        messageDiv.appendChild(messageBodyDiv)

        addMessageElement(messageDiv, options)
    }
    const addChatTyping = data => {
        data.typing = true
        data.message = 'is typing...'
        addChatMessage(data)
    }
    const removeChatTyping = data => {
        const typingMessages = getTypingMessages(data);
        typingMessages.forEach(function (message) {
            message.style.display = 'none';
            message.parentNode.removeChild(message)
        })
    }
    const addMessageElement = (el, options) => {
        const $el = el

        options = options || {}
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false
        }
        if (options.fade) {
            $el.style.display = 'none'
            fadeIn($el, FADE_TIME)
        }
        if (options.prepend) {
            messages.prepend($el)
        } else {
            messages.appendChild($el)
        }
        messages.scrollTop = messages.scrollHeight;
    }
    const cleanInput = input => {
        const div = document.createElement('div')
        div.textContent = input
        return div.innerHTML
    }
    const updateTyping = () => {
        if (connected) {
            if (!typing) {
                typing = true
                socket.emit('typing')
            }
            lastTypingTime = new Date().getTime()

            setTimeout(() => {
                const typingTimer = new Date().getTime()
                const timeDiff = typingTimer - lastTypingTime
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing')
                    typing = false
                }
            }, TYPING_TIMER_LENGTH)
        }
    }
    const getTypingMessages = data => {
        const typingMessages = Array.from(document.querySelectorAll('.typing.message')).filter(message => {
            return message.dataset.username === data.username
        });
        return typingMessages
    }
    const getUsernameColor = username => {
        let hash = 7;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash
        }
        const index = Math.abs(hash % COLORS.length)
        return COLORS[index]
    }
    windowElement.addEventListener('keydown', event => {
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            currentInput.focus()
        }
        currentInput.focus();
        if (event.which === 13) {
            if (username) {
                sendMessage()
                socket.emit('stop typing');
                typing = false
            } else {
                setUsername()
            }
        }
    })

    inputMessage.addEventListener('input', () => {
        updateTyping()
    })
    loginPage.addEventListener('click', () => {
        currentInput.focus()
    })
    inputMessage.addEventListener('click', () => {
        inputMessage.focus()
    })
    socket.on('login', data => {
        connected = true
        const message = 'Bienvenidos al chat del Sitio'
        log(message, {
            prepend: true
        })
        addParticipantsMessage(data)
    })
    socket.on('new message', data => {
        addChatMessage(data)
    })
    socket.on('user joined', data => {
        log(`${data.username} joined`)
        addParticipantsMessage(data)
    })
    socket.on('user left', data => {
        log(`${data.username} left`)
        addParticipantsMessage(data)
        removeChatTyping(data)
    })
    socket.on('typing', data => {
        addChatTyping(data)
    })
    socket.on('stop typing', data => {
        removeChatTyping(data)
    })

    socket.on('disconnect', () => {
        log('you have been disconnected')
    })

    socket.io.on('reconnect', () => {
        log('you have been reconnected')
        if (username) {
            socket.emit('add user', username)
        }
    })
})