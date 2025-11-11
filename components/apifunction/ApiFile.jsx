// Auth endpoints (match Next.js app/api/auth/* routes)
const loginApi = "auth/login";
const registerApi = "auth/register";
const verifyOtpApi = "auth/verify_otp";
const sendOtpApi = "auth/forget"; // send OTP for password reset
const resetPasswordApi = "auth/password";
const verifyResetOtpApi = "auth/verify_reset_otp"; // verify OTP for password reset

// Conversation endpoints
const conversationMessageApi = "conversation/message"; // POST
// For lists, build paths like `conversation/${page}` and `conversation/${conversationId}/${page}`

// Upload endpoints
const imageUpload = "image/upload";
const fileUpload = "file/upload";
const videoUpload = "video/upload";
const uploadFileApi = "uploadFile"; // Vercel Blob upload

// Category endpoints
const categoryApi = "category"; // GET, POST
const categoryAllApi = "category/all"; // GET all without pagination
const categoryByIdApi = "category"; // PUT, DELETE with ID

// Business Data endpoints
const businessDataApi = "businessData"; // GET, POST
const businessDataAllApi = "businessData/all"; // GET all without pagination
const businessDataByIdApi = "businessData"; // PUT, DELETE with ID

export {
  // auth
  loginApi,
  registerApi,
  verifyOtpApi,
  sendOtpApi,
  resetPasswordApi,
  verifyResetOtpApi,
  // conversation
  conversationMessageApi,
  // uploads
  imageUpload,
  fileUpload,
  videoUpload,
  uploadFileApi,
  // category
  categoryApi,
  categoryAllApi,
  categoryByIdApi,
  // business data
  businessDataApi,
  businessDataAllApi,
  businessDataByIdApi,
};
