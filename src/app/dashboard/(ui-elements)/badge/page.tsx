import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/admin-ui-ref/common/PageBreadCrumb';
import Badge from '@/components/admin-ui-ref/ui/badge/Badge';
import { PlusIcon } from '@/icons';

export const metadata: Metadata = {
  title: 'Next.js Badge | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Badge page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
  // other metadata
};

export default function BadgePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Badges" />
      <div className="space-y-5 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="px-6 py-5">
            <h3 className="font-medium text-base text-gray-800 dark:text-white/90">
              With Light Background
            </h3>
          </div>
          <div className="border-gray-100 border-t p-6 xl:p-10 dark:border-gray-800">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {/* Light Variant */}
              <Badge color="primary" variant="light">
                Primary
              </Badge>
              <Badge color="success" variant="light">
                Success
              </Badge>{' '}
              <Badge color="error" variant="light">
                Error
              </Badge>{' '}
              <Badge color="warning" variant="light">
                Warning
              </Badge>{' '}
              <Badge color="info" variant="light">
                Info
              </Badge>
              <Badge color="light" variant="light">
                Light
              </Badge>
              <Badge color="dark" variant="light">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="px-6 py-5">
            <h3 className="font-medium text-base text-gray-800 dark:text-white/90">
              With Solid Background
            </h3>
          </div>
          <div className="border-gray-100 border-t p-6 xl:p-10 dark:border-gray-800">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {/* Light Variant */}
              <Badge color="primary" variant="solid">
                Primary
              </Badge>
              <Badge color="success" variant="solid">
                Success
              </Badge>{' '}
              <Badge color="error" variant="solid">
                Error
              </Badge>{' '}
              <Badge color="warning" variant="solid">
                Warning
              </Badge>{' '}
              <Badge color="info" variant="solid">
                Info
              </Badge>
              <Badge color="light" variant="solid">
                Light
              </Badge>
              <Badge color="dark" variant="solid">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="px-6 py-5">
            <h3 className="font-medium text-base text-gray-800 dark:text-white/90">
              Light Background with Left Icon
            </h3>
          </div>
          <div className="border-gray-100 border-t p-6 xl:p-10 dark:border-gray-800">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge color="primary" startIcon={<PlusIcon />} variant="light">
                Primary
              </Badge>
              <Badge color="success" startIcon={<PlusIcon />} variant="light">
                Success
              </Badge>{' '}
              <Badge color="error" startIcon={<PlusIcon />} variant="light">
                Error
              </Badge>{' '}
              <Badge color="warning" startIcon={<PlusIcon />} variant="light">
                Warning
              </Badge>{' '}
              <Badge color="info" startIcon={<PlusIcon />} variant="light">
                Info
              </Badge>
              <Badge color="light" startIcon={<PlusIcon />} variant="light">
                Light
              </Badge>
              <Badge color="dark" startIcon={<PlusIcon />} variant="light">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="px-6 py-5">
            <h3 className="font-medium text-base text-gray-800 dark:text-white/90">
              Solid Background with Left Icon
            </h3>
          </div>
          <div className="border-gray-100 border-t p-6 xl:p-10 dark:border-gray-800">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge color="primary" startIcon={<PlusIcon />} variant="solid">
                Primary
              </Badge>
              <Badge color="success" startIcon={<PlusIcon />} variant="solid">
                Success
              </Badge>{' '}
              <Badge color="error" startIcon={<PlusIcon />} variant="solid">
                Error
              </Badge>{' '}
              <Badge color="warning" startIcon={<PlusIcon />} variant="solid">
                Warning
              </Badge>{' '}
              <Badge color="info" startIcon={<PlusIcon />} variant="solid">
                Info
              </Badge>
              <Badge color="light" startIcon={<PlusIcon />} variant="solid">
                Light
              </Badge>
              <Badge color="dark" startIcon={<PlusIcon />} variant="solid">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="px-6 py-5">
            <h3 className="font-medium text-base text-gray-800 dark:text-white/90">
              Light Background with Right Icon
            </h3>
          </div>
          <div className="border-gray-100 border-t p-6 xl:p-10 dark:border-gray-800">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge color="primary" endIcon={<PlusIcon />} variant="light">
                Primary
              </Badge>
              <Badge color="success" endIcon={<PlusIcon />} variant="light">
                Success
              </Badge>{' '}
              <Badge color="error" endIcon={<PlusIcon />} variant="light">
                Error
              </Badge>{' '}
              <Badge color="warning" endIcon={<PlusIcon />} variant="light">
                Warning
              </Badge>{' '}
              <Badge color="info" endIcon={<PlusIcon />} variant="light">
                Info
              </Badge>
              <Badge color="light" endIcon={<PlusIcon />} variant="light">
                Light
              </Badge>
              <Badge color="dark" endIcon={<PlusIcon />} variant="light">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="px-6 py-5">
            <h3 className="font-medium text-base text-gray-800 dark:text-white/90">
              Solid Background with Right Icon
            </h3>
          </div>
          <div className="border-gray-100 border-t p-6 xl:p-10 dark:border-gray-800">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge color="primary" endIcon={<PlusIcon />} variant="solid">
                Primary
              </Badge>
              <Badge color="success" endIcon={<PlusIcon />} variant="solid">
                Success
              </Badge>{' '}
              <Badge color="error" endIcon={<PlusIcon />} variant="solid">
                Error
              </Badge>{' '}
              <Badge color="warning" endIcon={<PlusIcon />} variant="solid">
                Warning
              </Badge>{' '}
              <Badge color="info" endIcon={<PlusIcon />} variant="solid">
                Info
              </Badge>
              <Badge color="light" endIcon={<PlusIcon />} variant="solid">
                Light
              </Badge>
              <Badge color="dark" endIcon={<PlusIcon />} variant="solid">
                Dark
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
