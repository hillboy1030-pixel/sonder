// Lulu Print API client: prices a journal, sizes its cover, and places the
// print order. Not wired into checkout yet: it needs a Lulu developer account
// (LULU_CLIENT_KEY / LULU_CLIENT_SECRET) and LULU_ENV=sandbox|production.
// Check every call against the sandbox before the first real order.

const BASE = process.env.LULU_ENV === "production" ? "https://api.lulu.com" : "https://api.sandbox.lulu.com";

/** 6x9 in, black & white standard, perfect bound paperback, 60# uncoated white, matte cover. */
export const JOURNAL_POD_PACKAGE = "0600X0900BWSTDPB060UW444MXX";

let token: { value: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && token.expires > Date.now() + 30_000) return token.value;
  const key = process.env.LULU_CLIENT_KEY;
  const secret = process.env.LULU_CLIENT_SECRET;
  if (!key || !secret) throw new Error("Lulu is not set up yet (LULU_CLIENT_KEY / LULU_CLIENT_SECRET missing)");
  const res = await fetch(`${BASE}/auth/realms/glasswing/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Lulu sign-in failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

async function lulu<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Lulu ${path} failed (${res.status}): ${text.slice(0, 500)}`);
  return JSON.parse(text) as T;
}

export type ShippingAddress = {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state_code: string;
  postcode: string;
  country_code: string;
  phone_number: string;
  email?: string;
};

/** Exact cover size in points for this page count. */
export async function coverDimensions(pages: number): Promise<{ width: number; height: number }> {
  const d = await lulu<{ width: string; height: string }>("/cover-dimensions/", {
    pod_package_id: JOURNAL_POD_PACKAGE,
    interior_page_count: pages,
    unit: "pt",
  });
  return { width: Number(d.width), height: Number(d.height) };
}

/** What Lulu will charge us (print + shipping + fulfillment + tax), to check margins. */
export async function printCost(pages: number, address: ShippingAddress, shippingLevel = "MAIL") {
  return lulu<{ total_cost_incl_tax: string; shipping_cost: { total_cost_incl_tax: string } }>("/print-job-cost-calculations/", {
    line_items: [{ page_count: pages, pod_package_id: JOURNAL_POD_PACKAGE, quantity: 1 }],
    shipping_address: address,
    shipping_option: shippingLevel,
  });
}

/** Places the print order. The PDFs must be at URLs Lulu can download. */
export async function createPrintJob(opts: {
  orderId: string;
  title: string;
  interiorUrl: string;
  coverUrl: string;
  address: ShippingAddress;
  contactEmail: string;
  shippingLevel?: string;
}) {
  return lulu<{ id: number; status: { name: string } }>("/print-jobs/", {
    external_id: opts.orderId,
    contact_email: opts.contactEmail,
    shipping_level: opts.shippingLevel ?? "MAIL",
    shipping_address: opts.address,
    line_items: [
      {
        external_id: opts.orderId,
        title: opts.title,
        quantity: 1,
        printable_normalization: {
          pod_package_id: JOURNAL_POD_PACKAGE,
          interior: { source_url: opts.interiorUrl },
          cover: { source_url: opts.coverUrl },
        },
      },
    ],
  });
}
