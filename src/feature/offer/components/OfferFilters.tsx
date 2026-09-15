import { actions } from "astro:actions";
import Combobox from "@core/components/Combobox";
import { useCallback, useRef, useState } from "react";

export interface OfferFiltersState {
  search: string;
  status: string;
  phoneValues: string[];
  addressValues: string[];
  phoneEmpty: boolean;
  addressEmpty: boolean;
  sortBy: "CompanyName" | "JobTitle" | "Status" | "CreatedAt";
  sortOrder: "asc" | "desc";
}

interface OfferFiltersProps {
  onFilterChange: (filters: OfferFiltersState) => void;
}

export default function OfferFilters({ onFilterChange }: OfferFiltersProps) {
  const [filters, setFilters] = useState<OfferFiltersState>({
    search: "",
    status: "",
    phoneValues: [],
    addressValues: [],
    phoneEmpty: false,
    addressEmpty: false,
    sortBy: "CreatedAt",
    sortOrder: "desc",
  });

  const [phoneOptions, setPhoneOptions] = useState<string[]>([]);
  const [addressOptions, setAddressOptions] = useState<string[]>([]);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const phoneFetched = useRef(false);
  const addressFetched = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const emitChange = useCallback(
    (next: Partial<OfferFiltersState>) => {
      const updated = { ...filters, ...next };
      setFilters(updated);
      onFilterChange(updated);
    },
    [filters, onFilterChange],
  );

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        emitChange({ search: value });
      }, 300);
    },
    [emitChange],
  );

  const fetchPhoneOptions = useCallback(async () => {
    if (phoneFetched.current) return;
    phoneFetched.current = true;
    setPhoneLoading(true);
    const { data } = await actions.offer.getFilterValues();
    if (data?.success) {
      setPhoneOptions(data.phones);
    }
    setPhoneLoading(false);
  }, []);

  const fetchAddressOptions = useCallback(async () => {
    if (addressFetched.current) return;
    addressFetched.current = true;
    setAddressLoading(true);
    const { data } = await actions.offer.getFilterValues();
    if (data?.success) {
      setAddressOptions(data.addresses);
    }
    setAddressLoading(false);
  }, []);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search company or title..."
        defaultValue=""
        onChange={(e) => debouncedSearch(e.target.value)}
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <div className="w-[200px]">
        <Combobox
          label="Phone"
          options={phoneOptions}
          selected={filters.phoneValues}
          onChange={(phoneValues) => emitChange({ phoneValues })}
          includeEmpty
          placeholder="Search phones..."
          loading={phoneLoading}
          onOpen={fetchPhoneOptions}
        />
      </div>
      <div className="w-[200px]">
        <Combobox
          label="Address"
          options={addressOptions}
          selected={filters.addressValues}
          onChange={(addressValues) => emitChange({ addressValues })}
          includeEmpty
          placeholder="Search addresses..."
          loading={addressLoading}
          onOpen={fetchAddressOptions}
        />
      </div>
      <select
        value={filters.status}
        onChange={(e) => emitChange({ status: e.target.value })}
        className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All statuses</option>
        <option value="Applied">Applied</option>
        <option value="Interview">Interview</option>
        <option value="Offer">Offer</option>
        <option value="Declined">Declined</option>
      </select>
      <select
        value={filters.sortBy}
        onChange={(e) =>
          emitChange({
            sortBy: e.target.value as OfferFiltersState["sortBy"],
          })
        }
        className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="CreatedAt">Date</option>
        <option value="CompanyName">Name</option>
        <option value="JobTitle">Title</option>
        <option value="Status">Status</option>
      </select>
      <button
        type="button"
        onClick={() =>
          emitChange({
            sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
          })
        }
        className="px-3 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        title={`Sort ${filters.sortOrder === "asc" ? "descending" : "ascending"}`}
      >
        {filters.sortOrder === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
}
