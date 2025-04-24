"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import {
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Button,
	TextField,
} from "@mui/material";
import { Address4 } from "ip-address";
import { setSubnets, Subnet } from "@/store/subnetSlice";
import SubnetRow from "./SubnetRow";

interface SubnetTableProps {
	subnets: Subnet[];
	showColumns: {
		subnetAddress: boolean;
		netmask: boolean;
		range: boolean;
		useableIPs: boolean;
		hosts: boolean;
		description: boolean;
		color: boolean;
		divide: boolean;
		join: boolean;
	};
}

const SubnetTable: React.FC<SubnetTableProps> = ({ subnets, showColumns }) => {
	const dispatch = useDispatch();

	const [rowColors, setRowColors] = useState<{ [index: number]: string }>({});
	const handleColorChange = (index: number, value: string) => {
		setRowColors((prev) => ({ ...prev, [index]: value }));

		const updated = [...subnets];
		updated[index] = {
			...updated[index],
			color: value,
		};
		dispatch(setSubnets(updated));
	};

	const [editedDescriptions, setEditedDescriptions] = useState<{
		[index: number]: string;
	}>({});
	const handleDescriptionChange = (index: number, value: string) => {
		setEditedDescriptions((prev) => ({ ...prev, [index]: value }));

		const newSubnets = [...subnets];
		newSubnets[index] = {
			...newSubnets[index],
			description: value,
		};
		dispatch(setSubnets(newSubnets));
	};

	const handleDescriptionBlur = (index: number) => {
		const newSubnets = [...subnets];
		newSubnets[index].description = editedDescriptions[index];
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
		const subnet2 = new Address4(
			`${nextSubnetIp.correctForm()}/${newMask}`
		);

		const calculateSubnetDetails = (subnetObj: Address4) => {
			const firstUsableIP = subnetObj.startAddress().bigInt() + BigInt(1);
			const lastUsableIP = subnetObj.endAddress().bigInt() - BigInt(1);
			const totalHosts =
				Number(
					subnetObj.endAddress().bigInt() -
						subnetObj.startAddress().bigInt()
				) + 1;

			return {
				cidr: subnetObj.correctForm() + "/" + subnetObj.subnetMask,
				netmask: subnetObj.subnetMask.toString(),
				range: `${subnetObj.startAddress().correctForm()} - ${subnetObj
					.endAddress()
					.correctForm()}`,
				useableIPs: `${Address4.fromBigInt(
					firstUsableIP
				).correctForm()} - ${Address4.fromBigInt(
					lastUsableIP
				).correctForm()}`,
				hosts: totalHosts,
				description: "",
			};
		};

		const newSubnets = [...subnets];
		newSubnets.splice(
			index,
			1,
			calculateSubnetDetails(subnet1),
			calculateSubnetDetails(subnet2)
		);

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
				Address4.fromBigInt(nextSubnetStart).correctForm() !==
					subnet2.startAddress().correctForm()
			) {
				alert("These subnets cannot be joined.");
				return;
			}

			// Reduce mask by 1 to merge
			const newMask: number = subnet1.subnetMask - 1;
			const mergedSubnet = new Address4(
				`${subnet1.startAddress().correctForm()}/${newMask}`
			);

			const calculateSubnetDetails = (subnetObj: Address4) => {
				const firstUsableIP =
					subnetObj.startAddress().bigInt() + BigInt(1);
				const lastUsableIP =
					subnetObj.endAddress().bigInt() - BigInt(1);
				const totalHosts =
					Number(
						subnetObj.endAddress().bigInt() -
							subnetObj.startAddress().bigInt()
					) + 1;

				return {
					cidr: subnetObj.correctForm() + "/" + subnetObj.subnetMask,
					netmask: subnetObj.subnetMask.toString(),
					range: `${subnetObj
						.startAddress()
						.correctForm()} - ${subnetObj
						.endAddress()
						.correctForm()}`,
					useableIPs: `${Address4.fromBigInt(
						firstUsableIP
					).correctForm()} - ${Address4.fromBigInt(
						lastUsableIP
					).correctForm()}`,
					hosts: totalHosts,
					description: "",
				};
			};

			const newSubnets = [...subnets];
			newSubnets.splice(index, 2, calculateSubnetDetails(mergedSubnet));

			dispatch(setSubnets([...newSubnets]));
		}
	};

	return (
		<Table
			sx={{
				mt: 4,
				border: "1px solid var(--secondary-dark)",
				width: "100%",
			}}
		>
			<TableHead>
				<TableRow
					sx={{
						bgcolor: "var(--secondary-light)",
						"& th": {
							borderBottom: "1px solid var(--secondary-dark)",
							borderRight: "1px solid var(--secondary-dark)",
							lineHeight: 1,
							fontSize: "var(--font-size-small)",
							textAlign: "center",
							textTransform: "uppercase",
						},
					}}
				>
					{showColumns.subnetAddress && (
						<TableCell>
							<strong>Subnet Address</strong>
						</TableCell>
					)}
					{showColumns.netmask && (
						<TableCell>
							<strong>Netmask</strong>
						</TableCell>
					)}
					{showColumns.range && (
						<TableCell>
							<strong>Range of Addresses</strong>
						</TableCell>
					)}
					{showColumns.useableIPs && (
						<TableCell>
							<strong>Usable IPs</strong>
						</TableCell>
					)}
					{showColumns.hosts && (
						<TableCell>
							<strong>Hosts</strong>
						</TableCell>
					)}
					{showColumns.description && (
						<TableCell>
							<strong>Description</strong>
						</TableCell>
					)}
					{showColumns.color && (
						<TableCell>
							<strong>Color</strong>
						</TableCell>
					)}
					{showColumns.divide && (
						<TableCell>
							<strong>Divide</strong>
						</TableCell>
					)}
					{showColumns.join && (
						<TableCell>
							<strong>Join</strong>
						</TableCell>
					)}
				</TableRow>
			</TableHead>

			<TableBody
				sx={{
					border: "1px solid var(--secondary-dark)",
				}}
			>
				{subnets.map((subnet, index) => (
					<SubnetRow
						key={index}
						subnet={subnet}
						index={index}
						showColumns={showColumns}
						onDivide={divideSubnet}
						onJoin={joinSubnets}
						editableDescription
						editedDescription={editedDescriptions[index]}
						onDescriptionChange={handleDescriptionChange}
						onDescriptionBlur={handleDescriptionBlur}
						editedColor={rowColors[index]}
						onColorChange={handleColorChange}
					/>
				))}
			</TableBody>
		</Table>
	);
};

export default SubnetTable;
