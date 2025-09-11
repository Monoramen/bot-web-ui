'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Program {
  id: number;
  name: string;
}

interface ProgramListProps {
  programs: Program[];
  selectedProgramId: number | null;
  onSelect: (id: number) => void;
  onAdd?: () => void;
  onDelete?: (id: number) => void;
}

const ProgramList: React.FC<ProgramListProps> = ({ programs, selectedProgramId, onSelect, onAdd, onDelete }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Список программ</CardTitle>
        <Button onClick={onAdd} size="sm">Добавить</Button>
      </CardHeader>
<CardContent className="flex-1 overflow-hidden">
  <div className="max-h-full h-full overflow-y-auto pr-2">
          <ul>
            {programs.map((program) => (
              <li
                key={program.id}
                className={`
                  flex justify-between items-center 
                  cursor-pointer p-2 rounded-md 
                  transition-colors duration-200
                  ${
                    selectedProgramId === program.id
                      ? 'bg-primary/10 dark:bg-primary/20 font-semibold text-primary'
                      : 'hover:bg-primary/5 dark:hover:bg-primary/10'
                  }
                `}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.delete-button')) return;
                  onSelect(program.id);
                }}
              >
                <span className={selectedProgramId === program.id ? 'text-primary font-medium' : ''}>
                  {program.name}
                </span>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="delete-button text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(program.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
            {programs.length === 0 && <p className="text-muted-foreground p-2">Программ нет</p>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramList;