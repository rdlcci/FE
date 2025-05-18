import { useState } from 'react';
import './App.css';

// Async function to call the backend API with the user's question and selected database type
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

// Function to save feedback (thumbs up/down) to browser's localStorage as JSON
function saveFeedback({ userInput, backendOutput, feedback, userName }) {
  const prev = JSON.parse(localStorage.getItem('feedback') || '[]');
  prev.push({
    userInput,
    backendOutput,
    feedback,
    userName,
    time: new Date().toISOString()
  }); // new feedback structure
  localStorage.setItem('feedback', JSON.stringify(prev));
}

// Function to download all feedback as a JSON file
function downloadFeedback() {
  const data = localStorage.getItem('feedback') || '[]';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'feedback.json';
  a.click();
  URL.revokeObjectURL(url);
}


// Main React component for the app
function App() {
  const [input, setInput] = useState('');
  const [hint, setHint] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [backendResponses, setBackendResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbType, setDbType] = useState('sqlite'); // default value
  const [userName] = useState('RD'); // You can make this dynamic if needed

  
// Function to handle the "Redo" action for a previous question
const handleRedo = async (idx) => {
  const question = chatHistory[idx]?.text;
  if (!question) return;
  setLoading(true); // Show loading animation
  try {
    const result = await getSummary(question, dbType);
    setChatHistory([
      ...chatHistory,
      {
        text: question,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]); // Add the question again to chat history with new time
    setBackendResponses([...backendResponses, result]);
  } catch (error) {
    setBackendResponses([...backendResponses, { error: error.message }]);
  }
  setLoading(false);
};

// Function to handle sending a new question to the backend
const handleSend = async () => {
    if (input.trim() === '') return;
    const combinedInput = hint.trim() ? `${input} (Hint: ${hint})` : input;
    setChatHistory([
      ...chatHistory,
      {
        text: combinedInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);
    setInput(''); // Clear input box
    setHint(''); // Clear hint box
    setLoading(true); // Show loading animation
    try {
      const result = await getSummary(combinedInput, dbType);
      setBackendResponses([...backendResponses, result]);
    } catch (error) {
      setBackendResponses([...backendResponses, { error: error.message }]);
    }
    setLoading(false); // Hide loading animation
  };

  // main ui part
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
              title={item.text}
            >
              {item.text.length > 30 ? item.text.slice(0, 10) + '...' : item.text}
            </div>
          ))}
        </div>
        {/* User info */}
        <div className="user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>RD</div>
          <div style={{ color: '#666', marginBottom: '0.5rem' }}>Engineer</div>
          <button onClick={downloadFeedback} style={{ marginTop: '0.5rem' }}>Download Feedback</button>
        </div>
        </aside>
        <main className="main">
          {/* Chat messages */}
        <div className="messages">
          {backendResponses.map((resp, idx) => (
            <div key={idx}>
              {/* User question: left-aligned */}
              <div
                className="user-message"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    background: '#e0e0e0',
                    color: '#222',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    maxWidth: '60%',
                    wordBreak: 'break-word',
                    boxShadow: '1px 1px 4px #eee',
                  }}
                >
                  You: {chatHistory[idx]?.text}
                  <span style={{ color: '#888', fontSize: '0.85em', marginLeft: 8 }}>
                    {chatHistory[idx]?.time}
                  </span>
                </div>
              </div>
              {/* Backend answer: right-aligned */}
              <div
                className="backend-response"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    maxWidth: '60%',
                    wordBreak: 'break-word',
                    boxShadow: '1px 1px 4px #b3c6e7',
                  }}
                >
                  {resp.summary || resp.answer || resp.message || resp.error || JSON.stringify(resp)}
                </div>
              </div>
              {/* Feedback and redo icons */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: 8, justifyContent: 'flex-end' }}>
                <button
                  title="Thumbs Up"
                  onClick={() =>
                    saveFeedback({
                      userInput: chatHistory[idx]?.text,
                      backendOutput: backendResponses[idx],
                      feedback: 1,
                      userName
                    })
                  }
                  style={{ cursor: 'pointer' }}
                >👍</button>
                <button
                  title="Thumbs Down"
                  onClick={() =>
                    saveFeedback({
                      userInput: chatHistory[idx]?.text,
                      backendOutput: backendResponses[idx],
                      feedback: 0,
                      userName
                    })
                  }
                  style={{ cursor: 'pointer' }}
                >👎</button>
                <button
                  title="Redo"
                  onClick={() => handleRedo(idx)}
                  style={{ cursor: 'pointer' }}
                >🔄</button>
              </div>
              {idx < backendResponses.length - 1 && <hr style={{ border: '0.5px solid #ccc', margin: '8px 0' }} />}
            </div>
          ))}
          {loading && (
            <div className="generating" style={{ textAlign: 'center', margin: '1rem 0' }}>
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