"use client";

import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, Snackbar, Alert } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setSubnets } from "@/store/subnetSlice";

const SubnetsTextEditor: React.FC = () => {
    const dispatch = useDispatch();
    const subnets = useSelector((state: RootState) => state.subnets.subnets);
    const [text, setText] = useState("");
    const [error, setError] = useState(false);

    // Sync Redux state to editor
    useEffect(() => {
        const reduced = subnets.map(({ cidr, description, color }) => ({ cidr, description, ...(color && { color }) }));
        setText(JSON.stringify(reduced, null, 2));
    }, [subnets]);

    // Sync editor changes back to Redux
    const handleChange = (value: string) => {
        setText(value);
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                const updatedSubnets = subnets.map((subnet, i) => ({
                    ...subnet,
                    cidr: parsed[i]?.cidr ?? subnet.cidr,
                    description: parsed[i]?.description ?? subnet.description,
                    color: parsed[i]?.color ?? subnet.color,
                }));
                dispatch(setSubnets(updatedSubnets));
                setError(false);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError(true);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
                Subnet CIDR, Description & Color
            </Typography>
            <TextField
                label="Subnets JSON (cidr, description, color)"
                multiline
                rows={20}
                fullWidth
                variant="outlined"
                value={text}
                onChange={(e) => handleChange(e.target.value)}
            />
            <Snackbar
                open={error}
                autoHideDuration={1500}
                onClose={() => setError(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: "100%" }}>
                    Invalid JSON format. Please correct the input.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SubnetsTextEditor;