import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

function App() {
    const [chatConnection, setChatConnection] = useState(null);
    const [notificationConnection, setNotificationConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]); // State for notifications
    const [input, setInput] = useState("");
    const [group, setGroup] = useState("");
    const [token, setToken] = useState(""); 
    // Fetch the token from an API
    const fetchToken = async () => {
        const response = await fetch('https://localhost:7246/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'test', password: 'password' }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        setToken(data.token); // Store the token
    };
    const getUserIdFromToken = () => {
        const token = localStorage.getItem("access_token");
        if (!token) return null;
    
        // Decode the JWT to get the userId
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub; // Adjust according to your JWT structure
    };
    useEffect(() => {
        // Fetch token when the component mounts
        fetchToken();
    }, []);
    useEffect(() => {
        if (token) {
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl("https://localhost:7246/chatHub", {
                    accessTokenFactory: () => token, // Use the token here
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();

                setChatConnection(newConnection);
        }
    }, [token]);
    // // Initialize chat connection
    // useEffect(() => {
    //     const newChatConnection = new signalR.HubConnectionBuilder()
    //         .withUrl("http://localhost:5049/chatHub") // Chat Hub URL
    //         .withAutomaticReconnect()
    //         .configureLogging(signalR.LogLevel.Information)
    //         .build();

    //     setChatConnection(newChatConnection);
    // }, []);

    // Initialize notification connection
    useEffect(() => {
        const newNotificationConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7252/notificationHub") // , {
            //     accessTokenFactory: () => token
            // }
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setNotificationConnection(newNotificationConnection);
    }, []);

    // Start chat connection and set up message handler
    useEffect(() => {
        if (chatConnection) {
            chatConnection.start()
                .then(() => {
                    console.log("Connected to Chat Hub!");
                    // Load user-specific chat history
                    chatConnection.on("LoadHistory", (history) => {
                        setMessages(history);
                    });
                    chatConnection.on("ReceiveMessage", (user, message) => {
                        setMessages(messages => [...messages, `${user}: ${message}`]);
                    });
                })
                .catch(e => console.log("Chat Connection failed: ", e));
        }
    }, [chatConnection]);

    // Start notification connection and set up notification handler
    useEffect(() => {
        if (notificationConnection) {
            notificationConnection.start()
                .then(() => {
                    console.log("Connected to Notification Hub!");

                    notificationConnection.on("ReceiveNotification", (notification) => {
                        setNotifications(notifications => [...notifications, notification]);
                    });
                })
                .catch(e => console.log("Notification Connection failed: ", e));
        }
    }, [notificationConnection]);

    const sendMessage = async () => {
        if (chatConnection._connectionStarted) {
            try {
                await chatConnection.invoke("SendMessage", input);
                setInput("");
            } catch (e) {
                console.error(e);
            }
        }
    };

    const joinGroup = async () => {
        if (chatConnection._connectionStarted) {
            try {
                await chatConnection.invoke("JoinGroup", group);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const leaveGroup = async () => {
        if (chatConnection._connectionStarted) {
            try {
                await chatConnection.invoke("LeaveGroup", group);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const sendMessageToGroup = async () => {     
        if (chatConnection._connectionStarted) {
            try {
                await chatConnection.invoke("SendMessageToGroup", group, input);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div>
            <h2>SignalR Chat and Notification Demo</h2>
            <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message"
                />
                <button onClick={sendMessage}>Send Message</button>
                <button onClick={sendMessageToGroup}>Send to Group</button>
            </div>
            <div>
                <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Group Name"
                />
                <button onClick={joinGroup}>Join Group</button>
                <button onClick={leaveGroup}>Leave Group</button>
            </div>

            <div>
                <h3>Messages:</h3>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>

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
