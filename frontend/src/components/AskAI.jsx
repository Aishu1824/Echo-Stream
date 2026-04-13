import { useState } from "react";
import toast from "react-hot-toast";

function AskAI({ darkMode }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/ask?question=${encodeURIComponent(question)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch answer");
      }

      const data = await response.json();

      setAnswer(data.answer || "No clear answer found.");
      setMatches(data.matches || []);

      toast.success("Answer generated");
    } catch (error) {
      console.error("Ask AI error:", error);
      toast.error("Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-white text-black border-gray-200"
      } p-6 rounded-2xl shadow-lg border w-full`}
    >
      <h2 className="text-2xl font-semibold mb-2">
        Ask AI About Your Meetings
      </h2>

      <p
        className={`text-sm mb-5 ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        Ask questions about transcripts, action items, summaries, or meeting
        discussions.
      </p>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Example: Was version 2 mentioned?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={`flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-black"
          }`}
        />

        <button
          onClick={handleAsk}
          disabled={loading}
          className={`px-6 py-3 rounded-xl font-medium text-white transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      {answer && (
        <div
          className={`mt-6 p-5 rounded-xl border ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3
              className={`font-semibold text-lg ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              AI Answer
            </h3>

            <button
              onClick={() => {
                navigator.clipboard.writeText(answer);
                toast.success("Answer copied");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
            >
              Copy
            </button>
          </div>

          <p
            className={`leading-relaxed ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {answer}
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-6">
          <h3
            className={`font-semibold text-lg mb-3 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Relevant Transcript Chunks
          </h3>

          <div className="space-y-3">
            {matches.map((match, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl text-sm border leading-relaxed ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                {match}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !answer && (
        <div
          className={`mt-6 text-sm rounded-xl p-4 border ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-gray-300"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}
        >
          Try asking:
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Was version 2 mentioned?</li>
            <li>What action items were discussed?</li>
            <li>What backend tasks were completed?</li>
            <li>Was API documentation discussed?</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default AskAI;