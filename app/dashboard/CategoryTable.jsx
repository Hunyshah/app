/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
import { useMemo, useState, useEffect } from "react";
import { Edit2, Trash2 } from "react-feather";
import { Modal, Form, Input } from "antd";
import toast from "react-hot-toast";

import ProductTable from "@/components/dataTables/productTable";
import apiFunction from "@/components/apifunction/apiFunction";
import { categoryApi, categoryByIdApi } from "@/components/apifunction/ApiFile";
import { InlineSpinner } from "@/components/common/Spinner";

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const { userData, getData, postData, putData, deleteData } = apiFunction();

  // ProductTable state management
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    if (userData?.token) {
      fetchCategories();
    }
  }, [userData?.token]);

  // Fetch categories from API
  const fetchCategories = async (page = 1, search = "") => {
    try {
      setLoading(true);
      // Ensure page is a valid number
      const validPage = Math.max(parseInt(page) || 1, 1);
      const params = new URLSearchParams({
        page: validPage.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      
      const res = await getData(`${categoryApi}?${params.toString()}`);
      if (res?.success) {
        setCategories(res.data || []);
        setTotalPages(res.count?.totalPage || 0);
        setCurrentPage(validPage - 1); // Convert to 0-based for ProductTable
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
    fetchCategories(1, value);
  };

  const handleAdd = async () => {
    try {
      setAddLoading(true);
      const values = await addForm.validateFields();
      const name = values.name.trim();
      
      const res = await postData(categoryApi, { name });
      if (res?.success) {
        toast.success("Category created successfully");
        setAddOpen(false);
        addForm.resetFields();
        fetchCategories(1, searchValue);
      } else {
        toast.error(res?.message || "Failed to create category");
      }
    } catch (error) {
      if (error.errorFields) {
        // Form validation errors
        return;
      }
      toast.error("Failed to create category");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditOpen = (row) => {
    setEditing(row);
    editForm.setFieldsValue({ name: row.name });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    try {
      setEditLoading(true);
      const values = await editForm.validateFields();
      const name = values.name.trim();
      
      const res = await putData(`${categoryByIdApi}/${editing._id}`, { name });
      if (res?.success) {
        toast.success("Category updated successfully");
        setEditOpen(false);
        setEditing(null);
        fetchCategories((currentPage || 0) + 1, searchValue);
      } else {
        toast.error(res?.message || "Failed to update category");
      }
    } catch (error) {
      if (error.errorFields) {
        // Form validation errors
        return;
      }
      toast.error("Failed to update category");
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
        const res = await deleteData(`${categoryByIdApi}/${deleting._id}`);
        if (res?.success) {
          toast.success("Category deleted successfully");
          setDeleteOpen(false);
          setDeleting(null);
          fetchCategories((currentPage || 0) + 1, searchValue);
        } else {
          toast.error(res?.message || "Failed to delete category");
        }
      } catch {
        toast.error("Failed to delete category");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setDeleting(null);
  };

  const columns = useMemo(
    () => [
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
        grow: 2,
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-3">
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

  // Handle pagination
  const handlePageChange = (selectedPage) => {
    // Handle both direct number and page object
    const pageIndex = typeof selectedPage === 'number' ? selectedPage : selectedPage.selected;
    const pageNumber = Math.max(parseInt(pageIndex) + 1, 1);
    fetchCategories(pageNumber, searchValue);
  };

  return (
    <div className="w-full">
      <ProductTable
        rowHeading="Category List"
        data={categories}
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
        buttonText="Add Category"
        buttonClick={() => setAddOpen(true)}
      />

      {/* Add Category Modal */}
      <Modal
        centered
        title="Add Category"
        open={addOpen}
        onOk={handleAdd}
        onCancel={() => {
          setAddOpen(false);
          addForm.resetFields();
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
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label="Category"
            name="name"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        centered
        title="Edit Category"
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
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Category"
            name="name"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        centered
        title="Delete Category"
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
        cancelText="Cancel"
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
          Are you sure you want to delete the category{" "}
          <strong>&ldquo;{deleting?.name}&rdquo;</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default CategoryTable;
