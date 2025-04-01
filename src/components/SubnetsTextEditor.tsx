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
import { completeWithMissingLeafPairs } from "@/utils/subnetUtils";

interface SubnetsTextEditorProps {
    setRootNetwork?: (network: string, mask: number) => void;
}

const SubnetsTextEditor: React.FC<SubnetsTextEditorProps> = ({ setRootNetwork }) => {
    const dispatch = useDispatch();
    const subnets = useSelector((state: RootState) => state.subnets.subnets);
    const [text, setText] = useState("");
    const [error, setError] = useState(false);
    const [format, setFormat] = useState<"json" | "text">("json");

    useEffect(() => {
        if (format === "json") {
            setText(
                JSON.stringify(
                    subnets.map(({ cidr, description, color }) => ({ cidr, description, color })),
                    null,
                    2
                )
            );
        } else {
            const lines = subnets.map(({ cidr, description, color }) =>
                `${cidr} ${description || ""}${color ? ` ${color}` : ""}`.trim()
            );
            setText(lines.join("\n"));
        }
    }, [subnets, format]);

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
                isJoinable: true,
            };
        } catch {
            return null;
        }
    };

    const parseTextFormat = (input: string) => {
        const lines = input.trim().split("\n");
        return lines.map((line) => {
            const [cidr, ...rest] = line.trim().split(/\s+/);
            const colorMatch = rest[rest.length - 1]?.startsWith("#") ? rest.pop() : undefined;
            const description = rest.join(" ");
            return { cidr, description, color: colorMatch };
        });
    };

    const findCommonRoot = (cidrs: string[]): { network: string; mask: number } | null => {
        try {
            const ips = cidrs.map((c) => new Address4(c));
            const base = ips[0];
            let mask = base.subnetMask;

            for (let i = 1; i < ips.length; i++) {
                while (!base.isInSubnet(new Address4(`${ips[i].startAddress().correctForm()}/${mask}`))) {
                    mask--;
                    if (mask < 0) return null;
                }
            }

            return { network: base.startAddress().correctForm(), mask };
        } catch {
            return null;
        }
    };

    const handleUpdate = () => {
        try {
            let parsed: { cidr: string; description?: string; color?: string }[] = [];

            // 1. Parse based on format
            if (format === "json") {
                parsed = JSON.parse(text);
            } else {
                parsed = parseTextFormat(text);
            }

            // 2. Enrich
            const enriched = parsed
                .map(enrichSubnet)
                .filter((s): s is Exclude<ReturnType<typeof enrichSubnet>, null> => s !== null);

            // const sortedEnriched = sortSubnetsByStartAddress(enriched);
            const completedSubnets = completeWithMissingLeafPairs(enriched);
            console.log(completedSubnets)

            // 3. Set root network if found
            const cidrs = completedSubnets.map(s => s.cidr);
            const root = findCommonRoot(cidrs);
            if (root && setRootNetwork) {
                setRootNetwork(root.network, root.mask);
            }

            // 4. Dispatch to global state
            dispatch(setSubnets(completedSubnets));
            setError(false);
        } catch {
            setError(true);
        }
    };




    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
                Subnets Editor
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
                    Invalid input format. Please check your data.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SubnetsTextEditor;