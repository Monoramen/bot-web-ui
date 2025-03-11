export default function CommandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-2 py-8 md:py-0">
      <div className="inline-block max-w-screen-xl w-full text-center justify-center">
        {children}
      </div>
    </section>
  );
}
