if (GmCXt === undefined) var GmCXt = {};
var stepAudio = {};
var userPrefAudio = false;

// Starts message channel only inside audio iframe
GmCXt.msgChannel = new MessageChannel();
GmCXt.startMsgChannel = function(initiator) {
	window.top.postMessage(initiator, '*', [GmCXt.msgChannel.port2]);
};
if (document.querySelectorAll('.mgPlayerJSProd_audio-iframe-icons').length > 0) {
	GmCXt.startMsgChannel('Guide:audioIframe');
}

function modifyElements(elements, operation, className) {
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
}

function setAudioModeOn() {
	if (document.getElementsByClassName('mgPlayerJSProd_play-step-audio-on') &&
		document.getElementsByClassName('mgPlayerJSProd_play-step-audio-on').length) {
		modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio-on'), 'show');
		modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio-off'), 'hide');
		modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio'), 'addClass', 'playing-audio');

		if (userPrefAudio) {

			var action = "mgPlayerJSProd_action:set_audio_storage";
			var data = {
				'stepAudioRunningStatus': true
			};
			formatAndSendToParentWindow(action, data);
		}
	} else {
		formatAndSendToParentWindow("mgPlayerJSProd_action:set_audio_mode_on", {});
	}
}

function setAudioModeOff() {
	if (document.getElementsByClassName('mgPlayerJSProd_play-step-audio-off') &&
		document.getElementsByClassName('mgPlayerJSProd_play-step-audio-off').length) {
		modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio-on'), 'hide');
		modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio-off'), 'show');
		modifyElements(document.querySelectorAll('.mgPlayerJSProd_play-step-audio'), 'removeClass', 'playing-audio');

		if (userPrefAudio) {

			var action = "mgPlayerJSProd_action:set_audio_storage";
			var data = {
				'stepAudioRunningStatus': false
			};
			formatAndSendToParentWindow(action, data);
		}
	} else {
		formatAndSendToParentWindow("mgPlayerJSProd_action:set_audio_mode_off", {});
	}
}

if (GmCXt.requestHandler === undefined) {
	GmCXt.requestHandler = {};
}

GmCXt.requestHandler.playAudioTrack = function(message) {
	if (message.data.playerInstance) {
		GmCXt.playerI = message.data.playerInstance;
	}
	GmCXt.playStepAudio(message.data);
};

GmCXt.requestHandler.stopAudioTrack = function(message) {
	GmCXt.stopAudio();
};

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

function getCdnSign() {
	var sign = '';
	if (GmCXt.user) {
		sign = GmCXt.user.cdn_signature;
	} 

	return sign;
};

function convertMgdata(m) {
	if (m.action && m.action.indexOf("init_sfdc_env") !== -1) {
		return m;
	} else if (m.data && m.data.config && m.data.config.appConfig &&
		m.data.config.appConfig.customer === 'westpac' && m.action && m.action.indexOf("MyGuideReporting") !== -1) {
		return m;
	}
	m.data = m.mgdata;
	return m;
};

function syncPlayerInst(m) {
	if (m === "mgPlayerJSProd_action:started;task:select_existing_dom_element" ||
		m === "mgPlayerJSProd_action:started;task:select_existing_dom_element:target_frame_only" ||
		m === "mgPlayerJSProd_action:started;task:select_dom_element_tooltips" ||
		m === "mgPlayerJSProd_action:task:init_new_iframe" ||
		m === "mgPlayerJSProd_action:update_player_instance" ||
		m === "mgPlayerJSProd_action:play_slideshow" ||
		m === "mgPlayerJSProd_action:play_video_step" ||
		m === "mgPlayerJSProd_action:play_image_step" ||
		m === "mgPlayerJSProd_action:click; on:mgPlayerJSProd_slideshow-close" ||
		m === "mgPlayerJSProd_action:mark_auto_tour_donotshow" ||
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

	var message = parseMsg(event);

	if (!message) return;
	if (!message.action || message.action.indexOf('mgPlayerJSProd_action:') !== 0) return;
	message = convertMgdata(message);

	if (message.data) {

		if (message.data.config) {
			GmCXt.conf = message.data.config;
		}

		if (message.data.user && Object.keys(message.data.user).length) {
			GmCXt.user = message.data.user;
			formatAndSendToParentWindow('mgPlayerJSProd_action:save_user_info', message.data.user);
		}

		if (syncPlayerInst(message.action)) {
			if (message.data.playerInstance) {
				GmCXt.playerI = message.data.playerInstance;
			}
		}
	}

	switch (message.action) {

		case 'mgPlayerJSProd_action:set_audio_mode_on':
			setAudioModeOn();
			break;

		case 'mgPlayerJSProd_action:set_audio_mode_off':
			setAudioModeOff();
			break;

		case 'mgPlayerJSProd_action:stop_audio':
			GmCXt.requestHandler.stopAudioTrack();
			break;

		case 'mgPlayerJSProd_action:set_style_audio_icon_response':
			document.documentElement.insertAdjacentHTML('beforeend', message.data.data);
			document.querySelectorAll('.mgPlayerJSProd_audio-iframe-icons').forEach(element => {
				element.removeAttribute('style');
			});
			formatAndSendToParentWindow('mgPlayerJSProd_action:hide_pop_audio_ctrl', {});
			break;
	}

}, false);

function pauseAudio() {
	if (GmCXt.audioObject) {
		GmCXt.audioObject.pause();
	}
}

GmCXt.checkAssetUrl = function(tempUrl, url, cb) {
	if (tempUrl === url) {
		cb(tempUrl);
	} else {
		var promise = GmCXt.checkFileExist(tempUrl);
		promise.then(function() {
			cb(tempUrl);
		}).catch(function(e) {
			cb(url);
		});
	}
};

GmCXt.playStepAudio = function(message) {
	GmCXt.isPageReloaded = false;
	setAudioModeOn();
	if (!message || !message.data) {
		if (GmCXt.playerI) {
			var step = getStepFromPlayerI(GmCXt.playerI.currentStepId);
			message = {
				audioTrack: step.step_audio,
				step: step
			}
		}
	}

	var audioTrack = message.audioTrack;

	var play = function(url) {
		if (url) {
			audioTrack = url;
		}
		var stepObj = message.step;

		if (GmCXt.audioObject) {
			GmCXt.audioObject.pause();
		}

		GmCXt.audioObject = new Audio(audioTrack);

		var action = "mgPlayerJSProd_action:start_step_completion_timeout";
		var data = {
			step: stepObj
		};

		GmCXt.audioObject.onended = function() {
			// Set Complete step timeout after audio is finished
			formatAndSendToParentWindow(action, data);
		};

		var promise = GmCXt.audioObject.play();
		if (promise !== undefined) {
			promise.then(function() {
				// Autoplay started!
			}).catch(function(e) {
				// Autoplay was prevented.
				// disbaled audio button
				console.log("Audio Track Fail", e);
				formatAndSendToParentWindow(action, data);
				setAudioModeOff();
			});
		}
	};

	if (audioTrack && audioTrack.indexOf(GmCXt.user.cdn_signature.split("=")[0]) === -1) {
		audioTrack = audioTrack + getCdnSign();
	}

	GmCXt.checkAssetUrl(audioTrack, audioTrack, play);

};

GmCXt.stopAudio = function() {
	if (GmCXt.audioObject) GmCXt.audioObject.pause();
};

function getStepFromPlayerI(step_id) {
	var step = false;
	var steps = [];

	var steps = GmCXt.playerI.tour.steps;

	for (var i = 0; i < steps.length; i++) {
		if (parseInt(steps[i].step_id) === parseInt(step_id)) {
			step = steps[i];
			break;
		}
	}
	if (!step.step_description) step.step_description = " ";

	// Map properties
	step.image_url = step.image_url + getCdnSign();
	step.screen_url = step.screen_url + getCdnSign();
	return step;
};


function formatAndSendToParentWindow(action, data) {

	var m = {};
	m.action = action;
	m.data = data || {};

	if (GmCXt.playerI || GmCXt.playerI === null) {
		m.data.playerInstance = GmCXt.playerI;
	}

	if (m.data && typeof m.data === 'object') {
		if (GmCXt.isSidePanelApp) {
			m.data.fromSidePanel = GmCXt.isSidePanelApp;
		}

		if (m.action !== "mgPlayerJSProd_action:update_custom_labels" &&
			m.action !== "mgPlayerJSProd_action:set_lang_content_script" &&
			m.action !== "mgPlayerJSProd_action:update:player_mode" &&
			m.action !== "mgPlayerJSProd_action:save_user_info" &&
			m.action !== "mgPlayerJSProd_action:payload_event_call") {
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
}


// Select all elements with the class 'mgPlayerJSProd_play-step-audio-on'
document.querySelectorAll('.mgPlayerJSProd_play-step-audio-on').forEach(element => {
	// Remove all click event listeners (if any) by setting up the event listener again
	element.removeEventListener('click', audioOnBtnClick);
	// Add a new click event listener
	element.addEventListener('click', function() {
		audioOnBtnClick();
	});
});


// Select all elements with the class 'mgPlayerJSProd_play-step-audio-off'
document.querySelectorAll('.mgPlayerJSProd_play-step-audio-off').forEach(element => {
	// Remove all click event listeners (if any) by setting up the event listener again
	element.removeEventListener('click', audioOffBtnClick);
	// Add a new click event listener
	element.addEventListener('click', function() {
		audioOffBtnClick();
	});
});


function audioOnBtnClick() {
	userPrefAudio = true;
	GmCXt.stopAudio();
	formatAndSendToParentWindow('mgPlayerJSProd_action:stop_audio', {});
	setAudioModeOff();
}

function audioOffBtnClick() {
	userPrefAudio = true;
	if (GmCXt.playerI) {
		var step = getStepFromPlayerI(GmCXt.playerI.currentStepId);
		message = {
			audioTrack: step.step_audio,
			step: step
		}
		GmCXt.isPageReloaded = false;
		GmCXt.playStepAudio(message);
	}
}

document.addEventListener('DOMContentLoaded', function() {
	formatAndSendToParentWindow('mgPlayerJSProd_action:set_style_audio_icon', {});
});