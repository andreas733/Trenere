/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kun for Docker-build; Vercel bruker eget deployment-format
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),
};

module.exports = nextConfig;
