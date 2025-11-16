'use client';
import { useState } from 'react';
import DatePicker from '@/components/admin-ui-ref/form/date-picker';
import { ChevronDownIcon, EyeCloseIcon, EyeIcon, TimeIcon } from '@/icons';
import ComponentCard from '../../common/ComponentCard';
import Input from '../input/InputField';
import Label from '../Label';
import Select from '../Select';

export default function DefaultInputs() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const options = [
    { value: 'marketing', label: 'Marketing' },
    { value: 'template', label: 'Template' },
    { value: 'development', label: 'Development' },
  ];
  const handleSelectChange = (value: string) => {
    setSelectedCategory(value);
  };
  return (
    <ComponentCard title="Default Inputs">
      <div className="space-y-6">
        <div>
          <Label>Input</Label>
          <Input type="text" />
        </div>
        <div>
          <Label>Input with Placeholder</Label>
          <Input placeholder="info@gmail.com" type="text" />
        </div>
        <div>
          <Label>Select Input</Label>
          <div className="relative">
            <Select
              className="dark:bg-dark-900"
              onChange={handleSelectChange}
              options={options}
              placeholder="Select an option"
            />
            <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {selectedCategory && (
            <p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
              Selected category: {selectedCategory}
            </p>
          )}
        </div>
        <div>
          <Label>Password Input</Label>
          <div className="relative">
            <Input
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="-translate-y-1/2 absolute top-1/2 right-4 z-30 cursor-pointer bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <DatePicker
            id="date-picker"
            label="Date Picker Input"
            onChange={(_dates, currentDateString) => {
              setSelectedDate(currentDateString || '');
            }}
            placeholder="Select a date"
          />
          {selectedDate && (
            <p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
              Selected date: {selectedDate}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="tm">Time Picker Input</Label>
          <div className="relative">
            <Input
              id="tm"
              name="tm"
              onChange={(e) => setSelectedTime(e.target.value)}
              type="time"
              value={selectedTime}
            />
            <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-gray-500 dark:text-gray-400">
              <TimeIcon />
            </span>
          </div>
          {selectedTime && (
            <p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
              Selected time: {selectedTime}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="tm">Input with Payment</Label>
          <div className="relative">
            <Input
              className="pl-[62px]"
              placeholder="Card number"
              type="text"
            />
            <span className="-translate-y-1/2 absolute top-1/2 left-0 flex h-11 w-[46px] items-center justify-center border-gray-200 border-r dark:border-gray-800">
              <svg
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="6.25" cy="10" fill="#E80B26" r="5.625" />
                <circle cx="13.75" cy="10" fill="#F59D31" r="5.625" />
                <path
                  d="M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z"
                  fill="#FC6020"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
