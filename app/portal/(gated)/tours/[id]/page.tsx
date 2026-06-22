import { redirect } from 'next/navigation'

export default async function TourRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/portal/tours/${id}/edit`)
}
