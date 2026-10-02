-- Explicitly fictional records. Idempotent and never overwrites existing records.
begin;
do $$
declare actor uuid; cid uuid; sid uuid; g int; m int; k int; j int; dt date; p jsonb; subj text; title text; author text; yr text;
begin
 select id into actor from public.profiles where role='admin' and active order by created_at limit 1;
 if actor is null then raise exception 'Aktif yönetici gerekli.';end if;
 perform set_config('request.jwt.claim.sub',actor::text,true);
 yr=case when extract(month from current_date)>=9 then extract(year from current_date)::int::text||'-'||(extract(year from current_date)::int+1)::text else (extract(year from current_date)::int-1)::text||'-'||extract(year from current_date)::int::text end;
 for g in 9..12 loop
  if exists(select 1 from public.students where school_number='ORNEK-LISE-'||g) then continue;end if;
  insert into public.classes(name,grade,school_year,is_sample) values(g||'/ÖRNEK',g,yr,true) on conflict(name,school_year) do nothing;
  select id into cid from public.classes where name=g||'/ÖRNEK' and school_year=yr and is_sample;
  if cid is null then raise exception 'Örnek sınıf adı mevcut gerçek kayıtla çakışıyor.';end if;
  insert into public.students(full_name,school_number,class_id,is_sample) values('ÖRNEK Öğrenci '||g,'ORNEK-LISE-'||g,cid,true) returning id into sid;
  insert into public.student_details(student_id,guardian_name,guardian_job,average_income,siblings,previous_school,percentile,entry_score,address,talents,own_room,hobbies,phone,health,special_notes)
  values(sid,'ÖRNEK Veli '||g,'Örnek meslek','Kurgu gelir bilgisi',2,'ÖRNEK Önceki Okul',12.5,410.25,'Gerçek adres değildir — örnek mahalle ve sokak','Müzik ve problem çözme',true,'Kitap okuma, satranç','00000000000','Kurgu kayıt: sağlık bilgisi değildir.','Bu öğrenci ve tüm bilgileri işlevleri tanıtmak için oluşturulmuş örnek verilerdir.');
  select b.title,b.author into title,author from public.books b where grade=least(g,11) order by b.title limit 1;
  for m in 0..1 loop
   dt=(date_trunc('month',current_date)-make_interval(months=>m))::date;
   for k in 1..4 loop
    subj=(array['Türkçe','Matematik','Sosyal','Fen'])[k];
    for j in 1..2 loop
     insert into public.entries(student_id,kind,record_date,payload,shared,author_id) values(sid,'study',dt,jsonb_build_object('subject',subj,'resource','ÖRNEK '||subj||' Soru Bankası '||j,'topic','Örnek ünite '||j,'questions',(50+g+k*10-m*5)::text),true,actor);
    end loop;
    insert into public.entries(student_id,kind,record_date,payload,shared,author_id) values(sid,'exam',dt,jsonb_build_object('name','ÖRNEK Branş Denemesi','exam_type','Branş','subject',subj,'correct',(20+k-m*2)::text,'wrong','4','blank','2','divisor','4','score',(70+k-m*3)::text,'notes','Kurgu sonuçlar; önceki dönemle karşılaştırma örneği.'),true,actor);
   end loop;
   insert into public.entries(student_id,kind,record_date,payload,shared,author_id) values
   (sid,'exam',dt,jsonb_build_object('name','ÖRNEK TYT Denemesi','exam_type','TYT','subject','Genel','correct',(82+g-m*6)::text,'wrong','12','blank',(26-g+m*6)::text,'divisor','4','score',(350+g-m*20)::text,'notes','Kurgu genel deneme.'),true,actor),
   (sid,'followup',dt,jsonb_build_object('week','Aylık değerlendirme','homework','İyi','adaptation','İyi','book',title,'parent_contact',true,'assignment_given',true,'monthly_score','85','progress',case when m=0 then 'Yükselmiş' else 'Henüz değerlendirilmedi' end,'meeting_date',dt::text,'next_goal','Günlük 20 paragraf sorusu ve düzenli tekrar.','notes','ÖRNEK: çalışma düzeni gelişiyor.'),true,actor),
   (sid,'parent_meeting',dt,jsonb_build_object('home_study','İyi','relations','İyi','phone','Orta','notes','ÖRNEK: evde çalışma planı görüşüldü, çalışma sırasında telefonun başka odada tutulması kararlaştırıldı.'),false,actor),
   (sid,'student_meeting',dt,jsonb_build_object('activities','ÖRNEK: satranç ve yürüyüş','books',title,'assignments','Her gün 20 paragraf; matematikte eksik konuları tekrar et.','notes','Kurgu görüşme; sonraki ay gelişim değerlendirilecek.'),true,actor),
   (sid,'reading',dt,jsonb_build_object('book',title,'author',author,'started',(dt-interval '14 days')::date::text,'finished',dt::text,'status','Tamamladı','notes','ÖRNEK: kitap üzerine kısa değerlendirme yapıldı.'),true,actor),
   (sid,'analysis',dt,jsonb_build_object('exam_name','ÖRNEK TYT Denemesi','subject','Matematik','topic','Üslü sayılar / soru 14','result','Yanlış','cause','Bilgi eksikliği','action','Konu özeti çıkar, 30 soru çöz ve yanlış soruya tekrar dön.','review_date',dt::text,'status',case when m=0 then 'Tekrar çalışılıyor' else 'Eksik giderildi' end,'notes','Kurgu hata analizi.'),true,actor),
   (sid,'note',dt,jsonb_build_object('title','ÖRNEK öğretmen notu','notes','Bu özel not yalnızca yönetici ve atanmış öğretmen tarafından görülebilir. Gerçek öğrenci bilgisi içermez.'),false,actor);
  end loop;
  p=jsonb_build_object('makeup_day','Pazar','notes','ÖRNEK: tamamlanmayan çalışmalar pazar günü telafi edilir.');
  for k in 1..7 loop
   subj=(array['monday','tuesday','wednesday','thursday','friday','saturday','sunday'])[k];
   p=p||jsonb_build_object(subj,'Matematik: üslü sayılar; Türkçe: paragraf',subj||'_homework','Örnek soru bankası, ünite 1',subj||'_paragraph','20',subj||'_review','Günün derslerini 15 dakika tekrar',subj||'_reading','25',subj||'_done',k<3);
  end loop;
  insert into public.entries(student_id,kind,record_date,payload,shared,author_id) values(sid,'plan',date_trunc('month',current_date)::date,p,true,actor);
 end loop;
end $$;
commit;
select count(*) as sample_students from public.students where is_sample;
