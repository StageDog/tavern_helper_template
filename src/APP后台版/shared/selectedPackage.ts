import { ref } from 'vue';
import { shopStoreMvu } from './shopStoreMvu';

export type SelectedPackage = {
  id?: string;
  name?: string;
  shop_id?: string;
  shop_name?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  price?: any;
  stars?: any;
  tags?: any;
  icon?: any;
  description?: any;
  content?: any;
  reviews?: any;
};

export const selectedPackage = ref<SelectedPackage | null>(null);
export const selectedShopId = ref<string | null>(null);
export const selectedPackageId = ref<string | null>(null);

function coerceId(v: any) {
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (typeof v === 'number' && !Number.isNaN(v)) return String(v);
  return '';
}

export function setSelectedPackage(next: SelectedPackage | null) {
  selectedPackage.value = next;
  selectedShopId.value = next?.shop_id ? String(next.shop_id) : null;
  selectedPackageId.value = next?.id ? String(next.id) : null;
}

export function setSelectedPackageFromShop(shop: any, pkg: any) {
  if (!shop || !pkg) return;
  const shopId = coerceId((shop as any).id || (shop as any).shop_id);
  const shopName = (shop as any).shopname || (shop as any).name || '未命名店铺';
  const pkgId = coerceId(pkg?.id);

  setSelectedPackage({
    id: pkgId || undefined,
    name: pkg?.name || '未命名套餐',
    shop_id: shopId || undefined,
    shop_name: String(shopName),
    image1: typeof pkg?.image1 === 'string' ? pkg.image1 : '',
    image2: typeof pkg?.image2 === 'string' ? pkg.image2 : '',
    image3: typeof pkg?.image3 === 'string' ? pkg.image3 : '',
    price: (pkg as any)?.price ?? (pkg as any)?.套餐价格 ?? (pkg as any)?.折后价格,
    stars: (pkg as any)?.stars,
    tags: (pkg as any)?.tags,
    icon: (pkg as any)?.icon,
    description: (pkg as any)?.description,
    content: (pkg as any)?.content,
    reviews: (pkg as any)?.reviews,
  });
}

export function ensureSelectedPackageFromMvu(): SelectedPackage | null {
  if (selectedPackage.value) return selectedPackage.value;
  return refreshSelectedPackageFromMvu();
}

export function refreshSelectedPackageFromMvu(): SelectedPackage | null {
  try {
    const shops = shopStoreMvu.getShops();
    if (!shops || shops.length === 0) {
      setSelectedPackage(null);
      return null;
    }

    const tryFind = () => {
      const sid = selectedShopId.value;
      const pid = selectedPackageId.value;
      if (!sid && !pid) return null;
      for (const shop of shops) {
        const shopId = coerceId((shop as any).id || (shop as any).shop_id);
        if (sid && shopId && shopId !== sid) continue;
        const pkgs = Array.isArray((shop as any).packages) ? (shop as any).packages : [];
        for (const pkg of pkgs) {
          const pkgId = coerceId(pkg?.id);
          if (pid && pkgId && pkgId === pid) return { shop, pkg };
        }
      }
      return null;
    };

    const found = tryFind();
    if (found) {
      setSelectedPackageFromShop(found.shop, found.pkg);
      return selectedPackage.value;
    }

    // fallback: first shop first package
    const shop = shops[0];
    const pkg = (shop as any)?.packages?.[0];
    if (!shop || !pkg) {
      setSelectedPackage(null);
      return null;
    }
    setSelectedPackageFromShop(shop, pkg);
    return selectedPackage.value;
  } catch (e) {
    console.warn('[selectedPackage] refreshSelectedPackageFromMvu failed', e);
    setSelectedPackage(null);
    return null;
  }
}
