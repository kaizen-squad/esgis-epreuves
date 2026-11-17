import SegmentedFilter from "../SegmentedFilter";

const EXAM_TYPES = [
  { label: "Tous", value: null },
  { label: "Terminal", value: "Contrôle Terminal" },
  { label: "Continu", value: "Contrôle Continu" },
];

interface TypeEvaluationFilterWrapperProps {
  current: string | null;
  onChange: (value: string | null) => void;
}

const TypeEvaluationFilterWrapper = ({
  current,
  onChange,
}: TypeEvaluationFilterWrapperProps) => (
  <SegmentedFilter choices={EXAM_TYPES} current={current} onChange={onChange} />
);

export default TypeEvaluationFilterWrapper;
