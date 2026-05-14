import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <main className="max-w-md mx-auto pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
