const { pipeline } = require("stream");
const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

const UPLOADS_FOLDER_NAME = "cms/uploads";

module.exports = {
  init(providerOptions) {
    // init your provider if necessary

    const uploadPath = path.resolve(
      strapi.dirs.static.public,
      UPLOADS_FOLDER_NAME
    );
    if (!fse.pathExistsSync(uploadPath)) {
      throw new Error(
        `The upload folder (${uploadPath}) doesn't exist or is not accessible. Please make sure it exists.`
      );
    }
    function getPathByDate(createdAt) {
      const currentDate = createdAt ? new Date(createdAt) : new Date();
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth() + 1;
      const targetDir = `${year}/${month}`;
      return targetDir;
    }
    function mkDirByDate() {
      const targetDir = getPathByDate();
      if (!fs.existsSync(uploadPath + "/" + targetDir)) {
        fs.mkdirSync(uploadPath + "/" + targetDir, { recursive: true });
      }
      return targetDir;
    }
    return {
      upload(file) {
        // upload the file in the provider
        // file content is accessible by `file.buffer`

        console.log("Custom provider upload: ", file);

        var prom;
        const afterMkDir = mkDirByDate();
        if (afterMkDir) {
          if (!file.buffer) {
            return Promise.reject(new Error("Missing file buffer"));
          }

          const { buffer } = file;
          console.log("buffer", buffer);
          try {
            prom = new Promise((resolve, reject) => {
              // write file in public/assets folder
              fs.writeFile(
                path.join(uploadPath, `${afterMkDir}/${file.hash}${file.ext}`),
                buffer,
                (err) => {
                  if (err) {
                    return reject(err);
                  }
                  file.url = `/${UPLOADS_FOLDER_NAME}/${afterMkDir}/${file.hash}${file.ext}`;
                  resolve();
                }
              );
            });
          } catch (error) {
            console.log("ERROR upload:", error);
          }
        }
        return prom;
      },
      uploadStream(file) {
        // upload the file in the provider
        // file content is accessible by `file.stream`
        const afterMkDir = mkDirByDate();
        var prom;
        if (afterMkDir) {
          if (!file.stream) {
            return Promise.reject(new Error("Missing file stream"));
          }
          const { stream } = file;
          console.log("stream", stream);
          try {
            prom = new Promise((resolve, reject) => {
              pipeline(
                stream,
                fs.createWriteStream(
                  path.join(uploadPath, `${afterMkDir}/${file.hash}${file.ext}`)
                ),
                (err) => {
                  if (err) {
                    return reject(err);
                  }

                  file.url = `/${UPLOADS_FOLDER_NAME}/${afterMkDir}/${file.hash}${file.ext}`;
                  resolve();
                }
              );
            });
          } catch (error) {
            console.log("ERROR uploadStream:", error);
          }
        }
        return prom;
      },
      delete(file) {
        // delete the file in the provider

        console.log("Custom provider delete: ", file);
        const createdAT = file.createdAT;
        const getPath = getPathByDate(createdAT);

        return new Promise((resolve, reject) => {
          let checkFilePath = file?.url.includes(
            UPLOADS_FOLDER_NAME + "/" + getPath
          );
          const filePathSlash = checkFilePath ? getPath + "/" : "";
          const filePath = path.join(
            uploadPath,
            `${filePathSlash}${file.hash}${file.ext}`
          );

          // remove file from   folder

          if (!fs.existsSync(filePath)) {
            resolve("File doesn't exist in path = " + getPath);
            return;
          }

          fs.unlink(filePath, (err) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      },
      getSignedUrl(file) {
        console.log("getSignedUrl", file);
        return;
      },
    };
  },
};
