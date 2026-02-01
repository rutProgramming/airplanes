import type { Dispatch, SetStateAction } from "react";
import type { Filters } from "../Types/Filters";

export interface FilterBarProps {
    filters: Filters;
    setFilters: Dispatch<SetStateAction<Filters>>;
    uniqueTypes: string[];
}