"use client";
import { useRef } from "react";
import { Image, File as FileIcon } from "lucide-react";

export default function UploadMenu({ isOpen, onClose, onImageChange, onFileChange }) {
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = () => {
    imageInputRef.current?.click();
    onClose?.();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
    onClose?.();
  };

  const handleImageChange = (e) => {
    if (typeof onImageChange === "function") onImageChange(e);
    // reset so selecting the same file again triggers change
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    if (typeof onFileChange === "function") onFileChange(e);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      )}

      <div
        className={`absolute bottom-14 left-0 space-y-4 transition-all duration-300 z-50 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleImageSelect}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent  text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 block mx-auto"
          aria-label="Select image"
        >
          <Image size={28} />
        </button>

        <button
          type="button"
          onClick={handleFileSelect}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent  text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 block mx-auto"
          aria-label="Select file"
        >
          <FileIcon size={28} />
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}