import { CompanyArticleEditorPage } from "@/pages-ui/company-articles/CompanyArticleEditorPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <CompanyArticleEditorPage articleId={id} />;
}
