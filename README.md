# Travel Planner

Aplikacija za organizaciju putovanja. Korisnici kreiraju planove putovanja i u okviru njih upravljaju destinacijama, aktivnostima, troškovima i packing listom, a planove mogu i podijeliti sa drugima.

## Funkcionalnosti

- Registracija i prijava korisnika (JWT)
- Kreiranje i uređivanje planova putovanja
- Upravljanje destinacijama i aktivnostima
- Praćenje troškova u odnosu na budžet
- Packing lista
- Dijeljenje plana putem linka i QR koda
- Izvoz plana u PDF
- Admin panel za pregled korisnika i planova

## Korišćene tehnologije

- **Frontend:** React (Vite)
- **Backend:** .NET 8 servisi na Microsoft Service Fabric platformi
- **Baza:** SQL Server

## Preduslovi za pokretanje

- .NET 8 SDK
- Microsoft Service Fabric SDK
- SQL Server (LocalDB ili Express)
- Node.js 18+
- Visual Studio 2026

## Backend

### Baza podataka

Svaki servis ima sopstveni `appsettings.json` u kojem se podešava connection string ka bazi:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=ImeRacunara\\SQLEXPRESS;Database=NazivBaze;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

`ImeRacunara\SQLEXPRESS` zamijeniti instancom lokalnog SQL Servera, a `NazivBaze` prilagoditi za svaki servis posebno (npr. `TravelPlannerDB`, `UserServiceDB`, `ExpenseDB`, `ChecklistDB`).

### JWT

Pošto se token validira u više servisa, vrijednosti u sekciji `Jwt` moraju biti iste u svakom `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "tajni-kljuc-minimum-32-karaktera",
    "Issuer": "TravelPlanner",
    "Audience": "TravelPlannerClient"
  }
}
```

### Interna komunikacija

Servisi međusobno razmjenjuju podatke za neke operacije (npr. brisanje plana ili korisnika briše i povezane podatke u drugim servisima). Ta komunikacija je zaštićena zajedničkom vrijednošću koju takođe treba postaviti isto u svakom `appsettings.json`:

```json
{
  "InternalServiceSecret": "interna-tajna-vrijednost"
}
```

### Migracije

Pokrenuti pojedinačno za svaki servis:

```bash
dotnet ef database update --project TravelService
dotnet ef database update --project UserService
dotnet ef database update --project ExpenseService
dotnet ef database update --project ChecklistService
```

### Pokretanje

Otvoriti `TravelPlannerApp.slnx` u Visual Studio 2026 i pokrenuti sa F5 — pokreće se cijela Service Fabric aplikacija.

### Servisi u sistemu

- `ApiGateway` – prosljeđuje zahtjeve odgovarajućem servisu
- `TravelService` – planovi putovanja, destinacije, aktivnosti, dijeljenje planova, PDF izvještaji
- `UserService` – registracija, prijava, administracija korisnika
- `ExpenseService` – troškovi
- `ChecklistService` – packing lista

## Frontend

```bash
cd travel-planner-frontend
npm install
```

Kreirati `.env` u root folderu frontenda:

```
VITE_API_URL=http://localhost:19081/TravelPlannerApp/ApiGateway/api
```

Pokretanje:

```bash
npm run dev
```

Frontend je dostupan na `http://localhost:5173`.

## Kako je sistem organizovan

Backend čini nekoliko nezavisnih mikroservisa, svaki sa svojom bazom podataka, koji se oslanjaju na `ApiGateway` za rutiranje dolaznih zahtjeva. `TravelService` je jedini stateful servis — koristi Service Fabric Reliable Collections za čuvanje tokena dijeljenih planova. Ostali servisi su stateless i sav podatak čuvaju isključivo u svojoj bazi.
