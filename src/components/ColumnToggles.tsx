"use client";

import React from "react";
import { Box, Checkbox, FormControlLabel } from "@mui/material";

type ColumnKey =
    | "subnetAddress"
    | "netmask"
    | "range"
    | "useableIPs"
    | "hosts"
    | "description"
    | "divide"
    | "join";

interface Props {
    showColumns: Record<ColumnKey, boolean>;
    toggleColumn: (column: ColumnKey) => void;
}

const ColumnToggles: React.FC<Props> = ({ showColumns, toggleColumn }) => {
    return (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            {Object.keys(showColumns)
                .filter((key) => key !== "divide" && key !== "join" && key !== "subnetAddress")
                .map((key) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Checkbox
                                checked={showColumns[key as ColumnKey]}
                                onChange={() => toggleColumn(key as ColumnKey)}
                            />
                        }
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                    />
                ))}
        </Box>
    );
};

export default ColumnToggles;
