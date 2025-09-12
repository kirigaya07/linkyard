import Board2D from "@/components/board/board2d";
import { checkUser } from "@/lib/checkuser";
import { redirect } from "next/navigation";

export default async function BoardPage() {
  const dbUser = await checkUser();
  if (!dbUser) redirect("/sign-in");
  return (
    <main className="h-screen w-screen">
      <Board2D />
    </main>
  );
}
