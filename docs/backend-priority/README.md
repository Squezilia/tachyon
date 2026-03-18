# Tachyon Priority Order

Bu doküman, repo içindeki backend, database ve frontend eksiklerini **öncelik sırasına göre** toparlar.

Önceliklendirme mantığı:

- **P0**: Veri bütünlüğü, finansal doğruluk veya üretim akışını doğrudan bozabilecek konular.
- **P1**: Ana feature'ın teknik olarak var olduğu ama eksik/yarım bırakıldığı konular.
- **P2**: Orta vadede düzeltilmesi gereken ama sistemi hemen kırmayan tasarım ve bakım eksikleri.

---

## P0 — Önce çözülmeli

### 1) POS işlemleri stok hareketi yazıyor ama gerçek stok miktarını güncellemiyor
**Neden kritik?**
- Retail sale ve gastro order akışları `stockMovement` kaydı oluşturuyor.
- Ancak `Stock.quantity` alanı transaction içinde azaltılmıyor.
- Bu durumda sistem hareket geçmişi üretse bile gerçek stok sayısı yanlış kalıyor.

**Etkisi**
- Satış sonrası stok ekranı yanlış görünür.
- Sonraki sipariş/satış validasyonları bozulabilir.
- Raporlama ile gerçek operasyon arasında fark oluşur.

**Önerilen çözüm**
- Retail create, gastro create ve gastro update transaction'larına `stock.update` adımlarını ekle.
- Hareket kaydı ve stok miktarı değişimini tek transaction içinde tut.
- İlgili akışlar için entegrasyon testleri yaz.

### 2) Refund akışları tamamlanmamış ve retail refund veri bütünlüğü riski taşıyor
**Neden kritik?**
- Gastro refund doğrudan stub durumda.
- Retail refund “pending” olarak işaretlenmiş.
- Retail reversal oluştururken mevcut `CartProduct` kayıtlarını `connect` ettiği için, bunların yeni reversal sell'e taşınması ve orijinal kaydın bozulması riski var.

**Etkisi**
- Orijinal satış kaydı bozulabilir.
- İade sonrası stok, gelir ve denetim kayıtları güvenilmez olabilir.
- Muhasebe ve operasyon raporları hatalı çıkabilir.

**Önerilen çözüm**
- Refund için ayrı reversal cart item üret.
- `reverseStocks` davranışını gerçekten uygula.
- Refund sonrasında stok, ödeme ve audit kayıtlarını birlikte yöneten tek bir domain akışı kur.

### 3) Payment domain pratikte kapalı
**Neden kritik?**
- Şemada `Payment` modeli var.
- Ama model hem `sellId` hem `orderId` alanlarını zorunlu istiyor.
- Seed de bu yüzden payment oluşturmayı atlıyor.
- Ayrı payment endpoint'leri de yok.

**Etkisi**
- Satış/sipariş kapanışı ile ödeme kaydı birbirinden kopuk kalıyor.
- Gerçek finansal kapanış modeli oluşmuyor.
- Refund ve tahsilat süreçleri eksik kalıyor.

**Önerilen çözüm**
- `Payment` modelini tekrar tasarla: ödeme ya sell'e ya order'a bağlı olmalı.
- Payment CRUD / capture / refund API'lerini ekle.
- Payment status geçişlerini netleştir.

### 4) CRUD permission kontrollerinde ters eşleşmeler var
**Neden kritik?**
- Bazı route'larda update işlemi delete izni istiyor.
- Bazı route'larda delete işlemi update izni istiyor.
- Bu durum product/category/tax/table endpoint'lerinde tekrar ediyor.

**Etkisi**
- Doğru role sahip kullanıcı doğru işlemi yapamayabilir.
- Yanlış role sahip kullanıcı beklenmeyen işlemler yapabilir.
- UI bug gibi görünen bazı problemler aslında permission bug'ı olabilir.

**Önerilen çözüm**
- Tüm permission check'lerini route bazında audit et.
- Route davranışı ile access-control matrix'ini eşleştir.
- Her resource için create/view/update/delete yetki testleri ekle.

---

## P1 — Ana feature'ı tamamlamak için gerekli

### 5) Campaign engine POS akışına bağlı değil
**Neden önemli?**
- Retail endpoint request body içinde `campaigns` alıyor.
- Ancak fiyat hesaplama servisinde campaign input'u kullanılmıyor.
- Şemada `CampaignApplication` modeli olmasına rağmen sale sırasında uygulama yok.

**Etkisi**
- Kampanya ekranı ile POS akışı arasında fonksiyonel kopukluk olur.
- Kullanıcı kampanya tanımlasa bile checkout sırasında etkisini göremez.

**Önerilen çözüm**
- Pricing pipeline içine campaign resolution adımı ekle.
- Uygulanan kampanyaları `CampaignApplication` olarak persist et.
- Ürün bazlı ve basket bazlı kampanyalar için test senaryoları yaz.

### 6) Role matrix ile route permission talepleri tam örtüşmüyor
**Neden önemli?**
- Bazı route'lar `sell.view`, `order.view`, `gastro.close` gibi izinler bekliyor.
- Role tanımlarında bunların bazıları eksik görünüyor.

**Etkisi**
- Route mevcut olsa da belirli rollerde fiilen kullanılamayabilir.
- Yönetici rolü bile bazı temel ekranları göremeyebilir.

**Önerilen çözüm**
- Role matrisi ile tüm route permission isteklerini karşılaştır.
- Eksik statement'ları rollere ekle veya route'ları güncelle.
- Bu eşleşmeyi test eden otomatik authorization testleri oluştur.

### 7) Orders / sells detail API yüzeyi eksik
**Neden önemli?**
- Sells ve orders için list endpoint'leri var.
- Ama detail tarafı backend'de açık şekilde tamamlanmış görünmüyor.

**Etkisi**
- Frontend detail ekranları kolayca bağlanamıyor.
- Refund, audit, drill-down gibi akışlar zayıf kalıyor.

**Önerilen çözüm**
- `GET /sells/:id` ve `GET /orders/:id` benzeri detay endpoint'leri ekle.
- İlgili cart item, tax, campaign application ve issuer/table ilişkilerini dahil et.

### 8) Product soft-delete tasarımı tamamlanmamış
**Neden önemli?**
- Product şemasında `deletedAt` ve `deletedBy` alanları mevcut.
- Ama delete endpoint'i hard delete yapıyor.

**Etkisi**
- Silinen ürünlerin denetim izi kaybolabilir.
- Geçmiş satış kayıtlarıyla ilişki yönetimi zorlaşabilir.
- Şema tasarımı ile uygulama davranışı çelişir.

**Önerilen çözüm**
- Product silme davranışını soft-delete'a çevir.
- Liste endpoint'lerinde `deletedAt: null` filtresini standartlaştır.
- Gerekirse ayrı restore akışı ekle.

---

## P2 — Şema ve bakım kalitesi için önemli

### 9) Negatif stock'a düşmeyi engelleyen koruma eksik
**Neden önemli?**
- `Stock.quantity` alanı için DB seviyesinde non-negative koruma yok.
- Drain endpoint'i de mevcut quantity kontrolü yapmadan decrement ediyor.

**Etkisi**
- Negatif stok oluşabilir.
- Operasyonel veri kalitesi düşer.

**Önerilen çözüm**
- Uygulama seviyesinde quantity guard ekle.
- Mümkünse DB constraint veya transaction-level validation uygula.

### 10) Organization slug uniqueness devre dışı
**Neden önemli?**
- `slug` alanı var.
- Ama unique constraint yorum satırına alınmış.

**Etkisi**
- Tenant / organization URL çözümlemesinde çakışma riski oluşur.
- Gelecekte org-switching ve public organization references zorlaşır.

**Önerilen çözüm**
- Slug kullanım senaryosunu netleştir.
- Gerekliyse unique constraint'i geri ekle.
- Mevcut veriler için migration planı oluştur.

### 11) Member modelinde DB seviyesinde uniqueness garantisi yok
**Neden önemli?**
- Aynı user'ın aynı organization'a birden fazla kez eklenmesini DB tek başına engellemiyor.

**Etkisi**
- Membership duplication riski oluşur.
- Permission ve raporlama tarafında yan etkiler çıkabilir.

**Önerilen çözüm**
- `@@unique([organizationId, userId])` benzeri bir constraint değerlendir.
- Invitation/member create akışlarında idempotency kontrolü ekle.

### 12) Migration disiplini repo içinde görünür değil
**Neden önemli?**
- Repo'da Prisma schema ve script'ler var.
- Ama versioned migration geçmişi görünmüyor.

**Etkisi**
- Ortamlar arası schema drift riski artar.
- Prod rollout ve rollback zorlaşır.

**Önerilen çözüm**
- Prisma migration'ları versioned olarak repo'ya dahil et.
- Schema change sürecini README seviyesinde standardize et.

---


## Frontend özeli detaylı eksikler

Aşağıdaki maddeler, backend/database tarafındaki eksiklerden bağımsız olarak **UI katmanında açıkça yarım kalmış** alanları toplar.

### FE-1) Action wiring birçok ekranda eksik veya yanlış endpoint'e gidiyor
**Neden önemli?**
- Campaigns, members, stocks, audit, orders ve sells ekranlarında action callback'lerinin önemli kısmı boş bırakılmış.
- Products, categories, taxes ve tables listelerinde delete aksiyonları `/delete/:id` benzeri endpoint'lere gidiyor; mevcut backend route yapısı ile bu path'ler uyuşmuyor.
- Tables ekranında duplicate/delete çağrıları ayrıca `/gastro` prefix'ini de kaçırıyor.

**Etkisi**
- Kullanıcı action menüsünü görse de işlem fiilen çalışmıyor.
- Bazı butonlar sessizce başarısız olurken bazıları 404 üretebilir.
- UI, backend capability varmış gibi görünse de operasyon akışı tamamlanmıyor.

**Önerilen çözüm**
- Tüm action callback'lerini ekran bazında inventory listesi çıkararak bağla.
- Frontend route/path kullanımını backend contract ile birebir eşleştir.
- Özellikle destructive action'lar için smoke test ekle.

### FE-2) Campaigns ve members yönetimi kullanılabilir seviyede değil
**Neden önemli?**
- Campaigns ekranı sadece liste gösteriyor; details/duplicate/edit/delete action'larının tamamı boş.
- Members ekranında tablo kolonları tanımlı olsa da tablo render'ı yorum satırına alınmış.
- Members kolonlarında da placeholder/accessor tutarsızlıkları var.

**Etkisi**
- Yönetim panelinin iki önemli bölümü kullanıcıya açık ama fiilen kullanılamıyor.
- Organization yönetimi ve kampanya operasyonu admin panelinde tamamlanmış hissi vermiyor.

**Önerilen çözüm**
- Campaign create/edit/detail/delete akışlarını bağla.
- Members ekranında tabloyu tekrar aktif et ve gerçek organization member API akışını stabilize et.
- Davranış ve kolon eşleşmelerini yeniden gözden geçir.

### FE-3) Stock ve audit tarafında ileri akışlar eksik
**Neden önemli?**
- Stocks ekranında sadece listeleme ve create var; detail/delete boş.
- Audit ekranında detail, stock'a git ve product'a git action'ları boş.
- Backend'de restock/drain capability varken frontend'de buna karşılık gelen akış görünmüyor.

**Etkisi**
- Stok yönetimi günlük operasyon için yarım kalıyor.
- Audit ekranı sadece pasif bir log listesine dönüşüyor.

**Önerilen çözüm**
- Stock detail, restock ve drain dialog/sayfalarını ekle.
- Audit kayıtlarından ilgili stock/product detaya geçiş sağla.
- Kritik stok aksiyonları için optimistic refresh veya invalidate stratejisi ekle.

### FE-4) POS yönetim ekranlarında placeholder veri ve eksik drill-down var
**Neden önemli?**
- Orders ve sells ekranlarında detail/refund action'ları boş.
- Hücrelerin bazılarında gerçek veri yerine `Payment` veya `Sell` gibi hard-coded değerler gösteriliyor.
- Orders ekran başlığı bile `Sells` olarak görünüyor.
- Tables ekranında details boş; bazı aksiyon path'leri de hatalı.

**Etkisi**
- POS backoffice görünürde mevcut ama operasyonel takip için yetersiz.
- Kullanıcı hangi kaydın neye ait olduğunu detaylı inceleyemiyor.

**Önerilen çözüm**
- Sell/order detail drawer ya da sayfalarını ekle.
- Payment/table/reversal alanlarında gerçek veri bağla.
- Orders/tables ekran kopyası kaynaklı label ve route hatalarını temizle.

### FE-5) Tamamen boş bırakılmış ekranlar hâlâ navigation içinde görünür durumda
**Neden önemli?**
- Analytics aggregated/raw, management general ve user alt sayfaları boş template içeriyor.
- Navigation ve kullanıcı menüsü bu ekranlara link vermeye devam ediyor.

**Etkisi**
- Kullanıcı ürünün tamamlanmamış alanlarına doğrudan düşüyor.
- Ürünün tamamlanmışlık algısı zedeleniyor.

**Önerilen çözüm**
- Bu sayfaları ya geçici olarak navigation'dan kaldır ya da minimum placeholder + roadmap state göster.
- Analytics ve user settings için kapsamlı UX backlog'u ayrı başlık olarak planla.

### FE-6) Küçük ama yaygın tamamlanmamışlıklar
**Neden önemli?**
- Products, categories ve taxes listelerinde detail action'ları boş.
- Bazı sayfalarda naming ve copy tutarsızlıkları var.

**Etkisi**
- Sistem genelinde “yarım kalmış admin panel” hissi oluşturuyor.

**Önerilen çözüm**
- Tüm listeler için ortak CRUD tamlık checklist'i oluştur.
- Detail/edit/delete/duplicate akışlarını resource bazlı standartlaştır.

---

## Önerilen uygulama sırası

1. **Stock senkronizasyonunu düzelt**
2. **Refund domain'ini güvenli hale getir**
3. **Payment modelini ve API'sini tamamla**
4. **Frontend action/path contract hatalarını temizle**
5. **Campaign engine + campaign UI akışını tamamla**
6. **Stock, audit, order ve sell detail akışlarını uçtan uca bağla**
7. **Members, general, analytics ve user placeholder ekranlarını toparla**
8. **Permission / role mismatch'lerini temizle**
9. **Soft-delete, DB constraint ve migration eksiklerini toparla**

---

## “Done” kriteri önerisi

Bir başlık kapatılmadan önce en az şunlar tamamlanmış olmalı:

- Domain davranışı net tanımlanmış olmalı.
- Endpoint + schema + auth üçlüsü birbiriyle uyumlu olmalı.
- En az bir başarılı ve bir başarısız test senaryosu yazılmış olmalı.
- Seed/demo verisi yeni davranışı desteklemeli.
- Frontend'in çağıracağı response şekli stabil hale gelmiş olmalı.
