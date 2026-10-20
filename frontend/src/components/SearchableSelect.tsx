import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableOption {
  value: string | number;
  label: string;
  searchText?: string;
}

interface SearchableSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: SearchableOption[];
  emptyOptionLabel?: string;
  emptyOptionValue?: string | number;
  emptyOptionDisabled?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  emptyOptionLabel,
  emptyOptionValue = "",
  emptyOptionDisabled = false,
  disabled = false,
  searchPlaceholder = "Ady boýunça filter...",
}: SearchableSelectProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedValue = String(value);
  const isEmptyValueSelected = selectedValue === String(emptyOptionValue);

  const selectedOption = useMemo(() => {
    if (isEmptyValueSelected) {
      return emptyOptionLabel ? { value: emptyOptionValue, label: emptyOptionLabel } : null;
    }
    return options.find((option) => String(option.value) === selectedValue) || null;
  }, [emptyOptionLabel, emptyOptionValue, isEmptyValueSelected, options, selectedValue]);

  useEffect(() => {
    if (!isOpen) {
      setSearch(isEmptyValueSelected ? "" : selectedOption?.label || "");
    }
  }, [isEmptyValueSelected, isOpen, selectedOption]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const baseOptions = emptyOptionLabel && !emptyOptionDisabled
      ? [{ value: emptyOptionValue, label: emptyOptionLabel }, ...options]
      : options;

    if (!normalized) return baseOptions;
    return baseOptions.filter((option) =>
      (option.searchText || option.label).toLowerCase().includes(normalized)
    );
  }, [emptyOptionDisabled, emptyOptionLabel, emptyOptionValue, options, search]);

  function commitValue(nextValue: string | number, nextLabel: string) {
    onChange(String(nextValue));
    setSearch(nextLabel);
    setIsOpen(false);
  }

  function handleFocus() {
    if (disabled) return;
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (!isOpen) {
      setSearch("");
    }
    setIsOpen(true);
  }

  function handleBlur() {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setSearch(isEmptyValueSelected ? "" : selectedOption?.label || "");
    }, 120);
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        disabled={disabled}
        autoComplete="off"
      />

      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 30,
            maxHeight: 220,
            overflowY: "auto",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            boxShadow: "var(--shadow-md)",
            backdropFilter: "var(--backdrop-blur)",
            WebkitBackdropFilter: "var(--backdrop-blur)",
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = String(option.value) === selectedValue;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commitValue(option.value, option.label)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    background: isSelected ? "var(--accent-surface)" : "transparent",
                    color: isSelected ? "var(--accent-text)" : "var(--text-main)",
                    border: "none",
                    borderBottom: "1px solid var(--border-color)",
                    fontSize: 14,
                  }}
                >
                  {option.label}
                </button>
              );
            })
          ) : (
            <div
              style={{
                padding: "10px 14px",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              Hiç zat tapylmady
            </div>
          )}
        </div>
      )}
    </div>
  );
}
