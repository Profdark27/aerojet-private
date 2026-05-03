export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0C14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated gold ring */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border border-[#C9A84C]/20 rounded-full" />
          <div className="absolute inset-0 border-t border-[#C9A84C] rounded-full animate-spin" />
        </div>
        <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase opacity-60 animate-pulse">
          Caricamento
        </p>
      </div>
    </div>
  )
}
