'use client';

import React from 'react';
import WorkoutUpload from '@/components/WorkoutUpload';

export default function UploadDemoPage() {
  const handleUploadComplete = (ingestId: string, sessionId?: string) => {
    console.log('Upload completed:', { ingestId, sessionId });
    // You can add additional logic here, like redirecting to a session view
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You can add additional error handling here, like showing a toast notification
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Workout Upload Demo
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload your TCX or GPX workout files to see the B2 Manual Upload feature in action
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <WorkoutUpload
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            How it works:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Drag and drop a .tcx or .gpx file (max 25MB)</li>
            <li>• File is validated and uploaded to the backend</li>
            <li>• Backend processes the file and creates a session record</li>
            <li>• Real-time status updates show progress</li>
            <li>• Success shows ingest ID and session ID</li>
          </ul>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">
            Test Files:
          </h3>
          <p className="text-sm text-yellow-800">
            You can create test files by saving any XML content as .tcx or .gpx files. 
            The backend will process them and create session records in the database.
          </p>
        </div>
      </div>
    </div>
  );
}
