import {Subnet} from "@/types/subnet";
import {Address4} from "ip-address";

export function sortSubnetsByStartAddress(subnets: Subnet[]): Subnet[] {
    return [...subnets].sort((a, b) => {
        const aStart = new Address4(a.cidr).startAddress().bigInt();
        const bStart = new Address4(b.cidr).startAddress().bigInt();
        return aStart < bStart ? -1 : aStart > bStart ? 1 : 0;
    });
}

export function completeWithMissingLeafPairs(subnets: Subnet[]): Subnet[] {
    const enriched = [...subnets]; // Assume already enriched
    const leafs = [...enriched].filter((s) => {
        const ip = new Address4(s.cidr);
        return ip.subnetMask > 0 && ip.subnetMask < 32;
    });

    // Sort by start IP
    leafs.sort((a, b) => {
        const aStart = new Address4(a.cidr).startAddress().bigInt();
        const bStart = new Address4(b.cidr).startAddress().bigInt();
        return aStart < bStart ? -1 : aStart > bStart ? 1 : 0;
    });

    // Check each pair
    for (let i = 0; i < leafs.length - 1; i++) {
        const current = new Address4(leafs[i].cidr);
        const next = new Address4(leafs[i + 1].cidr);

        const areAdjacent = current.endAddress().bigInt() + BigInt(1) === next.startAddress().bigInt();
        const sameMask = current.subnetMask === next.subnetMask;

        if (areAdjacent && sameMask) {
            leafs[i].isJoinable = true;
            leafs[i + 1].isJoinable = true;
        }
    }

    // console.log(enriched)
    return enriched;
}