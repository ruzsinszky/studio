'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface CsvUploaderProps {
  onFilesUploaded: (newItemsFile: File, statusFile: File) => void;
  isLoading: boolean;
}

export default function CsvUploader({ onFilesUploaded, isLoading }: CsvUploaderProps) {
  const [newItemsFile, setNewItemsFile] = useState<File | null>(null);
  const [statusFile, setStatusFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);


  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    let newItems: File | null = null;
    let status: File | null = null;

    acceptedFiles.forEach(file => {
      if (file.name.toLowerCase().includes('new') || file.name.toLowerCase().includes('item')) {
        newItems = file;
      } else if (file.name.toLowerCase().includes('status')) {
        status = file;
      }
    });

    if (rejectedFiles.length > 0) {
      setError(`File rejection: ${rejectedFiles[0].errors[0].message}. Please upload valid CSV files.`);
      return;
    }
    
    if (newItems) setNewItemsFile(newItems);
    if (status) setStatusFile(status);

    if (acceptedFiles.length === 0 && (newItemsFile || statusFile)) {
      // If no new files are dropped but old ones exist, this shouldn't clear them.
      // This is mostly for initial drop.
    }


  }, [newItemsFile, statusFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 2,
  });

  const handleUpload = async () => {
    if (newItemsFile && statusFile) {
      setError(null);
      setUploadProgress(0);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          setUploadProgress(progress);
        } else {
          clearInterval(interval);
          onFilesUploaded(newItemsFile, statusFile);
        }
      }, 100);
    } else {
      setError('Please select both new items CSV and status CSV files.');
    }
  };

  const removeFile = (type: 'newItems' | 'status') => {
    if (type === 'newItems') setNewItemsFile(null);
    if (type === 'status') setStatusFile(null);
    setUploadProgress(0); // Reset progress if a file is removed
  };

  return (
    <div className="space-y-4 p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
      <div {...getRootProps()} className="cursor-pointer text-center p-8">
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
        {isDragActive ? (
          <p className="text-primary">Drop the files here ...</p>
        ) : (
          <p className="text-muted-foreground">
            Drag 'n' drop 'new-items.csv' and 'status.csv' here, or click to select files.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newItemsFile && (
          <FileDisplay file={newItemsFile} onRemove={() => removeFile('newItems')} title="New Items CSV" />
        )}
        {statusFile && (
          <FileDisplay file={statusFile} onRemove={() => removeFile('status')} title="Status CSV" />
        )}
      </div>
      
      {uploadProgress > 0 && <Progress value={uploadProgress} className="w-full mt-2" />}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleUpload} disabled={!newItemsFile || !statusFile || isLoading} className="w-full">
        {isLoading ? 'Processing...' : 'Process CSV Files'}
      </Button>
    </div>
  );
}

interface FileDisplayProps {
  file: File;
  onRemove: () => void;
  title: string;
}

function FileDisplay({ file, onRemove, title }: FileDisplayProps) {
  return (
    <div className="p-3 border rounded-md bg-secondary/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${title}`}>
        <XCircle className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
