import { UserProvider } from "@/hooks/use-user";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#0A2613] via-background to-black p-4">
        {children}
      </main>
    </UserProvider>
  );
}
