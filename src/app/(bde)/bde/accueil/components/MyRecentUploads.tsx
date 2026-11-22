import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getExams } from "@/features/exams/queries";
import { toExamCardProps } from "@/components/exams/toExamCardProps";
import ExamCard from "@/components/exams/ExamCard";

const RECENT_UPLOADS_LIMIT = 8;

export function MyRecentUploadsSkeleton() {
  return (
    <div className="mx-auto mb-16 max-w-7xl animate-pulse">
      <div className="mb-6 h-8 w-64 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-72 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

/** Registre "Mes derniers versements" (R-15) : uniquement les epreuves deposees par ce membre. */
export default async function MyRecentUploads() {
  await connection();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;

  const { exams } = await getExams({
    createdBy: userId,
    pageSize: RECENT_UPLOADS_LIMIT,
  });

  if (exams.length === 0) {
    return (
      <div className="mx-auto mb-16 max-w-7xl">
        <h3 className="section-title">Mes derniers versements</h3>
        <p className="text-text-paragraph">
          Vous n&apos;avez pas encore versé d&apos;épreuve.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-16 max-w-7xl">
      <h3 className="section-title">Mes derniers versements</h3>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {exams.map((exam) => (
          <ExamCard key={exam.id} {...toExamCardProps(exam)} manageable />
        ))}
      </div>
    </div>
  );
}
