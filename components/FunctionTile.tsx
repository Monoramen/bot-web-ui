import { Card, CardBody } from "@heroui/react";

export function FunctionTile({ func }) {
  return (
    <Card className="p-4 bg-blue-700">
      <CardBody>
        <h3 className="text-lg font-semibold">{func.name}</h3>
        <p className="text-default-500 text-sm">{func.description}</p>
      </CardBody>
    </Card>
  );
}