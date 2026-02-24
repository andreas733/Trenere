# Trenere – Skien Svømmeklubb

Registreringsløsning for nye trenere og frivillige i Skien Svømmeklubb. Integrerer med Tripletex for ansattdata og Anvil Etch for ansettelseskontrakter.

## Funksjoner

- **Forside** – Innloggingsside for trenere (e-post/passord)
- **Trenerregistrering** – Selvregistrering med e-postbekreftelse, lenke fra forsiden
- **Min side** – Trenere kan logge inn og se egen informasjon (personlig info, adresse, kontrakt, lønn)
- **Redigering av trener** – Trenere kan redigere egen personlig informasjon og adresse
- **Admin-dashboard** – Innlogging via Microsoft Entra ID (Azure), lenke nederst til høyre på forsiden
- **Trenerliste** – Visning, redigering, sletting, søk (navn, e-post, by, telefon)
- **Lønnstrinn** – Admin-side for å administrere lønnstrinn (legg til, rediger, slett)
- **Kontraktstyper** – Vanlig kontrakt (fra–til) eller fast kontrakt (kun fra-dato)
- **Tripletex-sync** – Overføring av trenere som ansatte
- **Anvil-kontrakter** – Sending av ansettelseskontrakter til e-signering

## Teknisk stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL, Auth)
- Tailwind CSS

## Oppsett

### 1. Avhengigheter

```bash
npm install
```

### 2. Miljøvariabler

Kopier `.env.example` til `.env.local` og fyll inn. For lokal bygg trenger du minst `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY` (kan bruke placeholdere for kun å kjøre build):

```bash
cp .env.example .env.local
```

| Variabel | Beskrivelse |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-prosjekt URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `TRIPLETEX_CONSUMER_TOKEN` | Tripletex API consumer token |
| `TRIPLETEX_EMPLOYEE_TOKEN` | Tripletex API employee token |
| `ANVIL_API_KEY` | Anvil API-nøkkel |
| `ANVIL_PDF_TEMPLATE_EID` | EID for PDF-malen i Anvil |

### 3. Supabase

1. Opprett et prosjekt på [supabase.com](https://supabase.com)
2. Kjør migrasjonene i `supabase/migrations/` (via Supabase Dashboard SQL Editor eller CLI)
3. Aktiver **Email**-provider og sett **Confirm email** til på
4. Aktiver **Azure**-provider under Auth → Providers for admin-innlogging
5. Legg til redirect URLs under Auth → URL Configuration:
   - Produksjon: `https://din-app.vercel.app/admin/auth/callback`
   - Lokal: `http://localhost:3001/admin/auth/callback` og `http://localhost:3001/min-side`

### 4. Entra ID (Azure) for admin

1. Registrer en app i [Azure Portal](https://portal.azure.com) → Entra ID → App registrations
2. Legg til redirect URI: `https://<prosjekt>.supabase.co/auth/v1/callback`
3. Opprett en client secret
4. Legg til optional claims for e-post i manifest (se Supabase-dokumentasjon for Azure)
5. Konfigurer Client ID, Secret og Tenant URL i Supabase Dashboard → Auth → Providers → Azure

### 5. Admin-brukere

Brukere som logger inn med Entra ID får automatisk admin-tilgang. For å gi tilgang til andre (f.eks. e-post-brukere), legg dem inn i `admin_users`-tabellen med deres `auth_user_id` fra `auth.users`.

## Kjør lokalt

```bash
npm run dev
```

Åpne [http://localhost:3001](http://localhost:3001).

## Deploy til Vercel

1. Push til GitHub
2. Importer prosjektet i Vercel
3. Legg inn miljøvariabler
4. Deploy

## Deploy med Docker (Hetzner m.m.)

1. Opprett `.env.production` på serveren med alle miljøvariabler (kopier fra `.env.example`)
2. Bygg og start: `docker compose up -d --build`
3. Appen kjører på port 3000. Bruk Nginx eller Caddy som reverse proxy for SSL og domene.

```bash
docker compose up -d --build
```

## Struktur

```
src/
├── app/
│   ├── page.tsx              # Forside (trener-innlogging)
│   ├── TrainerLoginForm.tsx  # Innloggingsskjema for trenere
│   ├── registrer/            # Trenerregistrering
│   ├── min-side/             # Trener-dashboard (min side)
│   │   ├── page.tsx         # Visning og redigering av egen profil
│   │   ├── ProfileEditor.tsx
│   │   ├── LogoutButton.tsx
│   │   └── actions.ts
│   ├── admin/                # Admin-dashboard
│   │   ├── login/            # Entra ID-innlogging
│   │   └── (dashboard)/      # Trenerliste, lønnstrinn, redigering
│   │       ├── page.tsx      # Trenerliste med søk
│   │       ├── TrainerTable.tsx
│   │       ├── wage-levels/  # Administrasjon av lønnstrinn
│   │       └── trainers/[id]/ # Rediger trener
│   └── api/trainers/         # Tripletex-sync og Anvil-kontrakt
├── lib/
│   ├── supabase/             # Supabase-klienter
│   └── utils/                # Hjelpefunksjoner
└── types/                    # TypeScript-typer
```

## Database

- `trainers` – Trenere med kontraktdata (`contract_fast` for fast kontrakt uten sluttdato)
- `wage_levels` – Lønnstrinn
- `admin_users` – Brukere med admin-tilgang

Migrasjoner: `001_initial_schema`, `002_seed_wage_levels`, `003_contract_fast`
