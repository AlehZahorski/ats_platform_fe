"use client";

interface PillOption {
  value: string;
  label: string;
}

interface PillSelectorProps {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  multi?: false;
}

interface MultiPillSelectorProps {
  options: PillOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multi: true;
}

type Props = PillSelectorProps | MultiPillSelectorProps;

export function PillSelector(props: Props) {
  if (props.multi) {
    const { options, value, onChange } = props;
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange(
                  selected ? value.filter((v) => v !== opt.value) : [...value, opt.value]
                )
              }
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  const { options, value, onChange } = props;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(selected ? "" : opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary/50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
