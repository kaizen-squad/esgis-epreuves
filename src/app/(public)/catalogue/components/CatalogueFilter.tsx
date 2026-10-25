import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import { Drawer } from "vaul";
import FilterComponents from "../../components/filter/FilterComponents";

const CatalogueFilter = ({
  mode,
  onClose,
}: {
  mode: "mobile" | "desktop";
  onClose?: () => void;
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  return mode === "desktop" ? (
    <aside className="bg-background-primary hidden overflow-hidden rounded-xl border border-gray-200 py-4 shadow-sm lg:sticky lg:top-4 lg:flex lg:max-h-[calc(100dvh-2rem)] lg:flex-col">
      <FilterComponents onClose={onClose} />
    </aside>
  ) : (
    <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <Drawer.Trigger className="text-text-secondary flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 font-semibold lg:hidden">
        <FiFilter size={20} color="#c41c2d" />
        Filtres
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="bg-background-primary fixed right-0 bottom-0 left-0 z-50 mt-24 flex h-[80dvh] flex-col rounded-t-[10px] outline-none">
          <Drawer.Title className="sr-only">Filtres</Drawer.Title>
          <FilterComponents onClose={() => setIsDrawerOpen(false)} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CatalogueFilter;
