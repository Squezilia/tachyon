# Tachyon

<img width="1280" height="640" alt="Frame 3(1)" src="https://github.com/user-attachments/assets/cb12f4f1-8648-46fb-85fe-2d9a908bfc2f" />

> Takyonlar (Tachyon) ışık hızından daha hızlı giden teorik parçacıklardır.

Tachyon, standart kullanıcının yüksek kalite ERP'ye erişebilmesi için geliştirilmiş bir projedir. AI, POS, Envanter, Analitik modülleri ve Eklenti yapısı sayesinde her duruma adapte olmaya çalışır.

## Modüller
Bütün modüller varsayılan olarak açık gelir. Sistemin çekirdeğini oluşturduklarından ve birbirlerine bağımlılıkları olduğundan devre dışı bırakma gibi bir durum söz konusu olamaz.

### AI (Artifical-Intelligence)
AI Modülü sistemin geneline hakimdir. `Chat` moduyla sorular sorulabilir veya `Agent` moduyla eylemler yaptırılabilir.

#### Akıllı Model Yönlendirme

Tachyon, gelen her promptu kullanıcıya sormadan otomatik olarak doğru model katmanına yönlendirir. Bunun için özel olarak eğitilmiş küçük bir sınıflandırıcı kullanılır: [`tachyon-router-v1-mini`](https://huggingface.co/Squezilia/tachyon-router-v1-mini)

Sınıflandırıcı promptu 4 karmaşıklık seviyesinden birine atar (`trivial` → `simple` → `analysis` → `complex`) ve bu seviyeye karşılık gelen modeli seçer. Böylece basit sorgular gereksiz yere güçlü modellere gönderilmez; maliyet düşer, yanıt hızlanır.

Router; 13.7M parametreli bir ELECTRA modelidir, FP16 ile 26.2MB'tır ve TransformersJS aracılığıyla doğrudan tarayıcıda çalışır — sunucuya ek yük bindirmez.

#### Yetki Yönetimi
Yapay Zeka sistemin geneline hakim olsa bile her konuda izin sahibi değildir. `Chat` modunda sadece `read` izinlerine sahipken `Agent` modunda ise `read` `create` `update` izinlerine sahiptir.

Yapay Zeka sadece kullanıcının yapabildiği eylemlere sahiptir. Bunları yaparken özel bir MCP sunucusu kullanır.

Kullanıcı Yapay Zeka ayarlarından kullanılabilecek araçları ayarlayabilir lakin araç setleri Tachyon tarafından verilir. Kullanıcılar kendi araçlarını ekleyemezler.

### POS
Mantık olarak POS ne yapıyorsa aslında aynısını yapıyor. Standart bir satış kayıt yazılımı gibi davranır, bunun haricinde kendisine özel ilkeleri vardır. Bu ilkeler;

- Her satış değiştirilemezdir. Satışlar, oluşturuldukları andan itibaren değiştirilemezdir. İade gibi durumlar için aynı satışı niteleyen farklı bir kayıt açılması gerekir.
- Aynı satışlarda olduğu gibi siparişlerde kapanışlarını yaptıkları andan itibaren değiştirilemezdir.

Satış ve Sipariş mantığı ise şuna dayanır;
- Satışlar herhangi bir yaşam döngüsüne sahip değillerdir. Oluşturuldukları andan itibaren statik davranırlar.
- Siparişler, satışların aynı özelliklerine sahip olmakla birlikte bir yaşam döngüsüne sahiptirler. Açılırlar, Düzenlenirler ve Kapatılırlar ve değişmezlik ilkesi ise kapandıktan sonra geçerli olur. Siparişler ek olarak bir masaya atanabilirler ama bu zorunlu değildir.

### Envanter
Envanter modülü Ürünler, Kategoriler, Stoklar ve Hareketler olmak üzere 4 başlığa ayrılır. Normal bir envanter yönetim sistemi olarak çalışır ama içerisinde Depo yönetimi barındırmaz. İlerleyen dönemlerde bu özelliğin getirilmesini düşünüyorum.

### Analitik
Analitik modülü organizasyona ait işlemleri ve hareketleri işler. Saf ve Hesaplanmış olarak ikiye ayrılır. Saf analitikler eylemleri gösterirken Hesaplanmış analitikler eylemleri gözle ayırt edilebilir hale getirerek gösterir.

Veri toplama stratejisi; kayıtlı kaynakların ve bağımlılıklarının değişimlerini izlemektir. Örneğin; Satışlar Ürünlere bağımlıdır ve Ürünlerse Kategorilere bağımlıdır. Analitik modülü bu veriyi bir ağaç çıkararak tutar ve zamana bağlı olarak kaydeder.

## Eklenti Yapısı
Eklentiler, `client-side` ve `server-side` olarak ikiye ayrılır.

`client-side` Eklentiler; WASM Sandboxing ve iframe Isolation kullanarak tarayıcıda çalışır. Yüklenen eklentiler Tachyon sunucularından indirilerek çağrılırlar. Kullanıcı arayüzü oluşturabilirler ve kendi yetkilendirme dahilinde araçlar çağırabilirler.

`server-side` Eklentiler; Eklenti sunucusunun WebSockets kullanarak doğrudan Tachyon sunucularına bağlanmasıyla çalışır. Yetkilendirme dahilinde kullanıcı için araçlar çağırabilirler.

### Yetkilendirme
Better Auth OAuth 2.1 Provider eklentisinin kullanılmasıyla yapılır.

---

## Kaynak Kodu

### Gereksinimler

- **Bun** (zorunlu)
- **Node.js** (tooling için, Bun ile birlikte)
- **PostgreSQL** (veya Prisma destekli bir DB)

> Proje Node yerine Bun runtime’ını hedefler.


### Proje Yapısı

```
.
├── apps/
│   ├── backend/        # Backend uygulaması
│   └── frontend/       # Frontend uygulaması 
│
├── packages/
│   ├── database/       # Prisma schema + database client
│   └── config/         # Ortak config / typescript ayarları
│
├── package.json        # Root scripts & workspace config
└── bun.lock

```


### Kurulum

```bash
bun install
```


### Database

#### Prisma client üretme

```bash
bun run db:generate
```

#### Database schema push

```bash
bun run db:push
```

#### Seed çalıştırma

```bash
bun run db:seed
```


### Geliştirme Ortamı

#### Backend

```bash
bun run backend:dev
```

- Watch modunda çalışır
- Entry: `apps/backend/src/main.ts`

#### Frontend

```bash
bun run frontend:dev
```

- Nuxt dev server
- Uygulama `apps/frontend` altında çalışır


### Lint

#### Backend

```bash
bun run backend:lint
```

#### Frontend

```bash
bun run frontend:lint
```


### Build & Hazırlık

#### Backend

Backend Bun runtime hedeflediği için ayrı bir build adımı zorunlu değildir.
Production ortamında direkt entry dosyası çalıştırılabilir.

#### Frontend

```bash
cd apps/frontend
bun run build
```

> Nuxt build çıktıları frontend dizini altında oluşur.


### Deploy

#### Genel Akış

1. Environment değişkenlerini ayarla
2. Database migration / push
3. Backend’i Bun ile ayağa kaldır
4. Frontend build çıktısını deploy et

Örnek backend çalıştırma:

```bash
bun run apps/backend/src/main.ts
```

Frontend deploy yöntemi kullanılan platforma göre değişir
(Vercel, Node server, static output vs.).
