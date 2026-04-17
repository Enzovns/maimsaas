"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OnboardingSteps } from "@/components/OnboardingSteps";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const { status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB");
      return;
    }

    setError("");
    setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <OnboardingSteps current={3} />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload your CV</h1>
        <p className="text-gray-600">
          Upload your PDF CV once. We&apos;ll attach it to every email we send.
        </p>
      </div>

      {success ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">CV Uploaded!</h2>
          <p className="text-gray-600">Taking you to your dashboard...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-6">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
              file
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-200 hover:border-yellow-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <FileText className="text-yellow-500" size={40} />
                <div>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <p className="text-sm text-yellow-600">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="text-gray-400" size={40} />
                <div>
                  <p className="font-semibold text-gray-700">
                    Click to upload your CV
                  </p>
                  <p className="text-sm text-gray-500">PDF only, max 10MB</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-colors"
          >
            {uploading ? "Uploading..." : "Upload CV & Go to Dashboard"}
          </button>
        </div>
      )}
    </div>
  );
}
