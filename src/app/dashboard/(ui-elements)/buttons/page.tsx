import type { Metadata } from 'next';
import ComponentCard from '@/components/admin-ui-ref/common/ComponentCard';
import PageBreadcrumb from '@/components/admin-ui-ref/common/PageBreadCrumb';
import Button from '@/components/admin-ui-ref/ui/button/Button';
import { BoxIcon } from '@/icons';

export const metadata: Metadata = {
  title: 'Next.js Buttons | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Buttons page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

export default function Buttons() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Buttons" />
      <div className="space-y-5 sm:space-y-6">
        {/* Primary Button */}
        <ComponentCard title="Primary Button">
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary">
              Button Text
            </Button>
            <Button size="md" variant="primary">
              Button Text
            </Button>
          </div>
        </ComponentCard>
        {/* Primary Button with Start Icon */}
        <ComponentCard title="Primary Button with Left Icon">
          <div className="flex items-center gap-5">
            <Button size="sm" startIcon={<BoxIcon />} variant="primary">
              Button Text
            </Button>
            <Button size="md" startIcon={<BoxIcon />} variant="primary">
              Button Text
            </Button>
          </div>
        </ComponentCard>{' '}
        {/* Primary Button with Start Icon */}
        <ComponentCard title="Primary Button with Right Icon">
          <div className="flex items-center gap-5">
            <Button endIcon={<BoxIcon />} size="sm" variant="primary">
              Button Text
            </Button>
            <Button endIcon={<BoxIcon />} size="md" variant="primary">
              Button Text
            </Button>
          </div>
        </ComponentCard>
        {/* Outline Button */}
        <ComponentCard title="Secondary Button">
          <div className="flex items-center gap-5">
            {/* Outline Button */}
            <Button size="sm" variant="outline">
              Button Text
            </Button>
            <Button size="md" variant="outline">
              Button Text
            </Button>
          </div>
        </ComponentCard>
        {/* Outline Button with Start Icon */}
        <ComponentCard title="Outline Button with Left Icon">
          <div className="flex items-center gap-5">
            <Button size="sm" startIcon={<BoxIcon />} variant="outline">
              Button Text
            </Button>
            <Button size="md" startIcon={<BoxIcon />} variant="outline">
              Button Text
            </Button>
          </div>
        </ComponentCard>{' '}
        {/* Outline Button with Start Icon */}
        <ComponentCard title="Outline Button with Right Icon">
          <div className="flex items-center gap-5">
            <Button endIcon={<BoxIcon />} size="sm" variant="outline">
              Button Text
            </Button>
            <Button endIcon={<BoxIcon />} size="md" variant="outline">
              Button Text
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
