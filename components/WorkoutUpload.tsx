'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  ingestId?: string;
  sessionId?: string;
  error?: string;
}

interface WorkoutUploadProps {
  onUploadComplete?: (ingestId: string, sessionId?: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export default function WorkoutUpload({ 
  onUploadComplete, 
  onUploadError, 
  className = '' 
}: WorkoutUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds maximum 25MB`;
    }

    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.tcx', '.gpx'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return `File type not supported. Allowed: ${allowedExtensions.join(', ')}`;
    }

    return null;
  };

  // Upload file to backend
  const uploadFile = async (file: File): Promise<void> => {
    setUploadStatus({
      status: 'uploading',
      progress: 0,
      message: 'Uploading file...'
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', 'web-upload');
      formData.append('notes', '');

      const response = await fetch('/api/ingest/workout', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      setUploadStatus({
        status: 'processing',
        progress: 50,
        message: 'Processing workout data...',
        ingestId: result.ingest_id
      });

      // Start polling for status updates
      startStatusPolling(result.ingest_id);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: 'Upload failed',
        error: errorMessage
      });
      onUploadError?.(errorMessage);
    }
  };

  // Poll for status updates
  const startStatusPolling = (ingestId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/ingest/workout/${ingestId}`);
        
        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const statusData = await response.json();
        
        if (statusData.status === 'normalized') {
          setUploadStatus({
            status: 'completed',
            progress: 100,
            message: 'Workout processed successfully!',
            ingestId: statusData.ingest_id,
            sessionId: statusData.session_id
          });
          
          clearInterval(pollingIntervalRef.current!);
          onUploadComplete?.(statusData.ingest_id, statusData.session_id);
          
        } else if (statusData.status === 'error') {
          setUploadStatus({
            status: 'error',
            progress: 0,
            message: 'Processing failed',
            error: statusData.error_message || 'Unknown error'
          });
          
          clearInterval(pollingIntervalRef.current!);
          onUploadError?.(statusData.error_message || 'Processing failed');
          
        } else {
          // Still processing
          setUploadStatus(prev => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 90),
            message: `Processing... (${statusData.status})`
          }));
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Status check failed';
        setUploadStatus({
          status: 'error',
          progress: 0,
          message: 'Status check failed',
          error: errorMessage
        });
        
        clearInterval(pollingIntervalRef.current!);
        onUploadError?.(errorMessage);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: 'Invalid file',
        error: validationError
      });
      onUploadError?.(validationError);
      return;
    }

    uploadFile(file);
  }, [onUploadError]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/xml': ['.tcx'],
      'application/gpx+xml': ['.gpx'],
      'text/xml': ['.tcx', '.gpx']
    },
    multiple: false,
    disabled: uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'
  });

  // Reset upload status
  const resetUpload = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    setUploadStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
  };

  // Get status color
  const getStatusColor = () => {
    switch (uploadStatus.status) {
      case 'uploading':
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'uploading':
      case 'processing':
        return '⏳';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📁';
    }
  };

  return (
    <div className={`workout-upload ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadStatus.status === 'uploading' || uploadStatus.status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="space-y-4">
          <div className="text-4xl">{getStatusIcon()}</div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {uploadStatus.status === 'idle' && 'Upload Workout File'}
              {uploadStatus.status === 'uploading' && 'Uploading...'}
              {uploadStatus.status === 'processing' && 'Processing...'}
              {uploadStatus.status === 'completed' && 'Upload Complete!'}
              {uploadStatus.status === 'error' && 'Upload Failed'}
            </h3>
            
            <p className="text-sm text-gray-500 mt-1">
              {uploadStatus.status === 'idle' && 'Drag and drop your TCX or GPX file here, or click to browse'}
              {uploadStatus.status === 'uploading' && 'Please wait while your file is uploaded...'}
              {uploadStatus.status === 'processing' && 'Processing your workout data...'}
              {uploadStatus.status === 'completed' && 'Your workout has been processed successfully!'}
              {uploadStatus.status === 'error' && 'There was an error processing your file'}
            </p>
          </div>

          {/* File type info */}
          {uploadStatus.status === 'idle' && (
            <div className="text-xs text-gray-400">
              Supported formats: .tcx, .gpx (max 25MB)
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{uploadStatus.message}</span>
            <span>{uploadStatus.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadStatus.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status message */}
      {uploadStatus.message && (
        <div className={`mt-4 text-sm ${getStatusColor()}`}>
          {uploadStatus.message}
        </div>
      )}

      {/* Error details */}
      {uploadStatus.status === 'error' && uploadStatus.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800">
            <strong>Error:</strong> {uploadStatus.error}
          </div>
        </div>
      )}

      {/* Success details */}
      {uploadStatus.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-sm text-green-800">
            <div><strong>Ingest ID:</strong> {uploadStatus.ingestId}</div>
            {uploadStatus.sessionId && (
              <div><strong>Session ID:</strong> {uploadStatus.sessionId}</div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        {uploadStatus.status === 'idle' && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Choose File
          </button>
        )}
        
        {(uploadStatus.status === 'completed' || uploadStatus.status === 'error') && (
          <button
            onClick={resetUpload}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Upload Another
          </button>
        )}
      </div>
    </div>
  );
}
