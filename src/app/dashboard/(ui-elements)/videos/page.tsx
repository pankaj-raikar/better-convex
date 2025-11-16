import type { Metadata } from 'next';
import PageBreadcrumb from '@/components/admin-ui-ref/common/PageBreadCrumb';
import VideosExample from '@/components/admin-ui-ref/ui/video/VideosExample';

export const metadata: Metadata = {
  title: 'Next.js Videos | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Videos page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

export default function VideoPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Videos" />

      <VideosExample />
    </div>
  );
}
