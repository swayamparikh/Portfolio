import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
