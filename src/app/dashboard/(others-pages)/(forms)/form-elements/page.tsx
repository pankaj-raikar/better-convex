import type { Metadata } from 'next';

import PageBreadcrumb from '@/components/admin-ui-ref/common/PageBreadCrumb';
import CheckboxComponents from '@/components/admin-ui-ref/form/form-elements/CheckboxComponents';
import DefaultInputs from '@/components/admin-ui-ref/form/form-elements/DefaultInputs';
import DropzoneComponent from '@/components/admin-ui-ref/form/form-elements/DropZone';
import FileInputExample from '@/components/admin-ui-ref/form/form-elements/FileInputExample';
import InputGroup from '@/components/admin-ui-ref/form/form-elements/InputGroup';
import InputStates from '@/components/admin-ui-ref/form/form-elements/InputStates';
import RadioButtons from '@/components/admin-ui-ref/form/form-elements/RadioButtons';
import SelectInputs from '@/components/admin-ui-ref/form/form-elements/SelectInputs';
import TextAreaInput from '@/components/admin-ui-ref/form/form-elements/TextAreaInput';
import ToggleSwitch from '@/components/admin-ui-ref/form/form-elements/ToggleSwitch';

export const metadata: Metadata = {
  title: 'Next.js Form Elements | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Form Elements" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <DefaultInputs />
          <SelectInputs />
          <TextAreaInput />
          <InputStates />
        </div>
        <div className="space-y-6">
          <InputGroup />
          <FileInputExample />
          <CheckboxComponents />
          <RadioButtons />
          <ToggleSwitch />
          <DropzoneComponent />
        </div>
      </div>
    </div>
  );
}
