"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { title } from "@/components/primitives";
import { AttachmentList } from "@/components/attachment/AttachmentList";
import { Button } from "@heroui/react";
import { AttachmentResponseDTO } from "@/types/AttachmentDTO";
import { FaPlus, FaKeyboard } from "react-icons/fa";

export default function AttachmentsPage() {
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentResponseDTO | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showKeyboardForm, setShowKeyboardForm] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentResponseDTO[]>([]);
  const [commands, setCommands] = useState<CommandDTO[]>([]);

  const fetchCommands = async () => {
    try {
      const response = await axios.get("http://localhost:9090/commands");
      setCommands(response.data);
    } catch (error) {
      console.error("Error fetching commands", error);
    }
  };
  
  useEffect(() => {
    fetchAttachments();
    fetchCommands();
  }, []);
  



  const fetchAttachments = async () => {
    try {
      const response = await axios.get("http://localhost:9090/attachments");
      setAttachments(response.data);
    } catch (error) {
      console.error("Error fetching attachments", error);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  const handleSelectAttachment = (attachment: AttachmentResponseDTO) => {
    setSelectedAttachment(attachment);
  };

  const handleAddAttachment = () => {
    setShowAddForm((prev) => !prev);
    setSelectedAttachment(null);
    setShowKeyboardForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setSelectedAttachment(null);
    setShowKeyboardForm(false);
  };

  const handleAttachmentUpdated = () => {
    fetchAttachments();
  };

  const handleToggleKeyboardForm = () => {
    setShowKeyboardForm((prev) => !prev);
    setSelectedAttachment(null);
    setShowAddForm(true);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className={title()}>Attachments</h1>
        <Button
          className="p-0 w-12 h-12 flex items-center justify-center"
          onClick={handleAddAttachment}
          color="success"
          size="md"
        >
          <FaPlus />
        </Button>
      </div>

      {/* Attachment List and Tabs */}
      <div className="flex-1 grid grid-cols-3 gap-8 px-4">
        <div className="col-span-2">
          <AttachmentList
            attachments={attachments}
            commands={commands || []}
            onSelectAttachment={handleSelectAttachment}
            onAttachmentUpdated={handleAttachmentUpdated}
          />
        </div>
        <div>
          {/* Insert additional content/components here if needed */}
        </div>
      </div>
    </div>
  );

}
