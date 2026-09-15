import { useCallback, useEffect, useRef, useState } from "react";

interface ComboboxProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  includeEmpty?: boolean;
  placeholder?: string;
  loading?: boolean;
  onOpen?: () => void;
}

const EMPTY_VALUE = "__empty__";

export default function Combobox({
  label,
  options,
  selected,
  onChange,
  includeEmpty = false,
  placeholder = "Type to search...",
  loading = false,
  onOpen,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef(false);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  const isItemSelected = useCallback(
    (value: string) => selected.includes(value),
    [selected],
  );

  const handleToggle = useCallback(
    (value: string) => {
      if (value === EMPTY_VALUE) {
        const emptySelected = selected.includes(EMPTY_VALUE);
        onChange(emptySelected ? selected.filter((v) => v !== EMPTY_VALUE) : [...selected, EMPTY_VALUE]);
      } else {
        onChange(
          isItemSelected(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value],
        );
      }
    },
    [selected, isItemSelected, onChange],
  );

  const handleRemove = useCallback(
    (value: string) => {
      onChange(selected.filter((v) => v !== value));
    },
    [selected, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && onOpen && !fetchedRef.current) {
      fetchedRef.current = true;
      onOpen();
    }
  }, [open, onOpen]);

  const displayValues = selected.filter((v) => v !== EMPTY_VALUE);
  const emptySelected = selected.includes(EMPTY_VALUE);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div
        className="min-h-[38px] px-2 py-1 border border-gray-300 rounded-sm text-sm flex flex-wrap gap-1 cursor-pointer focus-within:ring-2 focus-within:ring-primary-500"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {displayValues.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-sm text-xs"
          >
            {v}
            <button
              type="button"
              className="hover:text-primary-900"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(v);
              }}
            >
              &times;
            </button>
          </span>
        ))}
        {emptySelected && (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm text-xs">
            Empty
            <button
              type="button"
              className="hover:text-gray-900"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(EMPTY_VALUE);
              }}
            >
              &times;
            </button>
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={displayValues.length === 0 && !emptySelected ? placeholder : ""}
          className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-lg max-h-48 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : (
            <>
              {includeEmpty && (
                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={emptySelected}
                    onChange={() => handleToggle(EMPTY_VALUE)}
                    className="rounded"
                  />
                  <span className="text-gray-500 italic">Empty</span>
                </label>
              )}
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No results found
                </div>
              ) : (
                filtered.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={isItemSelected(option)}
                      onChange={() => handleToggle(option)}
                      className="rounded"
                    />
                    {option}
                  </label>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
