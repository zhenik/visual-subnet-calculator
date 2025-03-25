import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Subnet {
    cidr: string;
    netmask: string;
    range: string;
    useableIPs: string;
    hosts: number;
    description?: string;
}

interface SubnetState {
    subnets: Subnet[];
}

const initialState: SubnetState = {
    subnets: [],
};

const subnetSlice = createSlice({
    name: "subnets",
    initialState,
    reducers: {
        setSubnets: (state, action: PayloadAction<Subnet[]>) => {
            state.subnets = action.payload;
        },
        addSubnet: (state, action: PayloadAction<Subnet>) => {
            state.subnets.push(action.payload);
        },
        removeSubnet: (state, action: PayloadAction<string>) => {
            state.subnets = state.subnets.filter((s) => s.cidr !== action.payload);
        },
    },
});

export const { setSubnets, addSubnet, removeSubnet } = subnetSlice.actions;
export default subnetSlice.reducer;
