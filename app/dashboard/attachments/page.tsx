"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { title } from "@/components/Primitives";
import { AttachmentList } from "@/components/attachment/AttachmentList";
import { Button } from "@heroui/react";
import { AttachmentDTO } from "@/types/Attachments";
import { CommandDTO } from "@/types/CommandDTO";
import { FaPlus, FaKeyboard } from "react-icons/fa";
import { A } from "framer-motion/dist/types.d-B50aGbjN";

export default function AttachmentsPage() {
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentDTO | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showKeyboardForm, setShowKeyboardForm] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);
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

  const handleSelectAttachment = (attachment: AttachmentDTO) => {
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

      <div className="w-full flex flex-col min-h-screen">
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
      <div className="flex-1 px-4">
  
          <AttachmentList
            attachments={attachments}
            commands={commands || []}
            onSelectAttachment={handleSelectAttachment}
            onAttachmentUpdated={handleAttachmentUpdated}
          />
      
        <div>
          {/* Insert additional content/components here if needed */}
        </div>
      </div>
    </div>
  );

}
