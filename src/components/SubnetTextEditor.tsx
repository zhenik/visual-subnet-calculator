"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Typography,
    Snackbar,
    Alert,
    Button,
    Stack,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setSubnets } from "@/store/subnetSlice";
import { Address4 } from "ip-address";

const SubnetsTextEditor: React.FC = () => {
    const dispatch = useDispatch();
    const subnets = useSelector((state: RootState) => state.subnets.subnets);
    const [text, setText] = useState("");
    const [error, setError] = useState(false);
    const [format, setFormat] = useState<"json" | "text">("json");

    // Sync Redux state to editor initially
    useEffect(() => {
        if (format === "json") {
            setText(JSON.stringify(subnets.map(({ cidr, description, color }) => ({ cidr, description, color })), null, 2));
        } else {
            const textFormat = subnets
                .map(({ cidr, description = "", color }) => `${cidr} ${description}${color ? ` ${color}` : ""}`.trim())
                .join("\n");
            setText(textFormat);
        }
    }, [subnets, format]);

    // Helper to calculate missing fields from CIDR
    const enrichSubnet = (item: { cidr: string; description?: string; color?: string }) => {
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

    // Handle Update click
    const handleUpdate = () => {
        try {
            let parsed: any[] = [];

            if (format === "json") {
                parsed = JSON.parse(text);
            } else {
                parsed = text
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line)
                    .map((line) => {
                        const parts = line.split(" ");
                        const cidr = parts[0];
                        const color = parts.length > 2 && /^#/.test(parts[parts.length - 1]) ? parts.pop() : undefined;
                        const description = parts.slice(1).join(" ");
                        return { cidr, description, color };
                    });
            }

            if (Array.isArray(parsed)) {
                dispatch(setSubnets([])); // Reset before update
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

            <RadioGroup
                row
                value={format}
                onChange={(e) => setFormat(e.target.value as "json" | "text")}
                sx={{ mb: 2 }}
            >
                <FormControlLabel value="json" control={<Radio />} label="JSON" />
                <FormControlLabel value="text" control={<Radio />} label="Text" />
            </RadioGroup>

            <TextField
                label="Subnets"
                multiline
                rows={20}
                fullWidth
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleUpdate}>Update</Button>
            </Stack>

            <Snackbar
                open={error}
                autoHideDuration={1500}
                onClose={() => setError(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={() => setError(false)} severity="error" sx={{ width: "100%" }}>
                    Invalid format. Please correct the input.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SubnetsTextEditor;