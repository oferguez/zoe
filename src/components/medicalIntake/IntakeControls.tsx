export function MultiSelectGrid({
  label,
  options,
  values,
  onToggle,
  optionClass,
  columns = "md:grid-cols-2"
}: {
  label?: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
  optionClass: (selected: boolean) => string;
  columns?: string;
}) {
  return (
    <div className="grid gap-3">
      {label ? <h2 className="text-base font-black text-ink/70">{label}</h2> : null}
      <div className={`grid gap-3 ${columns}`}>
        {options.map((option) => (
          <button className={optionClass(values.includes(option))} type="button" key={option} onClick={() => onToggle(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SingleSelectGrid({
  label,
  options,
  value,
  onChange,
  optionClass
}: {
  label?: string;
  options: [string, string][];
  value: string | null;
  onChange: (value: string) => void;
  optionClass: (selected: boolean) => string;
}) {
  return (
    <div className="grid gap-3">
      {label ? <h2 className="text-base font-black text-ink/70">{label}</h2> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {options.map(([optionValue, labelText]) => (
          <button
            className={optionClass(value === optionValue)}
            type="button"
            key={optionValue}
            onClick={() => onChange(optionValue)}
          >
            {labelText}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BooleanSegment({
  label,
  value,
  onChange,
  optionClass
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  optionClass: (selected: boolean) => string;
}) {
  return (
    <div className="grid gap-3">
      <h2 className="text-base font-black text-ink/70">{label}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <button className={optionClass(value === true)} type="button" onClick={() => onChange(true)}>
          Yes
        </button>
        <button className={optionClass(value === false)} type="button" onClick={() => onChange(false)}>
          No
        </button>
      </div>
    </div>
  );
}

export function ShortText({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-3 text-base font-bold text-ink/70">
      {label}
      <input
        className="min-h-14 rounded-[1rem] border-[3px] border-ink/20 bg-white px-4 text-base text-ink outline-none focus:border-ink focus:ring-4 focus:ring-royal-yellow/40"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
