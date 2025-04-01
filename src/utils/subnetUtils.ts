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
    const cidrSet = new Set(subnets.map((s) => s.cidr));
    const completed: Subnet[] = [...subnets];

    for (const subnet of subnets) {
        const ip = new Address4(subnet.cidr);
        const mask = ip.subnetMask;

        // Skip if mask is /32 (can't divide further)
        if (mask >= 32) continue;

        const increment = BigInt(2 ** (32 - mask));
        const siblingStart = ip.startAddress().bigInt() + increment;
        const siblingIp = Address4.fromBigInt(siblingStart);
        const siblingCidr = `${siblingIp.correctForm()}/${mask}`;

        // Skip if sibling already exists
        if (cidrSet.has(siblingCidr)) continue;

        // Skip if sibling is a parent of another subnet
        const isSiblingParent = subnets.some((s) => {
            const sIp = new Address4(s.cidr);
            return siblingIp.isInSubnet(sIp) && sIp.subnetMask > mask;
        });
        if (isSiblingParent) continue;

        // Skip if original subnet is a child of another subnet (e.g. already subdivided)
        const isSubnetChild = subnets.some((s) => {
            const sIp = new Address4(s.cidr);
            return sIp.isInSubnet(ip) && sIp.subnetMask < mask;
        });
        if (isSubnetChild) continue;

        // ✅ Add sibling
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
