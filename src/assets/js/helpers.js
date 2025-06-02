function generateRandomString() {
    const crypto = window.crypto || window.msCrypto;
    let array = new Uint32Array(1);
    return crypto.getRandomValues(array);
}

function closeVideo(elemId) {
    if (document.getElementById(elemId)) {
        document.getElementById(elemId).remove();
        adjustVideoElemSize();
    }
}

function pageHasFocus() {
    return !(document.hidden || document.onfocusout || window.onpagehide || window.onblur);
}

function getQString(url = '', keyToReturn = '') {
    url = url || location.href;
    let queryStrings = decodeURIComponent(url).split('#', 2)[0].split('?', 2)[1];

    if (queryStrings) {
        let splittedQStrings = queryStrings.split('&');
        if (splittedQStrings.length) {
            let queryStringObj = {};
            splittedQStrings.forEach(function (keyValuePair) {
                let keyValue = keyValuePair.split('=', 2);
                if (keyValue.length) {
                    queryStringObj[keyValue[0]] = keyValue[1];
                }
            });

            return keyToReturn ? queryStringObj[keyToReturn] || null : queryStringObj;
        }
    }
    return null;
}

function userMediaAvailable() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function getUserFullMedia() {
    if (userMediaAvailable()) {
        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        });
    } else {
        throw new Error('User media not available');
    }
}

function getUserAudio() {
    if (userMediaAvailable()) {
        return navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        });
    } else {
        throw new Error('User media not available');
    }
}

function shareScreen() {
    if (userMediaAvailable()) {
        return navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });
    } else {
        throw new Error('User media not available');
    }
}

function getIceServer() {
    return {
        iceServers: [
            { urls: ["stun:eu-turn4.xirsys.com"] },
            {
                username: "ml0jh0qMKZKd9P_9C0UIBY2G0nSQMCFBUXGlk6IXDJf8G2uiCymg9WwbEJTMwVeiAAAAAF2__hNSaW5vbGVl",
                credential: "4dd454a6-feee-11e9-b185-6adcafebbb45",
                urls: [
                    "turn:eu-turn4.xirsys.com:80?transport=udp",
                    "turn:eu-turn4.xirsys.com:3478?transport=tcp"
                ]
            }
        ]
    };
}

function addChat(data, senderType) {
    let chatMsgDiv = document.querySelector('#chat-messages');
    let contentAlign = 'justify-content-end';
    let senderName = 'You';
    let msgBg = 'bg-white';

    if (senderType === 'remote') {
        contentAlign = 'justify-content-start';
        senderName = data.sender;
        msgBg = '';
        toggleChatNotificationBadge();
    }

    let infoDiv = document.createElement('div');
    infoDiv.className = 'sender-info';
    infoDiv.innerText = `${senderName} - ${moment().format('Do MMMM, YYYY h:mm a')}`;

    let colDiv = document.createElement('div');
    colDiv.className = `col-10 card chat-card msg ${msgBg}`;
    colDiv.innerHTML = xssFilters.inHTMLData(data.msg).autoLink({ target: "_blank", rel: "nofollow" });

    let rowDiv = document.createElement('div');
    rowDiv.className = `row ${contentAlign} mb-2`;

    colDiv.appendChild(infoDiv);
    rowDiv.appendChild(colDiv);
    chatMsgDiv.appendChild(rowDiv);

    if (pageHasFocus()) {
        rowDiv.scrollIntoView();
    }
}

function toggleChatNotificationBadge() {
    const chatPane = document.querySelector('#chat-pane');
    const badge = document.querySelector('#new-chat-notification');
    if (chatPane.classList.contains('chat-opened')) {
        badge.setAttribute('hidden', true);
    } else {
        badge.removeAttribute('hidden');
    }
}

function replaceTrack(stream, recipientPeer) {
    let sender = recipientPeer.getSenders?.().find(s => s.track && s.track.kind === stream.kind);
    if (sender) sender.replaceTrack(stream);
}

function toggleShareIcons(share) {
    let shareIconElem = document.querySelector('#share-screen');
    if (share) {
        shareIconElem.setAttribute('title', 'Stop sharing screen');
        shareIconElem.children[0].classList.add('text-primary');
        shareIconElem.children[0].classList.remove('text-white');
    } else {
        shareIconElem.setAttribute('title', 'Share screen');
        shareIconElem.children[0].classList.add('text-white');
        shareIconElem.children[0].classList.remove('text-primary');
    }
}

function toggleVideoBtnDisabled(disabled) {
    document.getElementById('toggle-video').disabled = disabled;
}

function maximiseStream(e) {
    let elem = e.target.parentElement.previousElementSibling;
    elem.requestFullscreen?.() || elem.mozRequestFullScreen?.() || elem.webkitRequestFullscreen?.() || elem.msRequestFullscreen?.();
}

function singleStreamToggleMute(e) {
    const videoElem = e.target.parentElement.previousElementSibling;
    if (e.target.classList.contains('fa-microphone')) {
        videoElem.muted = true;
        e.target.classList.replace('fa-microphone', 'fa-microphone-slash');
    } else {
        videoElem.muted = false;
        e.target.classList.replace('fa-microphone-slash', 'fa-microphone');
    }
}

function saveRecordedStream(stream, user) {
    let blob = new Blob(stream, { type: 'video/webm' });
    let file = new File([blob], `${user}-${moment().unix()}-record.webm`);
    saveAs(file);
}

function toggleModal(id, show) {
    let el = document.getElementById(id);
    if (show) {
        el.style.display = 'block';
        el.removeAttribute('aria-hidden');
    } else {
        el.style.display = 'none';
        el.setAttribute('aria-hidden', true);
    }
}

function setLocalStream(stream, mirrorMode = true) {
    const localVidElem = document.getElementById('local');
    localVidElem.srcObject = stream;
    mirrorMode ? localVidElem.classList.add('mirror-mode') : localVidElem.classList.remove('mirror-mode');
}

function adjustVideoElemSize() {
    let elems = document.getElementsByClassName('card');
    let total = elems.length;
    let newWidth = total <= 2 ? '50%' :
        total === 3 ? '33.33%' :
        total <= 8 ? '25%' :
        total <= 15 ? '20%' :
        total <= 18 ? '16%' :
        total <= 23 ? '15%' :
        total <= 32 ? '12%' : '10%';

    for (let i = 0; i < total; i++) {
        elems[i].style.width = newWidth;
    }
}

function createDemoRemotes(str, total = 6) {
    let i = 0;
    let testInterval = setInterval(() => {
        let newVid = document.createElement('video');
        newVid.id = `demo-${i}-video`;
        newVid.srcObject = str;
        newVid.autoplay = true;
        newVid.className = 'remote-video';

        let controlDiv = document.createElement('div');
        controlDiv.className = 'remote-video-controls';
        controlDiv.innerHTML = `
            <i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
            <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

         let cardDiv = document.createElement('div');
        cardDiv.className = 'card card-sm';
        cardDiv.id = `demo-${i}`;
        cardDiv.appendChild(newVid);
        cardDiv.appendChild(controlDiv);

        document.getElementById('videos').appendChild(cardDiv);

        adjustVideoElemSize();

        i++;
        if (i === total) clearInterval(testInterval);
    }, 2000);
}

// ✅ Register all helpers globally
window.helpers = {
    generateRandomString,
    closeVideo,
    pageHasFocus,
    getQString,
    userMediaAvailable,
    getUserFullMedia,
    getUserAudio,
    shareScreen, getIceServer,
    addChat,
    toggleChatNotificationBadge,
    replaceTrack,
    toggleShareIcons,
    toggleVideoBtnDisabled,
    maximiseStream,
    singleStreamToggleMute,
    saveRecordedStream,
    toggleModal,
    setLocalStream,
    adjustVideoElemSize,
    createDemoRemotes
};