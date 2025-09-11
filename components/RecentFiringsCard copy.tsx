'use client'

import { Card, CardContent } from "@/components/ui/card";

const RecentFiringsCard = ({ recentFirings, openFiringDetails, getStatusColor, getStatusText }) => {
    return (
        <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Последние обжиги</h2>
                <div className="space-y-3">
                    {recentFirings.map(firing => (
                        <div 
                            key={firing.id} 
                            className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => openFiringDetails(firing)}
                        >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <div>
                                    <span className="font-medium">Программа #{firing.programId}</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(firing.startTime).toLocaleDateString()} в {new Date(firing.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">Длит.: {firing.duration} мин</span>
                                    <span className="text-sm">Макс: {firing.maxTemp}°C</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(firing.status)}`}>
                                        {getStatusText(firing.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentFiringsCard;