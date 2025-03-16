"use client";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { AttachmentDTO } from "@/types/Attachments";

export function AttachmentCard({ attachment }: { attachment: AttachmentDTO }) {
  return (
    <Card className="aspect-square bg-blue-700 rounded-lg shadow-md p-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">Attachment</p>
        <small className="text-default-500">ID: {attachment.id}</small>
        <h4 className="font-bold text-large">Type: {attachment.type}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        {attachment.type === "KEYBOARD" && attachment.keyboard && (
          <div>
            <p className="text-tiny uppercase font-bold">Keyboard</p>
            {typeof attachment.keyboard === "object" && ( // ✅ Проверка типа
              <>
                <p>Name: {attachment.keyboard.keyboard_name}</p>
                <p>Buttons:</p>
                <ul>
                  {attachment.keyboard.buttons.map((button) => (
                    <li key={button.id}>
                      {button.text} (Row: {button.row}, Position: {button.position})
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        {/* Добавьте другие типы прикреплений здесь */}
      </CardBody>
    </Card>
  );
}
