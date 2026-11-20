import SegmentedFilter from "@/components/catalogue/filter/SegmentedFilter";

const SESSIONS = [
  { label: "Toutes", value: null },
  { label: "Normale", value: "Session Normale" },
  { label: "Rattrapage", value: "Rattrapage" },
];

interface SessionFilterWrapperProps {
  current: string | null;
  onChange: (value: string | null) => void;
}

const SessionFilterWrapper = ({
  current,
  onChange,
}: SessionFilterWrapperProps) => (
  <SegmentedFilter choices={SESSIONS} current={current} onChange={onChange} />
);

export default SessionFilterWrapper;
