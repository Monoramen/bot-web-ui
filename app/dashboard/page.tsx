"use client";
import { CommandCard } from "@/components/CommandCard"; // Предположим, что компоненты находятся в папке components
import { AttachmentTile } from "@/components/attachment/AttachmentTile";
import { AttachmentDTO } from "@/types/Attachments";

export default function DashboardPage() {
  const commands = [
    {
      id: 3,
      command: "/info",
      response: "Эта команда предоставляет информацию о боте",
      attachment_ids: [2, 3],
    },
    // Добавьте другие команды здесь
  ];

  const attachments = [
    {
      id: 1,
      type: "KEYBOARD",
      command_id: 2,
      keyboard: 1, // Идентификатор клавиатуры
    },
    {
      id: 2,
      type: "INLINE_KEYBOARD",
      command_id: 2,
      inline_keyboard: 1, // Идентификатор инлайн-клавиатуры
    },
    {
      id: 3,
      type: "AUDIO",
      command_id: 3,
      audio: 1, // Идентификатор аудио
    },
    {
      id: 4,
      type: "IMAGE",
      command_id: 4,
      image: 1, // Идентификатор изображения
    },
    {
      id: 5,
      type: "DOCUMENT",
      command_id: 5,
      document: 1, // Идентификатор документа
    },
    {
      id: 6,
      type: "BUTTON",
      command_id: 6,
      button: 1, // Идентификатор кнопки
    },
    {
      id: 7,
      type: "VIDEO",
      command_id: 7,
      video: 1, // Идентификатор видео
    },
    {
      id: 8,
      type: "LOCATION",
      command_id: 8,
      location: 1, // Идентификатор локации
    },
    {
      id: 9,
      type: "CONTACT",
      command_id: 9,
      contact: 1, // Идентификатор контакта
    },
  ];

  const functions = [
    {
      id: 1,
      name: "Command Management",
      description: "Create, edit, and delete commands.",
    },
    {
      id: 2,
      name: "Statistics",
      description: "View bot usage statistics.",
    },
    {
      id: 3,
      name: "Settings",
      description: "Configure bot parameters.",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col p-6"> {/* min-h-screen для растяжения */}
      <div className="overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard Panel</h1>
        <p className="text-gray-600">
          Здесь вы можете управлять своим Telegram-ботом, создавать команды, настраивать клавиатуры и просматривать статистику.
        </p>

        {/* Карточки с количеством */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <div className="bg-blue-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Commands</h2>
            <p className="text-gray-400 mt-2">Counts: {commands.length}</p>
          </div>
          <div className="bg-blue-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Attachments</h2>
            <p className="text-gray-400 mt-2">Counts: {attachments.length}</p>
          </div>
          <div className="bg-blue-700 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Functions</h2>
            <p className="text-gray-400 mt-2">Counts: {functions.length}</p>
          </div>
        </div>

        <br />
        <hr />
        <br />

        {/* Секция с прикреплениями */}
        <h1 className="text-2xl font-bold mb-4">Attachment types</h1>
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-2">
          {attachments.map((attachment) => (
            <div key={attachment.id}>
              <AttachmentTile attachment={attachment} />
            </div>
          ))}
        </div>

        <br />
        <hr />
        <br />

        {/* Секция с функциями */}
        <h1 className="text-2xl font-bold mb-4">Functions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">

        </div>
      </div>
    </div>
  );
}