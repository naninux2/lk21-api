import { pgTable, serial, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const genres = pgTable('genres', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        slugIdx: uniqueIndex('genres_slug_idx').on(table.slug),
        nameIdx: uniqueIndex('genres_name_idx').on(table.name),
    };
});

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;