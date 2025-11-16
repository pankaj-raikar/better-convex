import type { Metadata } from 'next';
import ComponentCard from '@/components/admin-ui-ref/common/ComponentCard';
import PageBreadcrumb from '@/components/admin-ui-ref/common/PageBreadCrumb';
import BasicTableOne from '@/components/admin-ui-ref/tables/BasicTableOne';

export const metadata: Metadata = {
  title: 'Next.js Basic Table | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template',
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
