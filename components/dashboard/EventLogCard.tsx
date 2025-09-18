'use client';

import { Card, CardContent } from "@/components/ui/card";
import React from 'react';

interface EventLogItem {
  time: string;
  message: string;
}

interface EventLogCardProps {
  eventLog: EventLogItem[];
}

const EventLogCard: React.FC<EventLogCardProps> = ({ eventLog }) => {
  return (


        <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
          {eventLog.map((event, idx) => (
            <div key={idx} className="flex gap-4 py-1 border-b last:border-b-0">
              <span className="text-muted-foreground w-16">{event.time}</span>
              <span>{event.message}</span>
            </div>
          ))}
        </div>

  );
};

export default EventLogCard;