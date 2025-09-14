import PublicBoard2DClient from "@/components/board/public-board2d-client";

interface PublicBoardPageProps {
  params: Promise<{ shareToken: string }>;
}

export default async function PublicBoardPage({
  params,
}: PublicBoardPageProps) {
  const { shareToken } = await params;

  return (
    <main className="h-screen w-screen">
      <PublicBoard2DClient shareToken={shareToken} />
    </main>
  );
}
