import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

interface AttachmentListProps {
    attachments: AttachmentDTO[];
    commands?: CommandDTO[]; // Делаем commands необязательным
  }
  
  export function AttachmentList({ attachments, commands = [] }: AttachmentListProps) {
    return (
      <Table>
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn>Command</TableColumn>
          <TableColumn>Inline Keyboard</TableColumn>
          <TableColumn>Keyboard</TableColumn>
        </TableHeader>
        <TableBody>
          {attachments.map((attachment) => {
            const command = commands.find(cmd => cmd.id === attachment.command_id);
  
            return (
              <TableRow key={attachment.id}>
                <TableCell>{attachment.id}</TableCell>
                <TableCell>{attachment.type}</TableCell>
                <TableCell>{command ? command.command : "-"}</TableCell>
                <TableCell>
                  {attachment.inline_keyboard?.inline_keyboard_name || "-"}
                </TableCell>
                <TableCell>
                  {attachment.keyboard?.keyboard_name || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }
  

