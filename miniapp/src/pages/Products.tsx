import { useMemo, useState } from "preact/hooks";
import { api, type Product } from "../api";
import { pct, rupiah } from "../format";
import { Empty, ErrorBox, Field, Loading, MoneyInput, PrimaryAction, Row, Section, useApp, useAsync, useSaver, type AppCtx } from "../ui";

function openProductForm(app: AppCtx, product?: Product): void {
  app.push({ key: `product-${product?.id ?? "new"}-${Date.now()}`, title: product ? "Ubah produk" : "Produk baru", render: () => <ProductForm product={product} /> });
}

export function ProductsPage() {
  const app = useApp();
  const [q, setQ] = useState("");
  const { data, error, loading, reload } = useAsync(() => api.products(), [app.version]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? []).filter((p) => !s || p.name.toLowerCase().includes(s));
  }, [data, q]);

  return (
    <div>
      <header class="page-head row-head">
        <h1>Produk</h1>
        {app.isAdmin ? (
          <button class="btn primary small" onClick={() => openProductForm(app)}>
            + Produk
          </button>
        ) : null}
      </header>
      <div class="filters">
        <input type="search" value={q} placeholder="Cari produk" onInput={(e) => setQ(e.currentTarget.value)} />
      </div>
      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !list.length ? (
        <Empty>{data?.length ? "Tidak ada yang cocok." : "Belum ada produk. Penjualan tanpa produk bisa dicatat lewat Penjualan cepat."}</Empty>
      ) : (
        <Section title={`${list.length} produk`}>
          {list.map((p) => (
            <Row
              left={p.name}
              sub={
                p.cost_price !== undefined
                  ? `HPP ${rupiah(p.cost_price)} · margin ${pct(p.sell_price - p.cost_price, p.sell_price)}`
                  : app.meta.features.stock && p.track_stock
                    ? `stok ${p.stock}`
                    : undefined
              }
              right={rupiah(p.sell_price)}
              onClick={app.isAdmin ? () => openProductForm(app, p) : undefined}
            />
          ))}
        </Section>
      )}
    </div>
  );
}

function ProductForm({ product }: { product?: Product }) {
  const app = useApp();
  const [name, setName] = useState(product?.name ?? "");
  const [cost, setCost] = useState(product?.cost_price ?? 0);
  const [sell, setSell] = useState(product?.sell_price ?? 0);
  const { busy, run } = useSaver();
  const margin = sell - cost;

  const save = () =>
    run(async () => {
      if (product) await api.updateProduct(product.id, { name: name.trim(), cost_price: cost, sell_price: sell });
      else await api.createProduct({ name: name.trim(), cost_price: cost, sell_price: sell });
      app.bump();
      app.pop();
    }, product ? "Produk diperbarui" : "Produk ditambahkan");

  return (
    <div class="form">
      <Field label="Nama produk">
        <input type="text" maxLength={80} value={name} placeholder="mis. Salep Kulit 30g" onInput={(e) => setName(e.currentTarget.value)} />
      </Field>
      <Field label="HPP / modal per unit">
        <MoneyInput value={cost} onChange={setCost} />
      </Field>
      <Field label="Harga jual">
        <MoneyInput value={sell} onChange={setSell} />
      </Field>
      {sell > 0 ? (
        <p class="preview">
          Untung per unit <b class={margin < 0 ? "neg" : "pos"}>{rupiah(margin)}</b> · margin {pct(margin, sell)}
        </p>
      ) : null}
      {product ? <p class="footnote">Mengubah harga tidak mengubah penjualan yang sudah tercatat.</p> : null}
      <PrimaryAction text="Simpan" onClick={save} disabled={!name.trim() || sell <= 0} busy={busy} />
    </div>
  );
}
