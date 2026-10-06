import * as React from "react"
import { Badge } from "@/components/ui/badge"

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select items..." }: MultiSelectProps) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.length === 0 && <span className="text-sm text-muted-foreground">{placeholder}</span>}
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <Badge
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleOption(option.value)}
          >
            {option.label}
          </Badge>
        );
      })}
    </div>
  );
}
