export default {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
