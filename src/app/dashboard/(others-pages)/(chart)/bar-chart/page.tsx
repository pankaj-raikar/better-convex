import type { Metadata } from 'next';
import BarChartOne from '@/components/admin-ui-ref/charts/bar/BarChartOne';
import ComponentCard from '@/components/admin-ui-ref/common/ComponentCard';
import PageBreadcrumb from '@/components/admin-ui-ref/common/PageBreadCrumb';

export const metadata: Metadata = {
  title: 'Next.js Bar Chart | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
