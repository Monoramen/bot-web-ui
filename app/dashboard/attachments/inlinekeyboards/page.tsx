"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { title } from "@/components/primitives";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { InlineKeyboardDTO, InlineButtonDTO } from "@/types/AttachmentDTO";

export default function InlineKeyboardsPage() {
  const [inlineKeyboards, setInlineKeyboards] = useState<InlineKeyboardDTO[]>([]);
  const [selectedKeyboard, setSelectedKeyboard] = useState<InlineKeyboardDTO | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchInlineKeyboards = async () => {
    try {
      const response = await axios.get("http://localhost:9090/attachments/inline-keyboards");
      setInlineKeyboards(response.data);
    } catch (error) {
      console.error("Error fetching inline keyboards", error);
    }
  };

  useEffect(() => {
    fetchInlineKeyboards();
  }, []);

  const handleSelectKeyboard = (keyboard: InlineKeyboardDTO) => {
    setSelectedKeyboard(keyboard);
  };

  const handleAddKeyboard = () => {
    setShowAddForm((prev) => !prev);
    setSelectedKeyboard(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setSelectedKeyboard(null);
  };

  const handleKeyboardUpdated = () => {
    fetchInlineKeyboards();
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:9090/attachments/inline-keyboards/delete/${id}`);
      fetchInlineKeyboards();
    } catch (error) {
      console.error("Error deleting inline keyboard", error);
    }
  };

  const renderButtons = (buttons: InlineButtonDTO[]) => {
    if (buttons.length === 0) return "No buttons";

    return buttons.map((button, index) => (
      <span key={index} className="mr-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
        {button.text} (Row: {button.row}, Pos: {button.position})
      </span>
    ));
  };

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className={title()}>Inline Keyboards</h1>
        <Button
          className="p-0 w-12 h-12 flex items-center justify-center"
          onClick={handleAddKeyboard}
          color="success"
          size="md"
        >
          <FaPlus />
        </Button>
      </div>

      {/* Inline Keyboard List */}
      <div className="flex-1 px-4">
        <Table>
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Name</TableColumn>
            <TableColumn>Buttons</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {inlineKeyboards.map((keyboard) => (
              <TableRow key={keyboard.id}>
                <TableCell>{keyboard.id}</TableCell>
                <TableCell>{keyboard.inline_keyboard_name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap">
                    {renderButtons(keyboard.buttons)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <FaEdit
                      className="text-yellow-600 hover:text-yellow-700 cursor-pointer transition-colors"
                      onClick={() => handleSelectKeyboard(keyboard)}
                    />
                    <FaTrash
                      className="text-red-600 hover:text-red-700 cursor-pointer transition-colors"
                      onClick={() => handleDelete(keyboard.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Additional Forms or Modals */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Add New Inline Keyboard</h2>
            {/* Add form fields here */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel} color="danger">
                Cancel
              </Button>
              <Button onClick={handleKeyboardUpdated} color="success">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Keyboard Details */}
      {selectedKeyboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold">{selectedKeyboard.inline_keyboard_name}</h2>
            <div className="mt-2">
              {selectedKeyboard.buttons.map((button) => (
                <div key={button.id} className="bg-gray-500 p-2 rounded mt-1">
                  <p>Text: {button.text}</p>
                  <p>Position: {button.position}, Row: {button.row}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setSelectedKeyboard(null)} color="danger">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}