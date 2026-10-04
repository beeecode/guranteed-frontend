import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    // Preserves the old React Router `<Navigate to="/admin/dashboard" replace />`.
    return [{ source: '/admin', destination: '/admin/dashboard', permanent: false }];
  },
};

export default nextConfig;
