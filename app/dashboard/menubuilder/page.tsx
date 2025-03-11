"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { title } from "@/components/primitives";
import CommandList from "../../../components/CommandList";
import { Button } from "@heroui/react";
import { CommandResponseDTO } from "@/types/CommandDTO";
import { FaPlus, FaKeyboard } from "react-icons/fa";
import CommandTabs from "@/components/CommandTabs";

export default function CommandsPage() {
  const [selectedCommand, setSelectedCommand] = useState<CommandResponseDTO | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showKeyboardForm, setShowKeyboardForm] = useState(false); // Новый стейт для показа формы клавиатуры
  const [commands, setCommands] = useState<CommandResponseDTO[]>([]);

  const fetchCommands = async () => {
    try {
      const response = await axios.get("http://localhost:9090/commands/all");
      setCommands(response.data); // Обновляем список команд
    } catch (error) {
      console.error("Error fetching commands", error);
    }
  };

  useEffect(() => {
    fetchCommands(); // Загружаем данные при монтировании компонента
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
    fetchCommands(); // Загружаем актуальные данные команд
  };

  const handleToggleKeyboardForm = () => {
    setShowKeyboardForm((prev) => !prev); // Переключение видимости формы клавиатуры
    setSelectedCommand(null); // Сбрасываем выбранную команду
    setShowAddForm(true); // Скрываем форму добавления команды
  };

  return (
    <div className="max-w-screen-xl mx-auto px-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="flex justify-center items-center col-span-2">
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

        <div className="flex justify-center items-center gap-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="col-span-2 flex flex-col">
          <CommandList
            commands={commands}
            onSelectCommand={handleSelectCommand}
            onCommandUpdated={handleCommandUpdated}
          />
        </div>
        <div>
        <CommandTabs
            selectedCommand={selectedCommand}
            showAddForm={showAddForm}
            showKeyboardForm={handleToggleKeyboardForm}
            onAddFormToggle={handleAddCommand}
            onCancel={handleCancel}
            onCommandUpdated={handleCommandUpdated}
            onSelectCommand={handleSelectCommand}
          />
        </div>
      </div>
    </div>
  );
}
