import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

function App() {
    const [chatConnection, setChatConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [userName, setUserName] = useState("");
    const [pass, setPass] = useState("");
    const [token, setToken] = useState(""); 
    // Fetch the token from an API
    const fetchToken = async () => {
        try {
            const response = await fetch('https://localhost:7246/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username: userName, password: pass }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            // Проверка HTTP статуса
            if (!response.ok) {
                // Попытка получить сообщение об ошибке из ответа
                const errorData = await response.json().catch(() => ({
                    message: `HTTP error! status: ${response.status}`
                }));
                
                // Специальная обработка для 401
                if (response.status === 401) {
                    throw new Error(`Unauthorized: ${errorData.message || 'Invalid credentials'}`);
                }
                
                throw new Error(`Request failed: ${errorData.message || response.statusText}`);
            }
    
            // Проверка валидности JSON
            const data = await response.json().catch(error => {
                throw new Error('Invalid JSON response');
            });
    
            // Проверка наличия токена
            if (!data.token) {
                throw new Error('Token not found in response');
            }
    
            setToken(data.token);
    
        } catch (error) {
            // Обработка разных типов ошибок
            console.error('Login failed:', error);
            setError(`Login failed: ${error.message}` );
          
            // Сбросить токен в случае ошибки
            setToken(null);
        }
    };
    
    useEffect(() => {
        // Fetch token when the component mounts
       // fetchToken();
    }, []);
    useEffect(() => {
        if (token) {
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl("https://localhost:7246/chatHub", {
                    accessTokenFactory: () => token, // Use the token here
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();

                setChatConnection(newConnection);
        }
    }, [token]);
  

    //Start chat connection and set up message handler
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

   
    const sendMessage = async () => {
        if (chatConnection && chatConnection._connectionStarted) {
            try {
                await chatConnection.invoke("SendMessage", input);
                setInput("");
            } catch (e) {
                console.error(e);
            }
        }
    };
    
    return (
        <div>
            <h2>SignalR Chat Auth Demo</h2>
            <p>{error}</p>
            <div>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="username"
                />
                 <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="password"
                />
                <button onClick={fetchToken}>Login</button>
            </div>
            <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message"
                />
                <button onClick={sendMessage}>Send Message</button>
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
