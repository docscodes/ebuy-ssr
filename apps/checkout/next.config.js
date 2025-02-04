const NextFederationPlugin = require("@module-federation/nextjs-mf");
const path = require("path");

// this enables you to use import() and the webpack parser
// loading remotes on demand, not ideal for SSR
const remotes = (isServer) => {
  const location = isServer ? "ssr" : "chunks";
  return {
    checkout: `checkout@http://localhost:3002/_next/static/${location}/remoteEntry.js`,  
  };
};

module.exports = {
  output: "standalone",
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: "checkout",
        filename: "static/chunks/remoteEntry.js",
        exposes: {
          "./Module": "./pages/index.tsx",
        },
        remotes: remotes(options.isServer),
        shared: {},
        extraOptions: {
          automaticAsyncBoundary: true,
        },
      })
    );

    return config;
  },
};