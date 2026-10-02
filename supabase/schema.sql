begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null check(length(full_name) between 2 and 120),
 username text not null unique check(username ~ '^[a-z0-9._-]{3,50}$'),
 role text not null check(role in ('admin','teacher','parent','student')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.classes (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 40),
 grade integer not null check(grade between 6 and 11),
 school_year text not null check(school_year ~ '^20[0-9]{2}-20[0-9]{2}$'),
 teacher_id uuid references public.profiles(id),
 active boolean not null default true,
 unique(name,school_year)
);
create index classes_teacher_idx on public.classes(teacher_id);
create table public.students (
 id uuid primary key default gen_random_uuid(),
 full_name text not null check(length(full_name) between 2 and 120),
 school_number text not null unique check(length(school_number) between 1 and 30),
 class_id uuid not null references public.classes(id),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create index students_class_idx on public.students(class_id);
create table public.student_links (
 student_id uuid not null references public.students(id) on delete cascade,
 profile_id uuid not null references public.profiles(id) on delete cascade,
 primary key(student_id,profile_id)
);
create index student_links_profile_idx on public.student_links(profile_id);
create table public.student_details (
 student_id uuid primary key references public.students(id) on delete cascade,
 guardian_name text not null default '', guardian_job text not null default '',
 average_income text not null default '', siblings integer check(siblings between 0 and 30),
 previous_school text not null default '', percentile numeric check(percentile between 0 and 100),
 entry_score numeric check(entry_score between 0 and 1000), address text not null default '',
 talents text not null default '', own_room boolean not null default false,
 hobbies text not null default '', phone text not null default '',
 health text not null default '', special_notes text not null default ''
);
create table public.entries (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.students(id) on delete cascade,
 kind text not null check(kind in ('followup','study','exam','student_meeting','parent_meeting','reading','plan')),
 record_date date not null default current_date,
 payload jsonb not null default '{}' check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=40000),
 shared boolean not null default false,
 author_id uuid not null default auth.uid() references public.profiles(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index entries_student_date_idx on public.entries(student_id,record_date desc);
create index entries_author_idx on public.entries(author_id);
create unique index followup_period_unique on public.entries(student_id, date_trunc('month',record_date::timestamp), (payload->>'week')) where kind='followup';
create table public.books (
 id uuid primary key default gen_random_uuid(), grade integer not null check(grade between 6 and 11),
 title text not null check(length(title) between 1 and 200), author text not null default '', publisher text not null default '', genre text not null default '', pages integer check(pages between 1 and 10000),
 unique(grade,title,author)
);
create table public.setup_state (id integer primary key check(id=1), token_hash text not null, expires_at timestamptz not null, claimed boolean not null default false);

create function private.current_role() returns text language sql stable security definer set search_path='' as $$
 select p.role from public.profiles p where auth.uid() is not null and p.id=auth.uid() and p.active;
$$;
create function private.can_student(sid uuid, staff_only boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists (
 select 1 from public.profiles p where p.id=auth.uid() and p.active and (
 p.role='admin' or (p.role='teacher' and exists(select 1 from public.students s join public.classes c on c.id=s.class_id where s.id=sid and c.teacher_id=p.id))
 or (not staff_only and p.role in ('parent','student') and exists(select 1 from public.student_links l where l.student_id=sid and l.profile_id=p.id))));
$$;
create function private.can_class(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists (select 1 from public.profiles p where p.id=auth.uid() and p.active and (
 p.role='admin' or exists(select 1 from public.classes c where c.id=cid and c.teacher_id=p.id and p.role='teacher')
 or exists(select 1 from public.students s join public.student_links l on l.student_id=s.id where s.class_id=cid and l.profile_id=p.id)));
$$;
revoke all on function private.current_role(), private.can_student(uuid,boolean),private.can_class(uuid) from public;
grant execute on function private.current_role(),private.can_student(uuid,boolean),private.can_class(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.student_links enable row level security;
alter table public.student_details enable row level security;
alter table public.entries enable row level security;
alter table public.books enable row level security;
alter table public.setup_state enable row level security;
revoke all on all tables in schema public from anon,authenticated;
grant select on public.profiles to authenticated;
grant select,insert,update,delete on public.classes,public.students,public.student_links,public.student_details,public.entries,public.books to authenticated;
grant all on public.profiles,public.classes,public.students,public.student_links,public.student_details,public.entries,public.books,public.setup_state to service_role;

create policy profiles_read on public.profiles for select to authenticated using ((select private.current_role())='admin' or id=(select auth.uid()));
create policy classes_read on public.classes for select to authenticated using (private.can_class(id));
create policy classes_admin on public.classes for all to authenticated using ((select private.current_role())='admin') with check ((select private.current_role())='admin');
create policy students_read on public.students for select to authenticated using (private.can_student(id));
create policy students_admin on public.students for all to authenticated using ((select private.current_role())='admin') with check ((select private.current_role())='admin');
create policy links_read on public.student_links for select to authenticated using ((select private.current_role())='admin' or profile_id=(select auth.uid()));
create policy links_admin on public.student_links for all to authenticated using ((select private.current_role())='admin') with check ((select private.current_role())='admin');
create policy details_staff on public.student_details for all to authenticated using(private.can_student(student_id,true)) with check(private.can_student(student_id,true));
create policy entries_read on public.entries for select to authenticated using (private.can_student(student_id,true) or (shared and private.can_student(student_id)));
create policy entries_insert on public.entries for insert to authenticated with check(author_id=(select auth.uid()) and (private.can_student(student_id,true) or ((select private.current_role())='student' and private.can_student(student_id) and kind in ('reading','plan') and shared)));
create policy entries_update on public.entries for update to authenticated using(private.can_student(student_id,true) or ((select private.current_role())='student' and private.can_student(student_id) and author_id=(select auth.uid()) and kind in ('reading','plan'))) with check(private.can_student(student_id,true) or ((select private.current_role())='student' and private.can_student(student_id) and author_id=(select auth.uid()) and kind in ('reading','plan') and shared));
create policy entries_delete on public.entries for delete to authenticated using((select private.current_role())='admin');
create policy books_read on public.books for select to authenticated using((select private.current_role()) is not null);
create policy books_admin on public.books for all to authenticated using((select private.current_role())='admin') with check((select private.current_role())='admin');

create function private.validate_entry() returns trigger language plpgsql security invoker set search_path='' as $$
declare k text; v text;
begin
 if TG_OP='UPDATE' then
   if new.student_id<>old.student_id or new.kind<>old.kind or new.author_id<>old.author_id or new.created_at<>old.created_at then raise exception 'Kaydın öğrenci, tür veya yazarı değiştirilemez.'; end if;
 end if;
 new.updated_at=now();
 if new.record_date > current_date+interval '1 year' then raise exception 'Kayıt tarihi geçersiz.'; end if;
 foreach k in array array['questions','correct','wrong','score','monthly_score'] loop
   v=new.payload->>k;
   if v is not null and v<>'' and (v !~ '^\d+(\.\d+)?$' or length(v)>10) then raise exception 'Sayısal değer geçersiz: %',k; end if;
   if v is not null and v<>'' and v::numeric>100000 then raise exception 'Sayı çok büyük.';end if;
 end loop;
 if new.kind='exam' then
   if coalesce(new.payload->>'name','')='' or coalesce(new.payload->>'correct','')='' or coalesce(new.payload->>'wrong','')='' or coalesce(new.payload->>'divisor','') not in ('3','4') then raise exception 'Deneme adı, doğru, yanlış ve net hesabı gerekli.';end if;
 end if;
 if new.kind='followup' and coalesce(new.payload->>'week','') not in ('Aylık değerlendirme','1','2','3','4','5') then raise exception 'Hafta seçimi gerekli.';end if;
 if new.kind='study' and (coalesce(new.payload->>'resource','')='' or coalesce(new.payload->>'questions','')='') then raise exception 'Kaynak ve soru sayısı gerekli.';end if;
 if new.kind='reading' then
   if coalesce(new.payload->>'book','')='' then raise exception 'Kitap adı gerekli.';end if;
   if new.payload->>'status'='Tamamladı' and coalesce(new.payload->>'finished','')='' then raise exception 'Bitiş tarihi gerekli.';end if;
   if coalesce(new.payload->>'started','')<>'' and coalesce(new.payload->>'finished','')<>'' and (new.payload->>'finished')::date<(new.payload->>'started')::date then raise exception 'Kitap tarihleri geçersiz.';end if;
 end if;
 return new;
end $$;
revoke all on function private.validate_entry() from public;
create trigger validate_entry before insert or update on public.entries for each row execute function private.validate_entry();
create function private.validate_assignment() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null and current_setting('role',true)<>'service_role' then raise exception 'Oturum gerekli.';end if;
 if TG_TABLE_NAME='classes' then
  if new.teacher_id is not null and not exists(select 1 from public.profiles where id=new.teacher_id and role='teacher' and active) then raise exception 'Aktif öğretmen seçin.';end if;
 else
  if not exists(select 1 from public.profiles where id=new.profile_id and role in ('parent','student') and active) then raise exception 'Veli veya öğrenci hesabı seçin.';end if;
  if exists(select 1 from public.profiles where id=new.profile_id and role='student') and exists(select 1 from public.student_links where profile_id=new.profile_id and student_id<>new.student_id) then raise exception 'Öğrenci hesabı tek bir öğrenciye bağlanabilir.';end if;
 end if;
 return new;
end $$;
revoke all on function private.validate_assignment() from public;
create trigger validate_class before insert or update on public.classes for each row execute function private.validate_assignment();
create trigger validate_link before insert or update on public.student_links for each row execute function private.validate_assignment();
create function public.set_student_links(target_profile uuid, student_ids uuid[]) returns void language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or private.current_role() is distinct from 'admin' then raise exception 'Yönetici yetkisi gerekli.';end if;
 if not exists(select 1 from public.profiles where id=target_profile and role in ('parent','student') and active) then raise exception 'Aktif veli veya öğrenci hesabı gerekli.';end if;
 if exists(select 1 from public.profiles where id=target_profile and role='student') and cardinality(student_ids)>1 then raise exception 'Öğrenci hesabına tek kayıt bağlanabilir.';end if;
 delete from public.student_links where profile_id=target_profile;
 insert into public.student_links(student_id,profile_id) select distinct unnest(student_ids),target_profile;
end $$;
revoke all on function public.set_student_links(uuid,uuid[]) from public,anon;
grant execute on function public.set_student_links(uuid,uuid[]) to authenticated;
commit;
