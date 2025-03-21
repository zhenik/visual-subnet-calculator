"use client";

import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Box, Typography } from "@mui/material";
import {Address4} from "ip-address";

type Subnet = {
    subnet: string;
    range: string;
    useableIPs: string;
    hosts: number;
    netmask: string;
};

type ShowColumns = {
    subnetAddress: boolean;
    netmask: boolean;
    range: boolean;
    useableIPs: boolean;
    hosts: boolean;
    divide: boolean;
    join: boolean;
};

type SubnetTableProps = {
    subnets: Subnet[];
    showColumns: ShowColumns;
};

// Function to render the subnet tree structure
const renderSubnetTree = (index: number, total: number) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
            {index !== total - 1 && <Box sx={{ borderLeft: "2px solid gray", height: "20px", ml: 1 }} />}
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {index < total - 1 ? "├──" : "└──"}
            </Typography>
        </Box>
    );
};

const SubnetTable: React.FC<SubnetTableProps> = ({ subnets, showColumns }) => {
    return (
        <Table sx={{ mt: 4, border: "1px solid #ddd", width: "100%" }}>
            <TableHead>
                <TableRow>
                    {showColumns.subnetAddress && <TableCell><strong>Subnet Address</strong></TableCell>}
                    {showColumns.netmask && <TableCell><strong>Netmask</strong></TableCell>}
                    {showColumns.range && <TableCell><strong>Range of Addresses</strong></TableCell>}
                    {showColumns.useableIPs && <TableCell><strong>Usable IPs</strong></TableCell>}
                    {showColumns.hosts && <TableCell><strong>Hosts</strong></TableCell>}
                    {showColumns.divide && <TableCell><strong>Divide</strong></TableCell>}
                    {showColumns.join && <TableCell><strong>Join</strong></TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {subnets.map((subnet, index) => (
                    <TableRow key={index}>
                        {showColumns.subnetAddress && <TableCell>{subnet.subnet}</TableCell>}
                        {showColumns.netmask && <TableCell>{subnet.netmask}</TableCell>}
                        {showColumns.range && <TableCell>{subnet.range}</TableCell>}
                        {showColumns.useableIPs && <TableCell>{subnet.useableIPs}</TableCell>}
                        {showColumns.hosts && <TableCell>{subnet.hosts}</TableCell>}
                        {showColumns.divide && (
                            <TableCell>
                                <Button color="primary" onClick={() => console.log(`Dividing subnet ${subnet.subnet}`)}>
                                    Divide
                                </Button>
                            </TableCell>
                        )}
                        {showColumns.join && <TableCell>{renderSubnetTree(index, subnets.length)}</TableCell>}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

// const divideSubnet = (index: number) => {
//     const subnet = subnets[index];
//     // Ensure it's a valid subnet
//     const parts = subnet.subnet.split("/");
//     if (parts.length !== 2) {
//         console.error("Invalid subnet format!", subnet.subnet);
//         return;
//     }
//
//     const [ip, prefix] = parts;
//     const newMask = parseInt(prefix, 10) + 1;
//
//     if (isNaN(newMask)) {
//         console.error("Invalid subnet mask:", prefix);
//         return;
//     }
//
//     if (newMask > 32) {
//         alert("Cannot divide further.");
//         return;
//     }
//
//     if (!Address4.isValid(ip)) {
//         alert(`Invalid IP address: ${ip}`);
//         return;
//     }
//
//     const subnet1 = new Address4(`${ip}/${newMask}`);
//     const nextSubnetStart = subnet1.endAddress().bigInt() + BigInt(1); // First IP of next subnet
//     const nextSubnetIp = Address4.fromBigInt(nextSubnetStart); // Convert BigInt to Address4
//     const subnet2 = new Address4(`${nextSubnetIp.correctForm()}/${newMask}`);
//
//     const calculateSubnetDetails = (subnetObj: Address4) => {
//         const firstUsableIP = subnetObj.startAddress().bigInt() + BigInt(1);
//         const lastUsableIP = subnetObj.endAddress().bigInt() - BigInt(1);
//         const totalHosts = Number(subnetObj.endAddress().bigInt() - subnetObj.startAddress().bigInt()) + 1;
//
//         return {
//             subnet: subnetObj.correctForm() + "/" + subnetObj.subnetMask,
//             range: `${subnetObj.startAddress().correctForm()} - ${subnetObj.endAddress().correctForm()}`,
//             useableIPs: `${Address4.fromBigInt(firstUsableIP).correctForm()} - ${Address4.fromBigInt(lastUsableIP).correctForm()}`,
//             hosts: totalHosts,
//         };
//     };
//
//     const newSubnets = [...subnets];
//     newSubnets.splice(index, 1, calculateSubnetDetails(subnet1), calculateSubnetDetails(subnet2));
//
//     setSubnets(newSubnets);
// };
//
// const joinSubnets = (index: number) => {
//     if (index < subnets.length - 1) {
//         const subnet1 = new Address4(subnets[index].subnet);
//         const subnet2 = new Address4(subnets[index + 1].subnet);
//
//         // Ensure they are adjacent and have the same mask
//         const nextSubnetStart = subnet1.endAddress().bigInt() + BigInt(1);
//         if (
//             subnet1.subnetMask !== subnet2.subnetMask ||
//             Address4.fromBigInt(nextSubnetStart).correctForm() !== subnet2.startAddress().correctForm()
//         ) {
//             alert("These subnets cannot be joined.");
//             return;
//         }
//
//         // Reduce mask by 1 to merge
//         const newMask: number = subnet1.subnetMask - 1;
//         const mergedSubnet = new Address4(`${subnet1.startAddress().correctForm()}/${newMask}`);
//
//         const calculateSubnetDetails = (subnetObj: Address4) => {
//             const firstUsableIP = subnetObj.startAddress().bigInt() + BigInt(1);
//             const lastUsableIP = subnetObj.endAddress().bigInt() - BigInt(1);
//             const totalHosts = Number(subnetObj.endAddress().bigInt() - subnetObj.startAddress().bigInt()) + 1;
//
//             return {
//                 subnet: subnetObj.correctForm() + "/" + subnetObj.subnetMask,
//                 range: `${subnetObj.startAddress().correctForm()} - ${subnetObj.endAddress().correctForm()}`,
//                 useableIPs: `${Address4.fromBigInt(firstUsableIP).correctForm()} - ${Address4.fromBigInt(lastUsableIP).correctForm()}`,
//                 hosts: totalHosts,
//             };
//         };
//
//         const newSubnets = [...subnets];
//         newSubnets.splice(index, 2, calculateSubnetDetails(mergedSubnet));
//
//         setSubnets(newSubnets);
//     }
// };

export default SubnetTable;
