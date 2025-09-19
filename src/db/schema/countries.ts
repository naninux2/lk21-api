import { pgTable, serial, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        slugIdx: uniqueIndex('countries_slug_idx').on(table.slug),
        nameIdx: uniqueIndex('countries_name_idx').on(table.name),
    };
});

export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;