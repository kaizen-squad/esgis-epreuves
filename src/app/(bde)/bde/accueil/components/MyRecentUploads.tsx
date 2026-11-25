import Link from "next/link";
import { connection } from "next/server";
import { FiArrowRight } from "react-icons/fi";
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

  const { exams, total } = await getExams({
    createdBy: userId,
    pageSize: RECENT_UPLOADS_LIMIT,
  });

  if (exams.length === 0) {
    return (
      <div className="mx-auto mb-16 max-w-7xl">
        <h2 className="section-title">Mes derniers versements</h2>
        <p className="text-text-paragraph">
          Vous n&apos;avez pas encore versé d&apos;épreuve.
        </p>
        <Link
          href="/bde/epreuves/ajouter"
          className="bg-background-accent text-text-primary mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Verser votre première épreuve <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-16 max-w-7xl">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="section-title mb-0">
          Mes derniers versements{" "}
          <span className="text-text-paragraph text-base font-normal">
            ({total})
          </span>
        </h2>
        <Link
          href="/bde/mes-epreuves"
          className="text-text-default flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Voir tous mes versements <FiArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {exams.map((exam) => (
          <ExamCard key={exam.id} {...toExamCardProps(exam)} manageable />
        ))}
      </div>
    </div>
  );
}
