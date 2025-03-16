"use client";
import { Card, CardHeader, CardBody, Badge } from "@heroui/react";
import { AttachmentTile } from "@/components/attachment/AttachmentTile";
import { CommandDTO } from "@/types/CommandDTO"; // ✅ Импорт типа
import { AttachmentDTO } from "@/types/Attachments"; // ✅ Импорт типа

interface CommandCardProps {
  command: CommandDTO; // ✅ Тип команды
  attachments: AttachmentDTO[]; // ✅ Тип прикреплений
}

export function CommandCard({ command, attachments }: CommandCardProps) {
  // Фильтруем прикрепления, относящиеся к этой команде
  const commandAttachments = attachments.filter((attachment) =>
    command.attachment_ids.includes(attachment.id)
  );

  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">Command</p>
        <small className="text-default-500">ID: {command.id}</small>
        <h4 className="font-bold text-large">{command.command}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <p className="text-default-500">{command.response}</p>

        {/* Строка с количеством прикреплений */}
        <div className="mt-4 flex items-center gap-2">
          <p className="text-tiny uppercase font-bold">Attachments</p>
          <Badge color="primary" size="sm">
            {commandAttachments.length}
          </Badge>
        </div>

        {/* Плитки с прикреплениями */}
        <div className="grid grid-cols-1 gap-2 mt-2">
          {commandAttachments.map((attachment) => (
            <AttachmentTile key={attachment.id} attachment={attachment} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}