-- 002: note categories, pinning and archiving
-- Additive only: existing notes, the library's "categories" table and
-- all existing policies are not changed.

-- 1. Categories for notes, owned per user
create table note_categories (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0 and length(name) <= 50),
  created_at timestamptz not null default now(),
  constraint note_categories_id_user_id_key unique (id, user_id)
);

-- One category name per user (case-insensitive)
create unique index note_categories_user_id_name_key
  on note_categories (user_id, lower(name));

alter table note_categories enable row level security;
grant select, insert, update, delete on note_categories to authenticated;

create policy "Users see their own note categories"
  on note_categories for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users add note categories as themselves"
  on note_categories for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users change their own note categories"
  on note_categories for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users delete their own note categories"
  on note_categories for delete to authenticated
  using (user_id = (select auth.uid()));

-- 2. New columns on notes
alter table notes
  add column category_id bigint,
  add column pinned boolean not null default false,
  add column archived boolean not null default false;

-- 3. A note can only use a category that belongs to the same user.
--    Deleting a category just clears the note's category.
alter table notes
  add constraint notes_category_owner_fkey
  foreign key (category_id, user_id)
  references note_categories (id, user_id)
  on delete set null (category_id);

create index notes_user_id_category_id on notes (user_id, category_id);