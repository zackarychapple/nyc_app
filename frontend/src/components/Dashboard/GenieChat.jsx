import React, { useState, useRef, useEffect } from 'react';
import { askGenie } from '../../services/api';

const STARTER_QUESTIONS = [
  'How many total registrations?',
  'Which borough has the most registrations?',
  'What are the top reasons people are attending?',
  'How many attendees are from outside NYC?',
];

function GenieChat() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [result]);

  async function handleAsk(q) {
    const text = q || question.trim();
    if (!text || text.length < 3) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setQuestion(text);

    try {
      const data = await askGenie(text);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <div>
      {/* Input Area */}
      <div className="flex gap-2 md:gap-3">
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the event data..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm md:text-base text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lava-400 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || question.trim().length < 3}
          className="px-4 md:px-6 py-3 bg-lava-500 text-white rounded-xl font-semibold text-sm md:text-base hover:bg-lava-600 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 flex-shrink-0"
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <><i className="fas fa-paper-plane mr-1 md:mr-2"></i><span className="hidden md:inline">Ask</span></>
          )}
        </button>
      </div>

      {/* Starter Questions */}
      {!result && !loading && !error && (
        <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
          {STARTER_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              className="px-3 py-1.5 text-xs md:text-sm bg-oat-light border border-gray-200 rounded-full text-navy-800 hover:bg-oat-medium hover:border-gray-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-4 md:mt-6 flex items-center justify-center py-8 md:py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-2xl md:text-3xl text-lava-500 mb-2 block"></i>
            <p className="text-sm text-gray-500">Genie is thinking...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div ref={resultRef} className="mt-4 md:mt-6 space-y-4">
          {/* Answer */}
          {result.answer && (
            <div className="p-4 md:p-5 bg-oat-light rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-navy-800 mb-1">
                <i className="fas fa-magic mr-2 text-lava-500"></i>Answer
              </p>
              <p className="text-sm md:text-base text-navy-900">{result.answer}</p>
            </div>
          )}

          {/* Data Table */}
          {result.columns && result.columns.length > 0 && result.rows && result.rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-oat-light border-b border-gray-200">
                    {result.columns.map((col) => (
                      <th key={col} className="px-3 md:px-4 py-2 text-left font-semibold text-navy-800 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-oat-light/50'}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 md:px-4 py-2 text-navy-900 whitespace-nowrap">
                          {cell != null ? String(cell) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SQL */}
          {result.sql && (
            <details className="group">
              <summary className="cursor-pointer text-xs md:text-sm text-gray-500 hover:text-navy-800 transition-colors">
                <i className="fas fa-code mr-1"></i>
                View SQL
              </summary>
              <pre className="mt-2 p-3 md:p-4 bg-navy-900 text-gray-200 rounded-xl text-xs md:text-sm overflow-x-auto">
                <code>{result.sql}</code>
              </pre>
            </details>
          )}

          {/* Suggested Follow-ups */}
          {result.suggested_questions && result.suggested_questions.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Follow-up questions:</p>
              <div className="flex flex-wrap gap-2">
                {result.suggested_questions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    className="px-3 py-1.5 text-xs md:text-sm bg-oat-light border border-gray-200 rounded-full text-navy-800 hover:bg-oat-medium hover:border-gray-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GenieChat;
