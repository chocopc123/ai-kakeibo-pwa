import { BottomNav } from "@/components/forest/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen pb-32">
      {children}
      <BottomNav />
    </div>
  );
}
