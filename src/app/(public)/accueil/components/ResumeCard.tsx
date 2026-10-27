import React from "react";

interface ResumeCardProps {
  icon: React.ReactElement;
  title: string;
  text: string;
}

const ResumeCard = ({ icon, title, text }: ResumeCardProps) => {
  return (
    <div className="bg-background-primary rounded-lg px-6 py-5 lg:aspect-4/3">
      <div className="bg-background-default mb-6 w-fit rounded-full p-3">
        {icon}
      </div>
      <div>
        <p className="text-text-title mb-2 font-medium">{title}</p>
        <p className="text-text-paragraph text-sm font-light">{text}</p>
      </div>
    </div>
  );
};

export default ResumeCard;
