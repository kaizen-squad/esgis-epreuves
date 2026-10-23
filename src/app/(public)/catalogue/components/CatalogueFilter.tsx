import { FiFilter } from "react-icons/fi";
import { Drawer } from "vaul";
import HideFilterComponent from "../../components/filter/HideFilterComponent";
import { niveauMocks } from "../../constants/filter.constants";
import NiveauCard from "../../components/filter/niveau/NiveauCard";

const CatalogueFilter = () => {
  return (
    <Drawer.Root>
      <Drawer.Trigger>
        <span className="text-text-secondary mt-auto mb-6 flex cursor-pointer items-center gap-2 text-xl font-semibold">
          <FiFilter size={22} color="#c41c2d" />
          Filtres
        </span>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 mt-24 flex h-[80%] flex-col rounded-t-[10px] bg-gray-100 outline-none lg:h-80">
          <div className="py-2">
            <div className="mx-auto mb-8 h-1 w-1/10 rounded-full bg-gray-500"></div>
            <div className="px-4">
              <div className="text-text-secondary mb-4 flex items-center gap-2 font-semibold">
                <h3 className="text-xl">Filtres</h3>
                <span className="rounded-full bg-[#0f2155]/10 px-4 py-2">
                  0
                </span>
              </div>
              <p>120 résultats disponibles</p>
            </div>
            <hr className="my-4 w-full text-gray-300" />
            <div className="px-4">
              <HideFilterComponent label="Filière">
                <div className="flex gap-2">
                  {niveauMocks.map((niveau) => (
                    <NiveauCard key={niveau.niveau} />
                  ))}
                </div>
              </HideFilterComponent>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CatalogueFilter;
