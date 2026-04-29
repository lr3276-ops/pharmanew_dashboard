/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/symbol-logo.svg',
        permanent: false,
      },
    ]
  },
}
module.exports = nextConfig
