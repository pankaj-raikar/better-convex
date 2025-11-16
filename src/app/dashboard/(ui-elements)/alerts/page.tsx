import type { Metadata } from 'next';
import ComponentCard from '@/components/admin-ui-ref/common/ComponentCard';
import PageBreadcrumb from '@/components/admin-ui-ref/common/PageBreadCrumb';
import Alert from '@/components/admin-ui-ref/ui/alert/Alert';

export const metadata: Metadata = {
  title: 'Next.js Alerts | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Alerts page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
  // other metadata
};

export default function Alerts() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Alerts" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Success Alert">
          <Alert
            linkHref="/"
            linkText="Learn more"
            message="Be cautious when performing this action."
            showLink={true}
            title="Success Message"
            variant="success"
          />
          <Alert
            message="Be cautious when performing this action."
            showLink={false}
            title="Success Message"
            variant="success"
          />
        </ComponentCard>
        <ComponentCard title="Warning Alert">
          <Alert
            linkHref="/"
            linkText="Learn more"
            message="Be cautious when performing this action."
            showLink={true}
            title="Warning Message"
            variant="warning"
          />
          <Alert
            message="Be cautious when performing this action."
            showLink={false}
            title="Warning Message"
            variant="warning"
          />
        </ComponentCard>{' '}
        <ComponentCard title="Error Alert">
          <Alert
            linkHref="/"
            linkText="Learn more"
            message="Be cautious when performing this action."
            showLink={true}
            title="Error Message"
            variant="error"
          />
          <Alert
            message="Be cautious when performing this action."
            showLink={false}
            title="Error Message"
            variant="error"
          />
        </ComponentCard>{' '}
        <ComponentCard title="Info Alert">
          <Alert
            linkHref="/"
            linkText="Learn more"
            message="Be cautious when performing this action."
            showLink={true}
            title="Info Message"
            variant="info"
          />
          <Alert
            message="Be cautious when performing this action."
            showLink={false}
            title="Info Message"
            variant="info"
          />
        </ComponentCard>
      </div>
    </div>
  );
}
