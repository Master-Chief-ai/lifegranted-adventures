import { NextResponse } from 'next/server'
import { renderToBuffer, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { getBookingByRef } from '@/lib/supabase/queries'
import { formatCurrency, formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: 'Helvetica', color: '#0C1829' },
  header: { backgroundColor: '#006B6B', padding: 16, marginBottom: 20, borderRadius: 4 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 700 },
  headerRef: { color: '#FDF8ED', fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 6, color: '#006B6B' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  label: { color: '#5A6B7A' },
  value: { color: '#0C1829', fontWeight: 700 },
  listItem: { marginBottom: 2 },
  footer: { marginTop: 30, paddingTop: 10, borderTop: '1px solid #DDE8E8', textAlign: 'center', color: '#5A6B7A', fontSize: 9 },
})

export async function GET(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const booking = await getBookingByRef(ref)

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BOOKING CONFIRMATION</Text>
          <Text style={styles.headerRef}>LifeGranted Adventures · Ref: {booking.booking_ref}</Text>
        </View>

        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tour Name</Text>
          <Text style={styles.value}>{booking.tour.title}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Operator</Text>
          <Text style={styles.value}>{booking.operator.business_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Travel Date</Text>
          <Text style={styles.value}>{formatDate(booking.travel_date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Group Size</Text>
          <Text style={styles.value}>{booking.group_size} people</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{booking.tour.duration_days} days</Text>
        </View>

        <Text style={styles.sectionTitle}>Guest Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Lead Guest</Text>
          <Text style={styles.value}>{booking.tourist_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nationality</Text>
          <Text style={styles.value}>{booking.tourist_nationality ?? 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>WhatsApp</Text>
          <Text style={styles.value}>{booking.tourist_whatsapp ?? 'N/A'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tour Total</Text>
          <Text style={styles.value}>{formatCurrency(booking.total_usd)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Booking Fee</Text>
          <Text style={styles.value}>{formatCurrency(booking.booking_fee_usd)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Charged</Text>
          <Text style={styles.value}>{formatCurrency(booking.charged_to_tourist_usd)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Date</Text>
          <Text style={styles.value}>{formatDate(booking.created_at)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{booking.payment_method}</Text>
        </View>

        <Text style={styles.sectionTitle}>What&apos;s Included</Text>
        {booking.tour.inclusions.slice(0, 8).map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Important Information</Text>
        <Text style={styles.listItem}>Cancellation Policy: Free cancellation more than 30 days before travel date.</Text>
        <Text style={styles.listItem}>Meeting Point: Your operator will send meeting instructions 24 hours before departure.</Text>
        <Text style={styles.listItem}>Emergency Contact: LifeGranted Adventures WhatsApp: +255000000000</Text>

        <Text style={styles.footer}>Thank you for booking with LifeGranted Adventures | lifegrantedadventures.co.tz</Text>
      </Page>
    </Document>
  )

  const buffer = await renderToBuffer(doc)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="LGA-Booking-${booking.booking_ref}.pdf"`,
    },
  })
}
