import { CheckCircle } from "lucide-react";

const steps = [
  { id: 1, label: "Payment" },
  { id: 2, label: "Preferences" },
  { id: 3, label: "Upload CV" },
];

export function OnboardingSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${
                current > step.id
                  ? "bg-green-500 text-white"
                  : current === step.id
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {current > step.id ? <CheckCircle size={14} /> : step.id}
            </div>
            <span
              className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                current === step.id ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-6 sm:w-12 h-0.5 flex-shrink-0 ${
                current > step.id ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
