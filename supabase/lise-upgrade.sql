-- Existing school records are retained. Run once on the existing project.
begin;
alter table public.classes drop constraint classes_grade_check;
alter table public.classes add constraint classes_grade_check check(grade between 9 and 12);
alter table public.books drop constraint books_grade_check;
-- Old middle-school source books remain stored but are not exposed by policies/UI.
alter table public.books add constraint books_grade_check check(grade between 9 and 12) not valid;
create policy books_lise_only on public.books as restrictive for all to authenticated using(grade between 9 and 12) with check(grade between 9 and 12);
alter table public.students add column is_sample boolean not null default false;
alter table public.classes add column is_sample boolean not null default false;
alter table public.entries drop constraint entries_kind_check;
alter table public.entries add constraint entries_kind_check check(kind in ('followup','study','exam','student_meeting','parent_meeting','reading','plan','analysis','note'));

create table public.student_photos (
 student_id uuid primary key references public.students(id) on delete cascade,
 data_url text not null check(length(data_url)<=200000 and data_url ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'),
 updated_at timestamptz not null default now()
);
alter table public.student_photos enable row level security;
revoke all on public.student_photos from public,anon,authenticated;
grant select,insert,update,delete on public.student_photos to authenticated;
grant all on public.student_photos to service_role;
create policy photos_staff on public.student_photos for all to authenticated using(private.can_student(student_id,true)) with check(private.can_student(student_id,true));

create function private.validate_lise_entry() returns trigger language plpgsql security invoker set search_path='' as $$
declare k text; v text; lim numeric; d text;
begin
 if new.kind='followup' and new.payload->>'week' is distinct from 'Aylık değerlendirme' then raise exception 'Lise takibi aylık değerlendirme olmalıdır.';end if;
 if new.kind='exam' and new.payload->>'divisor' is distinct from '4' then raise exception 'Lise denemelerinde net hesabı dört yanlış üzerinden yapılır.';end if;
 foreach k in array array['questions','correct','wrong','blank','score','monthly_score'] loop
  v=new.payload->>k;
  if v is null or v='' then continue;end if;
  lim=case when k in ('correct','wrong','blank') then 500 when k='score' then 1000 when k='monthly_score' then 100 else 100000 end;
  if v !~ '^\d+(\.\d+)?$' or length(v)>10 then raise exception 'Sayısal değer geçersiz: %',k;end if;
  if v::numeric>lim then raise exception 'Sınır aşıldı: %',k;end if;
  if k in ('questions','correct','wrong','blank') and v::numeric<>trunc(v::numeric) then raise exception 'Tam sayı gerekli: %',k;end if;
 end loop;
 foreach k in array array['started','finished','meeting_date','review_date'] loop
  v=new.payload->>k;
  if coalesce(v,'')<>'' then
   if v !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Tarih geçersiz: %',k;end if;
   perform v::date;
  end if;
 end loop;
 if new.kind='analysis' and (length(trim(coalesce(new.payload->>'exam_name','')))=0 or length(trim(coalesce(new.payload->>'topic','')))=0 or length(trim(coalesce(new.payload->>'action','')))=0) then raise exception 'Deneme, konu ve çözüm planı gerekli.';end if;
 if new.kind='note' and (length(trim(coalesce(new.payload->>'title','')))=0 or length(trim(coalesce(new.payload->>'notes','')))=0) then raise exception 'Başlık ve not gerekli.';end if;
 if new.kind='plan' then
  foreach d in array array['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] loop
   foreach k in array array[d||'_paragraph',d||'_reading'] loop
    v=new.payload->>k;
    if coalesce(v,'')<>'' then
     if v !~ '^\d+$' or length(v)>4 then raise exception 'Plan hedefi tam sayı olmalı.';end if;
     if v::int > (case when k like '%_reading' then 1440 else 1000 end) then raise exception 'Plan hedefi sınırı aşıldı.';end if;
    end if;
   end loop;
  end loop;
 end if;
 return new;
end $$;
revoke all on function private.validate_lise_entry() from public;
create trigger validate_lise_entry before insert or update on public.entries for each row execute function private.validate_lise_entry();
commit;
