"use client";
import axios from "axios";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { CommandResponseDTO } from "../types/CommandDTO";
import { useEffect, useState } from "react";

export default function CommandList({
  commands,
  onSelectCommand,
  onCommandUpdated,
}: {
  commands: CommandResponseDTO[];
  onSelectCommand: (command: CommandResponseDTO) => void;
  onCommandUpdated: () => void;
}) {
  const [attachmentTypes, setAttachmentTypes] = useState<{ [key: number]: string }>({});

  // Загрузка типов вложений
  useEffect(() => {
    const fetchAttachmentTypes = async () => {
      const ids = commands.flatMap(cmd => cmd.attachment_ids);
      const uniqueIds = [...new Set(ids)];
      
      const types: { [key: number]: string } = {};
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const response = await axios.get(`http://localhost:9090/attachments/${id}`);
            types[id] = response.data.type;
          } catch (error) {
            console.error(`Error fetching attachment ${id}:`, error);
            types[id] = "Unknown";
          }
        })
      );
      
      setAttachmentTypes(types);
    };

    if (commands.length > 0) {
      fetchAttachmentTypes();
    }
  }, [commands]);

  // Функция для удаления команды
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:9090/commands/delete/${id}`);
      onCommandUpdated();
    } catch (error) {
      console.error("Error deleting command", error);
    }
  };

  // Функция для отображения типов вложений
  const renderAttachmentTypes = (ids: number[]) => {
    if (ids.length === 0) return "No attachments";
    
    return ids.map(id => (
      <span key={id} className="mr-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
        {attachmentTypes[id] || "Loading..."}
      </span>
    ));
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Command</TableColumn>
          <TableColumn>Response</TableColumn>
          <TableColumn>Attachments</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {commands.map((command) => (
            <TableRow key={command.id}>
              <TableCell>{command.id}</TableCell>
              <TableCell>{command.command}</TableCell>
              <TableCell>{command.response}</TableCell>
              <TableCell>
                <div className="flex flex-wrap">
                  {renderAttachmentTypes(command.attachment_ids)}
                </div>
              </TableCell>
              <TableCell>
  <div className="flex gap-2 items-center">
    <FaEdit 
      className="text-yellow-600 hover:text-yellow-700 cursor-pointer transition-colors"
      onClick={() => onSelectCommand(command)}
    />
    <FaTrash 
      className="text-red-600 hover:text-red-700 cursor-pointer transition-colors" 
      onClick={() => handleDelete(command.id)}
    />
  </div>
</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}