'use client';
import { useState } from 'react';
import { EnvelopeIcon } from '@/icons';
import ComponentCard from '../../common/ComponentCard';
import PhoneInput from '../group-input/PhoneInput';
import Input from '../input/InputField';
import Label from '../Label';

export default function InputGroup() {
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const countries = [
    { code: 'US', label: '+1' },
    { code: 'GB', label: '+44' },
    { code: 'CA', label: '+1' },
    { code: 'AU', label: '+61' },
  ];
  return (
    <ComponentCard title="Input Group">
      <div className="space-y-6">
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Input
              className="pl-[62px]"
              placeholder="info@gmail.com"
              type="text"
            />
            <span className="-translate-y-1/2 absolute top-1/2 left-0 border-gray-200 border-r px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Phone</Label>
          <PhoneInput
            countries={countries}
            onChange={setPrimaryPhone}
            placeholder="+1 (555) 000-0000"
            selectPosition="start"
          />
          {primaryPhone && (
            <p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
              Primary phone: {primaryPhone}
            </p>
          )}
        </div>{' '}
        <div>
          <Label>Phone</Label>
          <PhoneInput
            countries={countries}
            onChange={setSecondaryPhone}
            placeholder="+1 (555) 000-0000"
            selectPosition="end"
          />
          {secondaryPhone && (
            <p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
              Secondary phone: {secondaryPhone}
            </p>
          )}
        </div>
      </div>
    </ComponentCard>
  );
}
