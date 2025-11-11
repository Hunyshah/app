/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable multiline-ternary */
/* eslint-disable comma-dangle */
/* eslint-disable prefer-template */
import axios from "axios";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";

import { isValidFileType } from "./isValidType";
import { baseURL } from "./apiFunction";
import { fileUpload, imageUpload } from "./ApiFile";

const header2 = {
  "Content-Type": "multipart/form-data",
};

// export const UploadFile = async (file, general = false, isFile = false) => {
//   try {
//     const check = isValidFileType(file);

//     if (!check && !general) {
//       toast.error(
//         "!Invalid file type. Please upload a valid image file. you can only select the jpg, jpeg, png, svg, webp"
//       );
//       return;
//     }
//     const options = {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     const compressedFile = general
//       ? file
//       : await imageCompression(file, options);
//     const formData = new FormData();
//     formData.append(isFile ? "file" : "image", compressedFile);
//     const response = await axios.post(
//       `${baseURL}${isFile ? fileUpload : imageUpload}`,
//       formData,
//       header2
//     );
//     return response?.data;
//   } catch (error) {
//     console.error("Error uploading file:", error?.response);
//     throw error;
//   }
// };
// // export const uploadDocFile = async (file) => {
// //   try {
// //     const formData = new FormData();
// //     formData.append("file", file);
// //     const response = await axiosFileInstance.post("/doc/upload", formData, {
// //       headers: {
// //         "Content-Type": "multipart/form-data",
// //       },
// //     });
// //     return response.data;
// //   } catch (error) {
// //     console.error("Error uploading file:", error.response.data);
// //     throw error;
// //   }
// // };
// export const uploadVideo = async (file) => {
//   const { postData, header2 } = apiFunction();
//   const { videoUpload } = ApiFile;
//   try {
//     const check = isValidFileType(file, ["mpeg", "avi", "mov", "mp4"]);
//     if (!check) {
//       toast.error(
//         "!Invalid file type. Please upload a valid image file. you can only select the mpeg, avi, mov, mp4"
//       );
//       return;
//     }
//     const formData = new FormData();
//     formData.append("video", file);
//     const response = await postData(videoUpload, formData, header2);
//     return response;
//   } catch (error) {
//     console.error("Error uploading file:", error.response.data);
//     throw error;
//   }
// };
// export const uploadCertificate = async (file, token) => {
//   try {
//     const check = isValidFileType(file);
//     if (!check) {
//       toast.error(
//         "!Invalid file type. Please upload a valid image file. you can only select the jpg, jpeg, png, svg"
//       );
//       return;
//     }
//     const options = {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };
//     const compressedFile = await imageCompression(file, options);
//     const formData = new FormData();
//     formData.append("image", compressedFile);
//     const response = await axios.post(
//       global.BASEURL + "/image/upload",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           "x-auth-token": token,
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Error uploading file:", error.response.data);
//     throw error;
//   }
// };

// new code for file upload & image upload & both file & image upload
export const UploadFile = async (
  file,
  general = false,
  isFile = false,
  allowAll = false
) => {
  try {
    const check = isValidFileType(file);

    if (!check && !general) {
      toast.error(
        "!Invalid file type. Please upload a valid file. Allowed: jpg, jpeg, png, svg, webp, pdf, doc, docx, xls, xlsx, txt"
      );

      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    // ✅ only compress image types — not documents or mixed files
    const shouldCompress =
      !general && !isFile && !allowAll && file.type.startsWith("image/");

    const compressedFile = shouldCompress
      ? await imageCompression(file, options)
      : file;

    const formData = new FormData();

    if (isFile || (allowAll && !file.type.startsWith("image/"))) {
      formData.append("file", compressedFile);
    } else {
      formData.append("image", compressedFile);
    }

    const endpoint = allowAll
      ? file.type.startsWith("image/")
        ? imageUpload
        : fileUpload
      : isFile
      ? fileUpload
      : imageUpload;

    const response = await axios.post(
      `${baseURL}${endpoint}`,
      formData,
      header2
    );

    return response?.data;
  } catch (error) {
    console.error("Error uploading file:", error?.response);
    throw error;
  }
};
