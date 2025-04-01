// Basic subnet structure used throughout the app
export interface Subnet {
    cidr: string;
    netmask: string;
    range: string;
    useableIPs: string;
    hosts: number;
    description?: string;
    isJoinable: boolean;
    color?: string;
}