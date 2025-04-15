import React from "react";
import { TableRow, TableCell, Button, TextField } from "@mui/material";
import { Address4 } from "ip-address";
import { Subnet } from "@/store/subnetSlice";

interface Props {
    subnet: Subnet;
    index: number;
    showColumns: Record<string, boolean>;
    onDivide: (index: number) => void;
    onJoin: (index: number) => void;
    editableDescription?: boolean;
    editedDescription?: string;
    onDescriptionChange?: (index: number, value: string) => void;
    onDescriptionBlur?: (index: number) => void;
    editedColor?: string;
    onColorChange? : (index: number, value: string) => void;
}

const SubnetRow: React.FC<Props> = ({
                                        subnet,
                                        index,
                                        showColumns,
                                        onDivide,
                                        onJoin,
                                        editableDescription,
                                        editedDescription,
                                        onDescriptionChange,
                                        onDescriptionBlur,
                                        editedColor,
                                        onColorChange
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
                        value={editedColor ?? subnet.color ?? "#ffffff"}
                        onChange={(e) => onColorChange?.(index, e.target.value)}
                        style={{ width: "100%", border: "none", background: "transparent" }}
                    />
                </TableCell>
            )}
            {showColumns.divide && isDividable(subnet) && (
                <TableCell>
                    <Button color="primary" onClick={() => onDivide(index)}>
                        Divide
                    </Button>
                </TableCell>
            )}
            {showColumns.join && isJoinable(subnet) && (
                <TableCell>
                    <Button color="primary" onClick={() => onJoin(index)}>
                        Join
                    </Button>
                </TableCell>
            )}
        </TableRow>
    );
};

export default SubnetRow;
