"use client"; // Ensure this is a client component

import React from "react";
import dynamic from "next/dynamic";
import { Typography } from "@mui/material";
import SubnetInput from "../components/SubnetInput";
import SubnetTable from "../components/SubnetTable";

// Dynamically import MUI's Container without SSR
const Container = dynamic(() => import("@mui/material").then((mod) => mod.Container), { ssr: false });

export default function Home() {
    return (
        <Container>
            <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
                Visual Subnet Calculator (Next.js)
            </Typography>
            <SubnetInput />
            <SubnetTable />
        </Container>
    );
}
