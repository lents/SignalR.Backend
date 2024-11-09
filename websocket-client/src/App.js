import React, { useState, useEffect } from 'react';

function App() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        // Connect to the WebSocket server
        const ws = new WebSocket('ws://localhost:5163/ws');
        setSocket(ws);

        // Listen for messages from the server
        ws.onmessage = (event) => {
            const message = event.data;
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => ws.close();
    }, []);

    const sendMessage = () => {
        if (socket && input) {
            socket.send(input);
            setInput(''); // Clear input after sending
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>WebSocket Chat Demo</h1>
            <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <h2>Messages:</h2>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
        </div>
    );
}

export default App;
