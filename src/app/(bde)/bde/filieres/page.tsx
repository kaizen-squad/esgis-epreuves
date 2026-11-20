import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";

const BDEFilierePage = async () => {
  await requireBdeSession();

  return <div></div>;
};

export default BDEFilierePage;
