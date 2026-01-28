import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface AuditConfirmationEmailProps {
  clientName: string;
  auditDate: string;
  calendarLink?: string;
}

export default function AuditConfirmationEmail({
  clientName,
  auditDate,
  calendarLink,
}: AuditConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Cognitive Audit is scheduled for {auditDate}</Preview>
      <Body style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f4f4f4' }}>
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#fff',
            padding: '20px',
          }}
        >
          <Heading style={{ color: '#0087c8' }}>
            Your Cognitive Audit is Confirmed
          </Heading>
          <Text>Hi {clientName},</Text>
          <Text>
            Thanks for booking your Cognitive Audit! Here's what to expect:
          </Text>
          <Section>
            <Text>
              <strong>Date/Time:</strong> {auditDate}
            </Text>
            <Text>
              <strong>Duration:</strong> 60 minutes
            </Text>
            <Text>
              <strong>Format:</strong> Zoom (link will be sent 1 hour before)
            </Text>
          </Section>
          <Text>
            To prepare, please review your district's current AI tool usage (if
            any) and think about your biggest governance concerns.
          </Text>
          {calendarLink && (
            <Button
              href={calendarLink}
              style={{
                backgroundColor: '#0087c8',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Add to Calendar
            </Button>
          )}
          <Text>Questions? Just reply to this email.</Text>
          <Text>
            — John Lyman
            <br />
            Founder, WasatchWise
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

