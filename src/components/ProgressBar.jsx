
export default function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-teal-600 font-medium">
          {Math.round(progress)}% completed
        </span>
      </div>

      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
