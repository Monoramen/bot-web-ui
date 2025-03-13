export default function CommandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full">
      <div className="inline-block w-full max-w-screen-xl text-center justify-center">
        {children}
      </div>
    </section>
  );
}
