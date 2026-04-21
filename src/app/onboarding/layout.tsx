import { LogoLink } from "@/components/LogoLink";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <LogoLink />
        </div>
      </nav>
      {children}
    </div>
  );
}
