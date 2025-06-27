# Lobbyregister

A demo for a lobby register application built with SvelteKit, tracking meetings between lobbyists and government officials.

## Libraries used

- **[SvelteKit](https://svelte.dev/docs/kit)**: Full-stack web framework with file-based routing
- **[Drizzle ORM](https://orm.drizzle.team/)**: Type-safe SQL query builder for PostgreSQL
- **[TailwindCSS](https://tailwindcss.com/docs)**: Utility-first CSS framework
- **[Zod](https://zod.dev/)**: Runtime type validation
- **[TypeScript](https://www.typescriptlang.org/docs/)**: Static typing
- **[Prettier](https://prettier.io/docs/en/index.html)**: Code formatting

## Environment Setup


1. Copy `.env.example` to `.env` and change `mysecretpassword`

2. Install dependencies:
```bash
npm install
```

3. Start database:
```bash
npm run db:dev
```

3. Push schema and seed data:
```bash
npm run db:push
npm run db:seed
```

4. Run development server:
```bash
npm run dev
```

## Production

1. Create docker-compose.yml from example:
```bash
cp docker-compose.example.yml docker-compose.yml
```

2. Replace `<PASSWORD>` with a secure database password.

3. Build application:
```bash
docker compose build
```

4. Start application:
```bash
docker compose up -d
```

5. Initialize and seed the database:
```bash
docker compose exec app npm run db:push
docker compose exec app npm run db:seed
```

## Project Structure

```
src/
├── app.css                # Global styles and TailwindCSS imports
├── app.html               # HTML template
├── lib/                   # Shared utilities
├── ├── components/        # Reusable Svelte components
│   └── server/            # Server-only utilities
│       └── db/            # Database schema, connection and seeding
└── routes/                # SvelteKit file-based routing
```

## Database Schema

The application tracks three main entities:

### Organizations (`organizations`)
- Lobbyist organizations (in-house, consultant, association)
- Fields: name, type, sector, commercial status, address

### Officials (`officials`)
- Government officials who can attend meetings
- Fields: name, type (minister, secretary, etc.), department

### Meetings (`meetings`)
- Lobby meetings between organizations and officials
- Fields: date, type, location, description

### Relationships
- `lobbyists`: Individual lobbyists within organizations
- `organization_representatives`: Client relationships for consultant firms
- `meeting_officials`: Many-to-many between meetings and officials
- `meeting_lobbyists`: Many-to-many between meetings and lobbyists
- `meeting_representatives`: Tracks which clients are represented in meetings
