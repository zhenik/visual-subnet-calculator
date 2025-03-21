"use client";

import React, { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel, Typography, Container, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import { Address4 } from "ip-address";

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


    const [subnets, setSubnets] = useState<{ subnet: string; range: string; useableIPs: string; hosts: number }[]>([]);

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
                netmask: ip.subnetMask,
                range: `${ip.startAddress().correctForm()} - ${ip.endAddress().correctForm()}`,
                useableIPs: `${Address4.fromBigInt(firstUsableIP).correctForm()} - ${Address4.fromBigInt(lastUsableIP).correctForm()}`,
                hosts: totalHosts,
            };

            setSubnets([newSubnet]); // Update state with a single subnet
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

    const divideSubnet = (index: number) => {
        const subnet = subnets[index];
        // Ensure it's a valid subnet
        const parts = subnet.subnet.split("/");
        if (parts.length !== 2) {
            console.error("Invalid subnet format!", subnet.subnet);
            return;
        }

        const [ip, prefix] = parts;
        const newMask = parseInt(prefix, 10) + 1;

        if (isNaN(newMask)) {
            console.error("Invalid subnet mask:", prefix);
            return;
        }

        if (newMask > 32) {
            alert("Cannot divide further.");
            return;
        }

        if (!Address4.isValid(ip)) {
            alert(`Invalid IP address: ${ip}`);
            return;
        }

        const subnet1 = new Address4(`${ip}/${newMask}`);
        const nextSubnetStart = subnet1.endAddress().bigInt() + BigInt(1); // First IP of next subnet
        const nextSubnetIp = Address4.fromBigInt(nextSubnetStart); // Convert BigInt to Address4
        const subnet2 = new Address4(`${nextSubnetIp.correctForm()}/${newMask}`);

        const calculateSubnetDetails = (subnetObj: Address4) => {
            const firstUsableIP = subnetObj.startAddress().bigInt() + BigInt(1);
            const lastUsableIP = subnetObj.endAddress().bigInt() - BigInt(1);
            const totalHosts = Number(subnetObj.endAddress().bigInt() - subnetObj.startAddress().bigInt()) + 1;

            return {
                subnet: subnetObj.correctForm() + "/" + subnetObj.subnetMask,
                range: `${subnetObj.startAddress().correctForm()} - ${subnetObj.endAddress().correctForm()}`,
                useableIPs: `${Address4.fromBigInt(firstUsableIP).correctForm()} - ${Address4.fromBigInt(lastUsableIP).correctForm()}`,
                hosts: totalHosts,
            };
        };

        const newSubnets = [...subnets];
        newSubnets.splice(index, 1, calculateSubnetDetails(subnet1), calculateSubnetDetails(subnet2));

        setSubnets(newSubnets);
    };


    const joinSubnets = (index: number) => {
        // if (index < subnets.length - 1) {
        //     const subnet1 = new Address4(subnets[index].subnet);
        //     const subnet2 = new Address4(subnets[index + 1].subnet);
        //
        //     // Ensure they are adjacent and have the same mask
        //     const nextSubnetStart = subnet1.endAddress().bigInt() + BigInt(1); // Compute next subnet's first address
        //     if (subnet1.subnetMask !== subnet2.subnetMask || Address4.fromBigInt(nextSubnetStart).correctForm() !== subnet2.startAddress().correctForm()) {
        //         alert("These subnets cannot be joined.");
        //         return;
        //     }
        //
        //     // Reduce mask by 1 to merge
        //     const newMask: number = subnet1.subnetMask - 1;
        //     const mergedSubnet = new Address4(`${subnet1.startAddress().correctForm()}/${newMask}`);
        //
        //     const newSubnets = [...subnets];
        //     newSubnets.splice(index, 2,
        //         {
        //             subnet: mergedSubnet.correctForm(),
        //             range: `${mergedSubnet.startAddress().correctForm()} - ${mergedSubnet.endAddress().correctForm()}`,
        //             useableIPs: `${mergedSubnet.startAddress().address} - ${mergedSubnet.endAddress().address}`,
        //             hosts: Number(mergedSubnet.endAddress().bigInt() - mergedSubnet.startAddress().bigInt()) - 1,
        //         }
        //     );
        //
        //     setSubnets(newSubnets);
        // }
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

            {/* Subnet Table */}
            <Table sx={{ border: "1px solid #ddd" }}>
                <TableHead>
                    <TableRow>
                        {showColumns.subnetAddress && <TableCell><strong>Subnet Address</strong></TableCell>}
                        {showColumns.netmask && <TableCell><strong>Netmask</strong></TableCell>}
                        {showColumns.range && <TableCell><strong>Range of Addresses</strong></TableCell>}
                        {showColumns.useableIPs && <TableCell><strong>Useable IPs</strong></TableCell>}
                        {showColumns.hosts && <TableCell><strong>Hosts</strong></TableCell>}
                        {showColumns.divide && <TableCell><strong>Divide</strong></TableCell>}
                        {showColumns.join && <TableCell><strong>Join</strong></TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {subnets.map((subnet, index) => (
                        <TableRow key={index}>
                            {showColumns.subnetAddress && <TableCell>{subnet.subnet}</TableCell>}
                            {showColumns.netmask && <TableCell>{new Address4(subnet.subnet).subnetMask}</TableCell>}
                            {showColumns.range && <TableCell>{subnet.range}</TableCell>}
                            {showColumns.useableIPs && <TableCell>{subnet.useableIPs}</TableCell>}
                            {showColumns.hosts && <TableCell>{subnet.hosts}</TableCell>}
                            {showColumns.divide && (
                                <TableCell>
                                    <Button variant="text" color="primary" onClick={() => divideSubnet(index)}>
                                        Divide
                                    </Button>
                                </TableCell>
                            )}
                            {showColumns.join && index < subnets.length - 1 && (
                                <TableCell>
                                    <Button variant="text" color="primary" onClick={() => joinSubnets(index)}>
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
