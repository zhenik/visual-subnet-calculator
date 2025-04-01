import { completeWithMissingLeafPairs, sortSubnetsByStartAddress } from "@/utils/subnetUtils";
import { Subnet } from "@/types/subnet";



describe("completeWithMissingLeafPairs", () => {

    it("should add a missing sibling", () => {
        // 192.168.0.0/17
        // 192.168.128.0/18
        const input: Subnet[] = [
            {
                cidr: "192.168.0.0/17",
                netmask: "255.255.128.0",
                range: "192.168.0.0 - 192.168.127.255",
                useableIPs: "192.168.0.1 - 192.168.127.254",
                hosts: 32768,
                description: "",
                color: "",
                isJoinable: true,
            },
            {
                cidr: "192.168.128.0/18",
                netmask: "255.255.192.0",
                range: "192.168.128.0 - 192.168.191.255",
                useableIPs: "192.168.128.1 - 192.168.191.254",
                hosts: 16384,
                description: "",
                color: "",
                isJoinable: true,
            },
        ];

        const result = completeWithMissingLeafPairs(input);
        const resultCidrs = result.map((s) => s.cidr);

        // 192.168.0.0/17
        // 192.168.128.0/18
        // 192.168.192.0/18
        expect(resultCidrs).toEqual([
            "192.168.0.0/17",
            "192.168.128.0/18",
            "192.168.192.0/18",
        ]);
    });

    it("should fill in 1 level of missing siblings", () => {

        const input: Subnet[] = [
            {
                cidr: "192.168.0.0/17",
                netmask: "255.255.128.0",
                range: "192.168.0.0 - 192.168.127.255",
                useableIPs: "192.168.0.1 - 192.168.127.254",
                hosts: 32768,
                description: "",
                color: "",
                isJoinable: true,
            },
            {
                cidr: "192.168.128.0/19",
                netmask: "255.255.224.0",
                range: "192.168.128.0 - 192.168.159.255",
                useableIPs: "192.168.128.1 - 192.168.159.254",
                hosts: 8192,
                description: "",
                color: "",
                isJoinable: true,
            },
            {
                cidr: "192.168.160.0/20",
                netmask: "255.255.240.0",
                range: "192.168.160.0 - 192.168.175.255",
                useableIPs: "192.168.160.1 - 192.168.175.254",
                hosts: 4096,
                description: "",
                color: "",
                isJoinable: true,
            },
            {
                cidr: "192.168.176.0/21",
                netmask: "255.255.248.0",
                range: "192.168.176.0 - 192.168.183.255",
                useableIPs: "192.168.176.1 - 192.168.183.254",
                hosts: 2048,
                description: "",
                color: "",
                isJoinable: true,
            },
            {
                cidr: "192.168.192.0/18",
                netmask: "255.255.192.0",
                range: "192.168.192.0 - 192.168.255.255",
                useableIPs: "192.168.192.1 - 192.168.255.254",
                hosts: 16384,
                description: "",
                color: "",
                isJoinable: true,
            },
        ];

        const result = completeWithMissingLeafPairs(input);
        const resultCidrs = result.map((s) => s.cidr);

        expect(resultCidrs).toEqual([
            "192.168.0.0/17",
            "192.168.128.0/19",
            "192.168.160.0/20",
            "192.168.176.0/21",
            "192.168.184.0/21",
            "192.168.192.0/18",
        ]);
    });
});


describe("sortSubnetsByStartAddress", () => {
    it("should sort subnets by start IP address", () => {
        const input = [
            { cidr: "192.168.184.0/21", netmask: "", range: "", useableIPs: "", hosts: 0, isJoinable: false },
            { cidr: "192.168.0.0/17", netmask: "", range: "", useableIPs: "", hosts: 0, isJoinable: false },
            { cidr: "192.168.176.0/21", netmask: "", range: "", useableIPs: "", hosts: 0, isJoinable: false },
            { cidr: "192.168.128.0/19", netmask: "", range: "", useableIPs: "", hosts: 0, isJoinable: false },
            { cidr: "192.168.192.0/18", netmask: "", range: "", useableIPs: "", hosts: 0, isJoinable: false },
            { cidr: "192.168.160.0/20", netmask: "", range: "", useableIPs: "", hosts: 0, isJoinable: false },
        ];

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


