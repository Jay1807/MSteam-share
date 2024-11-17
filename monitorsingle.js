import xapi from 'xapi';

async function isMatchingCallActive() {
    try {
        const calls = await xapi.status.get('Call');
        console.log("Retrieved active calls:", JSON.stringify(calls, null, 2));

        if (calls.length === 0) {
            console.log("No active calls found.");
            return false;
        }

        for (const call of calls) {
            if (call.DisplayName && call.DisplayName.includes('Microsoft Teams meeting')) {
                console.log(`Matching call found with DisplayName: ${call.DisplayName}`);
                return true;
            }
        }

        console.log("No matching call with the required DisplayName found.");
        return false;
    } catch (error) {
        console.error("Error retrieving active calls:", error);
        return false;
    }
}

async function setVideoToSingleMonitorIfMatched() {
    const matchingCall = await isMatchingCallActive();

    if (matchingCall) {
        xapi.config.set('Video Monitors', 'Single')
            .then(() => {
                console.log("Video Monitors set to Single successfully.");
            })
            .catch((error) => {
                console.error("Failed to set Video Monitors to Single:", error);
            });
    } else {
        console.log("No matching call found. Video Monitors not changed.");
    }
}

function revertVideoToAutoMonitor() {
    xapi.config.set('Video Monitors', 'Auto')
        .then(() => {
            console.log("Video Monitors reverted to Auto successfully.");
        })
        .catch((error) => {
            console.error("Failed to revert Video Monitors to Auto:", error);
        });
}

xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
    if (event.PanelId === 'setSingleMonitor') {
        setVideoToSingleMonitorIfMatched();
    }
});

xapi.event.on('PresentationStarted', async () => {
    console.log("Presentation started event detected.");
    await setVideoToSingleMonitorIfMatched();
});

xapi.event.on('PresentationStopped', () => {
    console.log("Presentation stopped event detected.");
    revertVideoToAutoMonitor();
});
