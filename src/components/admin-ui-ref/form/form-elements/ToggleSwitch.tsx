'use client';
import { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Switch from '../switch/Switch';

export default function ToggleSwitch() {
  const [switchStates, setSwitchStates] = useState({
    defaultBlue: true,
    checkedBlue: true,
    defaultGray: true,
    checkedGray: true,
  });

  const handleSwitchChange =
    (key: keyof typeof switchStates) => (checked: boolean) => {
      setSwitchStates((prev) => ({
        ...prev,
        [key]: checked,
      }));
    };

  return (
    <ComponentCard title="Toggle switch input">
      <div className="flex gap-4">
        <Switch
          defaultChecked={true}
          label="Default"
          onChange={handleSwitchChange('defaultBlue')}
        />
        <Switch
          defaultChecked={true}
          label="Checked"
          onChange={handleSwitchChange('checkedBlue')}
        />
        <Switch disabled={true} label="Disabled" />
      </div>{' '}
      <div className="flex gap-4">
        <Switch
          color="gray"
          defaultChecked={true}
          label="Default"
          onChange={handleSwitchChange('defaultGray')}
        />
        <Switch
          color="gray"
          defaultChecked={true}
          label="Checked"
          onChange={handleSwitchChange('checkedGray')}
        />
        <Switch color="gray" disabled={true} label="Disabled" />
      </div>
      <div className="mt-4 space-y-1 text-gray-500 text-sm dark:text-gray-400">
        <p>Default (blue): {switchStates.defaultBlue ? 'On' : 'Off'}</p>
        <p>Checked (blue): {switchStates.checkedBlue ? 'On' : 'Off'}</p>
        <p>Default (gray): {switchStates.defaultGray ? 'On' : 'Off'}</p>
        <p>Checked (gray): {switchStates.checkedGray ? 'On' : 'Off'}</p>
      </div>
    </ComponentCard>
  );
}
