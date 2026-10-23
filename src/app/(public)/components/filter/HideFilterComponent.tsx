import { useState } from "react";
import { IoIosArrowUp } from "react-icons/io";

interface HideFilterComponentProps {
  children: React.ReactNode;
  label: string;
}

const HideFilterComponent = ({ children, label }: HideFilterComponentProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const onHide = () => {
    setIsVisible(!isVisible);
  };
  return (
    <div>
      <button
        type="button"
        onClick={onHide}
        className="text-text-secondary mb-4 flex w-full items-center justify-between font-semibold"
      >
        <h3 className="text-lg">{label}</h3>
        <IoIosArrowUp
          size={22}
          className={`${isVisible ? "rotate-180" : "rotate-0"} transition-all duration-300`}
        />
      </button>

      <div
        className={`${isVisible ? "h-fit grid-rows-[1fr] opacity-100" : "grid-row-[0fr] h-0 opacity-0"} grid transition-[grid-template-rows,opacity] duration-200 ease-out`}
        inert={!isVisible}
      >
        {children}
        <hr className="my-3 w-full text-gray-300" />
      </div>
    </div>
  );
};

export default HideFilterComponent;
