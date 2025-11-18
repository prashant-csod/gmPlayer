// Listen for messages from the parent window
window.addEventListener('message', function (event) {
    // Make sure the message is from your extension
    if (event.data && (event.data.action === 'fetchSsoId' || event.data.action === 'fetchUserInfoWithSSO' || 
        event.data.action === 'removeCookieSSO')) {

        const url = event.data.url;
        const headers = event.data.headers || {};
        const credentials = event.data.credentials || 'omit';

        // Make the fetch request from this iframe
        fetch(url, {
            method: 'GET',
            credentials: credentials,
            headers: headers,
        })
            .then((response) => {
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                if (response.url.indexOf("remove_cookie") !== -1){
                    return {};
                } else {
                    return response.json();
                }
                
            })
            .then((jsonResponse) => {
                // Send the result back to the parent window
                window.parent.postMessage(
                    {
                        action: 'ssoResult',
                        success: true,
                        data: jsonResponse,
                        requestId: event.data.requestId,
                        requestType: event.data.action,
                    },
                    '*',
                );
            })
            .catch((error) => {
                // Send error back to parent window
                window.parent.postMessage(
                    {
                        action: 'ssoResult',
                        success: false,
                        error: error.message,
                        requestId: event.data.requestId,
                        requestType: event.data.action,
                    },
                    '*',
                );
            });
    }
});

// Signal that the iframe is ready
window.parent.postMessage({ action: 'iframeReady' }, '*');
