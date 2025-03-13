"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { title } from "@/components/primitives";
import { Button } from "@heroui/react";
import { FaPlus, FaImage } from "react-icons/fa";

interface ImageAttachmentDTO {
  id: number;
  title: string;
  description: string; // Описание изображения
  source: string; // Источник (например, Unsplash, пользовательская загрузка и т.д.)
  url: string; // Ссылка на изображение
  width: number; // Ширина изображения
  height: number; // Высота изображения
}

export default function ImageAttachmentsPage() {
  const [imageAttachments, setImageAttachments] = useState<ImageAttachmentDTO[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageAttachmentDTO | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchImageAttachments = async () => {
    try {
      const response = await axios.get("http://localhost:9090/attachments/images");
      setImageAttachments(response.data);
    } catch (error) {
      console.error("Error fetching image attachments", error);
    }
  };

  useEffect(() => {
    fetchImageAttachments();
  }, []);

  const handleSelectImage = (image: ImageAttachmentDTO) => {
    setSelectedImage(image);
  };

  const handleAddImage = () => {
    setShowAddForm((prev) => !prev);
    setSelectedImage(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setSelectedImage(null);
  };

  const handleImageUpdated = () => {
    fetchImageAttachments();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className={title()}>Image Attachments</h1>
        <Button
          className="p-0 w-12 h-12 flex items-center justify-center"
          onClick={handleAddImage}
          color="success"
          size="md"
        >
          <FaPlus />
        </Button>
      </div>

      {/* Table for Image Attachments */}
      <div className="flex-1 px-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Title</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Source</th>
              <th className="border border-gray-300 p-2">Dimensions</th>
            </tr>
          </thead>
          <tbody>
            {imageAttachments.map((image) => (
              <tr
                key={image.id}
                className="hover:bg-gray-500 cursor-pointer"
                onClick={() => handleSelectImage(image)}
              >
                <td className="border border-gray-500 p-2 text-center">{image.id}</td>
                <td className="border border-gray-500 p-2 text-center">{image.title}</td>
                <td className="border border-gray-500 p-2 text-center">{image.description}</td>
                <td className="border border-gray-500 p-2 text-center">{image.source}</td>
                <td className="border border-gray-500 p-2 text-center">
                  {image.width}x{image.height}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional Forms or Modals */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Add New Image Attachment</h2>
            {/* Add form fields here */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel} color="danger">
                Cancel
              </Button>
              <Button onClick={handleImageUpdated} color="success">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Image Details */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold">{selectedImage.title}</h2>
            <p>Description: {selectedImage.description}</p>
            <p>Source: {selectedImage.source}</p>
            <p>
              Dimensions: {selectedImage.width}x{selectedImage.height}
            </p>
            <p>
              URL: <a href={selectedImage.url} className="text-blue-500 hover:underline">{selectedImage.url}</a>
            </p>
            <div className="mt-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setSelectedImage(null)} color="danger">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}