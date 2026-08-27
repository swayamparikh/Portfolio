export function ScanLine() {
  return (
    <div className="relative h-1 w-full overflow-hidden rounded-full bg-hairline">
      <div className="absolute inset-y-0 w-1/3 animate-scan rounded-full bg-signal shadow-red-glow" />
    </div>
  );
}
