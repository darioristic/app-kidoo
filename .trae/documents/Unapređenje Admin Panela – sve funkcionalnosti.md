## Cilj
- Učiniti sve opcije u admin panelu potpuno funkcionalnim (Users, Tenants, Settings, Modules, Integrations, Security, Logs), sa validacijom, audit evidencijom, stabilnim UI/UX i pokrivenim server‑side API rutama.

## Backend API i Baza
- Users:
  - Dovršiti CRUD i ban/unban na Supabase Admin API (postojeće rute dopuniti validacijama i povratnim statusima).
  - Dodati paginaciju i pretragu po emailu (`/api/admin/users/list?query=` i `?page=`).
  - Audit zapisi za svaku akciju (create/update/delete/ban).
- Tenants:
  - Dodati API rute za listanje, kreiranje, ažuriranje plana/statusa i brisanje (`/api/admin/tenants/*`).
  - Veza sa `workspaces` tabelom (kolone: `name`, `subdomain`, `plan`, `status`, `language`, `timezone`, `owner_user_id`).
  - Paginacija i filteri (plan/status/lang).
- Settings/Modules/Integrations/Security:
  - Konsolidovati `app_settings` kao key‑value store; rute `get/set` već postoje → dodati bulk set/get i validacije tipova.
  - Modules toggles (`module_smart_games`, `module_fun_games`, `module_ai_insights`) – stroga validacija vrednosti.
  - Integrations:
    - Dodati health check rute za Supabase/Stripe (provera env varijabli, latency, auth scope).
  - Security:
    - `security_2fa`, `security_monitor` toggle + audit.
- Logs:
  - Dovršiti `/api/admin/logs/list` sa paginacijom, filterima po `actor`/`action`/vremenu.
  - Dodati `/api/admin/logs/export` (CSV/JSON).
- SQL i RLS:
  - Primena skripti za `profiles`, `audit_logs`, `app_settings`, dopuna politika da `role in ('admin','saas_admin')` ima čitanje/izmenu gde je potrebno.

## Admin UI/UX
- Users tab:
  - Zamena `prompt/confirm` modalima (Create/Edit/Ban/Delete) sa validacijom i inline porukama.
  - Dodati pretragu, filter po ulozi/statusu, pagination.
  - Loading skeleton, empty states, toasts za uspeh/grešku.
- Tenants tab:
  - Uvesti CRUD (Create/Update/Delete), promenu plana/statusa, filtere, paginaciju.
  - Validacija jedinstvenosti subdomena i provera dostupnosti.
- Settings:
  - Bulk Save, indikatori nečuvane izmene, reset na default.
- Modules & Integrations:
  - Tasteri rade odmah (optimistic UI), uz rollback na grešku.
  - Health badge (Configured/Invalid/Missing env) po integraciji.
- Security:
  - Jasni statusi (Enabled/Disabled), opisi i link ka dokumentaciji.
- Logs:
  - Paginacija + filteri; opcija Export.
  - Live refresh na 30s (sa cancelom).

## Validacija okruženja
- U panelu (Integrations ili Settings) dodati sekciju „Environment checks“:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` – detekcija i vizuelni status.
  - Stripe key‑evi (ako planiramo realnu integraciju).

## Bezbednost i dozvole
- AdminGate:
  - Role check (`admin` ili `saas_admin`) – već podržano, dodati fallback poruke.
- API rute:
  - Provere da samo admin može da pozove; audit svih izmena.
  - Rate limiting (lightweight) i CSRF zaštita (po potrebi).

## Testiranje i CI
- Jedinični testovi za API rute (mock Supabase Admin).
- E2E smoke za Users/Settings toggles.
- GitHub Actions dopuniti job za testove i lint.

## Koraci implementacije
1. Dodati tenants API (list/create/update/delete) sa validacijama i audit.
2. Proširiti users API za paginaciju/pretragu; UI modali.
3. Konsolidovati app_settings (bulk get/set, validacije) i povezati Modules/Integrations/Security.
4. Dovršiti logs list/export i UI filtere/paginaciju.
5. Dodati Environment checks sekciju u admin panelu.
6. Uvesti UI poboljšanja (skeletons, toasts, empty states, optimistic updates).
7. Testovi (unit/E2E) i CI proširenje.

## Potrebe za tajnim varijablama
- Vercel env:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (obavezno)
  - Stripe ključevi (opciono, ako integraciju učinimo stvarnom)

Potvrdi pa krećem sa implementacijom po koracima iznad.