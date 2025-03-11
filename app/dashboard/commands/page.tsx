"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { title } from "@/components/primitives";
import CommandList from "@/components/CommandList";
import { Button } from "@heroui/react";
import { CommandResponseDTO } from "@/types/CommandDTO";
import { FaPlus, FaKeyboard } from "react-icons/fa";

export default function CommandsPage() {
  const [selectedCommand, setSelectedCommand] = useState<CommandResponseDTO | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showKeyboardForm, setShowKeyboardForm] = useState(false);
  const [commands, setCommands] = useState<CommandResponseDTO[]>([]);

  const fetchCommands = async () => {
    try {
      const response = await axios.get("http://localhost:9090/commands");
      setCommands(response.data);
    } catch (error) {
      console.error("Error fetching commands", error);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  const handleSelectCommand = (command: CommandResponseDTO) => {
    setSelectedCommand(command);
  };

  const handleAddCommand = () => {
    setShowAddForm((prev) => !prev);
    setSelectedCommand(null);
    setShowKeyboardForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setSelectedCommand(null);
    setShowKeyboardForm(false);
  };

  const handleCommandUpdated = () => {
    fetchCommands();
  };

  const handleToggleKeyboardForm = () => {
    setShowKeyboardForm((prev) => !prev);
    setSelectedCommand(null);
    setShowAddForm(true);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className={title()}>Commands</h1>
        <Button
          className="p-0 w-12 h-12 flex items-center justify-center"
          onClick={handleAddCommand}
          color="success"
          size="md"
        >
          <FaPlus />
        </Button>
      </div>

      {/* Command List and Tabs */}
      <div className="flex-1 grid grid-cols-3 gap-8 px-4">
        <div className="col-span-2">
          <CommandList
            commands={commands}
            onSelectCommand={handleSelectCommand}
            onCommandUpdated={handleCommandUpdated}
          />
        </div>
        <div>
          {/* Insert additional content/components here if needed */}
        </div>
      </div>
    </div>
  );

}