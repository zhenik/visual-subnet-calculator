"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import {Table, TableHead, TableRow, TableCell, TableBody, Button, TextField} from "@mui/material";
import { Address4 } from "ip-address";
import { setSubnets, Subnet } from "@/store/subnetSlice";

// Define the props interface for SubnetTable
interface SubnetTableProps {
    subnets: Subnet[];
    showColumns: {
        subnetAddress: boolean;
        netmask: boolean;
        range: boolean;
        useableIPs: boolean;
        hosts: boolean;
        description: boolean;
        divide: boolean;
        join: boolean;
    };
}

const SubnetTable: React.FC<SubnetTableProps> = ({ subnets, showColumns }) => {
    const dispatch = useDispatch();

    const [editedDescriptions, setEditedDescriptions] = useState<{ [index: number]: string }>({});
    const handleDescriptionChange = (index: number, value: string) => {
        setEditedDescriptions(prev => ({ ...prev, [index]: value }));

        const newSubnets = [...subnets];
        newSubnets[index] = {
            ...newSubnets[index],
            description: value,
        };
        dispatch(setSubnets(newSubnets));
    };

    // **Divide Subnet**
    const divideSubnet = (index: number) => {
        const subnet: Subnet = subnets[index];

        // Use `cidr` instead of `subnet`
        const [ip, prefix] = subnet.cidr.split("/");
        const newMask: number = Number(prefix) + 1; // Increase mask by 1

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
                cidr: subnetObj.correctForm() + "/" + subnetObj.subnetMask,
                netmask: subnetObj.subnetMask.toString(),
                range: `${subnetObj.startAddress().correctForm()} - ${subnetObj.endAddress().correctForm()}`,
                useableIPs: `${Address4.fromBigInt(firstUsableIP).correctForm()} - ${Address4.fromBigInt(lastUsableIP).correctForm()}`,
                hosts: totalHosts,
                description: "Auto-generated subnet",
            };
        };

        const newSubnets = [...subnets];
        newSubnets.splice(index, 1, calculateSubnetDetails(subnet1), calculateSubnetDetails(subnet2));

        dispatch(setSubnets([...newSubnets]));
    };

    // **Join Subnets**
    const joinSubnets = (index: number) => {
        if (index < subnets.length - 1) {
            const subnet1 = new Address4(subnets[index].cidr);
            const subnet2 = new Address4(subnets[index + 1].cidr);

            // Ensure they are adjacent and have the same mask
            const nextSubnetStart = subnet1.endAddress().bigInt() + BigInt(1);
            if (
                subnet1.subnetMask !== subnet2.subnetMask ||
                Address4.fromBigInt(nextSubnetStart).correctForm() !== subnet2.startAddress().correctForm()
            ) {
                alert("These subnets cannot be joined.");
                return;
            }

            // Reduce mask by 1 to merge
            const newMask: number = subnet1.subnetMask - 1;
            const mergedSubnet = new Address4(`${subnet1.startAddress().correctForm()}/${newMask}`);

            const calculateSubnetDetails = (subnetObj: Address4) => {
                const firstUsableIP = subnetObj.startAddress().bigInt() + BigInt(1);
                const lastUsableIP = subnetObj.endAddress().bigInt() - BigInt(1);
                const totalHosts = Number(subnetObj.endAddress().bigInt() - subnetObj.startAddress().bigInt()) + 1;

                return {
                    cidr: subnetObj.correctForm() + "/" + subnetObj.subnetMask,
                    netmask: subnetObj.subnetMask.toString(),
                    range: `${subnetObj.startAddress().correctForm()} - ${subnetObj.endAddress().correctForm()}`,
                    useableIPs: `${Address4.fromBigInt(firstUsableIP).correctForm()} - ${Address4.fromBigInt(lastUsableIP).correctForm()}`,
                    hosts: totalHosts,
                    description: `Auto-generated subnet`,
                };
            };

            const newSubnets = [...subnets];
            newSubnets.splice(index, 2, calculateSubnetDetails(mergedSubnet));

            dispatch(setSubnets([...newSubnets]));
        }
    };

    return (
        <Table sx={{ mt: 4, border: "1px solid #ddd", width: "100%" }}>
            <TableHead>
                <TableRow>
                    {showColumns.subnetAddress && <TableCell><strong>Subnet Address</strong></TableCell>}
                    {showColumns.netmask && <TableCell><strong>Netmask</strong></TableCell>}
                    {showColumns.range && <TableCell><strong>Range of Addresses</strong></TableCell>}
                    {showColumns.useableIPs && <TableCell><strong>Usable IPs</strong></TableCell>}
                    {showColumns.hosts && <TableCell><strong>Hosts</strong></TableCell>}
                    {showColumns.description && <TableCell><strong>Description</strong></TableCell>}
                    {showColumns.divide && <TableCell><strong>Divide</strong></TableCell>}
                    {showColumns.join && <TableCell><strong>Join</strong></TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {subnets.map((subnet, index) => (
                    <TableRow key={index}>
                        {showColumns.subnetAddress && <TableCell>{subnet.cidr}</TableCell>}
                        {showColumns.netmask && <TableCell>{subnet.netmask}</TableCell>}
                        {showColumns.range && <TableCell>{subnet.range}</TableCell>}
                        {showColumns.useableIPs && <TableCell>{subnet.useableIPs}</TableCell>}
                        {showColumns.hosts && <TableCell>{subnet.hosts}</TableCell>}
                        {showColumns.description && (
                            <TableCell>
                                <TextField
                                    variant="standard"
                                    value={editedDescriptions[index] ?? subnet.description ?? ""}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    fullWidth
                                />
                            </TableCell>
                        )}
                        {showColumns.divide && (
                            <TableCell>
                                <Button color="primary" onClick={() => divideSubnet(index)}>
                                    Divide
                                </Button>
                            </TableCell>
                        )}
                        {showColumns.join && (
                            <TableCell>
                                <Button color="primary" onClick={() => joinSubnets(index)}>
                                    Join
                                </Button>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default SubnetTable;
