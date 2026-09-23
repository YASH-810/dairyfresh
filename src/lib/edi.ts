import type { EdiDocument, Product, Vendor } from "./types";

// Simulated EDI: real X12 needs a VAN + trading partners, so we generate
// plausible-looking segments locally. See CLAUDE.md "EDI Implementation (simulated)".

let seq = 1000;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

function isaDate() {
  const d = new Date();
  return {
    date: d.toISOString().slice(2, 10).replace(/-/g, ""), // YYMMDD
    time: d.toISOString().slice(11, 16).replace(":", ""), // HHMM
  };
}

const REORDER_QTY = 100;

export function buildX12_850(poId: string, product: Product, vendor: Vendor): EdiDocument {
  const { date, time } = isaDate();
  const qty = REORDER_QTY;
  const rawX12 = [
    `ISA*00*          *00*          *ZZ*DAIRYFRESH     *ZZ*${vendor.id.toUpperCase().padEnd(15)}*${date}*${time}*U*00401*${poId}*0*P*>`,
    `GS*PO*DAIRYFRESH*${vendor.id.toUpperCase()}*${date}*${time}*${poId}*X*004010`,
    `ST*850*0001`,
    `BEG*00*NE*${poId}**${date}`,
    `PO1*1*${qty}*EA*${(product.price / 100).toFixed(2)}**VP*${product.id}`,
    `PID*F****${product.name}`,
    `CTT*1`,
    `SE*7*0001`,
    `GE*1*${poId}`,
    `IEA*1*${poId}`,
  ].join("~\n");

  return {
    id: nextId("edi"),
    poId,
    type: "PURCHASE_ORDER_850",
    vendorId: vendor.id,
    productId: product.id,
    payload: { poId, productId: product.id, productName: product.name, quantity: qty, unitPrice: product.price },
    rawX12,
    status: "SENT",
    createdAt: new Date().toISOString(),
  };
}

export function buildX12_997(poId: string, vendorId: string): EdiDocument {
  const { date, time } = isaDate();
  const rawX12 = [
    `ISA*00*          *00*          *ZZ*${vendorId.toUpperCase().padEnd(15)}*ZZ*DAIRYFRESH     *${date}*${time}*U*00401*${poId}*0*P*>`,
    `GS*FA*${vendorId.toUpperCase()}*DAIRYFRESH*${date}*${time}*${poId}*X*004010`,
    `ST*997*0001`,
    `AK1*PO*0001`,
    `AK9*A*1*1*1`,
    `SE*4*0001`,
    `GE*1*${poId}`,
    `IEA*1*${poId}`,
  ].join("~\n");

  return {
    id: nextId("edi"),
    poId,
    type: "ACK_997",
    vendorId,
    productId: "",
    payload: { poId, ackStatus: "Accepted" },
    rawX12,
    status: "ACKNOWLEDGED",
    createdAt: new Date().toISOString(),
  };
}

export function buildX12_846(poId: string, product: Product, vendor: Vendor, qtyReceived: number): EdiDocument {
  const { date, time } = isaDate();
  const rawX12 = [
    `ISA*00*          *00*          *ZZ*${vendor.id.toUpperCase().padEnd(15)}*ZZ*DAIRYFRESH     *${date}*${time}*U*00401*${poId}*0*P*>`,
    `GS*IB*${vendor.id.toUpperCase()}*DAIRYFRESH*${date}*${time}*${poId}*X*004010`,
    `ST*846*0001`,
    `BIA*00*${poId}`,
    `LIN*1*VP*${product.id}`,
    `QTY*33*${qtyReceived}`,
    `SE*5*0001`,
    `GE*1*${poId}`,
    `IEA*1*${poId}`,
  ].join("~\n");

  return {
    id: nextId("edi"),
    poId,
    type: "INVENTORY_846",
    vendorId: vendor.id,
    productId: product.id,
    payload: { poId, productId: product.id, quantityReceived: qtyReceived },
    rawX12,
    status: "RECEIVED",
    createdAt: new Date().toISOString(),
  };
}

export function buildX12_810(poId: string, product: Product, vendor: Vendor, qty: number): EdiDocument {
  const { date, time } = isaDate();
  const total = ((product.price * qty) / 100).toFixed(2);
  const rawX12 = [
    `ISA*00*          *00*          *ZZ*${vendor.id.toUpperCase().padEnd(15)}*ZZ*DAIRYFRESH     *${date}*${time}*U*00401*${poId}*0*P*>`,
    `GS*IN*${vendor.id.toUpperCase()}*DAIRYFRESH*${date}*${time}*${poId}*X*004010`,
    `ST*810*0001`,
    `BIG*${date}*${poId}`,
    `IT1*1*${qty}*EA*${(product.price / 100).toFixed(2)}**VP*${product.id}`,
    `TDS*${total}`,
    `SE*6*0001`,
    `GE*1*${poId}`,
    `IEA*1*${poId}`,
  ].join("~\n");

  return {
    id: nextId("edi"),
    poId,
    type: "INVOICE_810",
    vendorId: vendor.id,
    productId: product.id,
    payload: { poId, productId: product.id, quantity: qty, total: product.price * qty },
    rawX12,
    status: "RECEIVED",
    createdAt: new Date().toISOString(),
  };
}

export const EDI_REORDER_QTY = REORDER_QTY;
