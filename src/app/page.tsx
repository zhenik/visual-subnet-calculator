"use client";

import React, { useState } from "react";
import { Checkbox, FormControlLabel, Typography, Container, Box } from "@mui/material";
import { Address4 } from "ip-address";
import SubnetTable from "@/components/SubnetTable";
import SubnetInput from "@/components/SubnetInput";
import SubnetsTextEditor from "@/components/SubnetTextEditor";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setSubnets } from "@/store/subnetSlice";

export default function Home() {
    const [network, setNetwork] = useState("10.100.8.0");
    const [mask, setMask] = useState(21);
    const [showColumns, setShowColumns] = useState({
        subnetAddress: true,
        netmask: true,
        range: true,
        useableIPs: true,
        hosts: true,
        description: true,
        divide: true,
        join: true,
    });
    const subnets = useSelector((state: RootState) => state.subnets.subnets);
    const dispatch = useDispatch();

    const toggleColumn = (column: keyof typeof showColumns) => {
        setShowColumns({ ...showColumns, [column]: !showColumns[column] });
    };

    const calculateSubnet = () => {
        try {
            const ip = new Address4(`${network}/${mask}`);
            const firstUsableIP = ip.startAddress().bigInt() + BigInt(1);
            const lastUsableIP = ip.endAddress().bigInt() - BigInt(1);
            const totalHosts = Number(ip.endAddress().bigInt() - ip.startAddress().bigInt()) + 1;

            const newSubnet = {
                subnet: ip.correctForm() + "/" + ip.subnetMask,
                netmask: ip.subnetMask.toString(),
                range: `${ip.startAddress().correctForm()} - ${ip.endAddress().correctForm()}`,
                useableIPs: `${Address4.fromBigInt(firstUsableIP).correctForm()} - ${Address4.fromBigInt(lastUsableIP).correctForm()}`,
                hosts: totalHosts,
                cidr: ip.correctForm() + "/" + mask,
            };

            dispatch(setSubnets([newSubnet]));
        } catch (error) {
            console.error("Invalid IP address or mask", error);
            alert("Invalid network or subnet mask.");
        }
    };

    const handleReset = () => {
        setNetwork("192.168.0.0");
        setMask(16);
        dispatch(setSubnets([]));
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Visual Subnet Calculator
            </Typography>

            {/* Subnet Input */}
            <SubnetInput
                network={network}
                mask={mask}
                setNetwork={setNetwork}
                setMask={setMask}
                onCalculate={calculateSubnet}
                onReset={handleReset}
            />

            {/* Column Toggles */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                {Object.keys(showColumns).map((key) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Checkbox
                                checked={showColumns[key as keyof typeof showColumns]}
                                onChange={() => toggleColumn(key as keyof typeof showColumns)}
                            />
                        }
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                    />
                ))}
            </Box>

            {/* Table + Editor in side-by-side layout */}
            <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start", mt: 2 }}>
                <Box sx={{ flex: 2 }}>
                    <SubnetTable subnets={subnets} showColumns={showColumns} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <SubnetsTextEditor />
                </Box>
            </Box>
        </Container>
    );
}
