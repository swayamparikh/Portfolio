export default function NarrativeCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="card relative overflow-hidden bg-gradient-to-br from-white to-[#F4FBF6] border-green-soft">
      <div className="absolute -right-2.5 -top-2.5 text-[120px] leading-none opacity-[.06] text-green pointer-events-none select-none">✦</div>
      <div className="text-[12.5px] text-muted font-semibold mb-0.5">{title}</div>
      <span className="inline-flex items-center gap-1.5 bg-green text-white text-[11px] font-bold px-2.5 py-1 rounded-full mb-2.5">✦ AI Summary</span>
      <p className="text-[16px] leading-relaxed max-w-[60ch] relative">{text}</p>
    </div>
  );
}
