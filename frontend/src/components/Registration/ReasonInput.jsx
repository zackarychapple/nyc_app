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

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 text-left">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="e.g. I'm building an AI startup and want to learn about Databricks for data pipelines..."
          className="w-full p-4 rounded-lg border-2 border-gray-200 text-navy-900 resize-none focus:outline-none focus:ring-2 focus:ring-lava-400 focus:border-lava-400 hover:border-gray-300 transition-colors placeholder:text-gray-400"
        />
        <div className="flex justify-between items-center mt-2 mb-1">
          <span className={`text-xs ${reason.trim().length >= 10 ? 'text-green-500' : 'text-gray-400'}`}>
            {reason.trim().length >= 10 ? <><i className="fas fa-check mr-1"></i>Looks good!</> : 'Min 10 characters'}
          </span>
          <span className={`text-xs font-medium ${reason.length > 450 ? 'text-lava-600' : 'text-gray-400'}`}>
            {reason.length}/500
          </span>
        </div>
        {/* Character progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              reason.length > 450 ? 'bg-lava-600' : reason.trim().length >= 10 ? 'bg-lava-400' : 'bg-gray-300'
            }`}
            style={{ width: `${Math.min((reason.length / 500) * 100, 100)}%` }}
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg font-medium border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Back
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={!isValid || submitting}
            className="px-6 py-3 rounded-lg font-semibold bg-lava-500 text-white hover:bg-lava-600 hover:shadow-md active:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {submitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Submitting...
              </>
            ) : (
              <>
                Submit
                <i className="fas fa-arrow-right ml-2"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReasonInput;
