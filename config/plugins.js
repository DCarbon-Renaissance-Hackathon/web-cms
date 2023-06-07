module.exports = ({}) => {
  return {
    upload: {
      config: {
        provider: "strapi-provider-custom-upload", // For community providers pass the full package name (e.g. provider: 'strapi-provider-upload-google-cloud-storage')
      },
    },
  };
};
