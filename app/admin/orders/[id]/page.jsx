import AdminOrderDetailsClient from "@/components/AdminOrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }) {
  const { id } = await params;
  return <AdminOrderDetailsClient id={id} />;
}
