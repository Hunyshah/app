/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
import { useMemo, useState, useEffect } from "react";
import { Edit2, Trash2, MessageCircle } from "react-feather";
import { Modal, Form, Input, Select, InputNumber, Upload, Button } from "antd";
import { UploadOutlined, FileTextOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import ProductTable from "@/components/dataTables/productTable";
import apiFunction from "@/components/apifunction/apiFunction";
import { businessDataApi, businessDataByIdApi, categoryAllApi } from "@/components/apifunction/ApiFile";
import { uploadFileToVercel, uploadMultipleFilesToVercel } from "@/components/apifunction/uploadFileVercel";
import { InlineSpinner } from "@/components/common/Spinner";

const { Option } = Select;
const { TextArea } = Input;

const BusinessDataTable = () => {
  const [businessData, setBusinessData] = useState([]);
  const [categories, setCategories] = useState([]);
  const { userData, getData, postData, putData, deleteData } = apiFunction();
  const router = useRouter();

  // ProductTable state management
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [addFiles, setAddFiles] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [editFiles, setEditFiles] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [uploadingEditFiles, setUploadingEditFiles] = useState(false);

  // Delete confirmation modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    if (userData?.token) {
      fetchBusinessData();
      fetchCategories();
    }
  }, [userData?.token]);

  // Fetch business data from API
  const fetchBusinessData = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const validPage = Math.max(parseInt(page) || 1, 1);
      const params = new URLSearchParams({
        page: validPage.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      
      const res = await getData(`${businessDataApi}?${params.toString()}`);
      if (res?.success) {
        setBusinessData(res.data || []);
        setTotalPages(res.count?.totalPage || 0);
        setCurrentPage(validPage - 1);
      }
    } catch {
      toast.error("Failed to load business data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await getData(categoryAllApi);
      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch {
      toast.error("Failed to load categories");
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
    fetchBusinessData(1, value);
  };

  // Handle pagination
  const handlePageChange = (selectedPage) => {
    const pageIndex = typeof selectedPage === 'number' ? selectedPage : selectedPage.selected;
    const pageNumber = Math.max(parseInt(pageIndex) + 1, 1);
    fetchBusinessData(pageNumber, searchValue);
  };

  // Handle file upload for add modal
  const handleAddFileUpload = async (fileList) => {
    if (fileList.length === 0) {
      setAddFiles([]);
      return;
    }

    setUploadingFiles(true);
    try {
      // Get only new files (not already uploaded)
      const newFiles = fileList.filter(file => !file.url);
      const existingFiles = fileList.filter(file => file.url);

      if (newFiles.length > 0) {
        // Debug: Log the file objects
        // eslint-disable-next-line no-console
        console.log("New files to upload:", newFiles);
        
        // Upload new files to Vercel Blob
        const uploadResults = await uploadMultipleFilesToVercel(newFiles, userData?.token);
        
        // Combine existing files with newly uploaded files
        const allFiles = [
          ...existingFiles,
          ...uploadResults.map(result => ({
            uid: `uploaded-${Date.now()}-${Math.random()}`,
            name: result.fileName,
            status: 'done',
            url: result.fileUrl,
            fileType: result.fileType,
            fileSize: result.fileSize,
          }))
        ];
        
        setAddFiles(allFiles);
      } else {
        setAddFiles(fileList);
      }
    } catch (error) {
      toast.error("Failed to upload files");
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleAdd = async () => {
    try {
      setAddLoading(true);
      const values = await addForm.validateFields();
      
      const res = await postData(businessDataApi, {
        businessName: values.businessName.trim(),
        category: values.category,
        ownerName: values.ownerName.trim(),
        stockQuantity: parseInt(values.stockQuantity),
        totalCost: parseFloat(values.totalCost),
        monthlyRevenue: parseFloat(values.monthlyRevenue),
        profitMargin: parseFloat(values.profitMargin),
        location: values.location.trim(),
        contactNumber: values.contactNumber.trim(),
        email: values.email?.trim() || "",
        description: values.description?.trim() || "",
        uploadDocuments: addFiles,
      });
      
      if (res?.success) {
        toast.success("Business data created successfully");
        setAddOpen(false);
        addForm.resetFields();
        setAddFiles([]);
        fetchBusinessData(1, searchValue);
      } else {
        toast.error(res?.message || "Failed to create business data");
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      toast.error("Failed to create business data");
    } finally {
      setAddLoading(false);
    }
  };

  // Handle file upload for edit modal
  const handleEditFileUpload = async (fileList) => {
    if (fileList.length === 0) {
      setEditFiles([]);
      return;
    }

    setUploadingEditFiles(true);
    try {
      // Get only new files (not already uploaded)
      const newFiles = fileList.filter(file => !file.url);
      const existingFiles = fileList.filter(file => file.url);

      if (newFiles.length > 0) {
        // Debug: Log the file objects
        // eslint-disable-next-line no-console
        console.log("New files to upload:", newFiles);
        
        // Upload new files to Vercel Blob
        const uploadResults = await uploadMultipleFilesToVercel(newFiles, userData?.token);
        
        // Combine existing files with newly uploaded files
        const allFiles = [
          ...existingFiles,
          ...uploadResults.map(result => ({
            uid: `uploaded-${Date.now()}-${Math.random()}`,
            name: result.fileName,
            status: 'done',
            url: result.fileUrl,
            fileType: result.fileType,
            fileSize: result.fileSize,
          }))
        ];
        
        setEditFiles(allFiles);
      } else {
        setEditFiles(fileList);
      }
    } catch (error) {
      toast.error("Failed to upload files");
    } finally {
      setUploadingEditFiles(false);
    }
  };

  const handleEditOpen = (row) => {
    setEditing(row);
    editForm.setFieldsValue({
      businessName: row.businessName,
      category: row.category?._id || row.category,
      ownerName: row.ownerName,
      stockQuantity: row.stockQuantity,
      totalCost: row.totalCost,
      monthlyRevenue: row.monthlyRevenue,
      profitMargin: row.profitMargin,
      location: row.location,
      contactNumber: row.contactNumber,
      email: row.email,
      description: row.description,
    });
    
    // Convert existing uploadDocuments to fileList format
    const existingFiles = (row.uploadDocuments || []).map((doc, index) => ({
      uid: `existing-${index}`,
      name: doc.name || doc.fileName,
      status: 'done',
      url: doc.url || doc.fileUrl,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
    }));
    setEditFiles(existingFiles);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    try {
      setEditLoading(true);
      const values = await editForm.validateFields();
      
      const res = await putData(`${businessDataByIdApi}/${editing._id}`, {
        businessName: values.businessName.trim(),
        category: values.category,
        ownerName: values.ownerName.trim(),
        stockQuantity: parseInt(values.stockQuantity),
        totalCost: parseFloat(values.totalCost),
        monthlyRevenue: parseFloat(values.monthlyRevenue),
        profitMargin: parseFloat(values.profitMargin),
        location: values.location.trim(),
        contactNumber: values.contactNumber.trim(),
        email: values.email?.trim() || "",
        description: values.description?.trim() || "",
        uploadDocuments: editFiles,
      });
      
      if (res?.success) {
        toast.success("Business data updated successfully");
        setEditOpen(false);
        setEditing(null);
        fetchBusinessData(currentPage + 1, searchValue);
      } else {
        toast.error(res?.message || "Failed to update business data");
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      toast.error("Failed to update business data");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleting(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleting) {
      try {
        setDeleteLoading(true);
        const res = await deleteData(`${businessDataByIdApi}/${deleting._id}`);
        if (res?.success) {
          toast.success("Business data deleted successfully");
          setDeleteOpen(false);
          setDeleting(null);
          fetchBusinessData(currentPage + 1, searchValue);
        } else {
          toast.error(res?.message || "Failed to delete business data");
        }
      } catch {
        toast.error("Failed to delete business data");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setDeleting(null);
  };

  const handleChatClick = (row) => {
    // Build URL with business data ID
    const urlParams = new URLSearchParams();
    urlParams.set('id', row._id);
    
    // Include conversationId if it exists
    if (row.conversationId) {
      urlParams.set('cid', row.conversationId);
    }
    
    router.push(`/?${urlParams.toString()}`);
  };

  const columns = useMemo(
    () => [
      {
        name: "Business Name",
        selector: (row) => row.businessName,
        sortable: true,
        grow: 2,
      },
      {
        name: "Category",
        selector: (row) => row.category?.name || row.category,
        sortable: true,
      },
      {
        name: "Owner Name",
        selector: (row) => row.ownerName,
        sortable: true,
      },
      {
        name: "Location",
        selector: (row) => row.location,
        sortable: true,
      },
      {
        name: "Stock",
        selector: (row) => row.stockQuantity,
        sortable: true,
      },
      {
        name: "Revenue",
        selector: (row) => row.monthlyRevenue,
        sortable: true,
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-1 rounded hover:bg-brand-input text-blue-400"
              onClick={() => handleChatClick(row)}
              aria-label="Chat"
            >
              <MessageCircle size={16} />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-brand-input text-brand-text"
              onClick={() => handleEditOpen(row)}
              aria-label="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-brand-input text-red-400"
              onClick={() => handleDeleteClick(row)}
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <ProductTable
        rowHeading="Business Data List"
        data={businessData}
        columns={columns}
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        totalPages={totalPages}
        showSearch={true}
        showFilter={false}
        searchValue={searchValue}
        setSearchValue={handleSearch}
        loading={loading}
        isPagination={true}
        showButton={true}
        buttonText="Add Business"
        buttonClick={() => setAddOpen(true)}
      />

      {/* Add Business Modal */}
      <Modal
        centered
        title="Add Business Data"
        open={addOpen}
        onOk={handleAdd}
        onCancel={() => {
          setAddOpen(false);
          addForm.resetFields();
          setAddFiles([]);
        }}
        okText="Add"
        okButtonProps={{
          disabled: addLoading,
          className: "custom_button",
        }}
        cancelButtonProps={{
          disabled: addLoading,
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <div className="flex justify-end gap-2">
            <CancelBtn />
            <div className="relative">
              <OkBtn />
              {addLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <InlineSpinner sizeClass="w-4 h-4" colorClass="border-white" />
                </div>
              )}
            </div>
          </div>
        )}
        maskClosable={!addLoading}
        closable={!addLoading}
        width={800}
      >
        <Form form={addForm} layout="vertical" className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            label="Business Name"
            name="businessName"
            rules={[{ required: true, message: "Business name is required" }]}
          >
            <Input placeholder="Enter business name" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Select placeholder="Select category">
              {categories.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Owner Name"
            name="ownerName"
            rules={[{ required: true, message: "Owner name is required" }]}
          >
            <Input placeholder="Enter owner name" />
          </Form.Item>

          <Form.Item
            label="Stock Quantity"
            name="stockQuantity"
            rules={[{ required: true, message: "Stock quantity is required" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Enter stock quantity"
            />
          </Form.Item>

          <Form.Item
            label="Total Cost"
            name="totalCost"
            rules={[{ required: true, message: "Total cost is required" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Enter total cost"
            />
          </Form.Item>

          <Form.Item
            label="Monthly Revenue"
            name="monthlyRevenue"
            rules={[{ required: true, message: "Monthly revenue is required" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Enter monthly revenue"
            />
          </Form.Item>

          <Form.Item
            label="Profit Margin (%)"
            name="profitMargin"
            rules={[{ required: true, message: "Profit margin is required" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              max={100}
              placeholder="Enter profit margin"
            />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Location is required" }]}
          >
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item
            label="Contact Number"
            name="contactNumber"
            rules={[{ required: true, message: "Contact number is required" }]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
          >
            <Input placeholder="Enter email (optional)" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            className="md:col-span-2"
          >
            <TextArea
              placeholder="Enter description (optional)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Upload Documents"
            name="uploadDocuments"
            className="md:col-span-2"
          >
            <Upload
              multiple
              fileList={addFiles}
              beforeUpload={() => false}
              onChange={({ fileList }) => handleAddFileUpload(fileList)}
              disabled={uploadingFiles}
            >
              <Button icon={<UploadOutlined />} disabled={uploadingFiles}>
                {uploadingFiles ? "Uploading..." : "Upload Files"}
              </Button>
            </Upload>
            {uploadingFiles && (
              <div className="mt-2 text-sm text-blue-600">
                <InlineSpinner sizeClass="w-4 h-4" colorClass="border-blue-600" />
                <span className="ml-2">Uploading files...</span>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Business Modal */}
      <Modal
        centered
        title="Edit Business Data"
        open={editOpen}
        onOk={handleEdit}
        onCancel={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        okText="Save"
        okButtonProps={{
          disabled: editLoading,
          className: "custom_button",
        }}
        cancelButtonProps={{
          disabled: editLoading,
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <div className="flex justify-end gap-2">
            <CancelBtn />
            <div className="relative">
              <OkBtn />
              {editLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <InlineSpinner sizeClass="w-4 h-4" colorClass="border-white" />
                </div>
              )}
            </div>
          </div>
        )}
        maskClosable={!editLoading}
        closable={!editLoading}
        width={800}
      >
        <Form form={editForm} layout="vertical" className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            label="Business Name"
            name="businessName"
            rules={[{ required: true, message: "Business name is required" }]}
          >
            <Input placeholder="Enter business name" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Select placeholder="Select category">
              {categories.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Owner Name"
            name="ownerName"
            rules={[{ required: true, message: "Owner name is required" }]}
          >
            <Input placeholder="Enter owner name" />
          </Form.Item>

          <Form.Item
            label="Stock Quantity"
            name="stockQuantity"
            rules={[{ required: true, message: "Stock quantity is required" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Enter stock quantity"
            />
          </Form.Item>

          <Form.Item
            label="Total Cost"
            name="totalCost"
            rules={[{ required: true, message: "Total cost is required" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Enter total cost"
            />
          </Form.Item>

          <Form.Item
            label="Monthly Revenue"
            name="monthlyRevenue"
            rules={[{ required: true, message: "Monthly revenue is required" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Enter monthly revenue"
            />
          </Form.Item>

          <Form.Item
            label="Profit Margin (%)"
            name="profitMargin"
            rules={[{ required: true, message: "Profit margin is required" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              max={100}
              placeholder="Enter profit margin"
            />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Location is required" }]}
          >
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item
            label="Contact Number"
            name="contactNumber"
            rules={[{ required: true, message: "Contact number is required" }]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
          >
            <Input placeholder="Enter email (optional)" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            className="md:col-span-2"
          >
            <TextArea
              placeholder="Enter description (optional)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Upload Documents"
            name="uploadDocuments"
            className="md:col-span-2"
          >
            <Upload
              multiple
              fileList={editFiles}
              beforeUpload={() => false}
              onChange={({ fileList }) => handleEditFileUpload(fileList)}
              disabled={uploadingEditFiles}
            >
              <Button icon={<UploadOutlined />} disabled={uploadingEditFiles}>
                {uploadingEditFiles ? "Uploading..." : "Upload Files"}
              </Button>
            </Upload>
            {uploadingEditFiles && (
              <div className="mt-2 text-sm text-blue-600">
                <InlineSpinner sizeClass="w-4 h-4" colorClass="border-blue-600" />
                <span className="ml-2">Uploading files...</span>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        centered
        title="Delete Business Data"
        open={deleteOpen}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        okButtonProps={{
          danger: true,
          disabled: deleteLoading,
        }}
        cancelButtonProps={{
          disabled: deleteLoading,
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <div className="flex justify-end gap-2">
            <CancelBtn />
            <div className="relative">
              <OkBtn />
              {deleteLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <InlineSpinner sizeClass="w-4 h-4" colorClass="border-white" />
                </div>
              )}
            </div>
          </div>
        )}
        maskClosable={!deleteLoading}
        closable={!deleteLoading}
      >
        <p>
          Are you sure you want to delete the business{" "}
          <strong>&ldquo;{deleting?.businessName}&rdquo;</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default BusinessDataTable;