import React, { useState } from 'react';

function ReasonInput({ onSubmit, onBack, submitting }) {
  const [reason, setReason] = useState('');

  const isValid = reason.trim().length >= 10 && reason.length <= 500;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-navy-900 mb-2">Almost done!</h2>
      <p className="text-gray-600 mb-8">
        What brought you to this event today? What's the main thing you want to learn?
      </p>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-left">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="e.g. I'm building an AI startup and want to learn about Databricks for data pipelines..."
          className="w-full p-3 rounded-lg border border-gray-300 text-navy-900 resize-none focus:outline-none focus:ring-2 focus:ring-lava-500 focus:border-transparent placeholder:text-gray-400"
        />
        <div className="flex justify-between items-center mt-2 mb-6">
          <span className="text-xs text-gray-400">Min 10 characters</span>
          <span className={`text-xs ${reason.length > 450 ? 'text-lava-600' : 'text-gray-400'}`}>
            {reason.length}/500
          </span>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={!isValid || submitting}
            className="px-6 py-3 rounded-lg font-medium bg-lava-500 text-white hover:bg-lava-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReasonInput;
