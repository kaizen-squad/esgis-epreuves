import { FiFilter } from "react-icons/fi";
import { Drawer } from "vaul";
import FilterComponents from "../../components/filter/FilterComponents";

const CatalogueFilter = ({
  mode,
  isMobileOpen,
}: {
  mode: "mobile" | "desktop";
  isMobileOpen: boolean;
}) => {
  return mode === "desktop" ? (
    <div>
      {isMobileOpen && (
        <div className="bg-background-primary w-full rounded-lg px-2 py-4">
          <FilterComponents />
        </div>
      )}
    </div>
  ) : (
    <Drawer.Root>
      <Drawer.Trigger>
        <span className="text-text-secondary mt-auto mb-6 flex cursor-pointer items-center gap-2 text-xl font-semibold">
          <FiFilter size={22} color="#c41c2d" />
          Filtres
        </span>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 mt-24 flex h-[80dvh] flex-col rounded-t-[10px] bg-gray-100 outline-none lg:h-80">
          <FilterComponents />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CatalogueFilter;
