# Database Schema Fix - Remove Title Unique Constraint

## Problem
Aplikasi mengalami error `duplicate key value violates unique constraint "movies_title_idx"` karena ada constraint unique pada kolom `title` yang tidak seharusnya ada.

## Root Cause
- Database schema memiliki 2 unique constraint:
  - `movies_external_id_idx` pada kolom `external_id` ✓ (benar)
  - `movies_title_idx` pada kolom `title` ❌ (salah)

- Film dengan judul sama tapi external_id berbeda (contoh: remake, sequel, versi berbeda) tidak bisa disimpan.

## Solution

### 1. Immediate Fix (Code Level)
- ✅ Added error handling dalam `MovieService.createOrUpdateMovie()` 
- ✅ Handle constraint violation dengan graceful fallback
- ✅ Improved logging untuk batch operations

### 2. Database Schema Fix (Recommended)
Jalankan migration ini di database:

```sql
-- File: drizzle/remove_title_unique_constraint.sql
BEGIN;
DROP INDEX IF EXISTS movies_title_idx;
COMMIT;
```

### 3. Schema File Updated
- ✅ Updated `src/db/schema/movies.ts`
- ✅ Removed `titleIdx` unique constraint
- ✅ Kept `externalIdIdx` (yang benar sebagai primary identifier)

## How to Apply
1. **Code changes** - sudah applied ✅
2. **Database migration** - run SQL script manually:
   ```bash
   psql -d your_database < drizzle/remove_title_unique_constraint.sql
   ```

## Result
- Multiple movies dengan title sama dapat disimpan
- External ID tetap unique (sesuai dengan business logic)
- Error handling yang lebih baik untuk edge cases
- Batch operations yang lebih robust

## Testing
Setelah migration, test dengan:
1. Insert movie dengan title yang sudah ada
2. Verify bahwa hanya external_id yang tetap unique
3. Check logs untuk confirmation