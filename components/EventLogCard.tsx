'use client'

import { Card, CardContent } from "@/components/ui/card";

const EventLogCard = ({ eventLog }) => {
    return (
        <Card className="lg:col-span-3">
            <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Лог событий</h2>
                <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                    {eventLog.map((event, idx) => (
                        <div key={idx} className="flex gap-4 py-1 border-b last:border-b-0">
                            <span className="text-muted-foreground w-16">{event.time}</span>
                            <span>{event.message}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default EventLogCard;