export function ContentPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-heading text-3xl font-bold text-text-heading">{title}</h1>
      {subtitle && <p className="mt-2 text-text-muted">{subtitle}</p>}
      <div className="prose prose-sm mt-8 max-w-none space-y-4 text-text-body [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-text-heading [&_h2]:mt-8">
        {children}
      </div>
    </div>
  );
}
