import type { Metadata } from "next";
import ClasseurList from "@/components/classeur/ClasseurList";

export const metadata: Metadata = {
  title: "Mon classeur · Alexandria",
  robots: { index: false, follow: false },
};

export default function ClasseurPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="head-title mb-6 text-center">Mon classeur</h1>
      <ClasseurList />
    </div>
  );
}
