export default function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 z-50">
      
      <div className="text-white font-semibold tracking-wide">
        FP Malhas
      </div>

      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
        FP
      </div>

    </div>
  );
}