function connect(sessionId, token, appendVideo, appendPublisher) {
    var session = OT.initSession('45340532', sessionId);

    session.on('streamCreated', function(event) {
        var subscriberProperties = { insertMode: 'append' };
        session.subscribe(event.stream, appendVideo, subscriberProperties, function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log('Subscriber added.');
            }
        });
    });

    var publisher;
    session.connect(token, function (error) {
        if (error) {
            console.log("Error connecting: ", error.code, error.message);
        } else {
            console.log("Connected to the session.");
            if (session.capabilities.publish == 1) {
                publisher = OT.initPublisher(appendPublisher, { insertMode: "append", resolution: '50x50'}, function (error) {
                    if (error) {
                        $('#' + appendPublisher).append('Error connecting to your camera, try allowing the connection to your camera.');
                    } else {
                        console.log('Publisher initialized.');
                    }
                });
                session.publish(publisher, function (error) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Publishing a stream.');
                    }
                });
            }
        }
    });

}