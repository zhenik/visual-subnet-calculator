"use client";

import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, Snackbar, Alert, Button, Stack } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setSubnets } from "@/store/subnetSlice";
import { Address4 } from "ip-address";

const SubnetsTextEditor: React.FC = () => {
    const dispatch = useDispatch();
    const subnets = useSelector((state: RootState) => state.subnets.subnets);
    const [text, setText] = useState("");
    const [error, setError] = useState(false);

    // Sync Redux state to editor initially
    useEffect(() => {
        setText(JSON.stringify(subnets.map(({ cidr, description, color }) => ({ cidr, description, color })), null, 2));
    }, [subnets]);

    // Helper to calculate missing fields from CIDR
    const enrichSubnet = (item: any) => {
        try {
            const ip = new Address4(item.cidr);
            const firstUsable = ip.startAddress().bigInt() + BigInt(1);
            const lastUsable = ip.endAddress().bigInt() - BigInt(1);
            const hosts = Number(ip.endAddress().bigInt() - ip.startAddress().bigInt()) + 1;

            return {
                cidr: item.cidr,
                description: item.description || "",
                color: item.color,
                netmask: ip.subnetMask.toString(),
                range: `${ip.startAddress().correctForm()} - ${ip.endAddress().correctForm()}`,
                useableIPs: `${Address4.fromBigInt(firstUsable).correctForm()} - ${Address4.fromBigInt(lastUsable).correctForm()}`,
                hosts,
            };
        } catch {
            return null;
        }
    };

    // Attempt to parse JSON and update Redux state
    const handleUpdate = () => {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                const enriched = parsed.map(enrichSubnet).filter((s): s is Exclude<typeof s, null> => s !== null);
                dispatch(setSubnets(enriched));
                setError(false);
            }
        } catch (err) {
            setError(true);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
                Subnet JSON Editor
            </Typography>
            <TextField
                label="Subnets JSON"
                multiline
                rows={20}
                fullWidth
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleUpdate}>Update</Button>
                <Button variant="outlined" disabled>Import</Button>
            </Stack>
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
