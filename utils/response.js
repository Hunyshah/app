export const formatResponse = (success, message, data = {}, count = { totalPage: 0, currentPageSize: 0 }) => ({
  success,
  message,
  data,
  count,
});

export const buildCount = (totalCount, pageSize) => ({
  totalPage: Math.ceil((totalCount || 0) / (pageSize || 10)),
  currentPageSize: pageSize || 10,
});