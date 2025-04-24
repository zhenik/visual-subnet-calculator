"use client";

import React, { useState, useEffect } from "react";
import {
	Box,
	TextField,
	Typography,
	Snackbar,
	Alert,
	Button,
	Stack,
	RadioGroup,
	FormControlLabel,
	Radio,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setSubnets } from "@/store/subnetSlice";
import { Address4 } from "ip-address";
import styles from "./SubnetsTextEditor.module.css";

interface SubnetsTextEditorProps {
	setRootNetwork?: (network: string, mask: number) => void;
}

const SubnetsTextEditor: React.FC<SubnetsTextEditorProps> = ({
	setRootNetwork,
}) => {
	const dispatch = useDispatch();
	const subnets = useSelector((state: RootState) => state.subnets.subnets);
	const [text, setText] = useState("");
	const [error, setError] = useState(false);
	const [format, setFormat] = useState<"json" | "text">("json");

	useEffect(() => {
		if (format === "json") {
			setText(
				JSON.stringify(
					subnets.map(({ cidr, description, color }) => ({
						cidr,
						description,
						color,
					})),
					null,
					2
				)
			);
		} else {
			const lines = subnets.map(({ cidr, description, color }) =>
				`${cidr} ${description || ""}${color ? ` ${color}` : ""}`.trim()
			);
			setText(lines.join("\n"));
		}
	}, [subnets, format]);

	const enrichSubnet = (item: {
		cidr: string;
		description?: string;
		color?: string;
	}) => {
		try {
			const ip = new Address4(item.cidr);
			const firstUsable = ip.startAddress().bigInt() + BigInt(1);
			const lastUsable = ip.endAddress().bigInt() - BigInt(1);
			const hosts =
				Number(ip.endAddress().bigInt() - ip.startAddress().bigInt()) +
				1;

			return {
				cidr: item.cidr,
				description: item.description || "",
				color: item.color,
				netmask: ip.subnetMask.toString(),
				range: `${ip.startAddress().correctForm()} - ${ip
					.endAddress()
					.correctForm()}`,
				useableIPs: `${Address4.fromBigInt(
					firstUsable
				).correctForm()} - ${Address4.fromBigInt(
					lastUsable
				).correctForm()}`,
				hosts,
			};
		} catch {
			return null;
		}
	};

	const parseTextFormat = (input: string) => {
		const lines = input.trim().split("\n");
		return lines.map((line) => {
			const [cidr, ...rest] = line.trim().split(/\s+/);
			const colorMatch = rest[rest.length - 1]?.startsWith("#")
				? rest.pop()
				: undefined;
			const description = rest.join(" ");
			return { cidr, description, color: colorMatch };
		});
	};

	const findCommonRoot = (
		cidrs: string[]
	): { network: string; mask: number } | null => {
		try {
			const ips = cidrs.map((c) => new Address4(c));
			const base = ips[0];
			let mask = base.subnetMask;

			for (let i = 1; i < ips.length; i++) {
				while (
					!base.isInSubnet(
						new Address4(
							`${ips[i].startAddress().correctForm()}/${mask}`
						)
					)
				) {
					mask--;
					if (mask < 0) return null;
				}
			}

			return { network: base.startAddress().correctForm(), mask };
		} catch {
			return null;
		}
	};

	const handleUpdate = () => {
		try {
			let parsed: any[] = [];

			if (format === "json") {
				parsed = JSON.parse(text);
			} else {
				parsed = parseTextFormat(text);
			}

			if (Array.isArray(parsed)) {
				const cidrs = parsed.map((s) => s.cidr);
				const root = findCommonRoot(cidrs);
				if (root && setRootNetwork) {
					console.log("Root: " + JSON.stringify(root));
					setRootNetwork(root.network, root.mask);
				}

				const enriched = parsed
					.map(enrichSubnet)
					.filter((s): s is Exclude<typeof s, null> => s !== null);
				dispatch(setSubnets(enriched));
				setError(false);
			}
		} catch (err) {
			setError(true);
			console.error("Error parsing input", err);
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				color: "var(--primary-light)",
				gap: 2,
			}}
		>
			<Typography
				variant="h2"
				gutterBottom
				sx={{
					pl: 4,
					mb: 0,
					fontSize: "var(--font-size-xl)",
					fontWeight: 400,
					lineHeight: 1.235,
					height: "2rem",
					display: "flex",
					alignItems: "flex-end",
				}}
			>
				Subnets Editor
			</Typography>

			<div className={styles.horizontal_line_light}></div>

			<RadioGroup
				row
				value={format}
				onChange={(e) => setFormat(e.target.value as "json" | "text")}
				sx={{
					mb: 2,
					pl: 4,
					"& .MuiRadio-root": {
						color: "var(--primary-light)",
					},
				}}
			>
				<FormControlLabel
					value="json"
					control={<Radio />}
					label="JSON"
				/>
				<FormControlLabel
					value="text"
					control={<Radio />}
					label="Text"
				/>
			</RadioGroup>

			<TextField
				label="Subnets"
				multiline
				rows={20}
				variant="outlined"
				value={text}
				onChange={(e) => setText(e.target.value)}
				sx={{
					ml: 4,
					"& label.Mui-focused": {
						color: "white",
						transition: "all 0.3s ease-in-out",
					},
					"& .MuiOutlinedInput-root": {
						"& fieldset": {
							borderColor: "var(--primary-light)",
							color: "var(--primary-light)",
						},
						"&:hover fieldset": {
							borderColor: "white",
							transition: "all 0.3s ease-in-out",
						},
						"&.Mui-focused fieldset": {
							borderColor: "white",
							borderWidth: 1,
							transition: "all 0.3s ease-in-out",
						},
					},

					"& .MuiFormLabel-root": {
						color: "var(--primary-light)",
					},

					"& .MuiInputBase-input": {
						color: "var(--primary-light)",
					},
				}}
			/>
			<Stack direction="row" spacing={2} sx={{ mt: 2, pl: 4 }}>
				<Button variant="contained" onClick={handleUpdate}>
					Update
				</Button>
			</Stack>

			<Snackbar
				open={error}
				autoHideDuration={1500}
				onClose={() => setError(false)}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					onClose={() => setError(false)}
					severity="error"
					sx={{ width: "100%" }}
				>
					Invalid input format. Please check your data.
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default SubnetsTextEditor;
