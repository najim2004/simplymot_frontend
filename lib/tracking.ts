export type BookingConversionData = {
  order_id?: string;
  total_amount?: number | string;
  /** Promo / voucher code from checkout when the API returns it */
  voucher_code?: string;
};

/** Normalize book-slot API `data` for conversion tracking. */
export function trackBookingConversionFromApiData(
  data: BookingConversionData | Record<string, unknown> | null | undefined,
) {
  if (!data || typeof data !== "object") return;
  const record = data as Record<string, unknown>;
  const orderId = record.order_id;
  if (orderId == null || orderId === "") return;

  trackBookingConversion({
    order_id: String(orderId),
    total_amount: record.total_amount as BookingConversionData["total_amount"],
    voucher_code: record.voucher_code
      ? String(record.voucher_code)
      : undefined,
  });
}

type BookingData = BookingConversionData;

/**
 * Consolidated conversion tracking for both Awin and Google Ads.
 * Called once when a booking is successfully completed.
 *
 * Awin tracking follows Example #2 from the official docs (SPA/AJAX case):
 *   1. Set AWIN.Tracking.Sale
 *   2. Call AWIN.Tracking.run()
 *   3. Fire fall-back pixel (sread.img)
 *   4. Fire server-side tracking (/api/awin/track)
 *
 * Google Ads conversion fires via gtag at the same point.
 */
export function trackBookingConversion(booking: BookingData | undefined) {
  if (typeof window === "undefined" || !booking?.order_id) return;

  const amount = Number(booking.total_amount || 0).toFixed(2);
  const voucher = String(booking.voucher_code ?? "").trim();

  // --- Awin Conversion ---
  fireAwinConversion(booking.order_id, amount, { voucher });

  // --- Google Ads Conversion ---
  fireGoogleAdsConversion(booking.order_id, amount);
}

// ---------------------------------------------------------------------------
// Awin
// ---------------------------------------------------------------------------

function fireAwinConversion(
  orderRef: string,
  amount: string,
  opts: { voucher: string },
) {
  const advertiserId = process.env.NEXT_PUBLIC_AWIN_ADVERTISER_ID;
  if (!advertiserId) return;

  const currency = process.env.NEXT_PUBLIC_AWIN_CURRENCY || "GBP";
  const commissionGroup =
    process.env.NEXT_PUBLIC_AWIN_COMMISSION_GROUP || "DEFAULT";
  const channel = process.env.NEXT_PUBLIC_AWIN_CHANNEL || "aw";
  const testMode = process.env.NEXT_PUBLIC_AWIN_TEST_MODE || "0";
  const voucher = opts.voucher;
  const customerAcquisition =
    process.env.NEXT_PUBLIC_AWIN_CUSTOMER_ACQUISITION || "NEW";

  // 1. Set AWIN.Tracking.Sale (Conversion Tag — Example #2 from Awin docs)
  //    MasterTag is already loaded sitewide via layout.tsx, so we set Sale
  //    on the existing AWIN object and then call run().
  const win = window as any;

  if (typeof win.AWIN !== "undefined" && typeof win.AWIN.Tracking !== "undefined") {
    // MasterTag has loaded — follow Example #2 exactly
    win.AWIN.Tracking.Sale = {};
    win.AWIN.Tracking.Sale.amount = amount;
    win.AWIN.Tracking.Sale.channel = channel;
    win.AWIN.Tracking.Sale.orderRef = orderRef;
    win.AWIN.Tracking.Sale.parts = `${commissionGroup}:${amount}`;
    win.AWIN.Tracking.Sale.currency = currency;
    win.AWIN.Tracking.Sale.voucher = voucher;
    win.AWIN.Tracking.Sale.test = testMode;
    win.AWIN.Tracking.Sale.customerAcquisition = customerAcquisition;

    // 2. Trigger the MasterTag to process the conversion
    if (typeof win.AWIN.Tracking.run === "function") {
      win.AWIN.Tracking.run();
    } else {
      // MasterTag script loaded but run() not yet available — retry
      waitForAwinRun();
    }
  } else {
    // MasterTag hasn't fully initialized yet — set Sale and wait for run()
    win.AWIN = win.AWIN || {};
    win.AWIN.Tracking = win.AWIN.Tracking || {};
    win.AWIN.Tracking.Sale = {
      amount,
      channel,
      orderRef,
      parts: `${commissionGroup}:${amount}`,
      currency,
      voucher,
      test: testMode,
      customerAcquisition,
    };
    waitForAwinRun();
  }

  // 3. Fire fall-back conversion pixel (backup in case MasterTag tracking fails)
  fireAwinFallbackPixel(advertiserId, orderRef, amount, {
    currency,
    commissionGroup,
    channel,
    testMode,
    voucher,
    customerAcquisition,
  });

  // 4. Fire server-side tracking (additional backup)
  window.setTimeout(
    () => sendAwinServerSideTracking(orderRef, amount, { voucher }),
    1200,
  );
}

/**
 * Wait for AWIN.Tracking.run to become available, then call it.
 * Retries up to 20 times at 500ms intervals (10 seconds total).
 */
function waitForAwinRun(attempt = 0) {
  const win = window as any;
  if (typeof win.AWIN?.Tracking?.run === "function") {
    win.AWIN.Tracking.run();
    return;
  }
  if (attempt < 20) {
    window.setTimeout(() => waitForAwinRun(attempt + 1), 500);
  }
}

/**
 * Fall-back Conversion Pixel — fires an invisible image request to Awin.
 * This is a mandatory backup per Awin documentation.
 */
function fireAwinFallbackPixel(
  advertiserId: string,
  orderRef: string,
  amount: string,
  opts: {
    currency: string;
    commissionGroup: string;
    channel: string;
    testMode: string;
    voucher: string;
    customerAcquisition: string;
  },
) {
  const params = new URLSearchParams({
    tt: "ns",
    tv: "2",
    merchant: advertiserId,
    amount,
    ch: opts.channel,
    parts: `${opts.commissionGroup}:${amount}`,
    ref: orderRef,
    cr: opts.currency,
    vc: opts.voucher,
    testmode: opts.testMode,
    customeracquisition: opts.customerAcquisition,
  });

  const pixel = document.createElement("img");
  pixel.src = `https://www.awin1.com/sread.img?${params.toString()}`;
  pixel.width = 0;
  pixel.height = 0;
  pixel.alt = "";
  pixel.style.display = "none";
  document.body.appendChild(pixel);
}

/**
 * Server-side tracking — POST to our own API route which forwards to Awin's
 * sread.php endpoint. This provides an additional layer of tracking reliability
 * independent of browser conditions.
 */
function sendAwinServerSideTracking(
  orderRef: string,
  amount: string,
  opts: { voucher: string },
) {
  void fetch("/api/awin/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderRef,
      total_amount: amount,
      voucher_code: opts.voucher || undefined,
    }),
    keepalive: true,
  }).catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Google Ads
// ---------------------------------------------------------------------------

/**
 * Fire Google Ads conversion event via gtag.
 * Includes transaction_id to prevent duplicate counting.
 */
function fireGoogleAdsConversion(orderRef: string, amount: string) {
  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_CONVERSION_ID;
  if (!conversionId) return;

  const win = window as any;
  if (typeof win.gtag === "function") {
    win.gtag("event", "conversion", {
      send_to: conversionId,
      value: parseFloat(amount),
      currency: "GBP",
      transaction_id: orderRef,
    });
  }
}
