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

1. Create `.env` file:
```
DATABASE_URL=postgresql://root:mysecretpassword@localhost:5432/local
```

2. Start database:
```bash
pnpm db:start
```

3. Push schema and seed data:
```bash
pnpm db:push
pnpm db:seed
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
- Fields: date, duration, type, location, description

### Relationships
- `lobbyists`: Individual lobbyists within organizations
- `organization_representatives`: Client relationships for consultant firms
- `meeting_officials`: Many-to-many between meetings and officials
- `meeting_lobbyists`: Many-to-many between meetings and lobbyists
- `meeting_representatives`: Tracks which clients are represented in meetings
