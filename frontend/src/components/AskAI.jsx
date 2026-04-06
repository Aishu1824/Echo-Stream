import { useState } from "react";
function AskAI() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [matches, setMatches] = useState([]);

  const handleAsk = async () => {
    const response = await fetch(
      `http://127.0.0.1:8000/ask?question=${encodeURIComponent(question)}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    setAnswer(data.answer);
    setMatches(data.matches);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Ask AI About Your Meetings</h2>

      <input
        type="text"
        placeholder="Ask something..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
      />

      <button
        onClick={handleAsk}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Ask
      </button>

      {answer && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800">Answer</h3>
          <p className="text-gray-700 mt-2">{answer}</p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800">Relevant Transcript Chunks</h3>

          {matches.map((match, index) => (
            <div
              key={index}
              className="mt-2 p-3 bg-gray-100 rounded-lg text-sm text-gray-700"
            >
              {match}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AskAI;