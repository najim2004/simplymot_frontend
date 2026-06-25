import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type AwinTrackBody = {
  order_id?: string;
  total_amount?: number | string;
  voucher_code?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AwinTrackBody;
  const orderRef = body.order_id;
  const amount = Number(body.total_amount || 0).toFixed(2);
  const voucher = String(body.voucher_code ?? "").trim();
  const advertiserId = process.env.NEXT_PUBLIC_AWIN_ADVERTISER_ID;
  const awc = (await cookies()).get("awc")?.value;

  if (!advertiserId || !orderRef || !awc) {
    return NextResponse.json({
      success: false,
      message: "Awin tracking skipped: missing advertiser id, order ref, or awc.",
    });
  }

  const currency = process.env.NEXT_PUBLIC_AWIN_CURRENCY || "GBP";
  const commissionGroup =
    process.env.NEXT_PUBLIC_AWIN_COMMISSION_GROUP || "DEFAULT";
  const channel = process.env.NEXT_PUBLIC_AWIN_CHANNEL || "aw";
  const testMode = process.env.NEXT_PUBLIC_AWIN_TEST_MODE || "0";
  const customerAcquisition =
    process.env.NEXT_PUBLIC_AWIN_CUSTOMER_ACQUISITION || "NEW";

  const params = new URLSearchParams({
    tt: "ss",
    tv: "2",
    merchant: advertiserId,
    amount,
    ch: channel,
    parts: `${commissionGroup}:${amount}`,
    vc: voucher,
    cr: currency,
    ref: orderRef,
    cks: awc,
    customeracquisition: customerAcquisition,
    testmode: testMode,
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_CLIENT_APP_URL ||
    "https://simplymot.co.uk";
  const referer = siteUrl.replace(/\/$/, "");

  const response = await fetch(
    `https://www.awin1.com/sread.php?${params.toString()}`,
    {
      cache: "no-store",
      headers: { Referer: referer },
    },
  );

  return NextResponse.json({
    success: response.ok,
    status: response.status,
  });
}
