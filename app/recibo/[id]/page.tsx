import { ReceiptViewer } from "@/components/ReceiptViewer";

export default async function ReciboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReceiptViewer orderId={id} />;
}
