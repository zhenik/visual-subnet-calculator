import React from "react";
import { TableRow, TableCell, Button, TextField } from "@mui/material";
import { Address4 } from "ip-address";
import { Subnet } from "@/types/subnet";

interface ShowColumns {
    subnetAddress: boolean;
    netmask: boolean;
    range: boolean;
    useableIPs: boolean;
    hosts: boolean;
    description: boolean;
    color: boolean;
    divide: boolean;
    join: boolean;
}

interface SubnetRowProps {
    index: number;
    subnet: Subnet;
    showColumns: ShowColumns;
    editedDescription?: string;
    editableDescription?: boolean;
    onDescriptionChange?: (index: number, value: string) => void;
    onDescriptionBlur?: (index: number) => void;
    onDivide?: (index: number) => void;
    onJoin?: (index: number) => void;
    color?: string;
    onColorChange?: (index: number, value: string) => void;
}

const SubnetRow: React.FC<SubnetRowProps> = ({
                                                 subnet,
                                                 index,
                                                 showColumns,
                                                 onDivide,
                                                 onJoin,
                                                 editableDescription,
                                                 editedDescription,
                                                 onDescriptionChange,
                                                 onDescriptionBlur,
                                                 color,
                                                 onColorChange,
                                             }) => {
    const isJoinable = (subnet: Subnet) => {
        try {
            const s = new Address4(subnet.cidr);
            return s.subnetMask > 0 && s.subnetMask < 32;
        } catch {
            return false;
        }
    };

    const isDividable = (subnet: Subnet) => {
        try {
            const s = new Address4(subnet.cidr);
            return s.subnetMask < 32;
        } catch {
            return false;
        }
    };

    return (
        <TableRow
            sx={{
                backgroundColor: subnet.color ?? (subnet.description ? "#e5fbe5" : "transparent"),
            }}
        >
            {showColumns.subnetAddress && <TableCell>{subnet.cidr}</TableCell>}
            {showColumns.netmask && <TableCell>{subnet.netmask}</TableCell>}
            {showColumns.range && <TableCell>{subnet.range}</TableCell>}
            {showColumns.useableIPs && <TableCell>{subnet.useableIPs}</TableCell>}
            {showColumns.hosts && <TableCell>{subnet.hosts}</TableCell>}

            {showColumns.description && (
                <TableCell>
                    {editableDescription ? (
                        <TextField
                            variant="standard"
                            value={editedDescription ?? subnet.description ?? ""}
                            onChange={(e) => onDescriptionChange?.(index, e.target.value)}
                            onBlur={() => onDescriptionBlur?.(index)}
                            fullWidth
                        />
                    ) : (
                        subnet.description
                    )}
                </TableCell>
            )}

            {showColumns.color && (
                <TableCell>
                    <input
                        type="color"
                        value={color ?? subnet.color ?? "#ffffff"}
                        onChange={(e) => onColorChange?.(index, e.target.value)}
                        style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer" }}
                    />
                </TableCell>
            )}

            {showColumns.divide && isDividable(subnet) && (
                <TableCell>
                    <Button color="primary" onClick={() => onDivide?.(index)}>
                        Divide
                    </Button>
                </TableCell>
            )}

            {showColumns.join && isJoinable(subnet) && (
                <TableCell>
                    <Button color="primary" onClick={() => onJoin?.(index)}>
                        Join
                    </Button>
                </TableCell>
            )}
        </TableRow>
    );
};

export default SubnetRow;
