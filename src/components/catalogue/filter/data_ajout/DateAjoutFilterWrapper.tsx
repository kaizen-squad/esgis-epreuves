import { dateAjoutMocks } from "@/components/catalogue/filter/filter.constants";
import DateAjoutCard from "@/components/catalogue/filter/data_ajout/DateAjoutCard";

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
