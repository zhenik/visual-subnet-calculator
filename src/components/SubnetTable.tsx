"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { removeSubnet } from "@/store/subnetSlice";
import { Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";

const SubnetTable: React.FC = () => {
    const subnets = useSelector((state: RootState) => state.subnets.subnets);
    const dispatch = useDispatch();

    return (
        <Table sx={{ mt: 4, border: "1px solid #ddd" }}>
            <TableHead>
                <TableRow>
                    <TableCell>CIDR</TableCell>
                    <TableCell>Subnet Name</TableCell>
                    <TableCell>Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {subnets.map((subnet, index) => (
                    <TableRow key={index}>
                        <TableCell>{subnet.cidr}</TableCell>
                        <TableCell>{subnet.name}</TableCell>
                        <TableCell>
                            <Button color="error" onClick={() => dispatch(removeSubnet(subnet.cidr))}>
                                Remove
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default SubnetTable;
