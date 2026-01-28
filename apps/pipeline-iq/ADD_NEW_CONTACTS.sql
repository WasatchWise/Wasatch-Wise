-- Add New ConstructionWire Contacts to Outreach Queue
-- Run this in Supabase Dashboard > SQL Editor
-- Date: January 27, 2026

-- 1. Tom Hunt - President, PHD Hotels (Priority: 95)
INSERT INTO outreach_queue (recipient_email, recipient_name, email_subject, email_body, priority_score, vertical, status, metadata)
VALUES (
    'thunt@phdhotels.com',
    'Tom Hunt',
    'Quick question about PHD Hotels, Inc.',
    E'Hi Tom,\n\nI''m not sure if this is relevant to you right now, but I noticed PHD Hotels, Inc. in Opelika, AL and wanted to reach out.\n\nAs President, you''re probably juggling a lot of vendor relationships for technology infrastructure - WiFi, TV, phones, access control. Most hotel owners I talk to describe it as "vendor sprawl" - too many hands in the pot, nobody owns the outcome.\n\nGroove simplifies this by bringing it all "under one roof." We handle the entire hospitality technology stack (DirecTV, Internet, Phone Systems, Access Control) so you have one partner, one point of contact.\n\nI''ve put together a quick Groove overview that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.\n\nCheck it out here: https://pipelineiq.net/groove-in-45-seconds?vertical=hospitality\n\nThis way you can see if we''re relevant before we even talk.\n\nIf it''s worth a look, happy to do a quick 10 minutes to see if we can help avoid headaches later. If not, no worries.\n\nBest,\nMike\n\nReply to this email or reach me at msartain@getgrooven.com / 801-396-6534.',
    95,
    'Hospitality',
    'pending',
    '{"source": "constructionwire", "title": "President", "company": "PHD Hotels, Inc.", "city": "Opelika", "state": "AL", "phone": "334-705-0176", "cw_updated": "2026-01-15"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 2. Dilip Patel - President, DP Hotels (Priority: 95)
INSERT INTO outreach_queue (recipient_email, recipient_name, email_subject, email_body, priority_score, vertical, status, metadata)
VALUES (
    'dilip.patel@dphotelsgroup.com',
    'Dilip Patel',
    'Quick question about DP Hotels',
    E'Hi Dilip,\n\nI''m not sure if this is relevant to you right now, but I noticed DP Hotels in Dania Beach, FL and wanted to reach out.\n\nAs President, you''re probably juggling a lot of vendor relationships for technology infrastructure - WiFi, TV, phones, access control. Most hotel owners I talk to describe it as "vendor sprawl" - too many hands in the pot, nobody owns the outcome.\n\nGroove simplifies this by bringing it all "under one roof." We handle the entire hospitality technology stack (DirecTV, Internet, Phone Systems, Access Control) so you have one partner, one point of contact.\n\nI''ve put together a quick Groove overview that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.\n\nCheck it out here: https://pipelineiq.net/groove-in-45-seconds?vertical=hospitality\n\nThis way you can see if we''re relevant before we even talk.\n\nIf it''s worth a look, happy to do a quick 10 minutes to see if we can help avoid headaches later. If not, no worries.\n\nBest,\nMike\n\nReply to this email or reach me at msartain@getgrooven.com / 801-396-6534.',
    95,
    'Hospitality',
    'pending',
    '{"source": "constructionwire", "title": "President", "company": "DP Hotels", "city": "Dania Beach", "state": "FL", "phone": "954-874-1800", "cw_updated": "2026-01-12"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 3. Prakash Sundaram - SVP, Total Management Systems (Priority: 90)
INSERT INTO outreach_queue (recipient_email, recipient_name, email_subject, email_body, priority_score, vertical, status, metadata)
VALUES (
    'prakashr@tmsinn.com',
    'Prakash Sundaram',
    'Quick question about Total Management Systems',
    E'Hi Prakash,\n\nI''m not sure if this is relevant to you right now, but I noticed Total Management Systems Inc. in Albuquerque, NM and wanted to reach out.\n\nIn your role overseeing development, you''ve probably seen how technology coordination becomes a headache - especially when you''re managing multiple vendors for WiFi, TV, phones, and access control.\n\nGroove simplifies this by bringing it all "under one roof." We handle the entire hospitality technology stack (DirecTV, Internet, Phone Systems, Access Control) so you have one partner, one point of contact.\n\nI''ve put together a quick Groove overview that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.\n\nCheck it out here: https://pipelineiq.net/groove-in-45-seconds?vertical=hospitality\n\nThis way you can see if we''re relevant before we even talk.\n\nIf it''s worth a look, happy to do a quick 10 minutes to see if we can help avoid headaches later. If not, no worries.\n\nBest,\nMike\n\nReply to this email or reach me at msartain@getgrooven.com / 801-396-6534.',
    90,
    'Hospitality',
    'pending',
    '{"source": "constructionwire", "title": "Senior Vice President", "company": "Total Management Systems Inc./Sundaram Builders, Inc.", "city": "Albuquerque", "state": "NM", "phone": "505-831-4200", "cw_updated": "2026-01-12"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 4. Ketan Patel - VP of Development, Rainmaker Hospitality (Priority: 90)
INSERT INTO outreach_queue (recipient_email, recipient_name, email_subject, email_body, priority_score, vertical, status, metadata)
VALUES (
    'k.patel@rainmakerhospitality.com',
    'Ketan Patel',
    'Quick question about Rainmaker Hospitality',
    E'Hi Ketan,\n\nI''m not sure if this is relevant to you right now, but I noticed Rainmaker Hospitality LLC in Lexington, KY and wanted to reach out.\n\nIn your role overseeing development, you''ve probably seen how technology coordination becomes a headache - especially when you''re managing multiple vendors for WiFi, TV, phones, and access control.\n\nGroove simplifies this by bringing it all "under one roof." We handle the entire hospitality technology stack (DirecTV, Internet, Phone Systems, Access Control) so you have one partner, one point of contact.\n\nI''ve put together a quick Groove overview that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.\n\nCheck it out here: https://pipelineiq.net/groove-in-45-seconds?vertical=hospitality\n\nThis way you can see if we''re relevant before we even talk.\n\nIf it''s worth a look, happy to do a quick 10 minutes to see if we can help avoid headaches later. If not, no worries.\n\nBest,\nMike\n\nReply to this email or reach me at msartain@getgrooven.com / 801-396-6534.',
    90,
    'Hospitality',
    'pending',
    '{"source": "constructionwire", "title": "Vice President of Development", "company": "Rainmaker Hospitality LLC", "city": "Lexington", "state": "KY", "phone": "859-368-0087", "cw_updated": "2026-01-08"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 5. Rao Yalamanchili - President, Positive Investments (Priority: 95)
INSERT INTO outreach_queue (recipient_email, recipient_name, email_subject, email_body, priority_score, vertical, status, metadata)
VALUES (
    'rao@positiveinvestments.com',
    'Rao Yalamanchili',
    'Quick question about Positive Investments',
    E'Hi Rao,\n\nI''m not sure if this is relevant to you right now, but I noticed Positive Investments in Arcadia, CA and wanted to reach out.\n\nAs President, you''re probably juggling a lot of vendor relationships for technology infrastructure - WiFi, TV, phones, access control. Most hotel owners I talk to describe it as "vendor sprawl" - too many hands in the pot, nobody owns the outcome.\n\nGroove simplifies this by bringing it all "under one roof." We handle the entire hospitality technology stack (DirecTV, Internet, Phone Systems, Access Control) so you have one partner, one point of contact.\n\nI''ve put together a quick Groove overview that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.\n\nCheck it out here: https://pipelineiq.net/groove-in-45-seconds?vertical=hospitality\n\nThis way you can see if we''re relevant before we even talk.\n\nIf it''s worth a look, happy to do a quick 10 minutes to see if we can help avoid headaches later. If not, no worries.\n\nBest,\nMike\n\nReply to this email or reach me at msartain@getgrooven.com / 801-396-6534.',
    95,
    'Hospitality',
    'pending',
    '{"source": "constructionwire", "title": "President", "company": "Positive Investments", "city": "Arcadia", "state": "CA", "phone": "626-321-4800", "cw_updated": "2026-01-07"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Verify the inserts
SELECT 
    recipient_name,
    recipient_email,
    priority_score,
    metadata->>'company' as company,
    metadata->>'title' as title
FROM outreach_queue 
WHERE metadata->>'source' = 'constructionwire'
ORDER BY priority_score DESC;

-- Show total pending count
SELECT COUNT(*) as total_pending 
FROM outreach_queue 
WHERE status = 'pending';
