This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Test import

Input
```
10.100.8.0/25 private-endpoint-subnet
10.100.9.64/28 flow-application-gateway
10.100.9.0/28 flow-redis
10.100.9.16/28 flow-prod-subnet
10.100.10.0/24 prod-norwayeast-aks-support-services
10.100.9.224/28 good-data-redis
10.100.12.0/23 norwayeast-aks-applications
10.100.14.128/27 flexible-servers
```


Output
```
10.100.8.0/25 private-endpoint-subnet
10.100.8.128/25
10.100.9.0/28 flow-redis
10.100.9.16/28 flow-prod-subnet
10.100.9.32/27
10.100.9.64/28 flow-application-gateway
10.100.9.80/28
10.100.9.96/27
10.100.9.128/26
10.100.9.192/27
10.100.9.224/28 good-data-redis
10.100.9.240/28
10.100.10.0/24 prod-norwayeast-aks-support-services
10.100.11.0/24
10.100.12.0/23 norwayeast-aks-applications
10.100.14.0/25
10.100.14.128/27 flexible-servers
10.100.14.160/27
10.100.14.192/26
10.100.15.0/24
```