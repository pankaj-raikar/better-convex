import type { Metadata } from 'next';
import ComponentCard from '@/components/admin-ui-ref/common/ComponentCard';
import PageBreadcrumb from '@/components/admin-ui-ref/common/PageBreadCrumb';
import Avatar from '@/components/admin-ui-ref/ui/avatar/Avatar';

export const metadata: Metadata = {
  title: 'Next.js Avatars | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Avatars page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

export default function AvatarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Avatar" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Default Avatar">
          {/* Default Avatar (No Status) */}
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar size="xsmall" src="/images/user/user-01.jpg" />
            <Avatar size="small" src="/images/user/user-01.jpg" />
            <Avatar size="medium" src="/images/user/user-01.jpg" />
            <Avatar size="large" src="/images/user/user-01.jpg" />
            <Avatar size="xlarge" src="/images/user/user-01.jpg" />
            <Avatar size="xxlarge" src="/images/user/user-01.jpg" />
          </div>
        </ComponentCard>
        <ComponentCard title="Avatar with online indicator">
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              size="xsmall"
              src="/images/user/user-01.jpg"
              status="online"
            />
            <Avatar
              size="small"
              src="/images/user/user-01.jpg"
              status="online"
            />
            <Avatar
              size="medium"
              src="/images/user/user-01.jpg"
              status="online"
            />
            <Avatar
              size="large"
              src="/images/user/user-01.jpg"
              status="online"
            />
            <Avatar
              size="xlarge"
              src="/images/user/user-01.jpg"
              status="online"
            />
            <Avatar
              size="xxlarge"
              src="/images/user/user-01.jpg"
              status="online"
            />
          </div>
        </ComponentCard>
        <ComponentCard title="Avatar with Offline indicator">
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              size="xsmall"
              src="/images/user/user-01.jpg"
              status="offline"
            />
            <Avatar
              size="small"
              src="/images/user/user-01.jpg"
              status="offline"
            />
            <Avatar
              size="medium"
              src="/images/user/user-01.jpg"
              status="offline"
            />
            <Avatar
              size="large"
              src="/images/user/user-01.jpg"
              status="offline"
            />
            <Avatar
              size="xlarge"
              src="/images/user/user-01.jpg"
              status="offline"
            />
            <Avatar
              size="xxlarge"
              src="/images/user/user-01.jpg"
              status="offline"
            />
          </div>
        </ComponentCard>{' '}
        <ComponentCard title="Avatar with busy indicator">
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              size="xsmall"
              src="/images/user/user-01.jpg"
              status="busy"
            />
            <Avatar size="small" src="/images/user/user-01.jpg" status="busy" />
            <Avatar
              size="medium"
              src="/images/user/user-01.jpg"
              status="busy"
            />
            <Avatar size="large" src="/images/user/user-01.jpg" status="busy" />
            <Avatar
              size="xlarge"
              src="/images/user/user-01.jpg"
              status="busy"
            />
            <Avatar
              size="xxlarge"
              src="/images/user/user-01.jpg"
              status="busy"
            />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
