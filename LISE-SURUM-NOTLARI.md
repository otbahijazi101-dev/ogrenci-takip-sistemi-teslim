# Lise sürümü

1 Ekim 2026. Canlı adres: https://ogrenci-takip-sistemi-teslim.vercel.app

## Kapsam

Tüm sınıf ve kitap seçimleri 9–12. sınıf düzeyindedir. Veritabanı yeni ortaokul kaydını reddeder. Önceden yüklenmiş 6–8 kitapları veri kaybı olmaması için saklanır, uygulamada ve kullanıcı erişiminde gösterilmez. Lise defterlerinin 90 kitabı aktiftir; 12. sınıf için kaynak liste sağlanmadığından yönetici kitap ekleyebilir.

Aylık defter; ders başına kaynak ve çözülen soru toplamı, deneme türü/ders/net katsayısına göre ayrı toplamlar, puan ortalaması, görüşmeler ve gelişim değerlendirmesini bir araya getirir. Farklı deneme türleri karıştırılmaz. Boşlar, konu alanı, gelişim durumu ve görüşme tarihi eklendi.

Deneme hata analizi, bilgi/uygulama/dikkat/işlem/zaman nedenleri ile çözüm planını kaydeder. Haftalık planda yedi günün ödev, paragraf, ders, tekrar, okuma süresi ve tamamlanma alanları vardır. Defter rehberinde çalışma, sınav, analiz, plan ve veli görüşmesi ilkeleri bulunur. Öğrenciye özel notlar ve okul personeline özel fotoğraf alanı eklendi.

## Örnek kayıtlar

Dört `ÖRNEK` öğrenci, dört örnek sınıf ve 156 ilişkili kayıt oluşturuldu. Öğrenci özel bilgileri kurmacadır. Mevcut gerçek öğrenci ve hesaplar değiştirilmedi. Örnekler `is_sample` alanıyla ayrılır ve ana okul istatistiklerine dahil edilmez. Öğrenciler ekranında gerçek/örnek filtresi vardır.

Örneklerin ayrı giriş hesapları oluşturulmadı. Yönetici mevcut Hesaplar ve Sınıflar ekranlarından isterse yalnızca örnek sınıfa atanmış öğretmen ve örnek öğrenciye bağlı veli/öğrenci hesapları oluşturabilir. Yeni hesaplar gerçek kişilerin hesaplarını taklit etmez.

## Test kaydı

- 12 uygulama testi geçti: lise sınırı, kitap sayısı, hesaplama, tarih ve alan doğrulaması, haftalık program, boş rapor ve metin güvenliği.
- 39 SQL/rol testi geçti: yönetici, atanmış/atanmamış öğretmen, veli, öğrenci, pasif hesap, kitap sınırı, özel bilgi/fotoğraf ve veri doğrulama.
- SQL testleri tek işlemde geri alınır; kalıcı test kullanıcısı bırakmaz.
- Canlı yönetici oturumunda örnek öğrenciler, aylık rapor, hata analizi düzenleme ve kaydın veritabanına ulaşması doğrulandı.
- Üretim derlemesi başarılıdır. Güvenlik başlıkları eklenmiştir. Hesap değiştirme kullanıcı şifrelerini bir listede saklamaz.

## Üretime kabul için açık maddeler

Bu sürüm çalışan bir uygulamadır; testler kusursuzluk garantisi değildir. Sızdırılmış şifre koruması Supabase'de kapalıdır. Hesap sahibi bu özelliğin mevcut planındaki kullanılabilirliğini incelemeli ve etkinleştirmelidir: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Otomatik yedeklerin saklama süresi ve temiz bir test ortamına geri yükleme denemesi henüz doğrulanmadı. Okulun veri saklama/paylaşma kuralları ve dört rolle gerçek kullanıcı kabulü tamamlanmalıdır. Ek maliyet veya hizmet planı değişikliği yapılmadı. Kurulum tablosunun kullanıcı politikası olmaması kasıtlıdır; ilk kurulum bilgileri normal hesaplara kapalıdır.

## Kaynak ve yeniden kurulum

Yeni boş veritabanı: önce `supabase/schema.sql`, sonra `supabase/lise-upgrade.sql`. Mevcut canlı projede ikisi de uygulanmıştır; tekrar sıfırlama olarak çalıştırılmamalıdır. `supabase/sample-data.sql` aynı örnekleri ikinci kez oluşturmaz ve mevcut öğrencileri güncellemez.

`npm ci`, `npm test`, `npm run build` geliştirme kontrolleridir. Hesap fonksiyonunun sabit üretim alan adı izin listesinde tutulur. Şifreler, servis anahtarları ve `.env.local` yayımlanmaz. Kaynak ZIP bir veritabanı yedeği değildir.
