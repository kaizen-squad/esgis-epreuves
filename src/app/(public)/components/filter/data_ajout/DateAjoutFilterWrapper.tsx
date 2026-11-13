import { dateAjoutMocks } from "@/app/(public)/constants/filter.constants";
import DateAjoutCard from "./DateAjoutCard";

const DateAjoutFilterWrapper = () => {
  return (
    <div>
      {dateAjoutMocks.map((date_ajout) => (
        <DateAjoutCard key={date_ajout.date} />
      ))}
    </div>
  );
};

export default DateAjoutFilterWrapper;
