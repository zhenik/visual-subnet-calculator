import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Subnet {
    cidr: string;
    name: string;
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
        addSubnet: (state, action: PayloadAction<Subnet>) => {
            state.subnets.push(action.payload);
        },
        removeSubnet: (state, action: PayloadAction<string>) => {
            state.subnets = state.subnets.filter((s) => s.cidr !== action.payload);
        },
    },
});

export const { addSubnet, removeSubnet } = subnetSlice.actions;
export default subnetSlice.reducer;
