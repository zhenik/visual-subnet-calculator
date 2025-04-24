"use client";

import React, { useState } from "react";
import { Typography, Container, Box } from "@mui/material";
import { Address4 } from "ip-address";
import SubnetTable from "@/components/SubnetTable";
import SubnetInput from "@/components/SubnetInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setSubnets } from "@/store/subnetSlice";
import SubnetsTextEditor from "@/components/SubnetsTextEditor";
import ColumnToggles from "@/components/ColumnToggles";
import styles from "./page.module.css";

export default function Home() {
	const [network, setNetwork] = useState("192.168.0.0");
	const [mask, setMask] = useState(16);
	const [showColumns, setShowColumns] = useState({
		subnetAddress: true,
		netmask: true,
		range: true,
		useableIPs: true,
		hosts: true,
		description: true,
		color: true,
		divide: true,
		join: true,
	});
	const subnets = useSelector((state: RootState) => state.subnets.subnets);
	const dispatch = useDispatch();

	const toggleColumn = (column: keyof typeof showColumns) => {
		setShowColumns({ ...showColumns, [column]: !showColumns[column] });
	};

	const calculateSubnet = () => {
		try {
			const ip = new Address4(`${network}/${mask}`);
			const firstUsableIP = ip.startAddress().bigInt() + BigInt(1);
			const lastUsableIP = ip.endAddress().bigInt() - BigInt(1);
			const totalHosts =
				Number(ip.endAddress().bigInt() - ip.startAddress().bigInt()) +
				1;

			const newSubnet = {
				subnet: ip.correctForm() + "/" + ip.subnetMask,
				netmask: ip.subnetMask.toString(),
				range: `${ip.startAddress().correctForm()} - ${ip
					.endAddress()
					.correctForm()}`,
				useableIPs: `${Address4.fromBigInt(
					firstUsableIP
				).correctForm()} - ${Address4.fromBigInt(
					lastUsableIP
				).correctForm()}`,
				hosts: totalHosts,
				cidr: ip.correctForm() + "/" + mask,
			};

			dispatch(setSubnets([newSubnet]));
		} catch (error) {
			console.error("Invalid IP address or mask", error);
			alert("Invalid network or subnet mask.");
		}
	};

	const handleReset = () => {
		setNetwork("192.168.0.0");
		setMask(16);
		dispatch(setSubnets([]));
	};

	const setRootNetwork = (network: string, mask: number) => {
		setNetwork(network);
		setMask(mask);
	};

	return (
		<Container
			maxWidth={false}
			disableGutters
			sx={{
				display: "flex",
				flexDirection: "row",
				color: "var(--primary-dark)",
			}}
		>
			<Container
				maxWidth={false}
				disableGutters
				sx={{
					display: "flex",
					width: "70%",
					height: "100vh",
					flexDirection: "column",
					gap: 2,
					py: 4,
					pl: "5%",
					backgroundColor: "var(--primary-light)",
				}}
			>
				<Typography
					variant="h1"
					sx={{
						mr: 4,
						fontSize: "var(--font-size-2xl)",
						fontWeight: 400,
						lineHeight: 1.235,
						height: "2rem",
					}}
				>
					Visual Subnet Calculator
				</Typography>

				<div className={styles.horizontal_line_dark}></div>

				<Box
					sx={{
						display: "flex",
						width: "70%",
						mr: 4,
						height: "100%",
						flexDirection: { xs: "column", md: "row" },
						gap: 2,
					}}
				>
					<Box sx={{ flex: 7 }}>
						<SubnetInput
							network={network}
							mask={mask}
							setNetwork={setNetwork}
							setMask={setMask}
							onCalculate={calculateSubnet}
							onReset={handleReset}
						/>

						<ColumnToggles
							showColumns={showColumns}
							toggleColumn={toggleColumn}
						/>

						<SubnetTable
							subnets={subnets}
							showColumns={showColumns}
						/>
					</Box>
				</Box>
			</Container>

			{/* Subnets editor */}
			<Container
				maxWidth={false}
				disableGutters
				sx={{
					display: "flex",
					width: "30%",
					height: "100vh",
					flexDirection: "row",
					gap: 2,
					backgroundColor: "var(--primary-dark)",
					py: 4,
					pr: "5%",
				}}
			>
				<Box
					sx={{
						display: "flex",
						width: "100%",
						flexDirection: { xs: "column", md: "row" },
						gap: 2,
					}}
				>
					<Box sx={{ flex: 5 }}>
						<SubnetsTextEditor setRootNetwork={setRootNetwork} />
					</Box>
				</Box>
			</Container>
		</Container>
	);
}
