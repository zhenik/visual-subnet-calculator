// subnetTreeBuilder.ts
import { Address4 } from "ip-address";
import { Subnet } from "@/types/subnet";

// A subnet in tree format (with children)
export interface SubnetNode extends Subnet {
    children: SubnetNode[];
}

function isParent(parent: Subnet, child: Subnet): boolean {
    const parentIP = new Address4(parent.cidr);
    const childIP = new Address4(child.cidr);
    return parentIP.isInSubnet(childIP);
}

export function buildSubnetTree(subnets: Subnet[]): SubnetNode[] {
    const nodes: SubnetNode[] = subnets.map((s) => ({ ...s, children: [] }));
    const assigned = new Set<SubnetNode>();
    const tree: SubnetNode[] = [];

    for (const parent of nodes) {
        for (const child of nodes) {
            if (parent !== child && isParent(parent, child)) {
                parent.children.push(child);
                assigned.add(child);
            }
        }
    }

    for (const node of nodes) {
        if (!assigned.has(node)) {
            tree.push(node);
        }
    }

    return tree;
}


