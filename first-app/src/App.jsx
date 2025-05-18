import { useState } from 'react';
import './App.css';

async function getSummary(userInput, dbType) {
  const response = await fetch(`http://localhost:8000/api/analysis/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question: userInput, db_type: dbType }),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  return data;
}

function App() {
  const [input, setInput] = useState('');
  const [hint, setHint] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [backendResponses, setBackendResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbType, setDbType] = useState('sqlite'); // default value

  const handleSend = async () => {
    if (input.trim() === '') return;
    // Combine input and hint
    const combinedInput = hint.trim() ? `${input} (Hint: ${hint})` : input;
    setChatHistory([...chatHistory, combinedInput]);
    setInput('');
    setHint('');
    setLoading(true);
    try {
      const result = await getSummary(combinedInput, dbType);
      setBackendResponses([...backendResponses, result]);
    } catch (error) {
      setBackendResponses([...backendResponses, { error: error.message }]);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      {/* Top right dropdown */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <select value={dbType} onChange={e => setDbType(e.target.value)}>
          <option value="sqlite">SQLite</option>
          <option value="postgres">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="aurora">Auroa</option>
          <option value="redshift">Redshift</option>
          <option value="athena">Athena</option>
        </select>
      </div>
      <aside className="sidebar">
        {/* Logo */}
        <div className="logo">
          <img src="logo.png" alt="Logo" style={{ maxWidth: '80%', maxHeight: '80%' }} />
        </div>
        {/* Chat history */}
        <div className="chat-history">
          {chatHistory.map((item, idx) => (
            <div
              className="chat-item"
              key={idx}
              title={item}
            >
              {item.length > 30 ? item.slice(0, 10) + '...' : item}
            </div>
          ))}
        </div>
        {/* User info */}
        <div className="user-info">
          <div>RD</div>
          <div>Engineer</div>
        </div>
      </aside>
      <main className="main">
        {/* Chat messages */}
        <div className="messages">
          {backendResponses.map((resp, idx) => (
            <div key={idx}>
              <div className="user-message" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                You: {chatHistory[idx]}
              </div>
              <div className="backend-response" style={{ marginBottom: 8 }}>
                {resp.summary || resp.answer || resp.message || resp.error || JSON.stringify(resp)}
              </div>
              {idx < backendResponses.length - 1 && <hr style={{ border: '0.5px solid #ccc', margin: '8px 0' }} />}
            </div>
          ))}
          {loading && (
            <div className="generating">
              Generating... <button>⏹️</button>
            </div>
          )}
        </div>
        {/* Input area */}
        <div className="input-area">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
        </div>
        {/* Hint area */}
        <div className="input-area">
          <input
            type="text"
            placeholder="Optional hint..."
            value={hint}
            onChange={e => setHint(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </main>
    </div>
  );
}

export default App;