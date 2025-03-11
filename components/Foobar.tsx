export default function Foobar() {
  return (
    <footer className="w-full bg-gray-800 text-gray-100 py-4 text-center mt-auto">
      <p className="text-sm">
        © {new Date().getFullYear()} BotHub. All rights reserved.
      </p>
      <p className="text-xs">Powered by Next.js and @nextui-org/react</p>
    </footer>
  );
}
