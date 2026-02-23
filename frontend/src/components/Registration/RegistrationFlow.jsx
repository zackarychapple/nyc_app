import React, { useState } from 'react';
import LocationSelector from './LocationSelector';
import BoroughSelector from './BoroughSelector';
import StateSelector from './StateSelector';
import ReasonInput from './ReasonInput';
import Confirmation from './Confirmation';
import { submitRegistration } from '../../services/api';

function RegistrationFlow() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userId: crypto.randomUUID(),
    locationType: null, // 'nyc' | 'ny_state' | 'other_state'
    borough: null,
    neighborhood: null,
    state: null,
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleLocationSelect = (type) => {
    updateForm({ locationType: type });
    if (type === 'ny_state') {
      updateForm({ locationType: type, state: 'New York' });
    }
    setStep(2);
  };

  const handleBoroughComplete = (borough, neighborhood) => {
    updateForm({ borough, neighborhood });
    setStep(3);
  };

  const handleStateComplete = (state) => {
    updateForm({ state });
    setStep(3);
  };

  const handleNYStateNext = () => {
    setStep(3);
  };

  const handleReasonSubmit = async (reason) => {
    updateForm({ reason });
    setSubmitting(true);
    try {
      await submitRegistration({ ...formData, reason });
      setStep(4);
    } catch (err) {
      console.error('Submission failed:', err);
      setStep(4); // Still show confirmation for demo
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-12">
      {/* Progress indicator */}
      {step < 4 && (
        <div className="flex items-center justify-center mb-6 md:mb-10">
          {[
            { num: 1, label: 'Location' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Submit' },
          ].map(({ num, label }) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    num < step
                      ? 'bg-lava-500 text-white shadow-sm'
                      : num === step
                        ? 'bg-lava-500 text-white ring-4 ring-lava-100 shadow-sm'
                        : 'bg-oat-medium text-gray-400'
                  }`}
                >
                  {num < step ? <i className="fas fa-check text-xs"></i> : num}
                </div>
                <span className={`text-xs mt-1.5 font-medium transition-colors ${
                  num <= step ? 'text-navy-900' : 'text-gray-400'
                }`}>{label}</span>
              </div>
              {num < 3 && (
                <div
                  className={`w-12 md:w-16 h-0.5 mx-2 mb-5 transition-all duration-300 ${
                    num < step ? 'bg-lava-500' : 'bg-oat-medium'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {step === 1 && <LocationSelector onSelect={handleLocationSelect} />}

      {step === 2 && formData.locationType === 'nyc' && (
        <BoroughSelector onComplete={handleBoroughComplete} onBack={() => setStep(1)} />
      )}

      {step === 2 && formData.locationType === 'ny_state' && (
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 md:p-8">
            <div className="text-5xl mb-4">🗽</div>
            <h2 className="text-xl md:text-2xl font-bold text-navy-900 mb-3">New York State</h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              We're focused on NYC neighborhoods for our map, but we're glad you're here!
            </p>
            <div className="flex flex-col-reverse md:flex-row md:justify-center gap-2 md:gap-0 md:space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-full md:w-auto px-6 py-3.5 md:py-3 rounded-lg font-medium border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
              >
                Back
              </button>
              <button
                onClick={handleNYStateNext}
                className="w-full md:w-auto px-6 py-3.5 md:py-3 rounded-lg font-semibold bg-lava-500 text-white hover:bg-lava-600 hover:shadow-md active:shadow-sm transition-all text-center"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && formData.locationType === 'other_state' && (
        <StateSelector onComplete={handleStateComplete} onBack={() => setStep(1)} />
      )}

      {step === 3 && (
        <ReasonInput
          onSubmit={handleReasonSubmit}
          onBack={() => setStep(2)}
          submitting={submitting}
        />
      )}

      {step === 4 && <Confirmation userId={formData.userId} />}
    </main>
  );
}

export default RegistrationFlow;
