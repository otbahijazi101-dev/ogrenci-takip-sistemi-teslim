-- İzole, geri alınan test. Kalıcı kullanıcı/kayıt bırakmaz.
begin;
create temp table test_results(name text, passed boolean);
grant all on test_results to authenticated;
create function pg_temp.assert_true(name text, result boolean) returns void language plpgsql security invoker as $$
begin
 if result is distinct from true then raise exception 'TEST FAILED: %',name;end if;
 insert into test_results values(name,true);
end $$;
create function pg_temp.assert_denied(name text, command text) returns void language plpgsql security invoker as $$
declare denied boolean:=false;
begin
 begin execute command;exception when others then denied:=true;end;
 perform pg_temp.assert_true(name,denied);
end $$;
insert into auth.users(id,email) select ('00000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'rls-test-'||n||'@example.invalid' from generate_series(1,6) n;
insert into public.profiles(id,username,full_name,role,active) values
('00000000-0000-4000-8000-000000000001','rls_admin','Test Yönetici','admin',true),
('00000000-0000-4000-8000-000000000002','rls_teacher_a','Test Öğretmen A','teacher',true),
('00000000-0000-4000-8000-000000000003','rls_teacher_b','Test Öğretmen B','teacher',true),
('00000000-0000-4000-8000-000000000004','rls_parent','Test Veli','parent',true),
('00000000-0000-4000-8000-000000000005','rls_student','Test Öğrenci','student',true),
('00000000-0000-4000-8000-000000000006','rls_inactive','Test Pasif','teacher',false);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
insert into public.classes(id,name,grade,school_year,teacher_id) values
('10000000-0000-4000-8000-000000000001','RLS Test A',9,'2026-2027','00000000-0000-4000-8000-000000000002'),
('10000000-0000-4000-8000-000000000002','RLS Test B',10,'2026-2027','00000000-0000-4000-8000-000000000003');
insert into public.students(id,full_name,school_number,class_id) values
('20000000-0000-4000-8000-000000000001','RLS Öğrenci A','RLS-TEMP-A','10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000002','RLS Öğrenci B','RLS-TEMP-B','10000000-0000-4000-8000-000000000002');
insert into public.student_links values
('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004'),
('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000005');
insert into public.student_details(student_id,health) values('20000000-0000-4000-8000-000000000001','Test özel bilgi');
insert into public.student_photos(student_id,data_url) values('20000000-0000-4000-8000-000000000001','data:image/png;base64,AAAA');
insert into public.entries(student_id,kind,payload,shared,author_id) values
('20000000-0000-4000-8000-000000000001','parent_meeting','{"notes":"private"}',false,'00000000-0000-4000-8000-000000000002'),
('20000000-0000-4000-8000-000000000001','exam','{"name":"A","correct":"20","wrong":"4","divisor":"4"}',true,'00000000-0000-4000-8000-000000000002'),
('20000000-0000-4000-8000-000000000002','exam','{"name":"B","correct":"30","wrong":"4","divisor":"4"}',true,'00000000-0000-4000-8000-000000000003');
set local role authenticated;
select pg_temp.assert_true('admin sees both classes',(select count(*)=2 from public.classes where name like 'RLS Test%'));
select pg_temp.assert_denied('middle school class forbidden',$q$insert into public.classes(name,grade,school_year) values('RLS Middle',6,'2026-2027')$q$);
select pg_temp.assert_true('middle school books hidden',(select count(*)=0 from public.books where grade<9));
select pg_temp.assert_denied('middle school book forbidden',$q$insert into public.books(grade,title) values(6,'RLS Book')$q$);
select pg_temp.assert_denied('fractional questions forbidden',$q$insert into public.entries(student_id,kind,payload) values('20000000-0000-4000-8000-000000000001','study','{"resource":"Test","questions":"1.5"}')$q$);
select pg_temp.assert_denied('weekly followup forbidden',$q$insert into public.entries(student_id,kind,payload) values('20000000-0000-4000-8000-000000000001','followup','{"week":"1"}')$q$);
select pg_temp.assert_denied('blank analysis forbidden',$q$insert into public.entries(student_id,kind,payload) values('20000000-0000-4000-8000-000000000001','analysis','{}')$q$);
select pg_temp.assert_denied('invalid daily reading goal forbidden',$q$insert into public.entries(student_id,kind,payload) values('20000000-0000-4000-8000-000000000001','plan','{"monday_reading":"2000"}')$q$);
select pg_temp.assert_denied('photo scripts forbidden',$q$update public.student_photos set data_url='data:image/svg+xml;base64,AAAA'$q$);
select pg_temp.assert_denied('admin cannot assign parent as teacher',$q$update public.classes set teacher_id='00000000-0000-4000-8000-000000000004' where id='10000000-0000-4000-8000-000000000001'$q$);
select pg_temp.assert_denied('student identity linked once',$q$select public.set_student_links('00000000-0000-4000-8000-000000000005',array['20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002']::uuid[])$q$);
select pg_temp.assert_true('failed relink preserved original',(select count(*)=1 from public.student_links where profile_id='00000000-0000-4000-8000-000000000005'));
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select pg_temp.assert_true('teacher sees assigned student only',(select count(*)=1 from public.students));
select pg_temp.assert_true('teacher sees private and shared notes',(select count(*)=2 from public.entries));
select pg_temp.assert_true('teacher sees private details',(select count(*)=1 from public.student_details));
select pg_temp.assert_true('assigned teacher sees photo',(select count(*)=1 from public.student_photos));
select pg_temp.assert_denied('teacher cannot add student',$q$insert into public.students(full_name,school_number,class_id) values('Unauthorized Test','RLS-NO','10000000-0000-4000-8000-000000000001')$q$);
select pg_temp.assert_denied('teacher cannot write other class',$q$insert into public.entries(student_id,kind,payload) values('20000000-0000-4000-8000-000000000002','student_meeting','{}')$q$);
select pg_temp.assert_denied('teacher cannot create forged author',$q$insert into public.entries(student_id,kind,payload,author_id) values('20000000-0000-4000-8000-000000000001','student_meeting','{}','00000000-0000-4000-8000-000000000001')$q$);
insert into public.entries(student_id,kind,payload) values('20000000-0000-4000-8000-000000000001','study','{"resource":"Test","questions":"10"}');
select pg_temp.assert_true('teacher can save assigned record',(select count(*)=3 from public.entries));
select pg_temp.assert_denied('teacher cannot change own role',$q$update public.profiles set role='admin' where id='00000000-0000-4000-8000-000000000002'$q$);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000004',true);
select pg_temp.assert_true('parent sees linked student only',(select count(*)=1 from public.students));
select pg_temp.assert_true('parent sees only shared record',(select count(*)=1 from public.entries));
select pg_temp.assert_true('parent cannot read sensitive details',(select count(*)=0 from public.student_details));
select pg_temp.assert_true('parent cannot read photo',(select count(*)=0 from public.student_photos));
select pg_temp.assert_denied('parent cannot write records',$q$insert into public.entries(student_id,kind,payload,shared) values('20000000-0000-4000-8000-000000000001','reading','{"book":"Test"}',true)$q$);
select pg_temp.assert_denied('parent cannot relink students',$q$select public.set_student_links('00000000-0000-4000-8000-000000000004',array['20000000-0000-4000-8000-000000000002']::uuid[])$q$);
with attempted as (update public.entries set payload=payload||'{"notes":"changed"}' returning id) select pg_temp.assert_true('parent update changes zero rows',(select count(*)=0 from attempted));
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000005',true);
select pg_temp.assert_true('student sees own record only',(select count(*)=1 from public.students));
select pg_temp.assert_true('student cannot read private photo',(select count(*)=0 from public.student_photos));
insert into public.entries(student_id,kind,payload,shared) values('20000000-0000-4000-8000-000000000001','reading','{"book":"Test","status":"Okuyor"}',true);
select pg_temp.assert_true('student can save own reading',(select count(*)=2 from public.entries));
select pg_temp.assert_denied('student cannot record exam',$q$insert into public.entries(student_id,kind,payload,shared) values('20000000-0000-4000-8000-000000000001','exam','{"name":"A","correct":"10","wrong":"0","divisor":"4"}',true)$q$);
select pg_temp.assert_denied('student cannot move entry',$q$update public.entries set student_id='20000000-0000-4000-8000-000000000002' where kind='reading'$q$);
select pg_temp.assert_denied('student cannot hide own entry',$q$update public.entries set shared=false where kind='reading'$q$);
select pg_temp.assert_denied('invalid reading dates rejected',$q$insert into public.entries(student_id,kind,payload,shared) values('20000000-0000-4000-8000-000000000001','reading','{"book":"Test","started":"2026-09-02","finished":"2026-09-01"}',true)$q$);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000006',true);
select pg_temp.assert_true('inactive account sees no students',(select count(*)=0 from public.students));
select pg_temp.assert_true('inactive account sees no entries',(select count(*)=0 from public.entries));
select pg_temp.assert_true('inactive account sees no books',(select count(*)=0 from public.books));
select set_config('request.jwt.claim.sub','',true);
select pg_temp.assert_true('missing identity sees no records',(select count(*)=0 from public.entries));
reset role;
select count(*) as passed_tests, jsonb_agg(name) as checks from test_results where passed;
rollback;
