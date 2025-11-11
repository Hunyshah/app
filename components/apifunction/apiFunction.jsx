/* eslint-disable no-console */
/* eslint-disable padding-line-between-statements */
/* eslint-disable import/order */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */

import axios from "axios";
import { decryptData } from "@/utils/encrypt";
import { selectUser } from "../Redux/Slices/AuthSlice";
import { useSelector } from "react-redux";

// Use Next.js internal API routes only; no external base URL needed
export const baseURL = "/api/";

const apiFunction = () => {
  const encryptedUser = useSelector(selectUser);
  const userData = encryptedUser ? decryptData(encryptedUser) : null;
  const token = userData?.token;
  const header1 = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const header2 = {
    "Content-Type": "multipart/form-data",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const header3 = {};

  const axiosInstance = axios.create({
    baseURL,
  });

  const getData = async (endpoint, headers = header1) => {
    try {
      const response = await axiosInstance.get(endpoint, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in GET request:", error);
      throw error;
    }
  };

  const postData = async (endpoint, apiData, headers = header1) => {
    try {
      const response = await axiosInstance.post(endpoint, apiData, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in POST request:", error);
      throw error;
    }
  };

  const deleteData = async (endpoint, headers = header1) => {
    try {
      const response = await axiosInstance.delete(endpoint, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in DELETE request:", error);
      throw error;
    }
  };

  const putData = async (endpoint, apiData, headers = header1) => {
    try {
      const response = await axiosInstance.put(endpoint, apiData, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in PUT request:", error);
      throw error;
    }
  };

  const patchData = async (endpoint, apiData, headers = {}) => {
    try {
      const response = await axiosInstance.patch(endpoint, apiData, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in PUT request:", error);
      throw error;
    }
  };

  return {
    getData,
    postData,
    deleteData,
    putData,
    patchData,
    header1,
    header2,
    header3,
    userData,
  };
};

export default apiFunction;
