# Prediction Market AI Resolver

## Project setup

1. Install dependencies

   ```bash
   $ pnpm install
   ```

2. Create `.env` and fill the required variables

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod

# using dokcer
$ docker compose up
```

## Usage

Create a request to trigger market resolution

```
(POST) /markets/<market-address>?chainId=<chainId>
```
