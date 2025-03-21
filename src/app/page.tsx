"use client";

import React, { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel, Typography, Container, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import { Address4 } from "ip-address";

export default function Home() {
    // State for user input
    const [network, setNetwork] = useState("192.168.0.0");
    const [mask, setMask] = useState(16);
    const [showColumns, setShowColumns] = useState({
        subnetAddress: true,
        netmask: false,
        range: true,
        useableIPs: true,
        hosts: true,
        divide: true,
        join: true,
    });

    // Subnet results
    const [subnets, setSubnets] = useState<{ subnet: string; range: string; useableIPs: string; hosts: number }[]>([]);

    // Function to calculate subnets
    const calculateSubnet = () => {
        try {
            const ip = new Address4(`${network}/${mask}`);

            // First and last usable IPs
            const firstUsableIP = ip.startAddress().address;
            const lastUsableIP = ip.endAddress().address;

            // Compute the number of usable hosts using `bigInt()`
            const totalHosts = Number(ip.endAddress().bigInt() - ip.startAddress().bigInt()) - 1; // Exclude network & broadcast

            const newSubnet = {
                subnet: ip.correctForm(), // CIDR notation
                range: `${ip.startAddress().correctForm()} - ${ip.endAddress().correctForm()}`,
                useableIPs: `${firstUsableIP} - ${lastUsableIP}`,
                hosts: totalHosts,
            };

            setSubnets([newSubnet]); // Update state
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
                <TextField
                    label="Network Address"
                    variant="outlined"
                    size="small"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                />
                <TextField
                    label="Mask bits"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={mask}
                    onChange={(e) => setMask(Number(e.target.value))}
                />
                <Button variant="contained" onClick={calculateSubnet}>
                    Update
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleReset}>
                    Reset
                </Button>
            </Box>

            {/* Checkbox Options */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                {Object.keys(showColumns).map((key) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Checkbox
                                checked={showColumns[key as keyof typeof showColumns]}
                                onChange={() =>
                                    setShowColumns((prev) => ({ ...prev, [key]: !prev[key as keyof typeof showColumns] }))
                                }
                            />
                        }
                        label={key.replace(/([A-Z])/g, " $1").trim()}
                    />
                ))}
            </Box>

            {/* Subnet Table */}
            <Table sx={{ border: "1px solid #ddd" }}>
                <TableHead>
                    <TableRow>
                        {showColumns.subnetAddress && <TableCell>Subnet Address</TableCell>}
                        {showColumns.range && <TableCell>Range of Addresses</TableCell>}
                        {showColumns.useableIPs && <TableCell>Useable IPs</TableCell>}
                        {showColumns.hosts && <TableCell>Hosts</TableCell>}
                        {showColumns.divide && <TableCell>Divide</TableCell>}
                        {showColumns.join && <TableCell>Join</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {subnets.map((subnet, index) => (
                        <TableRow key={index}>
                            {showColumns.subnetAddress && <TableCell>{subnet.subnet}</TableCell>}
                            {showColumns.range && <TableCell>{subnet.range}</TableCell>}
                            {showColumns.useableIPs && <TableCell>{subnet.useableIPs}</TableCell>}
                            {showColumns.hosts && <TableCell>{subnet.hosts}</TableCell>}
                            {showColumns.divide && (
                                <TableCell>
                                    <Button variant="text" color="primary">
                                        Divide
                                    </Button>
                                </TableCell>
                            )}
                            {showColumns.join && (
                                <TableCell>
                                    <Button variant="text" color="primary">
                                        Join
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
}
