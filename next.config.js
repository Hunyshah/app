/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ESLint Configuration (from your original file)
  eslint: {
    // Allow production builds to succeed even if there are ESLint warnings
    ignoreDuringBuilds: true,
  },
  
  // 2. Images Configuration (from your original file)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
    ],
  },

  // 3. CORE FIX: The 'experimental' key is necessary for file tracing
  experimental: {
    // This is the key that forces the inclusion of worker files
    outputFileTracingIncludes: {
      '**/*': [
        // Include all necessary files for pdf-parse and its underlying pdfjs-dist
        './node_modules/pdf-parse/**/*',
        './node_modules/pdfjs-dist/build/**/*',
      ],
    },
    
    // 4. CORE FIX: Use the 'serverExternalPackages' under 'experimental' or as a standalone
    // It's cleaner to keep the externalization of the dependency here, and ensure 'pdfjs-dist' is included.
    serverExternalPackages: [
      'pdf-parse',
      'pdfjs-dist', // <--- IMPORTANT: Include pdfjs-dist as well
    ],
  },
  
  // 5. REMOVE or REPLACE the standalone serverExternalPackages line from your original config, 
  // as it is now inside 'experimental' for completeness. 
  // If you must keep it standalone, ensure it includes both packages:
  // serverExternalPackages: ['pdf-parse', 'pdfjs-dist'], // Use this ONLY if 'experimental.serverExternalPackages' doesn't work.
};

module.exports = nextConfig;