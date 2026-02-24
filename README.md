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
| `TRIPLETEX_USE_TEST` | `true` for test-miljø (api-test.tripletex.tech), `false` for produksjon |
| `TRIPLETEX_USER_TYPE` | `STANDARD`, `EXTENDED` eller `NO_ACCESS` (valgfritt, standard: STANDARD) |
| `ANVIL_API_KEY` | Anvil API-nøkkel |
| `ANVIL_PDF_TEMPLATE_EID` | EID for PDF-malen i Anvil |
| `ANVIL_USE_TEST` | `true` for test (signaturer ikke juridisk bindende), `false` for produksjon |

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

### 6. Tripletex (sync til ansatte)

For å synkronisere trenere som ansatte til Tripletex:

1. **Test-miljø:** Registrer deg på [api-test.tripletex.tech](https://api-test.tripletex.tech) – du får consumer token og e-post til aktivering. Opprett employee token i Tripletex under Innstillinger → Brukere → din bruker → API-tilgang → Nytt token.
2. **Produksjon:** Søk om tilgang via [Tripletex sitt skjema](https://developer.tripletex.no/docs/documentation/getting-started/3-getting-ready-for-production/). Du får consumer token på e-post. Employee token opprettes av kunden i sin Tripletex-konto.
3. Sett miljøvariabler i Vercel (og `.env.local` lokalt):
   - `TRIPLETEX_CONSUMER_TOKEN` – fra Tripletex
   - `TRIPLETEX_EMPLOYEE_TOKEN` – opprettet av bruker i Tripletex
   - `TRIPLETEX_USE_TEST=true` for test, `false` for produksjon
4. Klikk «Sync til Tripletex» på trenerens redigeringsside i admin-dashboardet. Treneren opprettes som ansatt i Tripletex (eller oppdateres hvis allerede synkronisert).

**Tekniske detaljer:**
- Synkroniserer: navn, e-post, adresse, bankkonto, fødselsnummer, fødselsdato.
- Tripletex krever samsvar mellom fødselsnummer og fødselsdato – appen utleder derfor fødselsdato fra fødselsnummeret (første 6 sifre = DDMMYY) når begge sendes.
- Støtter både ordinære fødselsnumre og D-numre (første siffer 4–9 i dag-delen).
- Kun gyldig 11-sifret fødselsnummer sendes; hvis ugyldig utelates feltet og ansatt kan fylles inn manuelt i Tripletex.

### 7. Anvil Etch (kontraktsignering)

For å sende ansettelseskontrakter til e-signering via Anvil:

1. **Opprett konto** på [app.useanvil.com](https://app.useanvil.com)
2. **Opprett PDF-mal** i Anvil med felt som matcher variablene i koden (standard): `hourly_wage`, `minimum_hours`, `fradato`, `tildato`, `navn`, `pnr`, `adresse`, `signature_club`, `signature_user`. Hent malens EID fra Anvil-dashboardet.
3. **API-nøkkel** finnes under Organization → API i Anvil.
4. Sett miljøvariabler: `ANVIL_API_KEY`, `ANVIL_PDF_TEMPLATE_EID`, `ANVIL_USE_TEST=true` (for test)
5. Klikk «Send kontrakt» på trenerens redigeringsside. Klubben signerer først (e-post til `ANVIL_CLUB_EMAIL`), deretter treneren.

**Signaturfelt (viktig!):** Hver signerer må være koblet til et signaturfelt i PDF-malen. Felt-idene (`ANVIL_FIELD_SIGNATURE_CLUB`, `ANVIL_FIELD_SIGNATURE_USER`) må matche **Field Alias** i Anvil-malen. Åpne malen i Anvil → Document Templates → velg mal → klikk på hvert signaturfelt og sjekk "Field Alias" (f.eks. `signature`, `signature_club`). For tabellfelt brukes format `feltnavn[0]`, `feltnavn[1]`. Sett miljøvariablene til de eksakte verdiene.

**Test av kontraktsignering:**
- Med `ANVIL_USE_TEST=true` sendes ikke juridiske signaturer – egnet for utvikling
- Sett `ANVIL_CLUB_EMAIL` til din egen e-post for å motta klubbens signaturlenke direkte
- Treneren mottar e-post til sin registrerte e-post – bruk en e-post du har tilgang til for testing

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

### Ekstra domener

**nytrener.skiensvk.no** – Redirect til registreringssiden (`/registrer`). Konfigureres i `src/middleware.ts`. Legg til domenet i Vercel → Settings → Domains, og sett CNAME for `nytrener` til `cname.vercel-dns.com`.

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
│   └── utils/                # Hjelpefunksjoner (birthdate.ts: parser fødselsdato fra norsk fnr/D-nummer)
└── types/                    # TypeScript-typer
```

## Database

- `trainers` – Trenere med kontraktdata (`contract_fast` for fast kontrakt uten sluttdato)
- `wage_levels` – Lønnstrinn
- `admin_users` – Brukere med admin-tilgang

Migrasjoner: `001_initial_schema`, `002_seed_wage_levels`, `003_contract_fast`
