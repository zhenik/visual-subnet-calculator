import {Subnet} from "@/types/subnet";
import {Address4} from "ip-address";

export function sortSubnetsByStartAddress(subnets: Subnet[]): Subnet[] {
    return [...subnets].sort((a, b) => {
        const aStart = new Address4(a.cidr).startAddress().bigInt();
        const bStart = new Address4(b.cidr).startAddress().bigInt();
        return aStart < bStart ? -1 : aStart > bStart ? 1 : 0;
    });
}

// todo: test these two func
export function addMissingLeafSiblings(subnets: Subnet[]): Subnet[] {
    const cidrSet = new Set(subnets.map((s) => s.cidr));
    const completed: Subnet[] = [...subnets];

    for (const subnet of subnets) {
        const ip = new Address4(subnet.cidr);
        const mask = ip.subnetMask;
        if (mask >= 32) continue;

        const increment = BigInt(2 ** (32 - mask));
        const siblingStart = ip.startAddress().bigInt() + increment;
        const siblingIp = Address4.fromBigInt(siblingStart);
        const siblingCidr = `${siblingIp.correctForm()}/${mask}`;

        if (cidrSet.has(siblingCidr)) continue;

        const isSiblingParent = subnets.some((s) => {
            const sIP = new Address4(s.cidr);
            return siblingIp.isInSubnet(sIP) && sIP.subnetMask > mask;
        });

        if (isSiblingParent) continue;

        const isCoveredByChildren = subnets.some((s) => {
            const sIP = new Address4(s.cidr);
            return sIP.isInSubnet(siblingIp) && sIP.subnetMask > mask;
        });

        if (isCoveredByChildren) continue;

        const sibling = new Address4(siblingCidr);
        const firstUsable = sibling.startAddress().bigInt() + BigInt(1);
        const lastUsable = sibling.endAddress().bigInt() - BigInt(1);
        const hosts = Number(sibling.endAddress().bigInt() - sibling.startAddress().bigInt()) + 1;

        const newSubnet: Subnet = {
            cidr: siblingCidr,
            netmask: sibling.subnetMask.toString(),
            range: `${sibling.startAddress().correctForm()} - ${sibling.endAddress().correctForm()}`,
            useableIPs: `${Address4.fromBigInt(firstUsable).correctForm()} - ${Address4.fromBigInt(lastUsable).correctForm()}`,
            hosts,
            description: "",
            color: "",
            isJoinable: true,
        };

        completed.push(newSubnet);
        cidrSet.add(siblingCidr);
    }

    return sortSubnetsByStartAddress(completed);
}

export function filterLeafSubnets(cidrs: string[]): string[] {
    return cidrs.filter((candidate) => {
        const candidateAddr = new Address4(candidate);

        return !cidrs.some((other) => {
            if (other === candidate) return false;
            const otherAddr = new Address4(other);
            // Only exclude candidate if it contains a more specific subnet
            return candidateAddr.isInSubnet(otherAddr) && otherAddr.subnetMask > candidateAddr.subnetMask;
        });
    });
}


// Tree node that contains children
export interface SubnetNode extends Subnet {
    children: SubnetNode[];
}
