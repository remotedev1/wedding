export default function AuthLayout({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_15%_20%,rgba(245,158,11,.25)_0,transparent_26%),radial-gradient(circle_at_85%_20%,rgba(37,99,235,.2)_0,transparent_30%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">{children}</div>
    </main>
  );
}
