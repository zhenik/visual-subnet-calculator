"use client";

import React, { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel, Typography, Container, Box } from "@mui/material";
import { Address4 } from "ip-address";
import SubnetTable from "@/components/SubnetTable"; // ✅ Import SubnetTable

export default function Home() {
    const [network, setNetwork] = useState("192.168.0.0");
    const [mask, setMask] = useState(16);
    const [showColumns, setShowColumns] = useState({
        subnetAddress: true,
        netmask: true,
        range: true,
        useableIPs: true,
        hosts: true,
        divide: true,
        join: true,
    });

    const toggleColumn = (column: keyof typeof showColumns) => {
        setShowColumns({ ...showColumns, [column]: !showColumns[column] });
    };

    const [subnets, setSubnets] = useState<{ subnet: string; netmask: string; range: string; useableIPs: string; hosts: number; cidr: string }[]>([]);

    // Function to calculate subnets
    const calculateSubnet = () => {
        try {
            const ip = new Address4(`${network}/${mask}`);

            // First and last usable IPs (excluding network & broadcast addresses)
            const firstUsableIP = ip.startAddress().bigInt() + BigInt(1);
            const lastUsableIP = ip.endAddress().bigInt() - BigInt(1);

            // Compute total hosts (including network and broadcast addresses)
            const totalHosts = Number(ip.endAddress().bigInt() - ip.startAddress().bigInt()) + 1;

            const newSubnet = {
                subnet: ip.correctForm() + "/" + ip.subnetMask,
                netmask: ip.subnetMask.toString(),
                range: `${ip.startAddress().correctForm()} - ${ip.endAddress().correctForm()}`,
                useableIPs: `${Address4.fromBigInt(firstUsableIP).correctForm()} - ${Address4.fromBigInt(lastUsableIP).correctForm()}`,
                hosts: totalHosts,
                cidr: ip.correctForm() + "/" + mask, // Add cidr property
            };

            setSubnets([{ ...newSubnet }]); // Update state with a single subnet
        } catch (error) {
            console.error("Invalid IP address or mask", error);
            alert("Invalid network or subnet mask.");
        }
    };

    // Reset to default values
    const handleReset = () => {
        setNetwork("192.168.0.0");
        setMask(16);
        setSubnets([]);
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Visual Subnet Calculator
            </Typography>

            {/* Input Fields */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField label="Network Address" variant="outlined" size="small" value={network} onChange={(e) => setNetwork(e.target.value)} />
                <TextField label="Mask bits" type="number" variant="outlined" size="small" value={mask} onChange={(e) => setMask(Number(e.target.value))} />
                <Button variant="contained" onClick={calculateSubnet}>Update</Button>
                <Button variant="outlined" color="secondary" onClick={handleReset}>Reset</Button>
            </Box>

            {/* Column Visibility Checkboxes */}
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
                        label={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize first letter
                    />
                ))}
            </Box>

            <SubnetTable subnets={subnets} showColumns={showColumns} />
        </Container>
    );
}
