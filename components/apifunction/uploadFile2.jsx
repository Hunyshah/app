/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
import axios from "axios";

import apiFunction from "./apiFunction";

export const uploadFile2 = async (data) => {
  const { postData, header2 } = apiFunction();

  try {
    const res = await axios.post(
      "https://api.vitalitymedico.eu/api/image/upload",
      data,
      header2
    );

    if (res?.data?.image) {
      return res;
    } else {
      throw new Error("Invalid response format. Image not found in response.");
    }
  } catch (error) {
    console.error("Image upload API error:", error.message || error);
    throw error;
  }
};
