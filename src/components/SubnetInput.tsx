"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addSubnet } from "@/store/subnetSlice";
import { TextField, Button, Box } from "@mui/material";

const SubnetInput: React.FC = () => {
    const [cidr, setCidr] = useState("");
    const [name, setName] = useState("");
    const dispatch = useDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cidr) return;
        dispatch(addSubnet({ cidr, name: name || "Unnamed Subnet" }));
        setCidr("");
        setName("");
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
                label="CIDR (e.g., 10.100.8.0/25)"
                variant="outlined"
                size="small"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
            />
            <TextField
                label="Subnet Name"
                variant="outlined"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary">
                Add Subnet
            </Button>
        </Box>
    );
};

export default SubnetInput;
