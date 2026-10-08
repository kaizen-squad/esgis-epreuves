import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

const Research = () => {
  return (
    <div className="mb-8 px-6 text-center">
      <div className="mb-8 text-center text-lg lg:text-3xl">
        Des sujets{" "}
        <div className="relative hidden h-10 w-17.5 align-middle lg:inline-block">
          <Image
            src="/images/accueil_span_page.jpeg"
            alt="Paragraphe image 1"
            className="hidden rounded-full object-cover align-middle lg:inline-block"
            fill
          />
        </div>{" "}
        gratuits et accessibles même <br className="hidden lg:block" /> sans
        compte pour préparer{" "}
        <div className="relative my-auto hidden h-10 w-25 align-middle lg:inline-block">
          <Image
            src="/images/study.png"
            alt="Paragraphe image 1"
            className="hidden rounded-full object-cover lg:inline-block"

            fill
            sizes="(max-width: 768px) 100%, (max-width: 1200px) 100%"
          />
        </div>{" "}
        vos examens.
      </div>

      <div className="bg-background-primary flex border border-gray-300 py-1 pr-2 pl-4 lg:mx-auto lg:w-1/3">
        <input
          className="min-w-0 flex-1 outline-none"
          type="search"
          placeholder="Rechercher une matière, un titre..."
        />
        <button className="bg-background-accent text-text-primary flex h-full min-w-0 cursor-pointer items-center gap-3 p-2">
          Rechercher
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Research;
