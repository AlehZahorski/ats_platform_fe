import { AdminArticleEditorPage } from "@/pages-ui/admin/AdminArticleEditorPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdminArticleEditorPage articleId={id} />;
}
