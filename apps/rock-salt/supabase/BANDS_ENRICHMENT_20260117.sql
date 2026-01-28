-- Enrichment updates for selected Salt Lake City bands
-- Uses bio + origin_city/state (schema-safe)

-- The Backseat Lovers
UPDATE public.bands
SET
  bio = 'Formed in 2018, this group achieved viral success with the hit "Kilby Girl," an ode to a Salt Lake City venue. They released "Waiting to Spill" in 2022 via Capitol Records.',
  origin_city = 'Provo / Heber City',
  state = 'UT'
WHERE slug = 'the-backseat-lovers';

-- Choir Boy
UPDATE public.bands
SET
  bio = 'Fronted by Adam Klopp, this band blends 1980s-influenced synth-pop and "new romantic" styles with a modern aesthetic. Album "Gathering Swans" showcased their dreamy sound.',
  origin_city = 'Salt Lake City',
  state = 'UT'
WHERE slug = 'choir-boy';

-- The Aces
UPDATE public.bands
SET
  bio = 'Originally known as The Blue Aces, this all-female quartet features sisters Cristal and Alisa Ramirez. Their debut "When My Heart Felt Volcanic" earned critical acclaim.',
  origin_city = 'Provo',
  state = 'UT'
WHERE slug = 'the-aces';

-- Neon Trees
UPDATE public.bands
SET
  bio = 'Founded by Tyler Glenn and Chris Allen, this band rose to national fame with multi-platinum hits like "Animal" and "Everybody Talks."',
  origin_city = 'Provo',
  state = 'UT'
WHERE slug = 'neon-trees';

-- Chelsea Grin
UPDATE public.bands
SET
  bio = 'A prominent name in the extreme metal scene, this band has released albums including "Desolation of Eden" and "Eternal Nightmare." One of Utah''s most globally recognized metal exports.',
  origin_city = 'Salt Lake City',
  state = 'UT'
WHERE slug = 'chelsea-grin';

-- Iceburn
UPDATE public.bands
SET
  bio = 'Led by Gentry Densley, this innovative group blended heavy metal, punk, and jazz improvisation into a groundbreaking sound. Active 1991-2001 with reunions.',
  origin_city = 'Salt Lake City',
  state = 'UT'
WHERE slug = 'iceburn';

-- Eagle Twin
UPDATE public.bands
SET
  bio = 'This two-man metal wrecking crew features Gentry Densley and Tyler Smith creating a massive blend of doom, sludge, and drone. Album "The Unkindness of Crows" is essential.',
  origin_city = 'Salt Lake City',
  state = 'UT'
WHERE slug = 'eagle-twin';

-- Meg & Dia
UPDATE public.bands
SET
  bio = 'Founded by sisters Meg and Dia Frampton, this band started with acoustic roots before evolving into indie rock. Dia appeared on "The Voice." Active 2004-2012, 2019-present.',
  origin_city = 'Draper',
  state = 'UT'
WHERE slug IN ('meg-and-dia', 'meg-dia');

-- Ritt Momney
UPDATE public.bands
SET
  bio = 'The indie-pop solo project of Jack Rutter. The name is a spoonerism of politician Mitt Romney. Rose to fame with viral TikTok cover of "Put Your Records On."',
  origin_city = 'Salt Lake City',
  state = 'UT'
WHERE slug = 'ritt-momney';

-- The Osmonds
UPDATE public.bands
SET
  bio = 'This legendary family music group rose to international superstardom in the 1970s with hits spanning pop, rock, country, and barbershop. Active 1958-2023.',
  origin_city = 'Ogden',
  state = 'UT'
WHERE slug = 'the-osmonds';

-- Royal Bliss
UPDATE public.bands
SET
  bio = 'A hard-working rock band formed in 1997, they built a loyal following through relentless touring and signed with Capitol Records.',
  origin_city = 'Salt Lake City',
  state = 'UT'
WHERE slug = 'royal-bliss';

-- The National Parks
UPDATE public.bands
SET
  bio = 'This indie-folk band creates atmospheric, nature-inspired pop music characterized by male-female harmonies. Album "Young" and single "As We Ran" gained attention.',
  origin_city = 'Provo',
  state = 'UT'
WHERE slug = 'the-national-parks';

-- Eidola
UPDATE public.bands
SET
  bio = 'Known for an eclectic mix of post-hardcore, math rock, and progressive metal, this group creates complex, layered compositions. Album "The Architect" showcases their range.',
  origin_city = 'Spanish Fork',
  state = 'UT'
WHERE slug = 'eidola';

-- Baby Ghosts
UPDATE public.bands
SET
  bio = 'Blending pop-punk, garage rock, and "cuddlecore," this band is known for high-energy shows and "aggro-adorable" aesthetic. Album "Maybe Ghosts" captured their sound.',
  origin_city = 'Salt Lake City',
  state = 'UT'
WHERE slug = 'baby-ghosts';

-- The Moth & The Flame
UPDATE public.bands
SET
  bio = 'An alternative rock band that garnered attention for their atmospheric sound and art-heavy promotion. Based in Provo''s vibrant music scene.',
  origin_city = 'Provo',
  state = 'UT'
WHERE slug IN ('the-moth-and-the-flame', 'the-moth-the-flame');
