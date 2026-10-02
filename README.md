# Lise Öğrenci Takip Sistemi

Türkçe, yönetici/öğretmen/veli/öğrenci rollü, Supabase üzerinde kalıcı kayıt tutan 9–12. sınıf takip sistemi.

Canlı adres: https://ogrenci-takip-sistemi-teslim.vercel.app

Güncel kapsam, test kanıtları ve üretime kabul için açık maddeler **LISE-SURUM-NOTLARI.md** içindedir. Kaynak defter eşlemesi **DEFTER-KAPSAMI.md** içindedir.

## Kullanım

Yönetici önce öğretmen hesabı ve sınıf oluşturur, ardından öğrenci ekler. Veli ve öğrenci hesapları Hesaplar → Bağlantılar üzerinden doğru öğrenciye bağlanır. Öğretmen yalnızca atanmış sınıfı görür. Veli sadece paylaşılan kayıtları okur; öğrenci kendi okuma ve haftalık plan kayıtlarını ekleyip düzenleyebilir.

Öğrenci dosyasında ay seçilerek aylık defter, değerlendirme, ders, deneme, görüşmeler, okuma, haftalık program, hata analizi ve notlar açılır. Sınıf, öğrenci, kitap ve hesaplar yönetici tarafından düzenlenir. Öğrenci ve sınıflar silinmeden pasifleştirilebilir.

Özel öğrenci bilgileri ve fotoğraf yalnızca yönetici/atanmış öğretmene açıktır. Diğer kayıtların veli ve öğrenciye görünmesi için paylaşım seçeneği açılmalıdır. Fotoğraflar en fazla 5 MB JPG/PNG/WebP olarak seçilir, yüklenmeden önce küçültülür.

Hesap değiştir / Çıkış mevcut oturumu kapatır; diğer hesabın şifresi gerekir. Şifrem sayfası mevcut şifre doğrulamasıyla çalışır. Unutulan şifreyi yönetici Hesaplar ekranından yeniler. Kullanıcı adları giriş için dahili olarak @ogrenci.invalid adresine dönüştürülür; e-posta gönderimi kullanılmaz.

Örnek öğrenciler açıkça etiketlenir ve gerçek okul istatistiklerinden ayrılır. Ayrı örnek giriş hesapları oluşturulmamıştır. Dört örnek öğrenci ve 156 dolu kayıt yönetici ekranında incelenebilir.

## Geliştirme ve kurulum

Node.js 22.12 veya üzeri gerekir. Bağımlılıklar kilit dosyasıyla sabitlenmiştir.

- npm ci
- npm test
- npm run dev
- npm run build
- npm start

Yerel sunucu 127.0.0.1:5173, hazır sürüm sunucusu 127.0.0.1:4173 kullanır.

Yeni boş veritabanında önce supabase/schema.sql, ardından supabase/lise-upgrade.sql uygulanır. Canlı projeye bu adımlar zaten uygulanmıştır. Bunlar sıfırlama komutu değildir; mevcut projede tekrar çalıştırmayın. supabase/sample-data.sql yalnızca örnek verileri ekler ve aynı öğrenci numaralarını tekrar eklemez.

supabase/book-data.js yalnızca 9–11. sınıfların 90 kaynak kitabını dışa verir. 12. sınıf listesi kaynakta bulunmadığı için yönetici tarafından doldurulur.

Hesap yönetimi supabase/functions/manage-accounts/index.ts fonksiyonundadır. JWT doğrulaması ve aktif yönetici kontrolü korunur. Sabit canlı adres izin listesindedir; başka alan adı kullanılacaksa açıkça eklenmelidir.

Yeni Supabase projesine taşınırken .env.example temel alınır. URL ve anahtarlar yeni projeye ait olmalıdır. Servis anahtarı tarayıcıya verilmez. İlk kurulum tek kullanımlık, süreli kodla yapılır; mevcut projede kapalıdır. Şifreleri, gizli dosyaları, .env.local ve Vercel oturum dosyalarını Git'e veya yayın paketine eklemeyin.

## Test ve güvenlik

12 birim testi ve 39 veritabanı/rol testi geçmiştir. tests/rls.sql testlerini tercihen ayrı test projesinde çalıştırın; işlem sonunda ROLLBACK ile test kayıtları geri alınır. Kaynak paket bir veritabanı yedeği değildir.

Üretim kabulü için sızdırılmış şifre koruması, yedekleme ve geri dönüş denemesi, okul veri saklama/paylaşma kuralları ve dört rolün kullanıcı kabulü tamamlanmalıdır. Ayrıntılar LISE-SURUM-NOTLARI.md dosyasındadır.
