import { pgTable, serial, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const years = pgTable('years', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 10 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        nameIdx: uniqueIndex('years_name_idx').on(table.name),
    };
});

export type Year = typeof years.$inferSelect;
export type NewYear = typeof years.$inferInsert;