# Düzce FENTEK okul uyarlaması

2 Ekim 2026

## Eklenenler

- Resmî okul adına dayalı giriş, panel ve rapor başlığı; okulun MEB sitesine bağlantı.
- Aylık defterde her kaynak için ayrı soru sayısı ve ders ara toplamı.
- Deneme/yayın ayrıntıları; aynı tür/ders/net hesabındaki kayıtlar için puan toplamı ve ortalaması. Puanı eksik olan kayıt ortalama paydasına alınmaz, sıfır puan ise alınır.
- Kaynak defterlerin Ekim–Mayıs düzeninde yıllık görünüm; eğitim yılı geçişi ve aya doğrudan geçiş.
- Kaynaktaki veli görüşmesi ve çalışma ilkelerinin eksik kalan özetleri.
- Yazdırmada okul kimliği ve çok sayfalı tablolar için tekrarlanan başlık düzeni.

Veritabanı, hesap yetkileri ve öğrenci kayıtları bu güncellemede değiştirilmedi. Word dosyasındaki yeni özellik önerileri kullanıcının tercihi doğrultusunda eklenmedi. Kaynaklarda 12. sınıf kitap listesi yoktur; liste uydurulmadı.

## Okuldan gerekenler

1. Resmî kurum adı teyidi, onaylı logo dosyası ve varsa kurumsal renkler. Mevcut renkler ve FT işareti uygulama için öneridir, resmî logo değildir.
2. Kullanılacak sınıf/şube listesi ve sorumlu öğretmen eşleştirmesi. Gerçek öğrenci bilgileri okulun onaylı, güvenli aktarım yöntemiyle sağlanmalıdır; parolalar sohbetten istenmez.
3. 12. sınıf için onaylı okuma listesi varsa kitap, yazar ve yayınevi bilgileri.
4. Gerçek kullanıma kabul verecek okul sorumlusu; veri saklama ve erişim politikasının onayı. Alan adı değişikliği istenirse okulun alan adı yöneticisiyle ayrıca bağlantı yapılmalıdır.

## Doğrulama sınırı

16 birim testi ve üretim derlemesi başarılı. Canlı arayüz kontrol sonuçları çalışma notlarında ayrıca belirtilir. Önceki sürümün SQL rol testleri korunur; bu sürüm yeni veritabanı yetkisi eklemez. Sızdırılmış parola korumasının etkinleştirilmesi, yedekten dönüş denemesi ve okulun dört rolle kullanıcı kabulü hâlâ ayrı tamamlanmalıdır.

## Canlı doğrulama

- Yayın durumu READY, üretim adresi: https://ogrenci-takip-sistemi-teslim.vercel.app
- Yayın kimliği: dpl_g4KVwVsQksTxd2bGM9URpmFwABvT. Vercel projesi ve mevcut alan adı korunmuştur.
- Yayın komutunda proje grubu açıkça seçilmiştir: otbahijazi101-8258s-projects. İlk yetki hatası bu şekilde giderilmiştir; ek hesap yetkisi verilmemiştir.
- Yönetici oturumunda örnek öğrenci 9: Ekim 2026 kaynak satırları toplam 672 soru, 5 deneme, 1 veli ve 1 öğrenci görüşmesi; yıllık ve aylık görünümler aynı sonuçları gösterir.
- Yıllık defterden Mayıs 2027 açıldığında doğru ay ve boş kayıt durumu görünür; Ekim ayına geri dönüş çalışır.
- Tarayıcıda hata/uyarı kaydı bulunmadı. Dar ekran kontrolünde sayfa genişliği 375 piksel, içerik genişliği 375 piksel; tablolar kendi içinde kayar.
- Giriş ekranı ve canlı panel görsel olarak kontrol edildi. Yazdırma kuralları güncellendi; fiziksel çıktı/PDF sayfalaması bu turda ayrıca doğrulanmadı.
- Bu turda öğretmen, veli ve öğrenci oturumlarıyla yeni bir kabul testi yapılmadı; mevcut erişim kuralları değiştirilmedi.
