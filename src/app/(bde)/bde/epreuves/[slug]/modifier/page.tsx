import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { getExamBySlug } from "@/features/exams/queries";
import {
  getFields,
  getLevels,
  getOptions,
  getSubjects,
} from "@/features/referentials/queries";
import ExamMetadataForm from "../../components/ExamMetadataForm";

export default async function ModifierEpreuvePage({
  params,
}: PageProps<"/bde/epreuves/[slug]/modifier">) {
  const { slug } = await params;
  const [exam, fields, levels, subjects, options] = await Promise.all([
    getExamBySlug(slug),
    getFields(),
    getLevels(),
    getSubjects(),
    getOptions(),
  ]);
  if (!exam) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <Link
        href="/bde/accueil"
        className="text-text-paragraph mb-6 flex w-fit items-center gap-2 text-sm"
      >
        <FiArrowLeft /> Retour à l&apos;accueil
      </Link>
      <h1 className="section-title">Modifier les données</h1>
      <p className="text-text-default mb-8">
        {exam.title}. Le fichier PDF n&apos;est pas modifié.
      </p>
      <ExamMetadataForm
        exam={exam}
        fields={fields}
        levels={levels}
        subjects={subjects}
        options={options}
      />
    </div>
  );
}
