'use client';
import type React from 'react';
import { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import FileInput from '../input/FileInput';
import Label from '../Label';

export default function FileInputExample() {
  const [fileName, setFileName] = useState<string>('');
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file?.name || '');
  };

  return (
    <ComponentCard title="File Input">
      <div>
        <Label>Upload file</Label>
        <FileInput className="custom-class" onChange={handleFileChange} />
        {fileName && (
          <p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
            Selected file: {fileName}
          </p>
        )}
      </div>
    </ComponentCard>
  );
}
