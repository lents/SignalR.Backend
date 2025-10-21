import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

function App() {
    const [chatConnection, setChatConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [group, setGroup] = useState("");
       
    
    //Initialize chat connection
    useEffect(() => {
        const newChatConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5049/chatHub") // Chat Hub URL
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setChatConnection(newChatConnection);
    }, []);

  
   

     //Start chat connection and set up message handler
     useEffect(() => {
        if (chatConnection) {
            chatConnection.start()
                .then(() => {                    
                    chatConnection.on("ReceiveMessage", (user, message) => {
                                             setMessages(messages => [...messages, `${user}: ${message}`]);
                                        });
                })
                .catch(e => console.log("Chat Connection failed: ", e));
        }
    }, [chatConnection]);

 

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

           
        </div>
    );
}

export default App;
