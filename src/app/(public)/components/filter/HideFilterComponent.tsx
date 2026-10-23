import { useState } from "react";
import { IoIosArrowUp } from "react-icons/io";

interface HideFilterComponentProps {
  children: React.ReactNode;
  label: string;
}

const HideFilterComponent = ({ children, label }: HideFilterComponentProps) => {
  const [isVisible, setIsVisible] = useState<boolean>();
  const onHide = () => {
    setIsVisible(!isVisible);
  };
  return (
    <div>
      <div
        onClick={onHide}
        className="text-text-secondary mb-4 flex items-center justify-between font-semibold"
      >
        <h3 className="text-lg">{label}</h3>
        <IoIosArrowUp
          size={22}
          className={`${isVisible ? "rotate-180" : "rotate-0"} transition-all`}
        />
      </div>

      <div className={`${isVisible ? "block" : "hidden"}`}>
        {children}
        <hr className="w-full text-gray-300" />
      </div>
    </div>
  );
};

export default HideFilterComponent;
