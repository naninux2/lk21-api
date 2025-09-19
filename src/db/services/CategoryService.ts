import { db } from '../index';
import { genres, countries, years } from '../schema';
import { eq } from 'drizzle-orm';

export class CategoryService {
    // Genre operations
    static async createGenre(name: string, slug: string) {
        try {
            const [genre] = await db
                .insert(genres)
                .values({ name, slug })
                .onConflictDoUpdate({
                    target: genres.slug,
                    set: {
                        name: name,
                        updatedAt: new Date()
                    }
                })
                .returning();

            return genre;
        } catch (error) {
            console.error('Error creating/updating genre:', error);
            return null;
        }
    }

    static async findGenreBySlug(slug: string) {
        try {
            const [genre] = await db
                .select()
                .from(genres)
                .where(eq(genres.slug, slug))
                .limit(1);

            return genre || null;
        } catch (error) {
            console.error('Error finding genre:', error);
            return null;
        }
    }

    static async getAllGenres() {
        try {
            return await db.select().from(genres).orderBy(genres.name);
        } catch (error) {
            console.error('Error getting all genres:', error);
            return [];
        }
    }

    // Country operations
    static async createCountry(name: string, slug: string) {
        try {
            const [country] = await db
                .insert(countries)
                .values({ name, slug })
                .onConflictDoUpdate({
                    target: countries.slug,
                    set: {
                        name: name,
                        updatedAt: new Date()
                    }
                })
                .returning();

            return country;
        } catch (error) {
            console.error('Error creating/updating country:', error);
            return null;
        }
    }

    static async findCountryBySlug(slug: string) {
        try {
            const [country] = await db
                .select()
                .from(countries)
                .where(eq(countries.slug, slug))
                .limit(1);

            return country || null;
        } catch (error) {
            console.error('Error finding country:', error);
            return null;
        }
    }

    static async getAllCountries() {
        try {
            return await db.select().from(countries).orderBy(countries.name);
        } catch (error) {
            console.error('Error getting all countries:', error);
            return [];
        }
    }

    // Year operations
    static async createYear(name: string) {
        try {
            const [year] = await db
                .insert(years)
                .values({ name })
                .onConflictDoUpdate({
                    target: years.name,
                    set: {
                        updatedAt: new Date()
                    }
                })
                .returning();

            return year;
        } catch (error) {
            console.error('Error creating/updating year:', error);
            return null;
        }
    }

    static async findYearByName(name: string) {
        try {
            const [year] = await db
                .select()
                .from(years)
                .where(eq(years.name, name))
                .limit(1);

            return year || null;
        } catch (error) {
            console.error('Error finding year:', error);
            return null;
        }
    }

    static async getAllYears() {
        try {
            return await db.select().from(years).orderBy(years.name);
        } catch (error) {
            console.error('Error getting all years:', error);
            return [];
        }
    }

    // Utility function to create slug from name
    static createSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }
}