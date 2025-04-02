import {
    addMissingLeafSiblings, filterLeafSubnets,
    sortSubnetsByStartAddress
} from "@/utils/subnetUtils";
import { Subnet } from "@/types/subnet";
import {Address4} from "ip-address";

function createSubnet(cidr: string, description?: string): Subnet {
    const ip = new Address4(cidr);
    const firstUsable = ip.startAddress().bigInt() + BigInt(1);
    const lastUsable = ip.endAddress().bigInt() - BigInt(1);
    const hosts = Number(ip.endAddress().bigInt() - ip.startAddress().bigInt()) + 1;
    return {
        cidr,
        netmask: ip.subnetMask.toString(),
        range: `${ip.startAddress().correctForm()} - ${ip.endAddress().correctForm()}`,
        useableIPs: `${Address4.fromBigInt(firstUsable).correctForm()} - ${Address4.fromBigInt(lastUsable).correctForm()}`,
        hosts,
        description: description ?? "",
        isJoinable: true,
    };
}

function createSubnets(subnetText: string[]): Subnet[] {
    return subnetText.map((line) => {
        const [cidr, ...descParts] = line.trim().split(/\s+/);
        const description = descParts.join(" ");
        return createSubnet(cidr, description || "");
    });
}

describe("sortSubnetsByStartAddress", () => {
    it("should sort subnets by start IP address", () => {
        const input = createSubnets([
            "192.168.184.0/21",
            "192.168.0.0/17",
            "192.168.176.0/21",
            "192.168.128.0/19",
            "192.168.192.0/18",
            "192.168.160.0/20"
        ])

        const expectedOrder = [
            "192.168.0.0/17",
            "192.168.128.0/19",
            "192.168.160.0/20",
            "192.168.176.0/21",
            "192.168.184.0/21",
            "192.168.192.0/18",
        ];

        const result = sortSubnetsByStartAddress(input);
        const resultCidrs = result.map((s) => s.cidr);

        expect(resultCidrs).toEqual(expectedOrder);
    });
});


describe("addMissingLeafSiblings", () => {
    it("should add missing leaf siblings with simple example", () => {
        const input = createSubnets([
            "192.168.0.0/17"
        ])

        const expectedOrder = [
            "192.168.0.0/17",
            "192.168.128.0/17"
        ];

        const result = addMissingLeafSiblings(input);
        const resultCidrs = result.map((s) => s.cidr);

        expect(resultCidrs).toEqual(expectedOrder);
    });

    it("should add missing leaf in child subnet", () => {
        const input = createSubnets([
            "192.168.0.0/17",
            "192.168.128.0/18"
        ])

        const expectedOrder = [
            "192.168.0.0/17",
            "192.168.128.0/18",
            "192.168.192.0/18"
        ];

        const result = addMissingLeafSiblings(input);
        const resultCidrs = result.map((s) => s.cidr);

        expect(resultCidrs).toEqual(expectedOrder);
    });

    it("should add missing leaf in child subnet two levels down", () => {
        const input = createSubnets([
            "192.168.0.0/17",
            "192.168.128.0/18",
            "192.168.192.0/19"
        ])

        const expectedOrder = [
            "192.168.0.0/17",
            "192.168.128.0/18",
            "192.168.192.0/19",
            "192.168.224.0/19",
        ];

        const result = addMissingLeafSiblings(input);
        const resultCidrs = result.map((s) => s.cidr);

        expect(resultCidrs).toEqual(expectedOrder);
    });

    //todo
    it("should add missing leaf complex example", () => {
        const input = createSubnets([
            "10.100.8.0/25 private-endpoint-subnet",
            "10.100.9.64/28 flow-application-gateway",
            "10.100.9.0/28 flow-redis",
            "10.100.9.16/28 flow-prod-subnet",
            "10.100.10.0/24 prod-norwayeast-aks-support-services",
            "10.100.9.224/28 good-data-redis",
            "10.100.12.0/23 norwayeast-aks-applications",
            "10.100.14.128/27 flexible-servers"
        ])

        const expectedOrder = [
            "10.100.8.0/25 private-endpoint-subnet",
            "10.100.8.128/25",
            "10.100.9.0/28 flow-redis",
            "10.100.9.16/28 flow-prod-subnet",
            "10.100.9.32/27",
            "10.100.9.64/28 flow-application-gateway",
            "10.100.9.80/28",
            "10.100.9.96/27",
            "10.100.9.128/26",
            "10.100.9.192/27",
            "10.100.9.224/28 good-data-redis",
            "10.100.9.240/28",
            "10.100.10.0/24 prod-norwayeast-aks-support-services",
            "10.100.11.0/24",
            "10.100.12.0/23 norwayeast-aks-applications",
            "10.100.14.0/25",
            "10.100.14.128/27 flexible-servers",
            "10.100.14.160/27",
            "10.100.14.192/26",
            "10.100.15.0/24"
        ];

        const subnetsWithMissingLeafs = addMissingLeafSiblings(input);
        // const result = filterMoreSpecificSubnets(subnetsWithMissingLeafs)
        // console.log(result)
        // const resultCidrs = result.map((s) => s.description ? `${s.cidr} ${s.description}` : s.cidr);
        //
        // expect(resultCidrs).toEqual(expectedOrder);
    });


    it("should add a missing sibling", () => {
        const input: Subnet[] = createSubnets([
            "192.168.0.0/17",
            "192.168.128.0/18",
        ])

        const result = addMissingLeafSiblings(input);
        const resultCidrs = result.map((s) => s.cidr);

        expect(resultCidrs).toEqual([
            "192.168.0.0/17",
            "192.168.128.0/18",
            "192.168.192.0/18",
        ]);
    });

    // it("should fill in 1 level of missing siblings", () => {
    //
    //     const input: Subnet[] = createSubnets([
    //         "192.168.0.0/17",
    //         "192.168.128.0/19",
    //         "192.168.160.0/20",
    //         "192.168.176.0/21",
    //         "192.168.192.0/18",
    //     ])
    //
    //     const result = addMissingLeafSiblings(input);
    //     const resultCidrs = result.map((s) => s.cidr);
    //
    //     expect(resultCidrs).toEqual([
    //         "192.168.0.0/17",
    //         "192.168.128.0/19",
    //         "192.168.160.0/20",
    //         "192.168.176.0/21",
    //         "192.168.184.0/21",
    //         "192.168.192.0/18",
    //     ]);
    // });
});

// describe("filterLeafSubnets", () => {
//     it("should filter work", () => {
//         const input = [
//             "192.168.0.0/17",
//             "192.168.128.0/19",
//             "192.168.160.0/20",
//             "192.168.176.0/21",
//             "192.168.184.0/21",
//             "192.168.192.0/18",
//             "192.169.0.0/18"
//         ];
//
//         const leafSubnets = filterLeafSubnets(input);
//         console.log(leafSubnets);
//
//     })
// })

// describe("buildSubnetTree", () => {
//     it("should build subnet tree", () => {
//         const input = createSubnets([
//             "192.168.0.0/17",
//             "192.168.128.0/18",
//             "192.168.192.0/18"
//         ])
//
//         const expected = [
//             {
//                 cidr: "192.168.0.0/17",
//                 children: []
//             },
//             {
//                 cidr: "192.168.128.0/17",
//                 children: [
//                     { cidr: "192.168.128.0/18", children: [] },
//                     { cidr: "192.168.192.0/18", children: [] }
//                 ]
//             }
//         ]
//
//         const tree = buildSubnetTree(input)
//         console.log(tree)
//         // expect(tree).toEqual(expected);
//     })
// })

