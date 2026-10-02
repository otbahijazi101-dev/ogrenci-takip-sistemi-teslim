// Kaynak: kullanıcının 6–11. sınıf takip defterlerindeki 30'ar kitaplık listeler.
// Kaynakta boş bırakılan alanlara dışarıdan bilgi eklenmemiştir.
const lists = {
  6: `Ahi Evren Efsanesi Kayıp Zaman|Zübeyr Tokgöz
Aliya|Meryem Uçar
Ayasofya'da Bir Gece|Rana Demiriz
Beşir ve Osman Bey|Ferhat Özbadem
Beşir ve Selahaddin Eyyübi|Ferhat Özbadem
Bilim Öyküleri|Tarık Uslu
Bir Kelime Sayyahı|Kaşgarlı Mahmut
Çılgın Mucitler|Yusuf Asal
Dedemin Bakkalı|Şermin Yaşar
Ömer Muhtar|Sevgi Başman
Fadiş|Gülten Dayıoğlu
Fatih Sultan Mehmet|İsmail Bilgin
Haritada Kaybolmak|Vladimir Tumanov
İbni Sina Bilim Öncüleri|
İnsan Ne ile Yaşar|Lev Tolstoy
Küçük Prens|
Macera Adası|Ahmet Yılmaz Boyunağa
Minberin Sırrı|Abdullah Yıldız
Momo|Michael Ende
Muhteşem Zafer Çanakkale|Yusuf Asal
Neşeli Öyküler (2 Kitap)|Selim Gündüzalp
Ormanda Gizemli Bir Gece|Nehir Aydın Gökduman
Sürpriz Tatilde Köydeyiz|Fatma Çağdaş Börekçi
Şehitler Tepesi|Mustafa Özçelik
Ulak Serisi (5 Kitap)|Oktay Tiryakioğlu
Üç Kaçak Yolcu|Yavuz Bahadıroğlu
Tufan|A. Yılmaz Boyunağa
Yasemen|Hasan Nail Canat
Yiğit Mustafa|Hasan Nail Canat
Yürek Dede ile Padişah|Cahit Zarifoğlu`,
  7: `Alice Harikalar Diyarında|Lewis Carrol
Altın Yapraklar|A. Yılmaz Boyunağa
Anton Çehov'dan Hikayeler|Anton Çehov
Beşir ve Osman Bey|Ferhat Özbadem
Beşir ve Selahaddin Eyyübi|Ferhat Özbadem
Koçyiğit Köroğlu|Ahmet Kutsi Tecer
Büyük Hayatlar Büyük Düşünceler|Saliha Şahin
Cafer Efe|İsmail Bilgin|Timaş|Tarih
Casus Mehmet|İsmail Bilgin|Timaş|Tarih
Çaylak ve Filozof 1|Özkan Öze
Çaylak ve Filozof 2|Özkan Öze
Çizgili Pijamalı Çocuk|John Boyne
Çocuk Sahabeler (1–5)|Talip Arışahin|Damla
Dede Korkut Hikayeleri|Anonim
Demiryolu Çocukları|Edith Nesbit
Denizler Ejderi|Ahmet Yılmaz Boyunağa
Sular Altında Bir Ülke|Yavuz Bahadıroğlu
Dünyanın Merkezine Yolculuk|Jules Verne
El Biruni|Hasan Yiğit
Falaka|Ahmet Rasim
Hamdi Bey|İsmail Bilgin|Timaş|Tarih
Haram Yemenin Sonu|Yavuz Bahadıroğlu
Hatice Bacı|İsmail Bilgin|Timaş|Tarih
İki Yıl Okul Tatili|Jules Verne
İnsan Ne ile Yaşar|Lev Tolstoy
Kambur Kerim|İsmail Bilgin|Timaş|Tarih
Kelile ve Dimne|Beydeba
Korsan Peşinde|Ahmet Yılmaz Boyunağa
Tarih Cesaretle Yazılır|Yavuz Bahadıroğlu
Martı|Richard Bach`,
  8: `Ağaç Okul|Cahit Zarifoğlu
İki Dirhem Bir Çekirdek|İskender Pala
Ali Kuşçu|Ayşenur Yiğit
Alparslan'ın Akıncısı (2 Kitap)|İsmail Bilgin|Timaş Yayınları|Macera
Aya Yolculuk|Jules Verne
Ayasofya'da Bir Gece|Rana Demiriz
Beşir ve Abdulhamit|Ferhat Özbadem
Beşir ve Fatih Sultan Mehmet|Ferhat Özbadem
Bilim Dedektifleri Böcek Kam Uyanıyor|Emir Hersan|Timaş Yayınları|Eğlenceli Bilgi
Bilim Dedektifleri Güç Taşı|Emir Hersan|Timaş Yayınları|Eğlenceli Bilgi
Davet Yolunda Bir Siyah Bir Beyaz|Ramazan Kayan|Çıra|Şahsiyet|160
Denizler Ejderi|A. Yılmaz Boyunağa
Diyet|Ömer Seyfettin
Dünyanın Merkezine Yolculuk|Jules Verne
Gençler İçin Siyer-i Nebi|Adem Apak
Gizli Mabet|Ömer Seyfettin
Hacı Murat|Lev Tolstoy
İbn-i Haysem|Elif Akardaş
Kutsal Taç|Muammer Karadeniz
Memleket Hikayeleri|Refik Halit Karay
Momo|Michel Ende
Sadako|Eleanor Coerr
Şehzade Murat|Yavuz Bahadıroğlu
Şu Acayip Şeyler (4 Kitap)|Tarık Uslu|Uğurböceği|Eğlenceli Bilgi
Vatan İçin|Yavuz Bahadıroğlu
Yaralı Serçe|Hasan Nail Canat
Secdede Son Nefes|Halit Ertuğrul
Yoksulluk İçimizde|Mustafa Kutlu
Yunus Emre'den Seçmeler|
Don Kişot|Cervantes`,
  9: `Gençlerle Başbaşa|Ali Fuad Başgil|Yağmur|Fikir|80
Uçurumdan Dönüş|Halit Ertuğrul|Nesil|İslami|102
Bilim Tarihi Sohbetleri|Fuat Sezgin, Sefer Turan|Pınar|Şahsiyet|220
Kalbin Erbaini|Mehmet Görmez|Otto|İslami|728
Yusuf'un Üç Gömleği|Abdullah Yıldız|Pınar|Yerli Edebiyat|118
İslam'da Adabı Muaşeret|A. Ebu Gudde|Muallim Neşriyat|Şahsiyet|128
Gelin Müslüman Olalım|Mevdudi|Pınar|İslami|262
Simyacı|Paulo Coelho|Can|Dünya Edebiyatı|188
Bu Böyledir|Mustafa Kutlu|Dergah|Yerli Edebiyat|90
Zamanın Kıymeti|A. Ebu Gudde|Takdim|Şahsiyet|159
Aliya|Mahmut Hakkı Akın|İlke|Şahsiyet|134
Bu Ümmetin Genci|Nurettin Yıldız|Tahlil|Fikir|228
Peygamberimizi Sahabe Gibi Sevmek|M. Emin Yıldırım|Siyer Yayınları|İslami|198
Gençler İçin Sosyal Medya İlmihali|Abdulaziz Kıranşal|MGV Yayınları|İslami|135
İslam ve İnsanlığın Geleceği|Roger Graudy|Timaş|Fikir|222
Hayat Güzeldir|Mustafa Kutlu|Dergah|Yerli Edebiyat|167
Fahrettin Paşa Medine Müdafası|İsmail Bilgin|Timaş|Tarih Roman|256
Esir|Adem Özköse|Pınar|Şahsiyet|223
İslam Deklarasyonu|Aliya İzzetbegoviç|Yarın|Fikir|115
Reis Bey|Necip Fazıl Kısakürek|Büyük Doğu|Fikir|152
İçimde AVM Var|Sadettin Ökten|Tuti Kitap|Fikir|205
Cemil Meriç'in Dünyası|Mustafa Armağan|Ketebe|Şahsiyet|319
Mihmandar|İskender Pala|Kapı|Yerli Edebiyat|400
Kayıp Minberin Sırrı|Abdullah Yıldız|Pınar|İslami|208
Satranç|Stefan Zweig|Can|Dünya Edebiyatı|71
Osmancık|Tarık Buğra|Ötüken|Yerli Edebiyat|376
Beyaz Gemi|Cengiz Aytmatov|Ötüken|Dünya Edebiyatı|168
Düşün ve Başar|Muhammed Bozdağ|Hayat|Kişisel Gelişim|324
Sevgi Zekası|Muhammed Bozdağ|Hayat|Kişisel Gelişim|151
Hızırla Kırk Saat|Sezai Karakoç|Diriliş|Yerli Edebiyat|128`,
  10: `Gençlerle Başbaşa|Ali Fuad Başgil|Yağmur|Fikir|80
Ruhsal Zeka|Muhammed Bozdağ|Hayat|Kişisel Gelişim|202
Sünnet ve Hadisi Anlama Kılavuzu|Mehmet Görmez|Otto|İslami|552
Bu Ümmetin Genci|Nurettin Yıldız|Tahlil|İslami|228
Zamanın Kıymeti|A. Ebu Gudde|Takdim|Şahsiyet|159
Nehirlerin Dili|İhsan Süreyya Sırma|Beyan|İslami|220
Yoksulluk İçimizde|Mustafa Kutlu|Dergah|Edebi Hikaye|104
Dünyaya Geldim Gitmeye|Kemal Sayar|Turkuaz|İslami|130
Avrupa'da İslam Damgası|Jack Goody|Nesil|Fikir|224
Son Peygamber|Ebu Hasan En Nedvi|Nebevi Hayat|İslami|236
Kuran'ı Anlamaya Giriş|Abdullah Yıldız|Pınar|İslami|248
İnternet Fıkhı|Nurettin Yıldız|Tahlil|İslami|198
İki Şehrin Hikayesi|Charles Dickens|Can|Dünya Edebiyatı|462
Doğu ve Batı Arasında İslam|Aliya İzzetbegoviç|Ketebe|Fikir|400
Diriliş Neslinin Amentüsü|Sezai Karakoç|Diriliş|Fikir|68
İstemenin Esrarı|Muhammed Bozdağ|Hayat|Kişisel Gelişim|140
İtiraf|İskender Pala|Kapı|Edebi Roman|248
Ya Tahammül Ya Sefer|Mustafa Kutlu|Dergah|Yerli Edebiyat|124
Amakı Hayal|Ahmet Hilmi|Kaknüs|Yerli Edebiyat|218
Müslümanca Düşünme Üzerine Denemeler|Rasim Özdenören|İz Yayıncılık|Fikir|166
Kuyucaklı Yusuf|Sabahattin Ali|Can|Yerli Edebiyat|253
Semerkand|Amin Maalouf|YKY|Dünya Edebiyatı|318
Düzceli Mehmet|Halit Ertuğrul|Nesil|İslami|220
Fincanımda Kola Var|Sadettin Ökten|Tuti Kitap|Deneme|230
Bir Dava Adamının Notları|Zübeyir Gündüzalp|Sebat|Kişisel Gelişim|246
Diken ve Karanfil|Yahya Sinvar|Ekin|Anı|733
Dijitalizm|Sait Ercan|Motto|Kişisel Gelişim|403
Bu Ülke|Cemil Meriç|İletişim|Fikir|341
Beş Şehir|Ahmet Hamdi Tanpınar|Dergah|Yerli Edebiyat|224
Dünya Bir İnkılap Bekliyor|Necip Fazıl Kısakürek|Büyük Doğu|Fikir|134`,
  11: `Bülbülün Kırk Şarkısı|İskender Pala
İslam Benden Ne İster?|Enbiya Yıldırım
Siyerden Hayata (2 Cilt)|M. Emin Yıldırım
Çaylak ile Filozof (7 Kitap)|Özkan Öze
Kendini Arayan Adam|Halit Ertuğrul
Sonsuzluk Yolculuğu|Muhammed Bozdağ
Bırakma Kendini|Mehmet Dinç
Çöle İnen Nur|Necip Fazıl
Son Devrin Din Mazlumları|Necip Fazıl
İslam Öncesi Mekke Dönemi ve Hz. Muhammed|İhsan Süreyya Sırma
Medine Dönemi ve Cihad|İhsan Süreyya Sırma
İslami Tebliğin Örnek Halifeler Dönemi|İhsan Süreyya Sırma
Kudüs Fatihi Selahaddin Eyyubi|Ramazan Şeşen
Sefiller|Victor Hugo
İnsan Ne ile Yaşar|Tolstoy
Gençlerle Baş Başa|Ali Fuat Başgil
Diriliş Neslinin Amentüsü|Sezai Karakoç
Aşk 5 Vakittir|Mehmet Yıldız
Yusuf'un Üç Gömleği|Abdullah Yıldız
Beyaz Zambaklar Ülkesinde|Grigory Petrov
24 Saat Müslümanca Bir Hayat|İhsan Şenocak
Fabrika Ayarı|Bekir Develi
Satır Arası Hikayeler|Serdar Tuncer
Yollar Dönüşe Gider|Nurullah Genç
Gül Yetiştiren Adam|Rasim Özdenören
Suç ve Ceza|Dostoyevski
İslam Deklarasyonu|Aliya İzzetbegoviç
Gençliğin Anlam Arayışı|Mehmet Görmez
Semerkant|Amin Maalouf
Küçük Ağacın Eğitimi|Forrest Carter`,
};
export const books = Object.entries(lists)
  .filter(([grade]) => Number(grade) >= 9)
  .flatMap(([grade, text]) =>
    text.split("\n").map((line) => {
      const [title, author = "", publisher = "", genre = "", pages = ""] =
        line.split("|");
      return {
        grade: Number(grade),
        title,
        author,
        publisher,
        genre,
        pages: pages ? Number(pages) : null,
      };
    }),
  );
