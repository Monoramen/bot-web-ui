import { Card, CardBody, Badge } from "@heroui/react";

export function AttachmentTile({ attachment }) {
  const attachmentType = attachment.type.toLowerCase().replace("_", " ");

  return (
    <Card className="p-1 bg-gray-500 aspect-square">
      <CardBody className="p-1 flex items-center justify-center">
        <div className="flex items-center gap-1">
          <Badge color="secondary" size="sm">
            {attachment.type} ()
          </Badge>
        </div>

        {/* Детали прикрепления */}
        {attachment.type === "KEYBOARD" && (
          <div className="mt-1">
            <p className="text-xs">Keyboard: </p>
            <p className="text-xs">Buttons: </p>
          </div>
        )}

        {attachment.type === "INLINE_KEYBOARD" && (
          <div className="mt-1">
            <p className="text-xs">Inline Keyboard: </p>
            <p className="text-xs">Buttons: </p>
          </div>
        )}

        {attachment.type === "AUDIO" && (
          <div className="mt-1">
            <p className="text-xs">Audio File</p>
          </div>
        )}

        {attachment.type === "IMAGE" && (
          <div className="mt-1">
            <p className="text-xs">Image</p>
          </div>
        )}

        {attachment.type === "DOCUMENT" && (
          <div className="mt-1">
            <p className="text-xs">Document</p>
          </div>
        )}

        {attachment.type === "BUTTON" && (
          <div className="mt-1">
            <p className="text-xs">Button: {attachment.text}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

