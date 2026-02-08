import { Box, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { filterBarStyle, formControlStyle } from "../styles/filterBar.styles";
import type { Filters } from "../Types/Filters";
import { useCallback } from "react";
import type { FilterBarProps } from "../Types/FilterBarProps";


export default function FilterBar({
    filters,
    setFilters,
    uniqueTypes
}: FilterBarProps) {

    const toggleType = useCallback((type: string) => {
        setFilters(prev => {
            const set = new Set(prev.types ?? []);
            set.has(type) ? set.delete(type) : set.add(type);
            return { ...prev, types: [...set] };
        });
    }, [setFilters]);

    const handleNumberChange = (field: keyof Filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value === '' ? undefined : Number(value)
        }));
    };

    const handleTextChange = (field: keyof Filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value || undefined
        }));
    };

    return (
        <Box sx={filterBarStyle}>
            <TextField
                label="Search ID"
                size="small"
                value={filters.id ?? ''}
                onChange={e => handleTextChange("id", e.target.value)}
            />

            <TextField
                label="Capacity From"
                type="number"
                size="small"
                value={filters.capacityFrom ?? ''}
                onChange={e => handleNumberChange("capacityFrom", e.target.value)}
            />

            <TextField
                label="Capacity To"
                type="number"
                size="small"
                value={filters.capacityTo ?? ''}
                onChange={e => handleNumberChange("capacityTo", e.target.value)}
            />

            <TextField
                label="Size From"
                type="number"
                size="small"
                value={filters.sizeFrom ?? ''}
                onChange={e => handleNumberChange("sizeFrom", e.target.value)}
            />

            <TextField
                label="Size To"
                type="number"
                size="small"
                value={filters.sizeTo ?? ''}
                onChange={e => handleNumberChange("sizeTo", e.target.value)}
            />

            <Box>
                {uniqueTypes.map(type => (
                    <FormControlLabel
                        key={type}
                        label={type}
                        sx={formControlStyle}
                        control={
                            <Checkbox
                                checked={filters.types?.includes(type) ?? false}
                                onChange={() => toggleType(type)}
                            />
                        }
                    />
                ))}
            </Box>
        </Box>
    );
}
