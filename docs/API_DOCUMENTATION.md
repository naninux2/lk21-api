# API Documentation

LK21 API menggunakan **Swagger UI** untuk dokumentasi interaktif yang lengkap dan mudah digunakan.

## 📖 Akses Dokumentasi

### 1. Swagger UI (Interactive Documentation)
```
http://localhost:8080/docs
```
- **Interface interaktif** untuk testing API
- **Try it out** langsung dari browser
- **Model schemas** yang detail
- **Response examples** yang lengkap

### 2. OpenAPI JSON Schema
```
http://localhost:8080/docs.json
```
- Raw OpenAPI 3.0 specification
- Dapat diimport ke tools lain (Postman, Insomnia)

## 🚀 Fitur Dokumentasi

### **Endpoints Terkategorikan**
- 🎬 **Movies**: Latest, popular, top-rated movies
- 📺 **Series**: TV series dengan episode details  
- 🔍 **Search**: Pencarian movies & series
- 🏷️ **Categories**: Genre, country, year filtering
- 📡 **Streaming**: Streaming sources & downloads
- 🗂️ **Cache Management**: Cache control tools
- ⚙️ **System**: API information

### **Interactive Testing**
- **Try it out** button pada setiap endpoint
- **Parameter input** forms
- **Real API responses** 
- **HTTP status codes** dan error handling
- **Response time** monitoring

### **Comprehensive Schemas**
- **Request/Response models** yang detail
- **Property descriptions** dan examples
- **Data types** dan validations
- **Nested object** structures

## 📋 Endpoint Categories

### 🎬 Movies
- `GET /movies` - Latest movies
- `GET /popular/movies` - Popular movies  
- `GET /top-rated/movies` - Top-rated movies
- `GET /movies/{id}` - Movie details
- `GET /movies/{id}/streams` - Streaming sources

### 📺 Series  
- `GET /series` - Latest series
- `GET /series/{id}` - Series details + seasons
- `GET /episodes/{id}` - Episode streaming

### 🔍 Search & Categories
- `GET /search/{title}` - Search movies/series
- `GET /genres` - All genres
- `GET /countries` - All countries  
- `GET /years` - All years

### 🗂️ Cache Management
- `DELETE /cache/clear` - Clear all cache
- `GET /cache/stats` - Cache statistics
- `DELETE /cache/clear/{pattern}` - Clear by pattern

## 🛠️ Usage Examples

### Testing dengan Swagger UI
1. Buka `http://localhost:8080/docs`
2. Pilih endpoint yang ingin dicoba
3. Klik **"Try it out"**
4. Isi parameter yang dibutuhkan
5. Klik **"Execute"**
6. Lihat response langsung

### Import ke Postman
1. Copy URL: `http://localhost:8080/docs.json`
2. Buka Postman → Import → Link
3. Paste URL dan import
4. Collection otomatis terbuat dengan semua endpoints

## 🔧 Development

Dokumentasi ini di-generate otomatis dari:
- **JSDoc comments** di route files
- **OpenAPI 3.0 specification**
- **Swagger JSDoc** annotations

Untuk menambah/edit dokumentasi:
1. Edit JSDoc comments di `/src/routes/index.ts`
2. Update schemas di `/src/config/swagger.ts`
3. Restart server untuk reload changes

## 📱 Mobile Friendly

Swagger UI responsive dan dapat diakses dari mobile device untuk testing API on-the-go.

---

**Happy API Testing!** 🎉