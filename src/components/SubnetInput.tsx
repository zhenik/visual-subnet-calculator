"use client";

import React from "react";
import { TextField, Button, Box } from "@mui/material";

interface SubnetInputProps {
	network: string;
	mask: number;
	setNetwork: (value: string) => void;
	setMask: (value: number) => void;
	onCalculate: () => void;
	onReset: () => void;
}

const SubnetInput: React.FC<SubnetInputProps> = ({
	network,
	mask,
	setNetwork,
	setMask,
	onCalculate,
	onReset,
}) => {
	return (
		<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
			{/* Network Address Input */}
			<TextField
				label="Network Address"
				variant="outlined"
				size="small"
				value={network}
				onChange={(e) => setNetwork(e.target.value)}
				sx={{
					"& label.Mui-focused": {
						color: "var(--primary-dark)",
						transition: "all 0.3s ease-in-out",
					},
					"& .MuiOutlinedInput-root": {
						"& fieldset": {
							borderColor: "var(--secondary-dark)",
						},
						"&:hover fieldset": {
							borderColor: "var(--primary-dark)",
							transition: "all 0.3s ease-in-out",
						},
						"&.Mui-focused fieldset": {
							borderColor: "var(--primary-dark)",
							borderWidth: 1,
							transition: "all 0.3s ease-in-out",
						},
					},
				}}
			/>

			{/* Mask Bits Input */}
			<TextField
				label="Mask bits"
				type="number"
				variant="outlined"
				size="small"
				value={mask}
				onChange={(e) => setMask(Number(e.target.value))}
				sx={{
					"& label.Mui-focused": {
						color: "var(--primary-dark)",
						transition: "all 0.3s ease-in-out",
					},
					"& .MuiOutlinedInput-root": {
						"& fieldset": {
							borderColor: "var(--secondary-dark)",
						},
						"&:hover fieldset": {
							borderColor: "var(--primary-dark)",
							transition: "all 0.3s ease-in-out",
						},
						"&.Mui-focused fieldset": {
							borderColor: "var(--primary-dark)",
							borderWidth: 1,
							transition: "all 0.3s ease-in-out",
						},
					},
				}}
			/>

			{/* Update Button */}
			<Button variant="contained" onClick={onCalculate}>
				Update
			</Button>

			{/* Reset Button */}
			<Button variant="outlined" color="secondary" onClick={onReset}>
				Reset
			</Button>
		</Box>
	);
};

export default SubnetInput;
