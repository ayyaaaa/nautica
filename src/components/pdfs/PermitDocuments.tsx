import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Define styles once here. Used by both Admin (Download) and User (Portal).
const colors = {
  primary: '#0f172a',
  primaryLight: '#f1f5f9',
  muted: '#64748b',
  border: '#cbd5e1',
  greenBg: '#dcfce7',
  greenText: '#166534',
  white: '#ffffff',
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 30, backgroundColor: '#f8fafc' },
  outerBorder: {
    borderWidth: 4,
    borderColor: colors.border,
    borderStyle: 'solid',
    height: '100%',
    padding: 4,
    backgroundColor: colors.white,
  },
  innerBorder: { borderWidth: 1, borderColor: colors.border, height: '100%', padding: 30 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryLight,
    paddingBottom: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: colors.primary,
  },
  headerSubtitle: { fontSize: 9, color: colors.muted, textTransform: 'uppercase', marginTop: 4 },
  badge: {
    backgroundColor: colors.greenBg,
    color: colors.greenText,
    padding: '4px 10px',
    borderRadius: 10,
    fontSize: 9,
    fontWeight: 'bold',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  field: { width: '50%', marginBottom: 20 },
  label: {
    fontSize: 8,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
  footer: {
    marginTop: 'auto',
    backgroundColor: colors.primaryLight,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrImage: { width: 50, height: 50 },
  signoff: { alignItems: 'flex-end' },
  signatureScript: { fontSize: 18, fontStyle: 'italic', color: colors.primary, marginBottom: 2 },
  role: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
})

interface PermitDocumentProps {
  vessel: any
  permitId: string
  qrCodeBase64: string // New Prop for base64 image
}

export const PermitDocument = ({ vessel, permitId, qrCodeBase64 }: PermitDocumentProps) => {
  const issueDate = new Date().toLocaleDateString()
  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  const operatorName = vessel.operator?.fullName || 'N/A'
  const operatorPhone = vessel.operator?.phone || 'N/A'

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Berthing Permit</Text>
                <Text style={styles.headerSubtitle}>Nautica Harbor Authority</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.badge}>✓ ACTIVE</Text>
                <Text style={{ fontSize: 9, color: '#64748b', marginTop: 6 }}>
                  Permit #{permitId}
                </Text>
              </View>
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              <View style={styles.field}>
                <Text style={styles.label}>Vessel Name</Text>
                <Text style={styles.value}>{vessel.name}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Registration</Text>
                <Text style={styles.value}>{vessel.registrationNumber}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{vessel.vesselType}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Plan</Text>
                <Text style={styles.value}>{vessel.registrationType}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Owner</Text>
                <Text style={styles.value}>{vessel.owner?.fullName || vessel.owner?.email}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Contact</Text>
                <Text style={styles.value}>{operatorPhone}</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={qrCodeBase64} style={styles.qrImage} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 8, color: '#64748b' }}>VALIDITY PERIOD</Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                    {issueDate} — {expiryDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.signoff}>
                <Text style={styles.signatureScript}>Authorized</Text>
                <Text style={styles.role}>Harbor Master</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
