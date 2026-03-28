import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Product updates, ecommerce guides, case studies, and industry insights from the YouSell team.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
