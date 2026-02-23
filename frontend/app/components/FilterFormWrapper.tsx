"use client";

import FilterForm, { FilterState } from "./FilterForm";

interface FilterFormWrapperProps {
  onFilter: (filters: FilterState) => void;
  isLoading: boolean;
}

export default function FilterFormWrapper({
  onFilter,
  isLoading,
}: FilterFormWrapperProps) {
  return <FilterForm onFilter={onFilter} isLoading={isLoading} />;
}
