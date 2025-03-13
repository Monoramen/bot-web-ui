export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-background dark:bg-background-gray-900 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          {children}
        </div>
      </div>
    </div>
  );
}