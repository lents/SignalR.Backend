import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

function App() {
    const [notificationConnection, setNotificationConnection] = useState(null);

    const [notifications, setNotifications] = useState([]); // State for notifications
    //Initialize notification connection
    useEffect(() => {
        const newNotificationConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7252/notificationHub") 
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setNotificationConnection(newNotificationConnection);
    }, []);

    
    // Start notification connection and set up notification handler
    useEffect(() => {
        if (notificationConnection) {
            notificationConnection.start()
                .then(() => {
                    console.log("Connected to Notification Hub!");

                    notificationConnection.no("ReceiveNotification", (notification) => {
                        setNotifications(notifications => [...notifications, notification]);
                    });
                })
                .catch(e => console.log("Notification Connection failed: ", e));
        }
    }, [notificationConnection]);

    return (
        <div>
            <h2>SignalR Notification Demo</h2>         
           

            <div>
                <h3>Notifications:</h3>
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={index}>{notification}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
