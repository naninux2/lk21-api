# Database Operations Control

## Disable Database Operations Temporarily

Untuk mengatasi masalah database constraint error sementara, kamu bisa disable fitur save ke database dengan mengatur environment variable.

### Setting Environment Variable

Tambahkan ke file `.env` atau export di terminal:

```bash
# Disable database operations (set to 'false' or hapus untuk disable)
ENABLE_DATABASE_OPERATIONS=false
```

**Atau melalui terminal:**

```bash
# Windows (CMD)
set ENABLE_DATABASE_OPERATIONS=false

# Windows (PowerShell)
$env:ENABLE_DATABASE_OPERATIONS="false"

# Linux/Mac
export ENABLE_DATABASE_OPERATIONS=false
```

### Behavior Changes

Ketika `ENABLE_DATABASE_OPERATIONS !== 'true'`:

✅ **API tetap berfungsi normal** - scraping dan response tetap bekerja
✅ **No database errors** - tidak ada database operations yang dijalankan
✅ **Mock data returned** - methods return mock values
✅ **Logging enabled** - semua operasi di-log dengan prefix `[DB_DISABLED]`

#### Affected Methods:
- `MovieService.createOrUpdateMovie()` → returns mock ID
- `MovieService.getMovieByExternalId()` → returns null (force fresh scraping)
- `MovieService.batchCreateMovies()` → returns mock IDs array

### To Re-enable Database

```bash
ENABLE_DATABASE_OPERATIONS=true
```

### Usage Examples

```bash
# Disable database dan start server
set ENABLE_DATABASE_OPERATIONS=false && npm run dev

# Atau tambahkan ke .env file
echo ENABLE_DATABASE_OPERATIONS=false >> .env
```

### Logs Example

When disabled, you'll see logs like:
```
[DB_DISABLED] Skipping database save for movie: Misfortune
[DB_DISABLED] Skipping database lookup for external ID: misfortune-2016
[DB_DISABLED] Skipping database batch save for 24 movies
```

This way, API akan tetap berfungsi normal tanpa database errors! 🚀