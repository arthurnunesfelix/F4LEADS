import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que os arquivos SQL das migrações (pasta /drizzle) sejam
  // incluídos no bundle das funções serverless na Vercel.
  outputFileTracingIncludes: {
    "/*": ["./drizzle/**/*"],
  },
};

export default nextConfig;
