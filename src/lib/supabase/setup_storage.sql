-- Create a bucket for product media
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Allow public access to read files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'products' );

-- Allow authenticated users (admins) to upload files
-- Note: In a real app, you'd check for admin role, but for now we'll allow all authenticated users
-- as we assume only admins use this panel.
create policy "Admin Upload"
on storage.objects for insert
with check (
  bucket_id = 'products' AND
  auth.role() = 'authenticated'
);

-- Allow updates and deletes
create policy "Admin Update"
on storage.objects for update
using ( bucket_id = 'products' )
with check ( auth.role() = 'authenticated' );

create policy "Admin Delete"
on storage.objects for delete
using ( bucket_id = 'products' AND auth.role() = 'authenticated' );
