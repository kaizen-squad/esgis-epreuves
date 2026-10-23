import { FiFilter } from "react-icons/fi";
import { Drawer } from "vaul";
import FilterComponents from "../../components/filter/FilterComponents";

const CatalogueFilter = ({
  mode,
  isDesktopOpen,
}: {
  mode: "mobile" | "desktop";
  isDesktopOpen: boolean;
}) => {
  return mode === "desktop" ? (
    <div>
      {isDesktopOpen && (
        <div className="bg-background-primary rounded-lg px-2 py-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:w-72 lg:shrink-0 lg:overflow-y-auto">
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
