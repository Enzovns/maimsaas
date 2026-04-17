import { CheckCircle } from "lucide-react";

const steps = [
  { id: 1, label: "Payment" },
  { id: 2, label: "Connect Gmail" },
  { id: 3, label: "Upload CV" },
];

export function OnboardingSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-10">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                current > step.id
                  ? "bg-green-500 text-white"
                  : current === step.id
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {current > step.id ? <CheckCircle size={16} /> : step.id}
            </div>
            <span
              className={`text-sm font-medium ${
                current === step.id ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 ${
                current > step.id ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
