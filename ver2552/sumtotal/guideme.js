/*global GmCXt,guideMe*/ 
if (typeof guideMe === 'undefined') {
    guideMe = {};
}
if (!guideMe.baseUrl) {
    guideMe.baseUrl = "https://github.com/prashant-csod/gmPlayer/ver2559/sumtotal";
} 

function getMyGuideScript() {
    var configPath = guideMe.baseUrl + 'config.js';
    if(typeof GmCXt === 'undefined'){
        if (configPath) {
            let el = document.createElement('script');
            el.onload = getMyGuideScriptCB;
            el.src = configPath;
            document.head.appendChild(el);
        } else {
            console.log("Invalid config path");
        }
    }
}

function getMyGuideScriptCB() {

    GmCXt.conf.baseUrl = guideMe.baseUrl;
    let a = document.createElement('script');

    if (GmCXt.conf.allowedDomains && GmCXt.conf.allowedDomains.length && window.location.hostname.length > 0) {
        let foundDomain = false;
        for (let i = 0; i < GmCXt.conf.allowedDomains.length; i++) {
            if (window.location.hostname.indexOf(GmCXt.conf.allowedDomains[i]) >= 0) {
                foundDomain = true;
                break;
            }
        }

        if (foundDomain) {
            loadGuideMeClientFiles();
        }
    } else {
        loadGuideMeClientFiles();
    }

    function loadGuideMeClientFiles() {
        if (window.self === window.top) {
            a.src = GmCXt.conf.baseUrl + 'gm_client_1763449067662.js';
        } else {
            a.src = GmCXt.conf.baseUrl + 'gm_client_iframe_1763449067662.js';
        }
        document.head.appendChild(a);
    }
};

function detectMyGuideExtension() {
    let playerExtImgUrl = "";

    if(playerExtImgUrl){
        let img;
        img = new Image();
	    img.src = playerExtImgUrl;
	    img.onload = function() {
	        console.log("MyGuide player Extension installed, Skiping client JS load.");
	    };
	    img.onerror = function() {
	        getMyGuideScript();
	    };
    } else{
        getMyGuideScript();
    }
    
}

detectMyGuideExtension();