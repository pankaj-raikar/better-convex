# better-convex

## Development

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Add NextJS environment variables to `.env.local`:

```sh
cp .env.example .env.local
```

3. Add Convex environment variables to `convex/.env`:

```sh
cp convex/.env.example convex/.env
```

4. Start the development server:

```sh
pnpm dev
```

5. Set Convex env variables in another terminal:

```shell
pnpm dev:init
```

1. Done! Open [http://localhost:3005](http://localhost:3005) to see the app.

### Seeding

```shell
pnpm seed
```

### Resetting the database

```shell
pnpm reset
```
