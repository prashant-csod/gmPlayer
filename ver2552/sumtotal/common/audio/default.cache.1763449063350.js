if (GmCXt === undefined) var GmCXt = {};
let stepAudio = {};
let userPrefAudio = false;

// Starts message channel only inside audio iframe
if (!GmCXt.msgChannel) {
    GmCXt.msgChannel = new MessageChannel();
}
if (document.querySelectorAll('.mgPlayerJSProd_audio-iframe-icons').length > 0) {
    window.top.postMessage('Guide:audioIframe', '*', [GmCXt.msgChannel.port2]);
}

GmCXt.modifyElements = function(elements, operation, className) {
    elements.forEach(element => {
        switch (operation) {
        case 'show':
            element.style.display = 'block';
            break;

        case 'hide':
            element.style.display = 'none';
            break;

        case 'addClass':
            element.classList.add(className);
            break;

        case 'removeClass':
            element.classList.remove(className);
            break;
        }
    });
};

GmCXt.setAudioModeOn = function() {
    if (document.getElementsByClassName('mgPlayerJSProd_play-step-audio-on') &&
		document.getElementsByClassName('mgPlayerJSProd_play-step-audio-on').length) {
        GmCXt.modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio-on'), 'show');
        GmCXt.modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio-off'), 'hide');
        GmCXt.modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio'), 'addClass', 'playing-audio');

        if (userPrefAudio) {

            let action = "mgPlayerJSProd_action:set_audio_storage";
            let data = {
                'stepAudioRunningStatus': true
            };
            GmCXt.formatAndSendToParentWindow(action, data);
        }
    } else {
        GmCXt.formatAndSendToParentWindow("mgPlayerJSProd_action:set_audio_mode_on", {});
    }
};

GmCXt.setAudioModeOff = function() {
    if (document.getElementsByClassName('mgPlayerJSProd_play-step-audio-off') &&
		document.getElementsByClassName('mgPlayerJSProd_play-step-audio-off').length) {
        GmCXt.modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio-on'), 'hide');
        GmCXt.modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio-off'), 'show');
        GmCXt.modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio'), 'removeClass', 'playing-audio');

        if (userPrefAudio) {

            let action = "mgPlayerJSProd_action:set_audio_storage";
            let data = {
                'stepAudioRunningStatus': false
            };
            GmCXt.formatAndSendToParentWindow(action, data);
        }
    } else {
        GmCXt.formatAndSendToParentWindow("mgPlayerJSProd_action:set_audio_mode_off", {});
    }
};

if (GmCXt.requestHandler === undefined) {
    GmCXt.requestHandler = {};
}

GmCXt.requestHandler.playAudioTrack = function(message) {
    GmCXt.playStepAudio(message);
};

GmCXt.isEmpty = function(val) {
    if (typeof val === "boolean" || typeof val === "number") return false; // for 'false' & zero

    if (!val) return true;

    if (typeof val === "object" && val.constructor === Object) return Object.keys(val).length ? false : true;

    if (typeof val === "object" && val.constructor === Array) return val.length ? false : true;

    if (typeof val === 'string' && !val.trim()) return true;

    return false;
};

GmCXt.getCdnSign = function() {
    let sign = '';
    if (GmCXt.user && !GmCXt.isEmpty(GmCXt.user)) {
        sign = GmCXt.user.cdn_signature;
    } 

    return sign;
};

GmCXt.convertMgdata = function(m) {
    if (m.action && m.action.indexOf("init_sfdc_env") !== -1) {
        return m;
    } else if (m.data && m.data.config && m.data.config.appConfig &&
		m.data.config.appConfig.customer === 'westpac' && m.action && m.action.indexOf("MyGuideReporting") !== -1) {
        return m;
    }
    m.data = m.mgdata;
    return m;
};

GmCXt.syncPlayerInst = function(m) {
    if (m === "mgPlayerJSProd_action:started;task:select_existing_dom_element" ||
		m === "mgPlayerJSProd_action:started;task:select_existing_dom_element:target_frame_only" ||
		m === "mgPlayerJSProd_action:started;task:select_dom_element_tooltips" ||
		m === "mgPlayerJSProd_action:task:init_new_iframe" ||
		m === "mgPlayerJSProd_action:update_player_instance" ||
		m === "mgPlayerJSProd_action:update_player_instance_app" ||
		m === "mgPlayerJSProd_action:set_audio_mode_off" ||
		m === "mgPlayerJSProd_action:set_audio_mode_on" ||
		m === "mgPlayerJSProd_action:close_guide" ||
		m === "mgPlayerJSProd_action:set_style_audio_icon_response") {
        return true;
    } else {
        return false;
    }
};

// This listener is only in Guide iframe
window.addEventListener('message', function(event) {
    if (!GmCXt) {
        GmCXt = event.target.GmCXt;
    }

    function parseJSON(str) {
        try {
            if (typeof str === 'object') {
                return str;
            } else if (str === '' || str === 'AS' ||
                str === 'na' || str === '[object Object]' ||
                str === undefined || str === 'undefined'
            ) {
                return {};
            } else {
                return JSON.parse(str);
            }

        } catch (e) {
            return {};
        }
    };

    function parseMsg(e) {
        let copiedE = e;
        let cData = parseJSON(copiedE.data);
        return cData;
    };

    let message = parseMsg(event);

    if (!message) return;
    if (!message.action || message.action.indexOf('mgPlayerJSProd_action:') !== 0) return;
    message = GmCXt.convertMgdata(message);

    if (message.data) {

        if (message.data.config) {
            GmCXt.conf = message.data.config;
        }

        if (message.data.user && Object.keys(message.data.user).length) {
            GmCXt.user = message.data.user;
        }

        if (GmCXt.syncPlayerInst(message.action)) {
            if (message.data.playerInstance) {
                GmCXt.playerI = message.data.playerInstance;
            }
        }
    }

    switch (message.action) {

    case 'mgPlayerJSProd_action:set_audio_mode_on':
        GmCXt.setAudioModeOn();
        break;

    case 'mgPlayerJSProd_action:set_audio_mode_off':
        GmCXt.setAudioModeOff();
        break;

    case 'mgPlayerJSProd_action:set_style_audio_icon_response':
        document.documentElement.insertAdjacentHTML('beforeend', message.data.data);
        document.querySelectorAll('.mgPlayerJSProd_audio-iframe-icons').forEach(element => {
            element.removeAttribute('style');
        });
        GmCXt.formatAndSendToParentWindow('mgPlayerJSProd_action:hide_pop_audio_ctrl', {});
        break;
    }

}, false);

GmCXt.pauseAudio = function() {
    if (GmCXt.audioObject) {
        GmCXt.audioObject.pause();
    }
};

GmCXt.checkAssetUrl = function(tempUrl, url, cb) {
    if (tempUrl === url) {
        cb(tempUrl);
    } else {
        let promise = GmCXt.checkFileExist(tempUrl);
        promise.then(function() {
            cb(tempUrl);
        }).catch(function(e) {
            cb(url);
        });
    }
};

GmCXt.playStepAudio = function(message) {
    GmCXt.isPageReloaded = false;
    GmCXt.setAudioModeOn();
    if (!message || !message.data) {
        if (GmCXt.playerI) {
            let step = GmCXt.stepFromPlayerI(GmCXt.playerI.currentStepId);
            message = {
                audioTrack: step.step_audio,
                step: step
            };
        }
    }

    let audioTrack = message.audioTrack;

    let play = function(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.blob();
            })
            .then(blob => {

                const blobUrl = URL.createObjectURL(blob); 
        
                let stepObj = message.step;

                if (GmCXt.audioObject) {
                    GmCXt.audioObject.pause();
                }

                GmCXt.audioObject = new Audio(blobUrl);

                let action = "mgPlayerJSProd_action:start_step_completion_timeout";
                let data = {
                    step: stepObj
                };

                GmCXt.audioObject.onended = function() {
                    // Set Complete step timeout after audio is finished
                    URL.revokeObjectURL(blobUrl);
                    GmCXt.formatAndSendToParentWindow(action, data);
                };

                let promise = GmCXt.audioObject.play();
                if (promise !== undefined) {
                    promise.then(function() {
                        // Autoplay started!
                    }).catch(function(e) {
                        // Autoplay was prevented.
                        // disbaled audio button
                        console.log("Audio Track Fail", e);
                        URL.revokeObjectURL(blobUrl);
                        GmCXt.formatAndSendToParentWindow(action, data);
                        GmCXt.setAudioModeOff();
                    });
                }
            });
    };

    if (audioTrack && audioTrack.indexOf(GmCXt.user.cdn_signature.split("=")[0]) === -1) {
        audioTrack = audioTrack + GmCXt.getCdnSign();
    }

    GmCXt.checkAssetUrl(audioTrack, audioTrack, play);

};

GmCXt.stopAudio = function() {
    if (GmCXt.audioObject) GmCXt.audioObject.pause();
};

GmCXt.stepFromPlayerI = function(step_id) {
    let step = false;
    var steps = [];

    var steps = GmCXt.playerI.tour.steps;

    for (let i = 0; i < steps.length; i++) {
        if (parseInt(steps[i].step_id) === parseInt(step_id)) {
            step = steps[i];
            break;
        }
    }
    if (!step.step_description) step.step_description = " ";

    // Map properties
    step.image_url = step.image_url + GmCXt.getCdnSign();
    step.screen_url = step.screen_url + GmCXt.getCdnSign();
    return step;
};


GmCXt.formatAndSendToParentWindow = function(action, data) {

    let m = {};
    m.action = action;
    m.data = data || {};

    if (GmCXt.playerI || GmCXt.playerI === null) {
        m.data.playerInstance = GmCXt.playerI;
    }

    if (m.data && typeof m.data === 'object') {
        if (GmCXt.isSidePanelApp) {
            m.data.fromSidePanel = GmCXt.isSidePanelApp;
        }

        if (m.action !== "mgPlayerJSProd_action:payload_event_call") {
            m.data.user = GmCXt.user;
        }

        if (m.action === "mgPlayerJSProd_action:payload_event_call") {
            delete m.data.fromSidePanel;
        }
    }

    if (m.data && m.data.config && m.data.config.appConfig &&
		m.data.config.appConfig.customer === 'westpac' && m.action.indexOf("MyGuideReporting") !== -1) {
        GmCXt.msgChannel.port1.postMessage(m);
    } else {

        if (m.data) {
            m.mgdata = m.data;
            delete m.data;
        }

        GmCXt.msgChannel.port1.postMessage(JSON.stringify(m));
    }
};


// Select all elements with the class 'mgPlayerJSProd_play-step-audio-on'
document.querySelectorAll('.mgPlayerJSProd_play-step-audio-on').forEach(element => {
    // Remove all click event listeners (if any) by setting up the event listener again
    element.removeEventListener('click', GmCXt.audioOnBtnClick);
    // Add a new click event listener
    element.addEventListener('click', function() {
        GmCXt.audioOnBtnClick();
    });
});


// Select all elements with the class 'mgPlayerJSProd_play-step-audio-off'
document.querySelectorAll('.mgPlayerJSProd_play-step-audio-off').forEach(element => {
    // Remove all click event listeners (if any) by setting up the event listener again
    element.removeEventListener('click', GmCXt.audioOffBtnClick);
    // Add a new click event listener
    element.addEventListener('click', function() {
        GmCXt.audioOffBtnClick();
    });
});


GmCXt.audioOnBtnClick = function() {
    userPrefAudio = true;
    GmCXt.stopAudio();
    GmCXt.setAudioModeOff();
    GmCXt.formatAndSendToParentWindow('mgPlayerJSProd_action:pause_playing_audio', {});
};

GmCXt.audioOffBtnClick = function() {
    userPrefAudio = true;
    if (GmCXt.playerI) {
        let step = GmCXt.stepFromPlayerI(GmCXt.playerI.currentStepId);
        message = {
            audioTrack: step.step_audio,
            step: step
        };
        GmCXt.isPageReloaded = false;
        GmCXt.playStepAudio(message);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    GmCXt.formatAndSendToParentWindow('mgPlayerJSProd_action:set_style_audio_icon', {});
});