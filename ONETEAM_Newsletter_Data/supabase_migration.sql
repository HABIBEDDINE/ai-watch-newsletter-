-- ============================================================
-- DXC ONETEAM Newsletter Data — Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS dxc_newsletter_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_number     INTEGER,
    title           TEXT,
    content         TEXT,
    month           VARCHAR(30),
    month_date      DATE,
    category        VARCHAR(60),
    image_path      TEXT,    -- Supabase Storage path, e.g. newsletters/images/page_002.png
    image_url       TEXT,    -- Public URL after upload to Supabase Storage
    newsletter_edition VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for your filters
CREATE INDEX IF NOT EXISTS idx_newsletter_month      ON dxc_newsletter_articles(month_date);
CREATE INDEX IF NOT EXISTS idx_newsletter_category   ON dxc_newsletter_articles(category);
CREATE INDEX IF NOT EXISTS idx_newsletter_page       ON dxc_newsletter_articles(page_number);

-- 3. Enable Row Level Security (optional — remove if not needed)
-- ALTER TABLE dxc_newsletter_articles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON dxc_newsletter_articles FOR SELECT USING (true);

-- 4. Insert all newsletter records
-- Note: image_url will be empty until you upload images to Supabase Storage.
-- After uploading, run:
--   UPDATE dxc_newsletter_articles
--   SET image_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/newsletters/images/' || image_path
--   WHERE image_url IS NULL;

INSERT INTO dxc_newsletter_articles (id, page_number, title, content, month, month_date, category, image_path, newsletter_edition) VALUES
('d0e81a46-9034-42bc-a2f4-dc5d583ca146', 1, 'Next Level Connect – Reinventing the', 'TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER MARCH 2026
DDDDaaaatttteeee:::: Wednesday, 15 April 2026 at 14:34:44 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
March 2026
Next Level Connect – Reinventing the
Customer Experience
At DXC Technology, quality is at the heart of everything we do. In this spirit, the
Quality Department, in collaboration with Sales and Marketing, organized Next Level
Connect with our local market clients.
The event aimed to clearly present our Customer Satisfaction (CSAT) approach and
show how client feedback drives continuous improvement. More importantly, it created
an open space for dialogue, allowing us to better understand client priorities and co-
build concrete actions.
This initiative reinforces our commitment to a transparent, collaborative, and
customer-centric experience, where quality and partnership go hand in hand.
1 of 212', 'March 2026', '2026-03-01', 'Quality', 'page_001.png', 'ONETEAM Newsletter - March 2026'),
('29bd24a2-f261-42b3-99ac-2dab8cd37193', 2, 'Quality at the Heart of the ADM Seminar', 'Quality at the Heart of the ADM Seminar
During the seminar dedicated to the ADM (Aéroport de Montréal) account, DXC
Technology’s Quality Department, in collaboration with the Client Success team,
played a key role by conducting an in-depth analysis of CSAT results.
While the client expressed strong satisfaction and positioned themselves as a
promoter of the collaboration, they also shared valuable recommendations for
improvement. These insights were embraced as opportunities to further strengthen
operational excellence.
Through a structured review, a clear and prioritized action plan was developed in close
alignment with Delivery teams. Each recommendation was translated into concrete,
measurable actions, reinforcing our commitment to continuous and sustainable
improvement.
March 2026: A Month of Strong
2 of 212', 'March 2026', '2026-03-01', 'Quality', 'page_002.png', 'ONETEAM Newsletter - March 2026'),
('70be4903-5887-4e67-9247-8d8d0f245e0d', 3, 'Achievements', 'Achievements
March 2026 marks a successful close to the fiscal year, with results exceeding
expectations and reinforcing client trust.
The month itself has been particularly impactful, driven by key achievements and
strategic renewals. Several major contracts and partnerships were extended,
confirming both client confidence and the quality of our services:
• The renewal of the Carrefour Italy contract strengthens a trusted relationship
while opening new avenues for innovation.
• The L&W insurance program has been extended for 24 months, reinforcing
performance and service quality.
• A one-year renewal with VINCI in the WorkPlace domain ensures continuity and
sustained performance.
• Radiance has renewed its insurance program for 36 months, highlighting long-
term trust.
• Xuber has renewed its teams within the insurance domain, consolidating the
value delivered.
These accomplishments reflect a strong and consistent dynamic, where strategic
continuity meets operational excellence, paving the way for continued growth and
success.
Get Summer-Ready with Fitpass: Boost
Your Energy & Wellbeing
With summer just around the corner, now is the perfect time to focus on your health
and energy. At DXC Technology, our partnership with Fitpass makes it easier than
ever to stay active.
Fitpass gives you access to a wide network of gyms and activities, from fitness and
swimming to yoga and more, helping you find what works best for you.
Take this opportunity to boost your wellbeing, build healthy habits, and feel your best.
Feel free to sign up and make this summer your strongest yet.
Please note: new subscriptions and cancellations are processed between the 20th
and the 25th of each month.
3 of 212', 'March 2026', '2026-03-01', 'Quality', 'page_003.png', 'ONETEAM Newsletter - March 2026'),
('ce8c26c6-3f0f-4642-8ffb-ece46d95f564', 4, 'A Strategic Partnership with Umnia Bank', 'A Strategic Partnership with Umnia Bank
for Employees’ Benefit
A new partnership has been established between DXC and Umnia Bank to provide
employees with tailored and advantageous financial solutions. As part of this
collaboration, a dedicated offering has been introduced, including participatory home
financing solutions, consumer financing options, as well as investment products
compliant with participatory finance principles. This partnership reflects the company’s
commitment to offering meaningful and relevant benefits to all employees.
Mandatory Annual Trainings – Upholding
Ethics and Security Together
As part of our ongoing commitment to integrity, ethical behavior, and information
security, all employees are required to complete the annual mandatory trainings listed
below.
The Code of Conduct and Security Awareness trainings are essential to
maintaining a culture of ethics, responsibility, and security across our organization.
They have been shared with each of you via email, along with regular reminders.
Deadline: 30 April 2026 – completion is mandatory for all employees.
Thank you for your commitment.
4 of 212', 'March 2026', '2026-03-01', 'Business & Clients', 'page_004.png', 'ONETEAM Newsletter - March 2026'),
('989313c9-e103-4ab3-98cf-422d06714478', 5, 'Hybrid Work Mode Reminder – Mandatory', 'Hybrid Work Mode Reminder – Mandatory
On-Site Presence
As part of our hybrid working model, we would like to remind everyone of the key
principles outlined in the hybrid work mode Charter.
The hybrid work mode is a structured arrangement, subject to role eligibility and
manager approval, which defines the number of remote days and working modalities.
A minimum of two days per week on-site presence is mandatory to ensure team
performance, coordination, and cohesion.
Being on-site also plays a key role in strengthening collaboration, accelerating
decision-making, and fostering team spirit.
Please note that non-compliance with the agreed on-site presence will be considered
an unjustified absence and may lead to disciplinary measures.
We count on your commitment to continue to make this model a success.
Diversity Equity & Inclusion, DXC in
continuous Action
On the occasion of International Women’s Day, we held a Town Hall focused on
women’s leadership, reflection, and inspiration.
This year’s initiative highlighted three dimensions of impact: Diversity & Inclusion,
social responsibility, and the promotion of women-leadership. In partnership with
LNKO, a Moroccan women-led brand democratizing access to quality eyewear, we
raised awareness about visual health, screen exposure prevention, and regular
ophthalmological check-ups.
5 of 212', 'March 2026', '2026-03-01', 'Quality', 'page_005.png', 'ONETEAM Newsletter - March 2026'),
('766ddc60-964e-45cc-9213-58be4098a284', 6, 'The collaboration also supports the Digital Explorers program, where LNKO', 'The collaboration also supports the Digital Explorers program, where LNKO
specialists will provide vision exams and glasses for children in the program, helping
them learn and thrive.
At DXC, inclusion and empowerment are brought to life through action, transforming
commitments into tangible, lasting impact for our teams, communities, and future.
Empowering Women Through Action:
Run4Her
We came together on April 5th for Run4Her, a meaningful initiative led by WE4SHE,
combining sport and solidarity to support and empower women. More than a race, this
event embodied a strong commitment to advancing women’s autonomy and inclusion
through sport, creating a space where energy, determination, and purpose came
together.
Through this initiative, participants led by our COMEX members Lamiaa Lahiaoui
and Kenza Benjelloun, engaged in a collective movement that celebrated resilience,
encouraged self-confidence, and highlighted the power of community. It also reflected
our broader commitment to solidarity, community impact, and shared opportunity,
bringing meaningful support to those who need it most.
Ramadan Solidaire 2026: Supporting
Families, Empowering Communities
As part of our “Ramadan Solidaire 2026” initiative and in partnership with the Amicale
Marocaine des Handicapés (AMH), DXC made a financial donation to support families
benefiting from AMH’s programs. Recognized as a public-utility association, AMH
Group works to build a more inclusive society by providing holistic medical care,
functional rehabilitation, socio-economic support, education and vocational training
tailored to the needs of people with disabilities. Its services span advanced health and
rehabilitation, personalized autonomy support, and inclusive educational programs
that help individuals and families overcome barriers and improve their quality of life.
This partnership underscores our commitment to solidarity, community impact, and
shared opportunity, bringing meaningful support to those who need it most!
6 of 212', 'March 2026', '2026-03-01', 'Quality', 'page_006.png', 'ONETEAM Newsletter - March 2026'),
('34eae195-b3f0-4e1d-bc95-ab08ab4b8fdd', 7, 'DEI Policy: Toward a Strengthened', 'DEI Policy: Toward a Strengthened
Balance
As part of our commitment to diversity, equity, and inclusion (DEI), we are proud to
report a 34% female representation within DXC, with a clear objective of reaching 40%
by the end of 2027 in terms of female talent recruitment. This steady progress reflects
our ambition to foster a more inclusive workplace, where equal opportunities support
both individual growth and collective performance, positioning diversity as a key driver
of our ESG strategy.
In comparison, recent data from the Haut-Commissariat au Plan (HCP, 2024) show
that women’s participation in the labor force in Morocco remains around 20%,
underscoring the broader national context and the progress still to be made.
Administrateur Infrastructure Confirmé H/F
Business Consultant H/F
Sales Development Junior (Sourcing)
Sales Development Senior ( Sourcing)
Consultant Reporting BI Anglophone H/F
7 of 212', 'March 2026', '2026-03-01', 'Quality', 'page_007.png', 'ONETEAM Newsletter - March 2026'),
('ea979748-dcf5-4fd5-a9c2-a3ace5e898b0', 10, 'New Contracts Strengthening Our', 'New Contracts Strengthening Our
Portfolio
During January and February, our center reached an important milestone by signing
several new contracts with leading clients, including Omron Security), Alstom, Philips
Snow, Sanaa Tamayuz, Dubai Finance, and ADNOC Snow.
These agreements reflect the trust placed in our services and highlight the diversity of
sectors recognizing our expertise, from security and rail industry to technology,
healthcare, and energy.
These new partnerships further strengthen our portfolio, reinforce our market position,
and confirm our teams’ ability to meet high expectations while supporting long-term
growth.
DXC Accelerates Digital Transformation
with Major Strategic Initiatives
DXC continues to strengthen its role in driving digital transformation in Morocco, with a
global Total Contract Value TCV) exceeding MAD 37 million.
At the center of this momentum is a five-year digital transformation program with the
Moroccan Agency for Investment and Export Development AMDIE. Through this
flagship project, DXC will support AMDIE in modernizing its digital ecosystem and
improving operational efficiency.
Combined with several other strategic initiatives, this portfolio highlights DXC’s ability to
deliver large-scale programs, modernize critical infrastructures, and create lasting
technological value for its clients in Morocco.
10 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_010.png', 'ONETEAM Newsletter - February 2026'),
('04f6bcad-2c04-4b28-be68-813a8422cb9c', 11, 'Delivers Key Strategic Initiatives', 'Delivers Key Strategic Initiatives
DXC
Across Major Institutions
DXC continues to expand its impact in Morocco through several strategic projects
delivered this month for leading national institutions.
Among the key initiatives, DXC is supporting the deployment of network and security
equipment, providing five years of End User support, and leading a Move to Cloud
program by migrating infrastructures to DXC’s datacenter. We are also implementing a
new market activity management solution and deploying a security supervision platform
for DGSSI.
These initiatives highlight DXC’s ongoing commitment to modernizing infrastructures,
strengthening cybersecurity, and supporting clients in their digital transformation
journeys.
11 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_011.png', 'ONETEAM Newsletter - February 2026'),
('07ba2bf0-4509-444b-8401-b50a0ed56be2', 12, 'In the Spotlight: Our SVP Lamiaa', 'In the Spotlight: Our SVP Lamiaa
Lahiaoui Driving the Conversation on
Tomorrow’s Skills
We are proud to share that Lamiaa Lahiaoui, our Senior Vice President HR, ESG &
Facilities, has been featured in HR Trends 2026.
In her contribution, Lamiaa offers a forward-looking perspective on 20262027,
highlighting sustained growth, the rise of new roles in Cloud, Cybersecurity, Data & AI,
and the increasing demand for hybrid tech skills. She also underscores Morocco’s strong
positioning as a strategic Nearshore hub, driven by digital transformation and DXC’s AI
Center of Excellence.
We are incredibly proud to see our leadership shaping the national conversation on the
future of work and technology.
Read the full testimony here: https://bit.ly/4kwJN3f
FY26 VOW Preparations Are Underway!
In February, we kicked off preparations for the FY26 VOW, our annual survey that measures
employee satisfaction and gathers your feedback on all work-related topics.
This year, we’ve added two new initiatives before the launch:
• VOW’s Co-Creation Box – a digital space for your ideas and expectations.
• VOW’s Mic – a video where colleagues share what VOW means to them.
Stay tuned, the FY26 VOW launch is coming soon and each one of your voices matter!
12 of 212', 'February 2026', '2026-02-01', 'CSR & Community', 'page_012.png', 'ONETEAM Newsletter - February 2026'),
('bf547cb4-7be0-4ab7-ae83-47e9c7c13d85', 13, 'Recharge & Thrive This Ramadan with', 'Recharge & Thrive This Ramadan with
Fitpass
As part of our ongoing commitment to wellbeing and promoting an active lifestyle, we
announce in February our partnership with Fitpass. This initiative is designed to encourage
everyone to practice sports regularly, aligning with our wellbeing commitment and sports
policy.
Fitpass gives you access to a wide network of gyms, studios, and specialized activities across
multiple cities, helping you stay active, healthy, and balanced every day. Whether you enjoy
gym workouts, yoga, Pilates, cross-training, swimming, or other sports, Fitpass makes it easy
to find the activity that suits you best.
By signing this partnership, we aim to make fitness accessible, enjoyable, and part of your
daily routine, supporting both physical health and mental energy. We hope this initiative
inspires you to embrace movement, boost your energy, and enhance your work-life balance
this Ramadan.
Innovation at Work: Voices That Inspire
As part of our Managerial Charter’s Value of the Month, we celebrated in February
“Innovation at Work” and highlighted how it shapes the way we collaborate, solve problems,
and continuously improve.
Innovation is not just about technology or major breakthroughs. It thrives in everyday actions,
when we challenge the status quo, suggest smarter ways to work, simplify processes, support
new ideas, or take initiative to create positive change.
To showcase this value in action, we are sharing a short video featuring voices of our
colleagues.
Let this video inspire you to think differently, embrace new ideas, and continue bringing
innovation to life in your own work.
13 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_013.png', 'ONETEAM Newsletter - February 2026'),
('a09f1e37-3b7f-48a7-887e-6a24d0dfedc3', 14, 'Launch of the Partnership with Crédit du', 'Launch of the Partnership with Crédit du
Maroc
A Town Hall was recently held to introduce the new partnership with Crédit du Maroc. The
session focused on presenting the objectives and scope of this collaboration, designed to
provide access to tailored financial solutions under preferential conditions. During the Town
Hall, the bank’s representatives outlined the key pillars of the partnership, including financing
options adapted to different needs and profiles, as well as the overall value created through
this agreement. This initiative reflects a broader commitment to enhancing access to relevant,
competitive, and practical financial services through trusted partnerships.
Participation in the Semi-Marathon
International de Tamesna
As part of a continued commitment to promoting well-being, health, and engagement,
participation in the Semi-Marathon International de Tamesna reflected a strong belief that well-
being extends beyond the workplace. This initiative highlighted the importance of encouraging
an active lifestyle, strengthening team spirit, and creating opportunities to step outside daily
routines.
Beyond the sporting challenge, the event embodied values such as resilience, perseverance,
collaboration, and mutual support. Taking part in this shared experience offered a different
setting to connect, reinforce bonds, and foster collective motivation. Such initiatives contribute
to building a positive, balanced, and engaging environment where energy, cohesion, and a
sense of purpose are strengthened.
14 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_014.png', 'ONETEAM Newsletter - February 2026'),
('43fcc23a-636a-4a16-bde8-4ce528012972', 15, 'DXC Cares: Turning Commitment into', 'DXC Cares: Turning Commitment into
Impact
Our DXC Cares Club, in partnership with the Rabat Blood Transfusion Center, recently led a
meaningful blood donation initiative, a concrete reflection of our ESG commitments and our
role as a responsible corporate citizen.
Thanks to the remarkable mobilization of our collaborators, 21 liters of blood were collected,
with the potential to save up to 130 lives. A powerful demonstration of solidarity and shared
responsibility.
Special thanks to Sara El Harchouni, Head of DXC Cares Club, for her leadership, and to all
colleagues who contributed to the success of this initiative.
Discover the highlights & Sara’s testimonial now, and let’s continue turning commitment into
impact together !
Capability Manager Intelligence Artificielle H/F.
Product Owner Senior H/F.
Ingénieur Etudes et Développement H/F.
Roles available for our referral program :
• Consultant ServiceNow senior (minimum 5 years experience )
• Account Run Lead (ARL) senior (minimum 10 years experience)
• Expert DevOps Azure/AWS (minimum 8 years experience)
• Solution Architect (minimum 15 years experience)
• Architecte Azure (minimum 15 years experience)
• Expert Réseaux et Sécurité (minimum 8 years experience)
• Consultant Pentester (minimum 5 years experience)
• Cloud Architect (minimum 15 years experience)
15 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_015.png', 'ONETEAM Newsletter - February 2026'),
('ab96fa50-3d0c-48b5-8a1e-488369492d09', 16, 'International Women’s Day Event – March 10th', 'International Women’s Day Event – March 10th
Voice Of Workforce Survey Launch – March 10th
Umnia Bank Partnership Town Hall – March 10th
Oneteam Rewards Ramadan Edition Wrap-up - March 31st
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::RE: ONETEAM NEWSLETTER - February 2026
DDDDaaaatttteeee:::: Wednesday, 25 March 2026 at 11:48:58 GMT+01:00
FFFFrrrroooommmm:::: Hiba, EL GHAROUCH
TTTToooo:::: EL FATEHI, Ilham, MOUSSALI, Omar, Mire, Mohamed
CCCCCCCC:::: MA QUALITY, BENNANI, Khalid, ACHOURI, Lamiae, Bensghir, Fatima Ezzahra
Merci ilham
16 of 212', 'February 2026', '2026-02-01', 'Quality', 'page_016.png', 'ONETEAM Newsletter - February 2026'),
('d20df39b-b0cb-43bf-8cb9-742ac1ace130', 19, 'February 2026', 'IIIImmmmppppoooorrrrttttaaaannnncccceeee:::: High
February 2026
Strategic Visits Driving Growth and Trust
In January and February, our center had the privilege of welcoming several strategic
visits, reflecting the strength of our partnerships and our growing attractiveness.
In January, we hosted prospective client Intermarché, who visited to discover our center
and meet the management team. We also welcomed Servier, who engaged directly with
our colleagues to ensure the quality of service delivered.
February continued this momentum with visits from Insurance Leadership, recognizing
the commitment and performance of our Moroccan teams, and Vinci Construction UK,
whose visit aimed to further develop local expertise through technical knowledge
sharing. We also received prospective client SUEZ, interested in exploring our services
and meeting with management.
These visits highlight the trust placed in our teams and our shared commitment to
excellence.
19 of 212', 'February 2026', '2026-02-01', 'Quality', 'page_019.png', 'ONETEAM Newsletter - February 2026'),
('cd9d7b4a-5c34-4511-b3d1-79c4a7b8ca6d', 20, 'New Contracts Strengthening Our', 'New Contracts Strengthening Our
Portfolio
During January and February, our center reached an important milestone by signing
several new contracts with leading clients, including Omron Security), Alstom, Philips
Snow, Sanaa Tamayuz, Dubai Finance, and ADNOC Snow.
These agreements reflect the trust placed in our services and highlight the diversity of
sectors recognizing our expertise, from security and rail industry to technology,
healthcare, and energy.
These new partnerships further strengthen our portfolio, reinforce our market position,
and confirm our teams’ ability to meet high expectations while supporting long-term
growth.
DXC Accelerates Digital Transformation
with Major Strategic Initiatives
DXC continues to strengthen its role in driving digital transformation in Morocco, with a
global Total Contract Value TCV) exceeding MAD 37 million.
At the center of this momentum is a five-year digital transformation program with the
Moroccan Agency for Investment and Export Development AMDIE. Through this
flagship project, DXC will support AMDIE in modernizing its digital ecosystem and
improving operational efficiency.
Combined with several other strategic initiatives, this portfolio highlights DXC’s ability to
deliver large-scale programs, modernize critical infrastructures, and create lasting
technological value for its clients in Morocco.
20 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_020.png', 'ONETEAM Newsletter - February 2026'),
('2c3808a2-45a0-4a2c-9d6f-d47fd64838d3', 21, 'Delivers Key Strategic Initiatives', 'Delivers Key Strategic Initiatives
DXC
Across Major Institutions
DXC continues to expand its impact in Morocco through several strategic projects
delivered this month for leading national institutions.
Among the key initiatives, DXC is supporting the deployment of network and security
equipment, providing five years of End User support, and leading a Move to Cloud
program by migrating infrastructures to DXC’s datacenter. We are also implementing a
new market activity management solution and deploying a security supervision platform
for DGSSI.
These initiatives highlight DXC’s ongoing commitment to modernizing infrastructures,
strengthening cybersecurity, and supporting clients in their digital transformation
journeys.
21 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_021.png', 'ONETEAM Newsletter - February 2026'),
('b08a0a69-1b6b-41cd-ac21-f3a1bc9fed2c', 22, 'In the Spotlight: Our SVP Lamiaa', 'In the Spotlight: Our SVP Lamiaa
Lahiaoui Driving the Conversation on
Tomorrow’s Skills
We are proud to share that Lamiaa Lahiaoui, our Senior Vice President HR, ESG &
Facilities, has been featured in HR Trends 2026.
In her contribution, Lamiaa offers a forward-looking perspective on 20262027,
highlighting sustained growth, the rise of new roles in Cloud, Cybersecurity, Data & AI,
and the increasing demand for hybrid tech skills. She also underscores Morocco’s strong
positioning as a strategic Nearshore hub, driven by digital transformation and DXC’s AI
Center of Excellence.
We are incredibly proud to see our leadership shaping the national conversation on the
future of work and technology.
Read the full testimony here: https://bit.ly/4kwJN3f
22 of 212', 'February 2026', '2026-02-01', 'CSR & Community', 'page_022.png', 'ONETEAM Newsletter - February 2026'),
('4bc7ef94-ead4-47b4-827b-8c2b8644d4fc', 23, 'FY26 VOW Preparations Are Underway!', 'FY26 VOW Preparations Are Underway!
In February, we kicked off preparations for the FY26 VOW, our annual survey that measures
employee satisfaction and gathers your feedback on all work-related topics.
This year, we’ve added two new initiatives before the launch:
• VOW’s Co-Creation Box – a digital space for your ideas and expectations.
• VOW’s Mic – a video where colleagues share what VOW means to them.
Stay tuned, the FY26 VOW launch is coming soon and each one of your voices matter!
Recharge & Thrive This Ramadan with
Fitpass
As part of our ongoing commitment to wellbeing and promoting an active lifestyle, we
announce in February our partnership with Fitpass. This initiative is designed to encourage
everyone to practice sports regularly, aligning with our wellbeing commitment and sports
policy.
Fitpass gives you access to a wide network of gyms, studios, and specialized activities across
multiple cities, helping you stay active, healthy, and balanced every day. Whether you enjoy
gym workouts, yoga, Pilates, cross-training, swimming, or other sports, Fitpass makes it easy
to find the activity that suits you best.
By signing this partnership, we aim to make fitness accessible, enjoyable, and part of your
daily routine, supporting both physical health and mental energy. We hope this initiative
inspires you to embrace movement, boost your energy, and enhance your work-life balance
this Ramadan.
23 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_023.png', 'ONETEAM Newsletter - February 2026'),
('e2018dc5-c7a7-4133-8036-fe4afa070e8f', 24, 'Innovation at Work: Voices That Inspire', 'Innovation at Work: Voices That Inspire
As part of our Managerial Charter’s Value of the Month, we celebrated in February
“Innovation at Work” and highlighted how it shapes the way we collaborate, solve problems,
and continuously improve.
Innovation is not just about technology or major breakthroughs. It thrives in everyday actions,
when we challenge the status quo, suggest smarter ways to work, simplify processes, support
new ideas, or take initiative to create positive change.
To showcase this value in action, we are sharing a short video featuring voices of our
colleagues.
Let this video inspire you to think differently, embrace new ideas, and continue bringing
innovation to life in your own work.
Launch of the Partnership with Crédit du
Maroc
A Town Hall was recently held to introduce the new partnership with Crédit du Maroc. The
session focused on presenting the objectives and scope of this collaboration, designed to
provide access to tailored financial solutions under preferential conditions. During the Town
Hall, the bank’s representatives outlined the key pillars of the partnership, including financing
options adapted to different needs and profiles, as well as the overall value created through
this agreement. This initiative reflects a broader commitment to enhancing access to relevant,
competitive, and practical financial services through trusted partnerships.
Participation in the Semi-Marathon
International de Tamesna
As part of a continued commitment to promoting well-being, health, and engagement,
participation in the Semi-Marathon International de Tamesna reflected a strong belief that well-
being extends beyond the workplace. This initiative highlighted the importance of encouraging
an active lifestyle, strengthening team spirit, and creating opportunities to step outside daily
routines.
Beyond the sporting challenge, the event embodied values such as resilience, perseverance,
collaboration, and mutual support. Taking part in this shared experience offered a different
24 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_024.png', 'ONETEAM Newsletter - February 2026'),
('76a6826a-5181-4a63-8815-853a3243a212', 25, 'setting to connect, reinforce bonds, and foster collective motivation. Such initiatives contribute', 'setting to connect, reinforce bonds, and foster collective motivation. Such initiatives contribute
to building a positive, balanced, and engaging environment where energy, cohesion, and a
sense of purpose are strengthened.
DXC Cares: Turning Commitment into
Impact
Our DXC Cares Club, in partnership with the Rabat Blood Transfusion Center, recently led a
meaningful blood donation initiative, a concrete reflection of our ESG commitments and our
role as a responsible corporate citizen.
Thanks to the remarkable mobilization of our collaborators, 21 liters of blood were collected,
with the potential to save up to 130 lives. A powerful demonstration of solidarity and shared
responsibility.
Special thanks to Sara El Harchouni, Head of DXC Cares Club, for her leadership, and to all
colleagues who contributed to the success of this initiative.
Discover the highlights & Sara’s testimonial now, and let’s continue turning commitment into
impact together !
Capability Manager Intelligence Artificielle H/F.
25 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_025.png', 'ONETEAM Newsletter - February 2026'),
('77e68a95-7f03-4e90-9d94-81f043a3277e', 26, 'Product Owner Senior H/F.', 'Product Owner Senior H/F.
Ingénieur Etudes et Développement H/F.
Roles available for our referral program :
• Consultant ServiceNow senior (minimum 5 years experience )
• Account Run Lead (ARL) senior (minimum 10 years experience)
• Expert DevOps Azure/AWS (minimum 8 years experience)
• Solution Architect (minimum 15 years experience)
• Architecte Azure (minimum 15 years experience)
• Expert Réseaux et Sécurité (minimum 8 years experience)
• Consultant Pentester (minimum 5 years experience)
• Cloud Architect (minimum 15 years experience)
International Women’s Day Event – March 10th
Voice Of Workforce Survey Launch – March 10th
Umnia Bank Partnership Town Hall – March 10th
26 of 212', 'February 2026', '2026-02-01', 'Business & Clients', 'page_026.png', 'ONETEAM Newsletter - February 2026'),
('b3d32e6b-4842-4304-b0a6-0adcb6feb93b', 27, 'Oneteam Rewards Ramadan Edition Wrap-up - March 31st', 'Oneteam Rewards Ramadan Edition Wrap-up - March 31st
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::Newsletter Qualité : S1 FY26
DDDDaaaatttteeee:::: Friday, 26 December 2025 at 09:25:34 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
Excellence & Engagement : Nos réussites Qualité au S1 FY26
Chers Collègues,
Ce semestre a été marqué par des avancées significatives en matière de qualité et de
satisfaction client. Grâce à l’engagement de chacun, nous avons atteint des résultats
remarquables. Découvrez sur cette newsletter les faits marquants et les réussites
collectives qui font notre fierté.
Automatisation du CSAT & Analyse des retours
Nous avons franchi une étape clé avec l’automatisation du processus CSAT et la
mise en place d’un reporting dynamique. Cette évolution nous permet d’intégrer
l’analyse des retours clients pour identifier les points forts et les axes
27 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_027.png', 'ONETEAM Newsletter - December 2025'),
('8698e930-e7a7-4a4e-ac98-550ecce3f81b', 28, 'd’amélioration, garantissant une écoute proactive et continue.', 'd’amélioration, garantissant une écoute proactive et continue.
Résultat CSAT S1FY26 :
Avec un score CSAT de 4,5, nous avons atteint notre objectif de satisfaction client
pour le semestre ! Ce résultat reflète la qualité de nos services et l’engagement
constant de nos équipes à écouter, comprendre et répondre aux attentes de nos
clients. Continuons à capitaliser sur nos points forts et à travailler sur les axes
d’amélioration identifiés pour maintenir ce niveau d’excellence. Bravo à tous pour
cette performance
Nos Clients et Comptes Très satisfaits
Audit Corporate : Une performance exemplaire !
Ces chiffres témoignent de notre engagement collectif à maintenir des standards
élevés et à améliorer continuellement nos méthodes de travail. Les bonnes pratiques
mises en avant reflètent notre capacité à répondre efficacement aux attentes de nos
clients et de notre organisation, en garantissant des processus fiables et performants.
28 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_028.png', 'ONETEAM Newsletter - December 2025'),
('1cb5cdfd-936d-4d6d-8d08-0bdb8a50665f', 29, 'Un immense merci à toutes les équipes impliquées dans la préparation et le', 'Un immense merci à toutes les équipes impliquées dans la préparation et le
déroulement de cet audit. Votre rigueur, votre collaboration et votre sens du
détail ont été déterminants pour atteindre ce niveau d’excellence. Ensemble,
nous consolidons notre position en tant que référence en matière de qualité et
de conformité
Félicitations à l’équipe Qualité et à l’équipe CISO !
Votre engagement en matière d’éthique et de conformité a été reconnu par
l’attribution du Prix de l’Engagement Éthique & Compliance. Une distinction qui
reflète nos valeurs et notre culture d’intégrité.
Mesure d’efficacité des processus : un levier pour la performance
durable
29 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_029.png', 'ONETEAM Newsletter - December 2025'),
('d84904c6-c85f-484d-bffc-9dfd433867bd', 30, 'Pour rester compétitifs et garantir une performance pérenne, il est essentiel de', 'Pour rester compétitifs et garantir une performance pérenne, il est essentiel de
mesurer l’efficacité de nos processus.
C’est pourquoi l’équipe Qualité a lancé le Process Effectiveness Survey, un outil
stratégique conçu pour :
Évaluer objectivement nos processus
Identifier les points forts et les axes d’amélioration.
Renforcer la satisfaction des parties prenantes
Impliquer nos équipes dans une démarche collaborative et constructive.
Favoriser l’amélioration continue
Détecter les inefficacités et mettre en place des actions correctives ciblées.
Appuyer la prise de décision
Fournir des données fiables pour orienter les priorités et les investissements.
Votre participation est essentielle ! Ensemble, faisons de nos processus un véritable
moteur de performance.
Ce semestre, nous renforçons nos pratiques qualité pour améliorer la performance et
la conformité. Voici les initiatives clés :
Formations & Certifications
✔ Modèle CMMI – Sessions pour renforcer la maturité des pratiques
✔ Process Improvement & Process Mapping Expert – Formation certifiante pour
maîtriser l’optimisation des processus
✔Lean Six Sigma Yellow Belt – Programme en ligne, à votre rythme, pour améliorer
l’efficacité et réduire les gaspillages
✔ Formation obligatoire en management qualité pour approfondir les exigences
et les bonnes pratiques
Événements & Sensibilisations
2 Town Halls réalisés :
• Quality Workbook– Votre guide pour appliquer facilement les standards qualité au
quotidien
• Gestion des risques et des opportunités – Anticiper les incertitudes, réduire les
impacts et transformer chaque défi en levier de performance
30 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_030.png', 'ONETEAM Newsletter - December 2025'),
('447718c6-7912-4ac8-a939-505269ddab0a', 31, 'Gestion documentaire', 'Gestion documentaire
✔ Mise à jour de la Labelling Policy
✔ Nouveaux templates disponibles (Tailoring)
✔ Clarification des notions : Politique, Processus, Procédure
✔ Guide pratique : Comment formaliser un processus
Knowledge Base & Bonnes Pratiques
31 of 212', 'December 2025', '2025-12-01', 'Awards & Recognition', 'page_031.png', 'ONETEAM Newsletter - December 2025'),
('9ae5d7fa-067e-4576-a41a-3aadb1872ae4', 33, 'Avec un score CSAT de 4,5, nous avons', 'Avec un score CSAT de 4,5, nous avons
atteint notre objectif de satisfaction client
pour le semestre ! Ce résultat reflète la
qualité de nos services et l’engagement
constant de nos équipes à écouter,
comprendre et répondre aux attentes de
nos clients. Continuons à capitaliser sur
nos points forts et à travailler sur les
axes d’amélioration identifiés pour
maintenir ce niveau d’excellence.
Bravo à tous pour cette performance
Nos Clients et Comptes Très
satisfaits
Audit Corporate : Une performance
exemplaire !
Ces chiffres témoignent de notre engagement
collectif à maintenir des standards élevés et à
améliorer continuellement nos méthodes de
travail. Les bonnes pratiques mises en avant
reflètent notre capacité à répondre efficacement
aux attentes de nos clients et de notre
organisation, en garantissant des processus
fiables et performants.
Un immense merci à toutes les
équipes impliquées dans la
préparation et le déroulement de cet
33 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_033.png', 'ONETEAM Newsletter - December 2025'),
('62d6fe61-643c-431c-914e-4fba4a8919c7', 34, 'audit. Votre rigueur, votre', 'audit. Votre rigueur, votre
collaboration et votre sens du détail
ont été déterminants pour atteindre
ce niveau d’excellence. Ensemble,
nous consolidons notre position en
tant que référence en matière de
qualité et de conformité
Félicitations à l’équipe Qualité et à
l’équipe CISO !
Votre engagement en matière d’éthique et de
conformité a été reconnu par l’attribution du Prix
de l’Engagement Éthique & Compliance. Une
distinction qui reflète nos valeurs et notre culture
d’intégrité.
Mesure d’efficacité des processus :
un levier pour la performance
durable
34 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_034.png', 'ONETEAM Newsletter - December 2025'),
('cdb7a409-bf2e-4d9e-8517-194de86ad27f', 35, 'Pour rester compétitifs et garantir une', 'Pour rester compétitifs et garantir une
performance pérenne, il est essentiel de mesurer
l’efficacité de nos processus.
C’est pourquoi l’équipe Qualité a lancé le Process
Effectiveness Survey, un outil stratégique conçu
pour :
Évaluer objectivement nos processus
Identifier les points forts et les axes
d’amélioration.
Renforcer la satisfaction des parties
prenantes
Impliquer nos équipes dans une démarche
collaborative et constructive.
Favoriser l’amélioration continue
Détecter les inefficacités et mettre en place
des actions correctives ciblées.
Appuyer la prise de décision
Fournir des données fiables pour orienter
les priorités et les investissements.
Votre participation est essentielle ! Ensemble,
faisons de nos processus un véritable moteur de
performance.
Ce semestre, nous renforçons nos
pratiques qualité pour améliorer la
performance et la conformité. Voici les
initiatives clés :
Formations & Certifications
✔ Modèle CMMI – Sessions pour renforcer la
maturité des pratiques
✔ Process Improvement & Process Mapping
Expert – Formation certifiante pour maîtriser
l’optimisation des processus
✔Lean Six Sigma Yellow Belt – Programme en
ligne, à votre rythme, pour améliorer l’efficacité et
réduire les gaspillages
✔ Formation obligatoire en management
qualité pour approfondir les exigences et les
bonnes pratiques
Événements & Sensibilisations
35 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_035.png', 'ONETEAM Newsletter - December 2025'),
('ef81ec13-97c3-4da2-a570-c123b88dda8b', 36, '2 Town Halls réalisés :', '2 Town Halls réalisés :
• Quality Workbook– Votre guide pour
appliquer facilement les standards
qualité au quotidien
• Gestion des risques et des
opportunités – Anticiper les incertitudes,
réduire les impacts et transformer
chaque défi en levier de performance
Gestion documentaire
✔ Mise à jour de la Labelling Policy
✔ Nouveaux templates disponibles
(Tailoring)
✔ Clarification des notions : Politique,
Processus, Procédure
✔ Guide pratique : Comment
formaliser un processus
Knowledge Base & Bonnes Pratiques
✔ Nouvelle version de la Politique
Qualité partagée avec tous
✔ Exemples concrets : Approval
Tool pour la validation des documents
✔ Vidéo : Les règles pour réussir vos
audits Conseils pratiques pour garantir
des audits efficaces et conformes
Ensemble, faisons de la qualité un
moteur d’excellence !
36 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_036.png', 'ONETEAM Newsletter - December 2025'),
('387e7b11-5e6c-430b-b9f4-c1cde8d11cbc', 38, 'Avec un score CSAT de 4,5, nous avons', 'Avec un score CSAT de 4,5, nous avons
atteint notre objectif de satisfaction client
pour le semestre ! Ce résultat reflète la
qualité de nos services et l’engagement
constant de nos équipes à écouter,
comprendre et répondre aux attentes de
nos clients. Continuons à capitaliser sur
nos points forts et à travailler sur les
axes d’amélioration identifiés pour
maintenir ce niveau d’excellence.
Bravo à tous pour cette performance
Nos Clients et Comptes Très
satisfaits
Audit Corporate : Une performance
exemplaire !
Ces chiffres témoignent de notre engagement
collectif à maintenir des standards élevés et à
améliorer continuellement nos méthodes de
travail. Les bonnes pratiques mises en avant
reflètent notre capacité à répondre efficacement
aux attentes de nos clients et de notre
organisation, en garantissant des processus
fiables et performants.
Un immense merci à toutes les
équipes impliquées dans la
préparation et le déroulement de cet
38 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_038.png', 'ONETEAM Newsletter - December 2025'),
('82cf13ec-6de3-422e-8146-19a5367b6206', 39, 'audit. Votre rigueur, votre', 'audit. Votre rigueur, votre
collaboration et votre sens du détail
ont été déterminants pour atteindre
ce niveau d’excellence. Ensemble,
nous consolidons notre position en
tant que référence en matière de
qualité et de conformité
Félicitations à l’équipe Qualité et à
l’équipe CISO !
Votre engagement en matière d’éthique et de
conformité a été reconnu par l’attribution du Prix
de l’Engagement Éthique & Compliance. Une
distinction qui reflète nos valeurs et notre culture
d’intégrité.
Mesure d’efficacité des processus :
un levier pour la performance
durable
39 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_039.png', 'ONETEAM Newsletter - December 2025'),
('eeeb0f19-13bb-4586-8f07-18e3e4f31f3e', 40, 'Pour rester compétitifs et garantir une', 'Pour rester compétitifs et garantir une
performance pérenne, il est essentiel de mesurer
l’efficacité de nos processus.
C’est pourquoi l’équipe Qualité a lancé le Process
Effectiveness Survey, un outil stratégique conçu
pour :
Évaluer objectivement nos processus
Identifier les points forts et les axes
d’amélioration.
Renforcer la satisfaction des parties
prenantes
Impliquer nos équipes dans une démarche
collaborative et constructive.
Favoriser l’amélioration continue
Détecter les inefficacités et mettre en place
des actions correctives ciblées.
Appuyer la prise de décision
Fournir des données fiables pour orienter
les priorités et les investissements.
Votre participation est essentielle ! Ensemble,
faisons de nos processus un véritable moteur de
performance.
Ce semestre, nous renforçons nos
pratiques qualité pour améliorer la
performance et la conformité. Voici les
initiatives clés :
Formations & Certifications
✔ Modèle CMMI – Sessions pour renforcer la
maturité des pratiques
✔ Process Improvement & Process Mapping
Expert – Formation certifiante pour maîtriser
l’optimisation des processus
✔Lean Six Sigma Yellow Belt – Programme en
ligne, à votre rythme, pour améliorer l’efficacité et
réduire les gaspillages
✔ Formation obligatoire en management
qualité pour approfondir les exigences et les
bonnes pratiques
Événements & Sensibilisations
40 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_040.png', 'ONETEAM Newsletter - December 2025'),
('d2db5e02-4b95-4eb4-bf55-1fb707cec86a', 42, '«««« EEEExxxxcccceeeelllllllleeeennnncccceeee &&&& EEEEnnnnggggaaaaggggeeeemmmmeeeennnntttt ::::', 'TTTToooo:::: MOUSSALI, Omar
«««« EEEExxxxcccceeeelllllllleeeennnncccceeee &&&& EEEEnnnnggggaaaaggggeeeemmmmeeeennnntttt ::::
NNNNoooossss rrrrééééuuuussssssssiiiitttteeeessss QQQQuuuuaaaalllliiiittttéééé SSSS1111 FFFFYYYY22226666 »»»»
Edito
Chers collègues,
Ce semestre a été marqué par des
avancées significatives en matière
de qualité et de satisfaction client.
Grâce à l’engagement de chacun,
nous avons atteint des résultats
remarquables. Découvrez sur cette
newsletter les faits marquants et les
réussites collectives qui font notre
fierté.
Automatisation du CSAT & Analyse
des retours
Nous avons franchi une étape clé
avec l’automatisation du processus
CSAT et la mise en place d’un
reporting dynamique. Cette
évolution nous permet d’intégrer
l’analyse des retours clients pour
identifier les points forts et les
axes d’amélioration, garantissant
une écoute proactive et continue.
Résultat CSAT S1FY26 :
42 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_042.png', 'ONETEAM Newsletter - December 2025'),
('f56ed7da-473e-4030-a43f-acb57a4e1742', 43, 'Avec un score CSAT de 4,5, nous', 'Avec un score CSAT de 4,5, nous
avons atteint notre objectif de
satisfaction client pour le semestre !
Ce résultat reflète la qualité de nos
services et l’engagement constant
de nos équipes à écouter,
comprendre et répondre aux
attentes de nos clients. Continuons
à capitaliser sur nos points forts et à
travailler sur les axes d’amélioration
identifiés pour maintenir ce niveau
d’excellence. Bravo à tous pour
cette performance
Clients et Comptes Très satisfaits
5/5 S1 FY26
NNNNoooossss ccccoooommmmpppptttteeeessss oooobbbbsssshhhhoooorrrreeeessss ttttrrrrèèèèssss
ssssaaaattttiiiissssffffaaaaiiiittttssss ::::
AAAASSSSAAAATTTT AAAAccccccccoooouuuunnnntttt SSSSaaaattttiiiissssffffaaaaccccttttiiiioooonnnn //// NNNNPPPPSSSS
NNNNeeeetttt pppprrrroooommmmoooottttoooorrrr ssssccccoooorrrreeee
Nos clients locaux très satisfaits : 5/5
VVVVooooCCCC VVVVooooiiiicccceeee ooooffff ccccuuuuttttoooommmmeeeerrrr //// NNNNPPPPSSSS NNNNeeeetttt
pppprrrroooommmmoooottttoooorrrr ssssccccoooorrrreeee
43 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_043.png', 'ONETEAM Newsletter - December 2025'),
('78846e07-d792-4b2c-bf68-02a5ad420b88', 44, 'Audit Corporate : Une performance', 'Audit Corporate : Une performance
exemplaire !
0 Non-conformités majeures
0 Non-conformités mineures
0 Observations
3 Opportunités d’amélioration
2 Bonnes pratiques identifiées
Ces chiffres témoignent de notre
engagement collectif à maintenir des
standards élevés et à améliorer
continuellement nos méthodes de travail.
Les bonnes pratiques mises en avant
reflètent notre capacité à répondre
efficacement aux attentes de nos clients et
de notre organisation, en garantissant des
processus fiables et performants.
Un immense merci à toutes les
équipes impliquées dans la
préparation et le déroulement de
cet audit. Votre rigueur, votre
collaboration et votre sens du
détail ont été déterminants pour
atteindre ce niveau d’excellence.
Ensemble, nous consolidons
notre position en tant que
44 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_044.png', 'ONETEAM Newsletter - December 2025'),
('acff3c9a-303c-4511-b9f3-7e24e02f2be3', 45, 'référence en matière de qualité et', 'référence en matière de qualité et
de conformité
Félicitations à l’équipe Qualité et à
l’équipe CISO !
Votre engagement en matière d’éthique et
de conformité a été reconnu par l’attribution
du Prix de l’Engagement Éthique &
Compliance. Une distinction qui reflète nos
valeurs et notre culture d’intégrité.
Mesure d’efficacité des processus :
un levier pour la performance
durable
Pour rester compétitifs et garantir une
performance pérenne, il est essentiel de
mesurer l’efficacité de nos processus.
C’est pourquoi l’équipe Qualité a lancé le
Process Effectiveness Survey, un outil
stratégique conçu pour :
Évaluer objectivement nos processus
Identifier les points forts et les axes
d’amélioration.
Renforcer la satisfaction des parties
prenantes
Impliquer nos équipes dans une
démarche collaborative et
constructive.
Favoriser l’amélioration continue
Détecter les inefficacités et mettre en
place des actions correctives ciblées.
Appuyer la prise de décision
Fournir des données fiables pour
orienter les priorités et les
investissements.
Votre participation est essentielle !
Ensemble, faisons de nos processus un
véritable moteur de performance.
45 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_045.png', 'ONETEAM Newsletter - December 2025'),
('ade0393e-56b1-4cd3-a1a9-375e12e75254', 46, 'Ce semestre, nous renforçons nos', 'Ce semestre, nous renforçons nos
pratiques qualité pour améliorer la
performance et la conformité. Voici
les initiatives clés :
Formations & Certifications
✔ Modèle CMMI – Sessions pour renforcer
la maturité des pratiques
✔ Process Improvement & Process
Mapping Expert – Formation certifiante
pour maîtriser l’optimisation des processus
✔Lean Six Sigma Yellow Belt –
Programme en ligne, à votre rythme, pour
améliorer l’efficacité et réduire les
gaspillages
✔ Formation obligatoire en management
qualité pour approfondir les exigences
et les bonnes pratiques
Événements & Sensibilisations
2 Town Halls réalisés :
• Quality Workbook– Votre guide
pour appliquer facilement les
standards qualité au quotidien
• Gestion des risques et des
opportunités – Anticiper les
incertitudes, réduire les impacts et
transformer chaque défi en levier de
performance
Gestion documentaire
✔ Mise à jour de la Labelling
Policy
✔ Nouveaux templates disponibles
(Tailoring)
✔ Clarification des notions :
Politique, Processus, Procédure
✔ Guide pratique : Comment
formaliser un processus
Knowledge Base & Bonnes
Pratiques
✔ Nouvelle version de la
Politique Qualité partagée avec
tous
✔ Exemples concrets : Approval
Tool pour la validation des
documents
✔ Vidéo : Les règles pour réussir
vos audits Conseils pratiques pour
garantir des audits efficaces et
conformes
Ensemble, faisons de la qualité
un moteur d’excellence !
Merci à chacun pour votre
implication et votre passion pour la
qualité. Ensemble, nous
construisons une organisation
46 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_046.png', 'ONETEAM Newsletter - December 2025'),
('99e726ee-7c1d-4329-84c7-597ab5f18af6', 48, 'reporting dynamique. Cette', 'reporting dynamique. Cette
évolution nous permet d’intégrer
l’analyse des retours clients pour
identifier les points forts et les
axes d’amélioration, garantissant
une écoute proactive et continue.
Résultat CSAT S1FY26 :
Avec un score CSAT de 4,5, nous
avons atteint notre objectif de
satisfaction client pour le semestre !
Ce résultat reflète la qualité de nos
services et l’engagement constant
de nos équipes à écouter,
comprendre et répondre aux
attentes de nos clients. Continuons
à capitaliser sur nos points forts et à
travailler sur les axes d’amélioration
identifiés pour maintenir ce niveau
d’excellence. Bravo à tous pour
cette performance
Clients et Comptes Très satisfaits
5/5 S1 FY26
NNNNoooossss ccccoooommmmpppptttteeeessss oooobbbbsssshhhhoooorrrreeeessss ttttrrrrèèèèssss
ssssaaaattttiiiissssffffaaaaiiiittttssss ::::
AAAASSSSAAAATTTT AAAAccccccccoooouuuunnnntttt SSSSaaaattttiiiissssffffaaaaccccttttiiiioooonnnn //// NNNNPPPPSSSS
NNNNeeeetttt pppprrrroooommmmoooottttoooorrrr ssssccccoooorrrreeee
Nos clients locaux très satisfaits : 5/5
VVVVooooCCCC VVVVooooiiiicccceeee ooooffff ccccuuuuttttoooommmmeeeerrrr //// NNNNPPPPSSSS NNNNeeeetttt
48 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_048.png', 'ONETEAM Newsletter - December 2025'),
('e7680440-8269-4100-943c-27507a1788de', 49, 'pppprrrroooommmmoooottttoooorrrr ssssccccoooorrrreeee', 'pppprrrroooommmmoooottttoooorrrr ssssccccoooorrrreeee
Audit Corporate : Une performance
exemplaire !
0 Non-conformités majeures
0 Non-conformités mineures
0 Observations
3 Opportunités d’amélioration
2 Bonnes pratiques identifiées
Ces chiffres témoignent de notre
engagement collectif à maintenir des
standards élevés et à améliorer
continuellement nos méthodes de travail.
Les bonnes pratiques mises en avant
reflètent notre capacité à répondre
efficacement aux attentes de nos clients et
de notre organisation, en garantissant des
processus fiables et performants.
Un immense merci à toutes les
équipes impliquées dans la
préparation et le déroulement de
cet audit. Votre rigueur, votre
collaboration et votre sens du
détail ont été déterminants pour
49 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_049.png', 'ONETEAM Newsletter - December 2025'),
('6b7e1c42-67b2-4573-9e9e-f8048ab78a56', 50, 'atteindre ce niveau d’excellence.', 'atteindre ce niveau d’excellence.
Ensemble, nous consolidons
notre position en tant que
référence en matière de qualité et
de conformité
Félicitations à l’équipe Qualité et à
l’équipe CISO !
Votre engagement en matière d’éthique et
de conformité a été reconnu par l’attribution
du Prix de l’Engagement Éthique &
Compliance. Une distinction qui reflète nos
valeurs et notre culture d’intégrité.
Mesure d’efficacité des processus :
un levier pour la performance
durable
Pour rester compétitifs et garantir une
performance pérenne, il est essentiel de
mesurer l’efficacité de nos processus.
C’est pourquoi l’équipe Qualité a lancé le
Process Effectiveness Survey, un outil
stratégique conçu pour :
Évaluer objectivement nos processus
Identifier les points forts et les axes
d’amélioration.
Renforcer la satisfaction des parties
prenantes
Impliquer nos équipes dans une
démarche collaborative et
constructive.
Favoriser l’amélioration continue
Détecter les inefficacités et mettre en
place des actions correctives ciblées.
Appuyer la prise de décision
Fournir des données fiables pour
orienter les priorités et les
investissements.
Votre participation est essentielle !
Ensemble, faisons de nos processus un
véritable moteur de performance.
50 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_050.png', 'ONETEAM Newsletter - December 2025'),
('cf084ddc-f473-4893-b617-a8144bdbc2df', 51, 'Ce semestre, nous renforçons nos', 'Ce semestre, nous renforçons nos
pratiques qualité pour améliorer la
performance et la conformité. Voici
les initiatives clés :
Formations & Certifications
✔ Modèle CMMI – Sessions pour renforcer
la maturité des pratiques
✔ Process Improvement & Process
Mapping Expert – Formation certifiante
pour maîtriser l’optimisation des processus
✔Lean Six Sigma Yellow Belt –
Programme en ligne, à votre rythme, pour
améliorer l’efficacité et réduire les
gaspillages
✔ Formation obligatoire en management
qualité pour approfondir les exigences
et les bonnes pratiques
Événements & Sensibilisations
2 Town Halls réalisés :
• Quality Workbook– Votre guide
pour appliquer facilement les
standards qualité au quotidien
• Gestion des risques et des
opportunités – Anticiper les
incertitudes, réduire les impacts et
transformer chaque défi en levier de
performance
Gestion documentaire
✔ Mise à jour de la Labelling
Policy
✔ Nouveaux templates disponibles
(Tailoring)
✔ Clarification des notions :
Politique, Processus, Procédure
✔ Guide pratique : Comment
formaliser un processus
Knowledge Base & Bonnes
Pratiques
✔ Nouvelle version de la
Politique Qualité partagée avec
tous
✔ Exemples concrets : Approval
Tool pour la validation des
documents
✔ Vidéo : Les règles pour réussir
vos audits Conseils pratiques pour
garantir des audits efficaces et
conformes
Ensemble, faisons de la qualité
un moteur d’excellence !
Merci à chacun pour votre
implication et votre passion pour la
qualité. Ensemble, nous
construisons une organisation
51 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_051.png', 'ONETEAM Newsletter - December 2025'),
('f74031b8-91ba-47ce-b9b4-f22458025382', 52, 'performante et durable.', 'performante et durable.
Pour toute question ou suggestion,
contactez l’équipe Qualité :
ma-quality@dxc.com
If you wish to unsubscribe from our newsletter, click here
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt:::: ONETEAM NEWSLETTER - NOVEMBER 2025
DDDDaaaatttteeee:::: Wednesday, 17 December 2025 at 11:41:29 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
AAAAttttttttaaaacccchhhhmmmmeeeennnnttttssss::::image002.png
YOUR MONTHLY SNAPSHOT OF LIFE AT
DXC
52 of 212', 'December 2025', '2025-12-01', 'Quality', 'page_052.png', 'ONETEAM Newsletter - December 2025'),
('fa62b1fd-01c2-4feb-918e-f1b16dfb1aa1', 53, 'Strengthening Global Collaboration: EU Sales Leadership', 'Strengthening Global Collaboration: EU Sales Leadership
Visit
Over the past weeks, we had the privilege of welcoming the EU Sales Leadership team to our
site; a key moment that allowed us to align on strategic priorities and reinforce our shared vision
for the future.
Beyond the formal sessions, this visit served as a true platform for open dialogue. It
strengthened connections between teams, encouraged the exchange of insights and best
practices, and helped identify new opportunities for collaboration. Discussions highlighted the
importance of close partnership and collective effort to drive transformation and ensure client
success at every stage.
This initiative reflects our ongoing commitment to maintaining strong engagement with global
leadership, sharpening our strategic direction, and ensuring that every action we take
contributes to a unified goal: delivering innovative, high-impact solutions that meet our clients’
evolving needs.
DXC.CDG at the Center of EMEA’s Digital Momentum
We proudly hosted the first EMEA Partners Engagement Forum at our Rabat Delivery
Center, bringing together more than 80 leaders, IT experts, and partners from across
Europe region.
This landmark event allowed us to exchange on key strategic priorities like
innovation, cloud, cybersecurity, and digital transformation, while strengthening
collaboration, sharing best practices, and exploring new partnership opportunities.
Through this forum, we reaffirmed DXC Morocco’s role as a strategic digital hub,
showcasing our ability to connect key regional players, foster innovation, and drive
operational excellence.
53 of 212', 'November 2025', '2025-11-01', 'Business & Clients', 'page_053.png', 'ONETEAM Newsletter - November 2025'),
('c8ffda87-7977-4154-834d-b2509ab99ece', 54, 'Key Achievements: Strengthening Our Role as a Strategic', 'Key Achievements: Strengthening Our Role as a Strategic
Partner
We continue to reinforce our position as a trusted strategic partner by supporting major
organizations through high-impact projects.
Among these key achievements, we successfully led RAM’s migration to ServiceNow, marking a
first reference in Morocco. We also supported Lafarge through the deployment of 1,000
Microsoft licenses, contributed to the development of web applications for Fondation CDG,
ensured the renewal of hosting and managed services for MNTRA, and provided functional SAP
support for Teal.
These accomplishments reflect our strong commitment to delivery excellence, operational
reliability, and long-term, value-driven partnerships.
Recent Milestones Strengthening Our Partnerships
Lately, several key developments have marked the evolution of our client engagements. Banqup
and SUEZ signed new contracts and unveiled refreshed logos, reinforcing their visual identity
and long-term vision. TotalEnergies welcomed additional resources to support its ongoing
projects, while Audi extended and expanded its teams to ensure continuity and sustained
performance.
At the same time, Alstom finalized a new contract with partner Diapason, opening the door to
fresh synergies. Caceis renewed its agreement, reaffirming the strength of our collaboration, and
“Ministero Della Cultura” extended its existing setup to secure the continuity of current initiatives.
These milestones reflect the trust our partners place in us and our ongoing commitment to
delivering value, innovation, and operational excellence.
54 of 212', 'November 2025', '2025-11-01', 'Business & Clients', 'page_054.png', 'ONETEAM Newsletter - November 2025'),
('fc2617d1-d19e-4c2d-9d01-d071969774b7', 55, 'Managerial Charter : Leading with Flexibility and Agility', 'Managerial Charter : Leading with Flexibility and Agility
Throughout November, we explored one of the key values of our Managerial
Charter: Flexibility & Agility , essential capabilities that enable us to adapt to
change, respond effectively to evolving priorities, and remain resilient in a constantly
shifting environment.
Thank you for your strong engagement around this theme. We invite you to watch the
video testimonial in which our colleagues share their perspectives and best practices
on embracing flexibility and agility in their daily work.
Together, let’s continue to foster a management culture that is adaptive, forward-
looking, and centered on our people.
OneTeam App: Your Front-Row Seat to the Excitement!
Over 1,045 colleagues are already active on the OneTeam App, staying connected
and up to date with all things DXC.CDG. If you haven’t joined yet, now is the perfect
time!
Something exciting linked to a major football event is coming soon: fun, engaging,
and worth following. Don’t miss your chance to be part of the experience and join the
growing OneTeam community.
Download the app today and stay tuned for more updates!
55 of 212', 'November 2025', '2025-11-01', 'Wellbeing & Health', 'page_055.png', 'ONETEAM Newsletter - November 2025'),
('9e93b08e-ba66-4a57-9ab5-6b5a0e68a09b', 56, 'Health Insurance Made Clear! Simplifying Benefits for You', 'Health Insurance Made Clear! Simplifying Benefits for You
The Complementary Health Insurance Town Hall took place a few days ago, aiming
to provide a clearer understanding of our health coverage, managed by our partner
AtlantaSanad and supported by our broker AFMA.
Key topics covered included:
The benefits and guarantees under the plan: Illness–Maternity, Disability–
Invalidity, Death, and Major Risks
Coverage limits, reimbursement rates, and procedures
How to submit a claim or coverage request
Features of the AFMA mobile app to simplify your requests
For any questions regarding your documents or coordination with the insurer, our
nurse and colleague Rajae Ayadi remains your contact.
For those who could not attend, the recording is available by clicking on the
thumbnail.
FY26S1 Mid-Year Evaluation Campaign Launched
The FY26-S1 mid-year evaluation campaign is now underway, covering the period from
April 1 to September 30, 2025.
Eligible colleagues had the opportunity to review achievements, share aspirations, and
engage in constructive dialogue with their managers. Self-evaluations were also completed
in our internal HR tool: TalentSoft.
A dedicated Town Hall was held on Thursday, December 4, to guide eligible colleagues
through the process and answer their questions.
For any follow-up or assistance, colleagues could contact Anas NAJA
56 of 212', 'November 2025', '2025-11-01', 'Business & Clients', 'page_056.png', 'ONETEAM Newsletter - November 2025'),
('de07ffa5-b23c-4862-a979-89fab44b9e63', 57, 'Kudos to Our DXC CDG Football Teams for an Outstanding', 'Kudos to Our DXC CDG Football Teams for an Outstanding
Performance
Our DXC.CDG Football Club shined brightly in this year’s Customer Relation Tournament,
showcasing impressive teamwork, resilience, and passion across both our Rabat and
Casablanca teams. A big congratulations to all players for their remarkable performances!
Well-done to both teams for representing DXC.CDG with excellence on the field. Your
sportsmanship and commitment embody the very best of our team spirit.
Onwards to more victories!
Rabat Team Results :
06/11/2025 – CEGEDIM vs. DXC.CDG : 0–1
13/11/2025 – STELLANTIS 2 vs. DXC.CDG : 1–1
20/11/2025 – TELEPERFORMANCE vs. DXC.CDG : 0–1
Casablanca Team Results :
03/11/2025 – DXC.CDG vs. CBI: 0–1
10/11/2025 – DXC.CDG vs. CMS: 3–1
17/11/2025 – DXC.CDG vs. WAFA ASSURANCE: 3–2
25/11/2025 – DXC.CDG vs. TELEPERFORMANCE 3: 9–2
Movember 2025  Honoring Men, supporting Wellbeing
As part of its commitment to a healthy and inclusive workplace, DXC.CDG held its annual
Movember & Men’s Health Month initiative on December 9th and 10th in Rabat and
Casablanca.
The sessions raised awareness around prostate cancer prevention, early screening, and
men’s mental health, with contributions from a medical specialist, our Occupational Doctor,
and an on-site mobile laboratory offering free and confidential screenings.
Through open discussions and your strong participation, this initiative reinforced the
importance of speaking up, prevention, and collective care for our people.
Together, we continue to build a workplace where wellbeing, prevention, and open dialogue
truly matter.
57 of 212', 'November 2025', '2025-11-01', 'Wellbeing & Health', 'page_057.png', 'ONETEAM Newsletter - November 2025'),
('9a3cfb9a-ea23-4117-85ee-7fa74771c802', 58, 'Ethics & Compliance Week : Key Highlights', 'Ethics & Compliance Week : Key Highlights
The 2025 Ethics & Compliance Week has come to a close, marking a period of
meaningful discussions, shared learning, and collective engagement. Through a
series of enriching activities, this edition offered an opportunity to highlight ethical
practices and reinforce the importance of integrity across our organization.
This week also shone a spotlight on internal best practices and outstanding initiatives.
The Quality and CISO teams were honored with the Ethics & Compliance
Engagement Award, recognizing their strong commitment to integrity and compliance.
Ethics and compliance remain embedded in our daily culture, serving as essential
drivers of trust and performance. You can now revisit the highlights through the recap
video and photo album, available via the thumbnail.
58 of 212', 'November 2025', '2025-11-01', 'Quality', 'page_058.png', 'ONETEAM Newsletter - November 2025'),
('bade0c14-3ca5-48ac-93a3-aca67c1a7e8f', 59, 'Final Oneteam Rewards Ranking – December 31st', 'AFCON 2025 Concepts – Soon
Final Oneteam Rewards Ranking – December 31st
If you wish to unsubscribe from our newsleper, click here
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt:::: ONETEAM NEWSLETTER - OCTOBER 2025
DDDDaaaatttteeee:::: Thursday, 13 November 2025 at 11:48:53 GMT+01:00
59 of 212', 'November 2025', '2025-11-01', 'Events & Upcoming', 'page_059.png', 'ONETEAM Newsletter - November 2025'),
('2828a731-4d95-4d7f-8576-ce0aedf1c9d7', 60, 'An Autumn of Engagement, Integrity,', 'FFFFrrrroooommmm:::: Oneteam Communication
PPPPrrrriiiioooorrrriiiittttyyyy:::: High
AAAAttttttttaaaacccchhhhmmmmeeeennnnttttssss::::image001.png, image002.png, image003.png
An Autumn of Engagement, Integrity,
Health & Team Spirit!
60 of 212', 'October 2025', '2025-10-01', 'Wellbeing & Health', 'page_060.png', 'ONETEAM Newsletter - October 2025'),
('47a84707-4617-406a-8864-4b6f144176ae', 61, 'Spotlight on Managerial and Relational Effectiveness', 'Spotlight on Managerial and Relational Effectiveness
Throughout October, we explored one of the key values of our Managerial Charter:
Managerial and Relational Effectiveness; a core skill that helps us lead with
purpose, communicate with impact, and strengthen our relationships at work.
Thank you for your enthusiasm and engagement, we invite you to watch the video
testimonial featuring our colleagues as they share their insights and best practices
around this value.
Together, let’s continue to build a strong, effective, and human-centered management
culture.
Updated Health & Safety Policy
Our Health & Safety Policy has recently been updated to reflect the latest standards
and best practices. This update reinforces our shared commitment to ensuring a safe
and secure work environment for everyone.
We invite you to check the new policy via the communication email sent last week
and take a moment to familiarize yourself with the key changes.
Thank you for your continued attention and dedication to safety!
DXC.CDG Shines at the GENI Enterprise Forum
Once again, we had the pleasure of taking part in the GENI Enterprise Forum, a
partnership that has truly become a tradition over the years.
This year’s edition was a record-breaker with over 300 students visiting our booth and
around 150 interviews conducted by our HR & Delivery teams, reflecting their
remarkable energy and dedication.
A huge thank you to our teams for their professionalism, enthusiasm, and
commitment in making this event a success.
Together, we continue to strengthen our bond with the next generation of tech
professionals.
61 of 212', 'October 2025', '2025-10-01', 'Business & Clients', 'page_061.png', 'ONETEAM Newsletter - October 2025'),
('f72fd797-6f1d-4ea2-89ae-2f9279c4cf27', 62, 'Team Spirit in Motion: DXC.CDG at the Casablanca Marathon!', 'Team Spirit in Motion: DXC.CDG at the Casablanca Marathon!
Our Running Club colleagues proudly took part in the Casablanca International Marathon,
showcasing the spirit of teamwork, perseverance, and well-being that defines our company
culture.
A heartfelt thank you to all participants for their enthusiasm and sportsmanship, their
energy made this event truly memorable!
Led by our Running Club, this initiative reflects our ongoing commitment to promoting
physical activity and healthy lifestyles at work. Through moments like these, we continue to
strengthen our bonds and foster a culture of balance, vitality, and engagement.
Congratulations to all our runners!
Strong Start for the DXC.CDG Football Team !
Our DXC.CDG Football Club has started the 10th edition of the national tournament “Ligue
de la Relation Client” with an impressive performance!
In their first match, our team dominated Inetum with an outstanding 10–1 victory, a true
showcase of teamwork, energy, and skill.
Their second game against Le Matin ended in a thrilling 4–4 draw, keeping the competition
wide open and our hopes high for the next rounds.
Let’s continue to support our players as they represent DXC.CDG with passion and
sportsmanship!
For more details on upcoming games and how you can join to cheer them on, please reach
out to Houssine Moudden, Head of the Football Club.
Go DXC.CDG!
62 of 212', 'October 2025', '2025-10-01', 'Business & Clients', 'page_062.png', 'ONETEAM Newsletter - October 2025'),
('458ec47e-accf-4c09-b4df-a06e5f81d55f', 63, 'Ethics & Compliance Week 2025 in Full Swing', 'Ethics & Compliance Week 2025 in Full Swing
Ethics & Compliance Week 2025 is underway, bringing together a series of town halls,
workshops, and interactive activities highlighting our commitment to integrity and compliance.
The first Town Hall focused on the responsible use of AI in our operations and sparked great
discussions among participants. More engaging sessions and initiatives are rolling out
throughout the week, reinforcing our shared values of integrity and collaboration.
63 of 212', 'October 2025', '2025-10-01', 'Events & Upcoming', 'page_063.png', 'ONETEAM Newsletter - October 2025'),
('3addbdca-4571-487b-8aac-906d720619a8', 64, 'Thank You for Making Pink October a Success', 'Thank You for Making Pink October a Success
Heartfelt thank you to everyone for your engagement and exemplary participation
throughout our Pink October awareness campaign.
The initiative began with a charity run in Casablanca, followed by two inspiring
awareness days led in partnership with Dr. Mouncef Belkasmi and the associations
Les Amis du Ruban Rose and Nabd BC2. Together, we explored key topics around
prevention, early detection, and support with empathy and insight.
Your active participation and heartfelt exchanges turned this initiative into a
meaningful moment of sharing and collective awareness, true to our values of care
and solidarity.
64 of 212', 'October 2025', '2025-10-01', 'Business & Clients', 'page_064.png', 'ONETEAM Newsletter - October 2025'),
('3460a2b0-bec6-4dc0-9853-c858c2601bd9', 66, 'Hello Narjisse,', 'TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::FW: ONETEAM NEWSLETTER - Business Focus Edition
DDDDaaaatttteeee:::: Monday, 3 November 2025 at 11:28:13 GMT+01:00
FFFFrrrroooommmm:::: Hiba, EL GHAROUCH
TTTToooo:::: Chahine, Narjisse
CCCCCCCC:::: Lahlou, Younes, BENNANI, Khalid, Lahbabi, Amal, El OMRI, Amine, Alaoui Yazidi, EL Yazid, MOUSSALI, Omar, ACHOURI, Lamiae
PPPPrrrriiiioooorrrriiiittttyyyy::::High
Hello Narjisse,
Un grand merci pour ton rôle clé dans le partage des actu business pour la newsleper OneTeam, tes contribu0ons nous aident vraiment à garder le contenu vivant et
connecté à ce qui se passe dans le business !
Le mois dernier, on était ravis de consacrer une édi0on spéciale principalement aux news business (voir plus bas)
On prépare déjà la prochaine édi0on, donc n’hésite pas à nous envoyer toute nouvelle actu ou info business que tu aimerais mepre en avant. Tes partages sont
toujours très appréciés !
Cdt,
Hiba
FFFFrrrroooommmm:::: Oneteam Communica0on <MA_communica0on@dxc.com>
SSSSeeeennnntttt:::: Friday, October 10, 2025 12:00 PM
SSSSuuuubbbbjjjjeeeecccctttt:::: ONETEAM NEWSLETTER - Business Focus Edi0on
IIIImmmmppppoooorrrrttttaaaannnncccceeee:::: High
Business Focus Edition
66 of 212', 'October 2025', '2025-10-01', 'Innovation & Tech', 'page_066.png', 'ONETEAM Newsletter - October 2025'),
('477d0a2a-feca-4dd8-9d97-c6d41b56a5c7', 67, 'Offshore Strength: Continuity and New Horizons!', 'Offshore Strength: Continuity and New Horizons!
In September, DXC.CDG continued to strengthen its commitment to service continuity
for its long-standing clients, including BPOST, London Market, and Stellantis, by
ensuring the highest standards of quality and reliability.
At the same time, DXC.CDG expanded its portfolio with the addition of Baloise
Holding and Pratt & Whitney. These new collaborations not only enhance our market
presence but also reaffirm the strategic value of our solutions in addressing our
clients’ evolving challenges.
ISB Leadership Visit: Strengthening Strategic Ties!
In September, DXC.CDG had the privilege of hosting an ISB leadership visit, marking
an important milestone in strengthening our strategic relationships.
This meeting highlighted the dedication of our Morocco teams around the key pillars
of our strategy: innovation, customer value creation, and operational excellence. The
discussions were rich and constructive, showcasing local initiatives in digital
transformation; particularly investments in AI capabilities, which are helping us
reimagine processes, generate meaningful insights, and enhance overall
performance.
67 of 212', 'September 2025', '2025-09-01', 'Quality', 'page_067.png', 'ONETEAM Newsletter - September 2025'),
('7d2b4e76-fa34-453b-ad92-54f7727dd33a', 68, 'Five Prestigious Offshore Visits Mark a Strong First Semester', 'Five Prestigious Offshore Visits Mark a Strong First Semester
The first semester of this financial year was marked by the visit of five prestigious
offshore accounts; in addition to ISB Leadership, we welcomed Airbus, Soletanche
Bachy, Vinci, and Engie, reflecting the trust and confidence our clients place in
DXC.CDG. These visits provided a unique opportunity to deepen strategic
relationships, showcase the expertise of our Morocco teams, and highlight our
commitment to innovation, customer value creation, and operational excellence.
Exciting Growth: Extending Our Teams for ASSURE CLAIM & London
Market
We are thrilled to share that, in response to growing needs and ongoing collaboration, the
teams dedicated to our clients ASSURE CLAIMS and London Market have been extended.
This expansion underscores our commitment to delivering exceptional service,
strengthening partnerships, and providing the right resources to meet our clients’ evolving
requirements.
68 of 212', 'September 2025', '2025-09-01', 'Business & Clients', 'page_068.png', 'ONETEAM Newsletter - September 2025'),
('ce0900e5-181a-4f43-8c33-59b8dc607a37', 69, 'Excellence in Action: Our Local Client Successes', 'Excellence in Action: Our Local Client Successes
DXC.CDG has accomplished several key milestones with its local clients, highlighted by a
strategic addition to its portfolio with the Ministry of the Interior. Over the past period, we
have also signed framework agreements, consolidated existing projects, renewed strategic
licenses, and deployed major solutions.
These successes reflect our commitment to operational excellence and our ongoing close
collaboration with local clients, ensuring we deliver tailored solutions that address their
evolving needs while maintaining the highest standards of quality and reliability.
Some of the recent key projects include:
Ministry of the Interior – SOC Managed Services
CDG Prévoyance – New Framework Agreement
Ministry of Education – Security Roadmap
MNTRA – Hosting Renewal
MAP – SOC-as-a-Service Contract (24/07)
UM6P – Provision of On-Site Resources
CMIM – Acquisition and Implementation of FORTINAC Solution
SCR – Managed Hosting.
These projects reinforce our position as a trusted technology partner for our local
clients.
DXC.CDG at the Heart of Africa’s Cybersecurity Dialogue
DXC.CDG participated in the African Cybersecurity Forum, organized by DGSSI and Smart
Africa alongside our valued partner.
The event, themed "The Future of Cybersecurity: Digital Sovereignty for Sustainable
Economic Development," brought together over 700 decision-makers, including ministers and
international experts.
DXC.CDG reinforced its position as a market leader, showcasing its ability to innovate, secure
applications, and protect sensitive data while supporting Africa’s digital sovereignty.
69 of 212', 'September 2025', '2025-09-01', 'Quality', 'page_069.png', 'ONETEAM Newsletter - September 2025'),
('7f66513d-3dc9-451b-baff-f6a68900f2be', 70, 'OneTeam Rewards: Celebrating Our Top Employees!', 'OneTeam Rewards: Celebrating Our Top Employees!
The latest edition of OneTeam Rewards has come to an exciting close! We recently revealed
the long-awaited Top 10 ranking and winners, recognizing the employees who have been
most engaged in the day-to-day life of the company.
Congratulations to all our winners, who took home prize money ranging from 1,500 to 8,000
MAD for their outstanding engagement and involvement.
If you weren’t in the top 10 this time, don’t worry, the next edition of OneTeam Rewards is just
around the corner. Get involved, stay engaged, and you could be our next winner!
1st Younes Haji - Technopolis
2nd Omar Bennis - Casanearshore
3rd Sara El Harchouni – Technopolis
4th Ismail Ait Salah – Kouribga Client-Site
5th Ilyas Kouifi – Khouribga Client-Site
6th Samir Haouchi – Casablanca Client-Site
7th Taher Bachir – Technopolis
8th Chaimaa Fares - Technopolis
9th Youssef Oubala - Technopolis
10th Assaad El Aamni – Khouribga Client-Site
Building Stronger Teams Through Our Managerial Charter
As part of our Managerial Charter, we recently wrapped up September by revisiting
the value of the month: Team Spirit and Constructive Communication.
It was a great opportunity to highlight the importance of collaboration, active listening,
and open dialogue within our teams. In October, we’ll be focusing on a new core
value: Managerial and Relational Effectiveness; a key pillar to strengthen both our
collective performance and the quality of our daily interactions.
Let’s keep cultivating a collaborative and impactful managerial culture at DXC.CDG.
70 of 212', 'September 2025', '2025-09-01', 'Quality', 'page_070.png', 'ONETEAM Newsletter - September 2025'),
('6bb5fc4b-23dd-4ba0-8c1a-e33f6f128a49', 71, 'DXC.CDG Shines with 4 Brandon Hall Group Excellence Awards!', 'DXC.CDG Shines with 4 Brandon Hall Group Excellence Awards!
We are proud to announce that DXC.CDG has won four prestigious Brandon Hall
Group Excellence Awards, recognizing our corporate culture, social impact, benefits
and well-being programs as well as our recognition program “Oneteam Rewards”.
These awards celebrate the employee-focused initiatives, highlighting our
leadership’s commitment to fostering a healthy work environment that provides
employees with everything they need to thrive.
Brandon Hall Group Excellence Gold Award 2025 – Best Corporate Culture
Transformation
Brandon Hall Group Excellence Gold Award 2025 – Best Benefits, Wellness
and Well-Being Program
Brandon Hall Group Excellence Gold Award 2025 – Best Social Impact
Brandon Hall Group Excellence Silver Award 2025 – Best Employee
Recognition Program
Game On: Casablanca Office Gets a PS5 Zone!
Following growing interest, we’re excited to launch a gaming zone in our Casablanca
office, featuring a PS5 and the most voted popular games. This space allows
colleagues to enjoy breaks together, strengthen bonds, and make office days more
fun.
Adding to our beloved rituals, “Wednesday Brunch” and “Couscous Friday,” the
gaming zone offers even more ways to connect, relax, and share moments of fun at
work.
Get ready to play, connect, and level up your breaks!
71 of 212', 'September 2025', '2025-09-01', 'Awards & Recognition', 'page_071.png', 'ONETEAM Newsletter - September 2025'),
('b9aa2ecc-cd83-4627-9d52-1870dd51c4e0', 75, '« Excellence & Engagement : Nos réussites Qualité S1 FY26 »', '« Excellence & Engagement : Nos réussites Qualité S1 FY26 »
Edito
Chers collègues,
Ce semestre a été marqué par des avancées significatives en matière de qualité et de satisfaction client. Grâce à l’engagement de chacun, nous avons atteint des résultats remarquables. Découvrez sur cette newsletter les faits marquants et les réussites collectives qui font notre fierté.
Automatisation du CSAT & Analyse des retours
Nous avons franchi une étape clé avec l’automatisation du processus CSAT et la mise en place d’un reporting dynamique. Cette évolution nous permet d’intégrer l’analyse des retours clients pour identifier les points forts et les axes d’amélioration, garantissant une écoute proactive et continue.
Résultat CSAT S1FY26 :
Avec un score CSAT de 4,5, nous avons atteint notre objectif de satisfaction client pour le semestre ! Ce résultat reflète la qualité de nos services et l’engagement constant de nos équipes à écouter, comprendre et répondre aux attentes de nos clients. Continuons à capitaliser sur nos points forts et à travailler sur les axes d’amélioration identifiés pour maintenir ce niveau d’excellence. Bravo à tous pour cette performance
Clients et Comptes Très satisfaits 5/5 (S1 FY26)
Nos comptes offshores très satisfaits :
ASAT Account Satisfaction / NPS Net promotor score
75 of 212', 'September 2025', '2025-09-01', 'Quality', 'page_075.png', 'ONETEAM Newsletter - September 2025'),
('0d3b70c0-5113-49dd-8de3-5ce5a80bb6d2', 78, '0 Non-conformités majeures', '0 Non-conformités majeures
0 Non-conformités mineures
0 Observations
3 Opportunités d’amélioration
2 Bonnes pratiques identifiées
Ces chiffres témoignent de notre engagement collectif à maintenir des standards élevés et à améliorer continuellement nos méthodes de travail. Les bonnes pratiques mises en avant reflètent notre capacité à répondre efficacement aux attentes de nos clients et de notre organisation, en garantissant des processus fiables et performants.
Un immense merci à toutes les équipes impliquées dans la préparation et le déroulement de cet audit. Votre rigueur, votre collaboration et votre sens du détail ont été déterminants pour atteindre ce niveau d’excellence. Ensemble, nous consolidons notre position en tant que référence en matière de qualité et de conformité
Félicitations à l’équipe Qualité et à l’équipe CISO !
Votre engagement en matière d’éthique et de conformité a été reconnu par l’attribution du Prix de l’Engagement Éthique & Compliance. Une distinction qui reflète nos valeurs et notre culture d’intégrité.
78 of 212', 'September 2025', '2025-09-01', 'Quality', 'page_078.png', 'ONETEAM Newsletter - September 2025'),
('fb8d83aa-1ae7-42f7-8c67-15046d158e39', 79, 'Mesure d’efficacité des processus : un levier pour la performance durable', 'Mesure d’efficacité des processus : un levier pour la performance durable
Pour rester compétitifs et garantir une performance pérenne, il est essentiel de mesurer l’efficacité de nos processus.
C’est pourquoi l’équipe Qualité a lancé le Process Effectiveness Survey, un outil stratégique conçu pour :
Évaluer objectivement nos processus
Identifier les points forts et les axes d’amélioration.
Renforcer la satisfaction des parties prenantes
Impliquer nos équipes dans une démarche collaborative et constructive.
Favoriser l’amélioration continue
Détecter les inefficacités et mettre en place des actions correctives ciblées.
Appuyer la prise de décision
Fournir des données fiables pour orienter les priorités et les investissements.
Votre participation est essentielle ! Ensemble, faisons de nos processus un véritable moteur de performance.
79 of 212', 'September 2025', '2025-09-01', 'Quality', 'page_079.png', 'ONETEAM Newsletter - September 2025'),
('46b490bc-19e3-4011-8981-99cc13ea5d78', 80, 'Ce semestre, nous renforçons nos pratiques qualité pour améliorer la performance et la conformité. Voici les initiatives', 'Ce semestre, nous renforçons nos pratiques qualité pour améliorer la performance et la conformité. Voici les initiatives clés :
Formations & Certifications
✔ Modèle CMMI – Sessions pour renforcer la maturité des pratiques
✔ Process Improvement & Process Mapping Expert – Formation certifiante pour maîtriser l’optimisation des processus
✔Lean Six Sigma Yellow Belt – Programme en ligne, à votre rythme, pour améliorer l’efficacité et réduire les gaspillages
✔ Formation obligatoire en management qualité pour approfondir les exigences et les bonnes pratiques
Événements & Sensibilisations
2 Town Halls réalisés :
• Quality Workbook– Votre guide pour appliquer facilement les standards qualité au quotidien
• Gestion des risques et des opportunités – Anticiper les incertitudes, réduire les impacts et transformer chaque défi en levier de performance
Gestion documentaire
✔ Mise à jour de la Labelling Policy
✔ Nouveaux templates disponibles (Tailoring)
✔ Clarification des notions : Politique, Processus, Procédure
✔ Guide pratique : Comment formaliser un processus
Knowledge Base & Bonnes Pratiques
✔ Nouvelle version de la Politique Qualité partagée avec tous
✔ Exemples concrets : Approval Tool pour la validation des documents
✔ Vidéo : Les règles pour réussir vos audits Conseils pratiques pour garantir des audits efficaces et conformes
Ensemble, faisons de la qualité un moteur d’excellence !
Merci à chacun pour votre implication et votre passion pour la qualité. Ensemble, nous construisons une organisation performante et durable.
Pour toute question ou suggestion, contactez l’équipe Qualité :
ma-quality@dxc.com
If you wish to unsubscribe from our newsleper, click here
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER - Summer 2025 Edition
DDDDaaaatttteeee:::: Monday, 11 August 2025 at 09:08:49 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
PPPPrrrriiiioooorrrriiiittttyyyy::::High
80 of 212', 'September 2025', '2025-09-01', 'Quality', 'page_080.png', 'ONETEAM Newsletter - September 2025'),
('07665c69-1d5e-4462-95f7-6a962abe4c05', 81, 'Summer 2025 Edition', 'Summer 2025 Edition
Summer Referral Campaign Kicked Off!
The Summer Referral Campaign is now live and runs until mid-August! Throughout
this campaign, job openings were shared regularly by email and on the OneTeam
mobile app. If you know someone who fits one of the needed profiles, send their CV
to dxc-cdg.cooption@dxc.com, your referral could make a real impact!
What’s in it for you?
6,000 rewards points for each referral (instead of 3,000)
A bonus of up to 7,000 MAD if your referral gets hired
It’s the perfect time to help grow our team and earn some great rewards along the
way.
81 of 212', 'August 2025', '2025-08-01', 'Referral & Jobs', 'page_081.png', 'ONETEAM Newsletter - August 2025'),
('afb52724-c547-4171-90d2-ec8e232a0700', 82, 'Update to Travel and Expense Policy – in Morocco & Internationally', 'Update to Travel and Expense Policy – in Morocco & Internationally
As part of our process improvement efforts, we’ve updated the travel and expense
policy for both Morocco and international travel.
The new memo was sent to all staff via a communication email in late July, it
highlights key changes, including:
New rates and limits (mileage, accommodation, travel allowance)
Clearer guidelines for expense management
Enhanced Health Insurance Coverage Now in Effect
We’re pleased to inform you that your complementary health insurance plan with
AtlantaSanad has been significantly improved, effective July 1, 2025.
These enhancements respond directly to your feedback and reflect our commitment
to offering better protection tailored to your needs.
For full details on the new benefits and updated coverage, please refer to the email
communication sent to your inbox.
82 of 212', 'August 2025', '2025-08-01', 'Business & Clients', 'page_082.png', 'ONETEAM Newsletter - August 2025'),
('861464d0-5ea4-4eb9-aa19-4348497701ec', 83, 'DXC CDG Wins JMSE Championship Again!', 'DXC CDG Wins JMSE Championship Again!
For the second year in a row, DXC CDG has proudly defended its title as Morocco’s best
sports company by winning the JMSE Championship. Over three intense days, 63 athletes
competed in 20 sports, showing incredible skill and team spirit.
To all our athletes : your dedication and passion inspire us.
Excellence is in our DNA, and together, we’ll keep reaching new heights!
A Week Full of Life at DXC CDG!
Last couple of months, we launched five fresh weekly rituals designed to add energy,
inspiration, and connection to your workdays!
Our colleagues started their week with a smile on “Monday Moodboard”, spread kindness
through “Tuesday Gratitude”, ignited their creativity on “Wednesday Innovation”, got moving
with “Thursday 5K Challenge”, and stretched their brains with the “Friday Brain Teaser”.
Each day brought something to look forward to, because at DXC CDG, work is more than
tasks, it’s about the shared moments together!
83 of 212', 'August 2025', '2025-08-01', 'Wellbeing & Health', 'page_083.png', 'ONETEAM Newsletter - August 2025'),
('c380c64a-a56e-4fd4-ae18-9f620ae777e7', 84, 'Kickoff of FY26 “Managerial Charter” Program', 'Kickoff of FY26 “Managerial Charter” Program
We were delighted to launch the FY26 Managerial Charter this summer, spotlighting a key
value each month. Starting from May, the month during which we focused on “Client &
Business Orientation / Service Mindset” while during June, we highlighted “Emotional
Intelligence”; essential for good communication, and effective leadership and July when we
showcased “Active listening” as an important trait we should all foster at DXC CDG.
Look out for the activities we regularly conduct like testimonials, quizzes, and targeted
trainings to help you live these values every day.
Watch the different testimonials by our colleagues : Client & Business Orientation - Emotional
Intelligence.
Chess Club Shines with Remarkable Performances
Recently our Chess Club members made us proud with impressive results in national and
international events. Nidal Ghanoui competed in two international tournaments back-to-back,
finishing 5th out of 93 players at the LUC EDN Open in Lille, an outstanding achievement.
Meanwhile, Hatim Bendriss topped his region in the Moroccan Rapid Chess Championship
qualifiers and placed 7th nationally. Congratulations to both for their dedication and success,
showcasing the Chess Club’s excellence and spirit.
84 of 212', 'August 2025', '2025-08-01', 'Business & Clients', 'page_084.png', 'ONETEAM Newsletter - August 2025'),
('6f618068-046b-41b7-aacf-f928aa9a27f2', 85, 'OneTeam Rewards: Edition Wrap-Up!', 'OneTeam Rewards: Edition Wrap-Up!
The current edition of OneTeam Rewards has officially come to a close!
Over the past three months, we''ve seen incredible energy, collaboration, and
participation across the board. A big thank you to everyone who took part and brought
the spirit of engagement to life!
Stay tuned, after the summer break, we’ll be back with a new edition full of exciting
opportunities.
In the meantime, keep an eye out for the big reveal of our Top 10 most engaged
colleagues: the lucky winners of this edition!
Club Wifaq: A New Partner for Your Well-being!
We were excited to announce a new partnership with Club Wifaq, one of Rabat’s
most popular fitness and wellness centers, located in the heart of Souissi.
Modern, family-friendly, and surrounded by greenery, Club Wifaq offers the perfect
setting to move, recharge, and take care of yourself.
Thanks to this exclusive agreement (similar to the one in place for CDG and its
subsidiaries), you and your family can now enjoy special discounted rates on:
Membership fees
Sports subscriptions
Sports schools for both children and adults
Note: Membership fees are paid once only, and the annual subscription is calculated
on a pro-rata basis (January to December). It also includes access to the tennis
courts and outdoor pool.
Heads-up: Starting December 2025, family membership fees will increase to 25,000
MAD, now’s the perfect time to take advantage of the current offer!
85 of 212', 'August 2025', '2025-08-01', 'Business & Clients', 'page_085.png', 'ONETEAM Newsletter - August 2025'),
('ef4c7372-719a-4ee6-badc-ee64313380ab', 86, 'DXC CDG Earns CGEM CSR Label!', 'DXC CDG Earns CGEM CSR Label!
We were proud to be recognized by CGEM for our strong commitment to corporate social
responsibility. This distinction highlights our ongoing commitment to integrating
Environmental, Social, and Governance (ESG) principles into every aspect of our business.
We firmly believe that sustainable success is built on positive impact. By acting responsibly
today, we are building the trust and foundation for a better tomorrow. Thanks to our partners,
colleagues, and volunteers for supporting our ESG efforts.
Digital Explorers 2nd Cohort Graduates: Building an Inclusive
Tomorrow.
In June, we proudly hosted the graduation ceremony for the 2nd cohort of the Digital
Explorers program at our B9 Technopolis offices.
This program is more than training: it’s a human journey where dedicated colleagues spent
up until now two years sharing skills with young people facing hardship or disabilities.
Thanks to their commitment and our 8 partner associations, Digital Explorers now reaches 7
cities across Morocco.
This initiative reflects our deep commitment to digital inclusion, social responsibility, and
building a more accessible future for all.
86 of 212', 'August 2025', '2025-08-01', 'Business & Clients', 'page_086.png', 'ONETEAM Newsletter - August 2025'),
('a18baa3d-2e02-4783-995e-e56542c4132a', 87, 'DXC Newsletter Page', 'TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt:::: Stories from the Field / Digital Explorers Program
DDDDaaaatttteeee:::: Wednesday, 18 June 2025 at 09:35:59 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
PPPPrrrriiiioooorrrriiiittttyyyy:::: High
AAAAttttttttaaaacccchhhhmmmmeeeennnnttttssss::::image002.png, image001.png
87 of 212', 'August 2025', '2025-08-01', 'CSR & Community', 'page_087.png', 'ONETEAM Newsletter - August 2025'),
('6e159d27-b646-4476-93ca-8f8793e276cb', 88, '2222000022226666 aaaatttt', 'TTTThhhhuuuurrrrssssddddaaaayyyy,,,,
AAAApppprrrriiiillll 11116666,,,,
2222000022226666 aaaatttt
11110000::::00008888::::33337777 AAAAMMMM
GGGGMMMMTTTT++++00001111::::00000000
Chers Collaborateurs, Chères Collaboratrices,
Dans le cadre de notre engagement ESG, nous avons le plaisir de vous annoncer le lancement prochain de notre Newsletter ESG, qui mettra
en lumière les initiatives concrètes portées par nos équipes, ainsi que les retours d’expérience qui incarnent nos engagements sur le terrain.
Parmi les nouveautés de cette newsletter, nous sommes fiers de vous présenter Stories from the Field, une rubrique dédiée aux récits vécus
de nos collaborateurs engagés, là où nos valeurs prennent vie.
Cap sur le premier épisode, centré sur le retour d’expérience autour du “S” de l’ESG, le pilier social, avec le témoignage de nos
collègues bénévoles auprès de l’association AMH à Casablanca.
Ce moment de partage met à l’honneur une valeur essentielle, commune à DXC CDG et à l’esprit du bénévolat : le partage. Partage de temps,
de compétences, d’écoute, mais surtout d’humanité. À travers cette immersion, c’est toute la richesse de l’engagement volontaire qui s’exprime,
reflétant notre ambition d’être une entreprise responsable, humaine et connectée à son écosystème.
Cliquez sur le thumbnail ci-dessous et découvrez le témoignage de nos collègues @Youssef Fahssi, @Omar Bennis et @Mehdi Blal,
bénévoles auprès de l’association AMH, qui, à travers leurs mots, mettent en lumière la puissance du partage et de l’engagement humain !
Corporate Culture & ESG Team
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER - APRIL 2025
DDDDaaaatttteeee:::: Friday, 9 May 2025 at 16:22:46 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
88 of 212', 'April 2025', '2025-04-01', 'Quality', 'page_088.png', 'ONETEAM Newsletter - April 2025'),
('f5ec713e-3481-4265-8761-748b759229d0', 89, 'Inside GITEX AFRICA 2025: DXC CDG’s Bold Steps in Innovation', 'APRIL 2025
Inside GITEX AFRICA 2025: DXC CDG’s Bold Steps in Innovation
and Partnerships
For the third consecutive year, DXC CDG proudly participated in GITEX AFRICA, the
continent’s largest tech and startup event, held in vibrant Marrakech from April 14–16,
2025. Our presence at this landmark event was packed with unforgettable moments:
Official Visits: We had the honor of hosting Mr. Khalid Safir, General Director of
CDG, and Mr. Khalid Aït Taleb, Minister of Health, engaging in high-level
discussions about digital transformation in healthcare.
Strategic Partnerships: We solidified our commitment to innovation by signing
key agreements with UIR, 212Founders, and Faculté Ben M’Sick, strengthening
our collaboration with academia and the wider innovation ecosystem.
Talkspots & TechTalks: We spotlighted the impactful JobInTech program and co-
hosted an insightful TechTalk with Nutanix on crucial topics like data
sovereignty and hybrid cloud.
89 of 212', 'April 2025', '2025-04-01', 'Business & Clients', 'page_089.png', 'ONETEAM Newsletter - April 2025'),
('6894ea5d-ec90-474e-b83c-0c8bbaa1f42d', 90, 'This year, we took our values of engagement and sharing to new heights ; offering', 'This year, we took our values of engagement and sharing to new heights ; offering
over 30 exclusive visitor passes to colleagues who were eager to experience GITEX
first-hand. This initiative turned the event into a shared experience that amplified our
collective drive for innovation.
Our participation at GITEX AFRICA underscores DXC CDG’s commitment to driving
digital transformation and shaping the future of tech across Africa.
Another Win Worth Celebrating!
We’re thrilled to announce the signing of a new strategic contract with MAP, a key
player we’re proud to support in strengthening their security policy. This
partnership is a clear reflection of our continued commitment to delivering reliable,
high-impact solutions and building long-term, trust-based relationships with our
clients.It also marks a valuable addition to our client portfolio, reinforcing the
confidence that the market places in our expertise and execution capabilities.
Kudos to all the teams involved in making this happen, yet another milestone in
our journey of growth and excellence!
Proud to Be Part of the 17th Edition of SIAM!
We’re excited to participate in the 17th edition of the International Agricultural Show in
Morocco (SIAM), a flagship event that brings together key players from across the
agricultural ecosystem.
This is a unique opportunity to showcase our expertise, exchange with industry
leaders, and deepen our commitment to supporting the agricultural sector through
innovation and partnership.
90 of 212', 'April 2025', '2025-04-01', 'Business & Clients', 'page_090.png', 'ONETEAM Newsletter - April 2025'),
('7dee1987-8db8-4ccf-9c36-85e7852ac427', 91, 'DXC CDG Management Seminar : A Strong Start to FY26!', 'DXC CDG Management Seminar : A Strong Start to FY26!
DXC CDG leaders and managers gathered at the Conrad Rabat Arzana for the
FY26 Kick-Off Seminar; a day of collaboration, dialogue, and alignment.
Beyond strategic discussions, a key part of the seminar focused on leadership.
Together, we co-built a Managerial Charter to strengthen and harmonize our
management practices. This marks an important step toward more consistent,
empowering leadership across the organization, with several follow-up actions
planned. The seminar set a strong tone for FY26, rooted in shared purpose and
unity. Here’s to a successful year, together as OneTeam!
Wrapping Up the 1st Edition of OneTeam Rewards : A Celebration of
Engagement!
We’re proud to wrap up the 1st edition of OneTeam Rewards, our recognition
program celebrating engagement across DXC CDG. Nearly 900 colleagues took
part of it, and the Top 10 most engaged won exciting prize money. Winners came
from Safi, Khouribga, Casablanca, Rabat, and Kenitra, proving that this
program reaches everyone, everywhere. From town halls to volunteering,
quizzes, surveys, internal content creation, and participation in our 14 clubs :
every action counted! The 2nd edition is already live, and each of you has a
chance to win by staying active and engaged in Life at DXC. Let’s keep the spirit
alive, because when one wins, we all win!
91 of 212', 'April 2025', '2025-04-01', 'Awards & Recognition', 'page_091.png', 'ONETEAM Newsletter - April 2025'),
('b8d94e24-a9eb-4e2f-8eea-28078b5fa9e4', 92, 'A Transparent Look at Our Voice of Workforce Results : A Step', 'A Transparent Look at Our Voice of Workforce Results : A Step
Forward Together!
During our recent Town Hall, held with our Mazars partners, we shared the detailed results of
the latest Voice of Workforce (VOW) survey. 92% of colleagues participated, with an overall
satisfaction rate of 91%. The session also covered the evolution of our scores over the past
six years, highlighting key trends. Next steps include the creation of detailed action plans by
each service line and department, to ensure we stay in a dynamic, continuous improvement
approach.
DXC CDG Launches Its Quality Workbook : A New Milestone in Our
Operational Excellence Journey!
The recent Town Hall held with our quality team marked an important step in our collective
drive to embed quality standards at the heart of our operations, with the official launch of the
Quality Workbook. This new reference guide is now available and has been designed to
help integrate best practices into daily activities, supporting a culture of continuous
improvement and operational excellence. We encourage all teams to review the workbook
carefully and apply its principles consistently, making quality a shared priority across all our
functions. You can find the Quality Workbook attached in our recent communications.
DXC CDG Hits the Road Again, This Time in Rabat!
Following our energized participation in the Marrakech International Marathon earlier this
year, our momentum carried us forward to the Rabat International Marathon last weekend!
Colleagues from across DXC CDG took on the challenge with enthusiasm, team spirit, and
determination, choosing from three race formats: 10 km, 21 km, and the full 42 km
marathon. Whether running for personal bests or simply enjoying the shared experience,
92 of 212', 'April 2025', '2025-04-01', 'Quality', 'page_092.png', 'ONETEAM Newsletter - April 2025'),
('6f5a261c-6971-4445-8d7d-517699461e11', 93, 'every step reflected our values of well-being, resilience, and togetherness. Each race was', 'every step reflected our values of well-being, resilience, and togetherness. Each race was
a new challenge, and each finish line a shared victory. Congratulations to all participants for
proudly representing DXC CDG , both in performance and spirit!
DXC CDG Gears Up for JMSE 2025: Ready to Defend Our Title!
After winning 1st place last year, DXC CDG is back for the Jeux Marocains du Sport en
Entreprise this June! We’re building our all-star teams, if you have an advanced level in any
sport listed (from football to chess), join us now and be part of the challenge. Disciplines
available: Running, Football, Basketball, Tennis, Table Tennis, Golf, Darts, Gaming, Baby-
foot, Billiards, Chess & Padel. Registrations are open, let’s go for gold!
Workplace Health: Official Implementation of Anti-Smoking Law 15-91
As part of strengthening our internal health and safety policy, we have officially adopted the
provisions of Law 15-91, which strictly prohibits smoking in all shared use areas; including
professional, public, enclosed, and covered spaces, as well as the immediate surroundings
of the building. This measure reflects a clear intention: to protect the health of our
colleagues, comply with Moroccan legislation, and move toward a healthier, safer, and more
respectful work environment for all.
93 of 212', 'April 2025', '2025-04-01', 'Wellbeing & Health', 'page_093.png', 'ONETEAM Newsletter - April 2025'),
('80dc2d37-3898-400d-923c-615c3cea8f32', 95, 'Smoking Cessation Workshop', 'Smoking Cessation Workshop
(TBD)
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER - FEBRUARY 2025
DDDDaaaatttteeee:::: Monday, 10 March 2025 at 11:17:21 GMT+00:00
FFFFrrrroooommmm:::: Oneteam Communication
95 of 212', 'April 2025', '2025-04-01', 'Newsletter Content', 'page_095.png', 'ONETEAM Newsletter - April 2025'),
('f1628a23-3ea5-4cb6-92f9-3cbe054ca708', 96, 'DXC.CDG launches its AI Center of Excellence', 'DXC.CDG launches its AI Center of Excellence
We are delighted to remind you that in mid-February 2025, we launched our AI Center
of Excellence at Rabat Technopolis, supporting DXC Europe''s growth strategy and
Morocco''s National Digital Strategy 2030. The center delivers secure, end-to-end AI
solutions, combining data protection, cybersecurity, and digital sovereignty to meet the
needs of critical infrastructures. On this occasion, we also unveiled our upgraded
Cyber Defense Command Center, leveraging AI to strengthen protection against cyber
threats. This milestone positions DXC.CDG as a key player in digital innovation, while
fostering local talent development in AI and cybersecurity.
Europe Leadership’s Visit to DXC CDG
We were honored to welcome Mr. Juan Parra, President of DXC Europe, and Mr. Eugenio-
Maria Bonomi, President of DXC France, Benelux, and Italy, to DXC CDG. Their visit
highlights the strategic importance of DXC CDG in driving the Group''s growth, innovation,
and technological development across Europe.
Mr. Juan Parra emphasized the strength of the partnership between DXC and CDG, stating:
"The synergy between DXC and CDG is a major driver of innovation and development for us
and will contribute to the creation of several highly skilled jobs in Morocco."
This visit reinforces our commitment to fostering technological excellence, promoting
knowledge sharing, and expanding our footprint in the region.
96 of 212', 'February 2025', '2025-02-01', 'Business & Clients', 'page_096.png', 'ONETEAM Newsletter - February 2025'),
('10a53258-9632-4047-8e17-371432856fbe', 97, 'A Look Back at Our Recent Town Hall with Leadership', 'A Look Back at Our Recent Town Hall with Leadership
Following your numerous requests via “AskTheCEO”, we had the pleasure of hosting a
Town Hall session featuring our CEO Mehdi Kettani alongside COMEX members :
Lamiaa Lahiaoui, Achraf El Harti, Amine Benjelloun, Kenza Benjelloun, and Younes
Lahlou.
During this all-staff meeting, our leadership team presented the newly launched AI Center
of Excellence (CoE) — a major step in our digital transformation journey. The session was
also an excellent opportunity to engage with our colleagues, address their questions, and
share insights on the company''s strategic vision.
We are proud to see such collective enthusiasm and collaboration driving our future
forward.
Key Highlights from Local Business Development
We are pleased to share two significant developments from the BusDev Local team:
1. ONCF Contract Renewal: We have successfully renewed the TMA GMAO
ONCF contract for rolling stock and railway infrastructure. This renewal marks
the continuation of a partnership that began in 2014, highlighting the long-
standing trust our client has placed in us.
2. CIH Oracle EBS Upgrade: We are excited to announce the project to upgrade
Oracle EBS for CIH. The goal of this initiative is to modernize and enhance the
system’s functionalities, ensuring greater efficiency and performance for the
organization.
These milestones reflect our ongoing commitment to delivering quality service and
strengthening our client relationships.
Recap of the Internal Clubs Town Hall - An Inspiring Edition!
On Thursday, February 27, we hosted our Internal Clubs Town Hall, showcasing 14 active
clubs and the passion behind them. Club leaders presented their vision, objectives, and
roadmaps for the year, welcoming new members and announcing two new clubs to enrich
our community. Our clubs are spaces for exchange, creativity, and innovation — open to
everyone! Join a club that inspires you and help us keep this dynamic community thriving!
97 of 212', 'February 2025', '2025-02-01', 'Quality', 'page_097.png', 'ONETEAM Newsletter - February 2025'),
('5e777bda-c261-4b6e-abec-ee8beac7f935', 98, 'Join the Cooptation Challenge!', 'Join the Cooptation Challenge!
We are excited to launch the Cooptation Challenge — your chance to actively contribute to
our company''s growth! Recommend exceptional talents to strengthen our teams and win
exciting rewards.
If your recommended profile gets hired, you can win up to 7000 DH and 3000 rewards
points!
Let''s highlight our company culture by welcoming those who share our values and vision.
For more details follow our communication emails closely.
Deadline: March 20, 2025
Together, let''s build the future — one talent at a time!
Tobacco Awareness Campaign – A Step toward a Healthier Future !
At DXC CDG, we''re committed to your well-being. This month, we launched a Tobacco
Awareness Campaign with expert-led sessions to highlight the dangers of smoking. With
Ramadan approaching, it''s the perfect time to embrace healthier habits. We''re here to
support your journey to a smoke-free future. Let''s create a healthier workplace together!
Driving Sustainability Forward:
Our Partnership with Tadweir in Progress!
At DXC CDG, we''re proud to partner with Tadweir in our sustainability journey. In three
months, we''ve sorted and recycled nearly 500 kg of paper and plastic waste, reducing our
environmental footprint.
98 of 212', 'February 2025', '2025-02-01', 'Business & Clients', 'page_098.png', 'ONETEAM Newsletter - February 2025'),
('4549ee18-add8-44b2-9c98-0d7899cae1d4', 99, 'This initiative reflects our commitment to eco-friendly practices and a greener future.', 'This initiative reflects our commitment to eco-friendly practices and a greener future.
Together, we''re fostering a culture of environmental responsibility, one step at a time!
Have you got any other
questions ?
Share them with us below
Click to ASK
Internation Town Hall Voice Of Oneteam
al Women’s Sports Workforce Rewards
Day Company 2025 Final
99 of 212', 'February 2025', '2025-02-01', 'Wellbeing & Health', 'page_099.png', 'ONETEAM Newsletter - February 2025'),
('adf06ada-a32e-47f3-a6cb-3e751a9fc5b0', 100, 'of the Year Ranking', 'of the Year Ranking
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER - JANUARY 2025
DDDDaaaatttteeee:::: Monday, 10 February 2025 at 14:41:28 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
PPPPrrrriiiioooorrrriiiittttyyyy::::High
100 of 212', 'February 2025', '2025-02-01', 'Newsletter Content', 'page_100.png', 'ONETEAM Newsletter - February 2025'),
('297ff2f5-585b-45be-bfd8-f2fa520a1858', 101, 'Renewing Our Commitment to Excellence', 'Renewing Our Commitment to Excellence
We’re thrilled to announce the renewal of our ISO 9001 certification after a flawless
audit! Key Highlights:
• No findings identified
• No negative feedback
What is ISO 9001?
ISO 9001 is a global standard that validates our commitment to quality, efficiency, and
customer satisfaction. It reflects our dedication to continuous improvement. A huge
thank you to our teams for making this achievement possible! We remain committed to
exceeding client and partner expectations as we strive for excellence.
The African Cybersecurity Summit 2025
We were thrilled to be part of the AFRICAN CYBERSECURITY SUMMIT 2025, alongside
our partners LogRhythm SIEM, Exabeam, and GoFAST Digital Workplace & GED. Our
workshop on Day 2 was focused on Predictive Threat Analysis with AI & Metadata Real-
Time Threat Detection. We explored how AI enhances threat detection through metadata
standards like CVE and CVSS, staying ahead of cyber risks. It was an amazing
opportunity to connect with industry experts and contribute to shaping the future of
cybersecurity!
101 of 212', 'January 2025', '2025-01-01', 'Quality', 'page_101.png', 'ONETEAM Newsletter - January 2025'),
('80cce335-8f71-4910-99f9-0ef71e358f84', 102, 'A Strong Start to the Year: Marked by Success', 'A Strong Start to the Year: Marked by Success
DXC CDG has delivered key projects with strategic clients, showcasing our
commitment to excellence and close commercial relationships. Notable
projects include:
Bank Al-Maghrib: IT support services for end-users.
CNSS: Implementation of an IT Disaster Recovery Plan (PSI).
Taqa Morocco: IT support for users.
Teal: Deployment of 14 new service desk resources.
These projects strengthen our position as a trusted technology partner,
committed to delivering top-tier solutions for our clients.
The official Launch of our Oneteam App and Rewards 2.0
We announced with great enthusiasm the launch of our Oneteam APP and Rewards 2.0,
This program celebrates and rewards our most engaged colleagues, fostering a culture of
appreciation within our "life at DXC."
You can earn reward points, with the top 10 receiving e-wallet amounts to spend on the
app’s marketplace.
Here is how to get started:
Visit Oneteamapp.ma on your laptop or scan the QR code to open the app.
Log in with your Eprogram account.
Add the app to your home screen.
Enjoy and track your rewards!
For more details feel free to consult our latest communication on the matter.
DXC CDG at the International Marathon of Marrakesh 2025
Chasing Miles, Creating Memories !
As part of our ongoing commitment to well-being and promoting sports within our organization,
we
were pleased to participate in the International Marathon of Marrakech on January 26th, 2025.
This prestigious event saw a record participation of 27 collaborators, highlighting our collective
energy and strong team spirit. A huge congratulations to all our participants for their dedication,
perseverance, and outstanding performances throughout the race. Not only did they showcase
incredible teamwork, but many achieved excellent times, further reflecting their hard work and
commitment.
102 of 212', 'January 2025', '2025-01-01', 'Business & Clients', 'page_102.png', 'ONETEAM Newsletter - January 2025'),
('c95a3306-26d8-4895-b5bf-494c30bb2706', 103, 'Our colleague Shines at the Seville Marathon 2025', 'Our colleague Shines at the Seville Marathon 2025
We''re glad to highlight the exceptional performance of our colleague Taher Bachir, head of our
Running Club, who brilliantly represented our company at the Seville Marathon. With
unwavering determination and exemplary sportsmanship, Bachir completed the half-marathon
in an impressive time of 1 hour, 30 minutes, and 58 seconds—an outstanding feat that
showcases his dedication and endurance. We congratulate him on this remarkable
achievement and for proudly representing both his Club and our Company !
DXC CDG Wishes Card For Amazigh New Year 2975
On the occasion of the Amazigh New Year 2975, we extended our warmest wishes to all. We
hope this year brought success, growth, and fulfillment in both professional and personal lives.
The Amazigh New Year is a time for reflection and renewal, celebrating our shared cultural
heritage. A special New Year’s card, prepared by our colleagues, was shared, featuring
messages in several languages, reflecting the diversity and unity that define our spirit. Wishing
everyone a bright and prosperous Amazigh Year 2975!
Ethics & Compliance : Key Pillars of Governance in ESG
Mid-January we were excited to hold a Town Hall on Ethics & Compliance. The session was
held physically at our Casablanca office and online for the rest of the staff. The session
focused on Governance (G) within our ESG commitments. Hasnae Bakach, our expert in the
field, was our special guest and discussed the importance of ethics and compliance in
strengthening transparency and accountability within our organization. We appreciated
everyone who attended this important session.
103 of 212', 'January 2025', '2025-01-01', 'Business & Clients', 'page_103.png', 'ONETEAM Newsletter - January 2025'),
('9dc6cb85-d6bf-4751-8aa9-9c0e2c71a1ff', 104, 'Our participation to the CESE hearings on Care Economy', 'Our participation to the CESE hearings on Care Economy
DXC CDG, invited by the Economic, Social, and Environmental Council (CESE),
participated in hearings on the "care economy" to share our initiatives, particularly those
focused on employee well-being. We had the opportunity to discuss our best practices and
contribute to promoting a true "care economy." We thank CESE and CGEM for their trust
and the chance to be part of this valuable initiative. We believe that company success
begins with the well-being of its employees!
Encouraging Female Representation in sports
We were honored to represent DXC CDG at a conference hosted by Ambassador
Christophe Lecourtier, focusing on how female sports events support CSR strategies. We
also heard from Mrs. Nadia FETTAH Minister of Economy and Finance and met the
inspiring Nawal El Moutawakel. Special thanks for the Ambassador of France in Rabat for
the opportunity to engage in this meaningful discussion. At DXC CDG, we are proud to
promote CSR initiatives aligned with our values of inclusion, equality, and sustainability.
104 of 212', 'January 2025', '2025-01-01', 'Quality', 'page_104.png', 'ONETEAM Newsletter - January 2025'),
('bd917dc2-6fd1-45e1-9af9-371b148dd396', 105, 'Have you got any other', 'Have you got any other
questions ?
Share them with us below
Click to ASK
Anti-Tobacco Town Hall with DXC Talks
Awareness CEO Podcast
Mehdi KETTANI
105 of 212', 'January 2025', '2025-01-01', 'Events & Upcoming', 'page_105.png', 'ONETEAM Newsletter - January 2025'),
('f3f7cfc5-f974-4f81-b7ac-ff4b9f01fa67', 106, 'Client Visits: Strengthening Partnerships & Unlocking Growth', 'TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER - DECEMBER 2024
DDDDaaaatttteeee:::: Friday, 10 January 2025 at 11:53:21 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
Client Visits: Strengthening Partnerships & Unlocking Growth
In December, DXC CDG hosted three key client visits, focusing on strengthening relationships
and exploring new business opportunities.
EDP
The visit to EDP involved team workshops where challenges from the transition period were
discussed, and an action plan for continuous service improvement was developed. The client
was impressed by the quality of interactions and the visit’s organization, with potential for
additional business and new logos in the future.
106 of 212', 'January 2025', '2025-01-01', 'Quality', 'page_106.png', 'ONETEAM Newsletter - January 2025'),
('d26d54a1-499f-4b60-93e4-61834d268c90', 107, 'Total Energy', 'Total Energy
During the visit to Total Energy, we held operational workshops covering project status, HR4U
training, and skills development. We also presented our service lines to identify new needs. The
client was pleased with the workshops and expressed interest in expanding the business.
Air France
The Air France visit marked the official project kickoff. The client praised our team’s
professionalism and expressed satisfaction, with plans to officially request a new need to be
handled by our Moroccan teams. The visit also opened doors for growing the SAP service line in
Morocco.
By aligning efforts and sharing experiences, we aim to harmonize methods, improve account
management, and innovate to tackle future challenges, ultimately contributing to the company''s
growth and success.
These visits underscored our commitment to delivering excellence and
exploring new growth opportunities with our clients.
107 of 212', 'December 2024', '2024-12-01', 'Business & Clients', 'page_107.png', 'ONETEAM Newsletter - December 2024'),
('ff9612ce-048a-427b-a999-b46da9175b9a', 108, 'LondonMarket Team Connects and Embraces', 'LondonMarket Team Connects and Embraces
New Opportunities at December Meetup in Casablanca
In December, we hosted an in-person meetup at our Casablanca offices with the London Market
team. It was a great chance for colleagues to connect, discuss project progress, share
challenges, and explore new opportunities for the year ahead. The team exchanged ideas on
how to improve collaboration and efficiency, while also reflecting on successes. Top
management and HR teams shared valuable insights on the company’s vision and upcoming
initiatives to support growth and well-being. The event fostered a sense of unity, excitement, and
shared goals, preparing everyone for a successful and opportunity-filled year ahead.
New Global Infrastructure Services (GIS)
We are pleased to announce the establishment of a new Global Infrastructure Services (GIS)
organization within our company.
This strategic restructuring is designed to better align with our clients'' evolving needs, enhance
our expertise, and create greater value for both our clients and our organization. We are
committed to building a company where the value we deliver is immediately apparent to our
clients, where each team member is equipped with the resources necessary to succeed and be
recognized, and where we position ourselves as a market leader through innovative and high-
quality services. This new organizational framework addresses the need for closer client
relationships, operational excellence, continuous innovation, and the sustainable creation of
value.
See More
108 of 212', 'December 2024', '2024-12-01', 'Quality', 'page_108.png', 'ONETEAM Newsletter - December 2024'),
('2c3e9e2c-b06f-48d5-b927-9f4140748e48', 109, 'December Health and Well-being Awareness at DXC CDG', 'December Health and Well-being Awareness at DXC CDG
As part of our Wellbeing Planner, designed to ensure continuity in initiatives promoting and
maintaining a balance between professional and personal life, we recently held sessions focused on
stress management and well-being at work. Led by Dr. Amine Berrazzouk, a renowned psychologist
and clinician, these sessions provided valuable insights into the metabolic and scientific origins of
stress, along with practical tools to manage it effectively in our daily lives.At DXC CDG, your well-
being remains a top priority. We are committed to fostering a work environment where every
employee can thrive and feel supported, both professionally and personally. We will continue offering
initiatives and resources to support your mental and emotional balance. Together, we will continue to
build a workplace where everyone feels valued and empowered.
See More
Imminent launch of your Oneteam Rewards 2.0
we are thrilled to be launching Oneteam Rewards 2.0, a program designed to recognize and
reward our most active and engaged colleagues. This initiative aims to celebrate your
contributions, commitment, and involvement within our “life at DXC”. We believe it will foster a
culture of appreciation and inspire you to take part and benefit of everything we have to offer.
We invite you to check the recording of the town hall by clicking on the image below, to learn
more about how you can win points and what you will be able to do with them.
See More
109 of 212', 'December 2024', '2024-12-01', 'Awards & Recognition', 'page_109.png', 'ONETEAM Newsletter - December 2024'),
('b6afd1da-5ec4-4d0c-9177-04e51cde84e5', 110, 'Ben M’sik Forum – Casablanca', 'Ben M’sik Forum – Casablanca
DXC CDG was proud to participate in the Forum Ben M''Sik earlier this month at the Faculty of
Science of Ben M''Sik, Casablanca, focusing on the theme "From Education to Professional
Integration: Skills, Research, and Innovation for Excellence." This event provided a valuable
platform for connecting businesses with students, allowing us to engage with future talent and
discuss current job market opportunities. Our participation in such events is essential for
strengthening our employer brand. It offers us the chance to showcase our company culture,
innovative projects, and career opportunities, while positioning DXC CDG as a top employer. By
connecting directly with students, we attract the best talent, reinforcing our commitment to
professional growth and digital transformation.
See More
DXC Cooking Club : Healthy Habits
In complement to the recently held Health Awareness sessions at our Technopolis &
Casanearshore offices, our Cooking Club organized Healthy Habits Workshops focused on
enhancing both physical & mental well-being. These workshops aimed to offer practical
advice and share recipes featuring ingredients known to support brain health and improve
focus. We introduced simple yet effective recipes using brain-boosting ingredients,
designed to enhance focus, mental clarity, and energy levels. This initiative aligns with our
ongoing commitment to promoting a balanced lifestyle, encouraging employees to make
mindful choices that positively impact both their professional performance and personal
health. At DXC CDG, we firmly believe that a healthy mind and body are essential to
success. These workshops are part of our continued efforts to foster a culture of well-
being, wellness, and sustained focus across our workforce.
See More
110 of 212', 'December 2024', '2024-12-01', 'Wellbeing & Health', 'page_110.png', 'ONETEAM Newsletter - December 2024'),
('6c13650c-bbc4-4401-bc88-aed65af19f1a', 111, 'Have you got any other', 'Have you got any other
questions ?
Share them with us below
Click to ASK
Well-being Launch of DXC Talks
Awareness Oneteam Podcast
Rewards
111 of 212', 'December 2024', '2024-12-01', 'Events & Upcoming', 'page_111.png', 'ONETEAM Newsletter - December 2024'),
('841d8791-e295-4406-a606-20a746834fc9', 112, 'DXC Newsletter Page', 'TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER - NOVEMBER 2024
DDDDaaaatttteeee:::: Monday, 23 December 2024 at 13:59:38 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
112 of 212', 'December 2024', '2024-12-01', 'Newsletter Content', 'page_112.png', 'ONETEAM Newsletter - December 2024'),
('22eaba9e-0f8e-4453-8d11-400b25c90fd3', 113, 'Discover the part 1 of the answers to the', 'Discover the part 1 of the answers to the
questions we have received so far, more
answers will be shared in the next editions!
ASK THE CEO
Environmental Awareness : Waste Management
On November 27th, our colleague Achouri Lamiae led an insightful environmental awareness
session at our Casanearshore offices, focusing on waste management within the company and
the partnerships that enable us to implement our recycling initiatives. This session underscored
DXC CDG''s unwavering commitment to Environmental, Social, and Governance (ESG)
principles. As part of our continuous efforts to foster a sustainable corporate culture, the session
aimed to educate employees on effective waste management strategies and the importance of
reducing our environmental footprint. At DXC CDG, we firmly believe that integrating ESG
considerations into our daily operations is not only a corporate responsibility but a key driver for
long-term value creation. Through our strategic partnerships, we are able to successfully
execute recycling initiatives, ensuring that waste is properly managed and recycled. By
promoting awareness and encouraging actionable steps, we aim to inspire our workforce to
contribute actively to a greener future, aligning with both our ethical values and global
sustainability goals.
113 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_113.png', 'ONETEAM Newsletter - November 2024'),
('df113435-18b9-49ca-82f4-078a074138cb', 114, 'Kick-Off : 2nd edition of the National Program “Digital Explorers”', 'Kick-Off : 2nd edition of the National Program “Digital Explorers”
Following the success of its inaugural edition, the kick-off for the second year of Digital Explorers has
officially begun. The first edition was a resounding success, thanks to the dedication of our volunteer
employees, who generously gave their time to support this noble cause. Digital Explorers aims to
promote digital inclusion for children from disadvantaged backgrounds and/or with disabilities,
providing them with the tools and skills to thrive in an increasingly digital world. This initiative is a
testament to our commitment to creating meaningful value and making a positive impact in our
communities. By empowering the next generation through education and technology, we are not only
fostering equal opportunities but also contributing to building a more inclusive society where every
child has the chance to succeed.
Rabat Business School: 5th edition Careers Expo. Forum
DXC CDG was honored to participate in the 5th edition of the Careers Expo Forum, organized
by Rabat Business School in collaboration with CDG, which took place on November 13th. This
major event, a key highlight of the year, proved to be a resounding success, offering a valuable
platform for connecting students with professionals. It provided an exceptional opportunity for
young, ambitious talents to engage with our Teams gaining insights into professional
opportunities and the skills necessary for success in the workforce. Our participation was a
testament to our commitment to supporting the development of future professionals, reinforcing
our role in the broader employment ecosystem and contributing to the continued success of this
impactful initiative.
EMSI Enterprise 10th edition Forum
On November 21st, DXC CDG proudly participated in the 10th edition of the EMSI
Enterprises Forum. As every year, this event provided us with an excellent opportunity to
network and engage with young, talented engineers eager to explore career prospects. It
was an enriching experience that allowed us to share insights about our industry, discuss
emerging trends, and showcase the diverse opportunities available at DXC CDG. Our
participation in the forum reflects our ongoing commitment to fostering relationships with
future leaders, exchanging knowledge, and contributing to the development of the next
generation of professionals in the engineering field.
114 of 212', 'November 2024', '2024-11-01', 'DEI & Inclusion', 'page_114.png', 'ONETEAM Newsletter - November 2024'),
('e5c12ed1-b454-471a-b781-1ceff1e221d1', 115, 'Movember : Raising Awareness about Men’s Health : Prostate Cancer &', 'Movember : Raising Awareness about Men’s Health : Prostate Cancer &
Cardiovascular issues
In celebration of Movember, a month dedicated to raising awareness about men’s health, DXC
CDG proudly marked this important event for the first time, recognizing the significant
contributions of men in our society.
To promote health and well-being, we organized an awareness day at our Casanearshore and
Technopolis offices, in collaboration with renowned urologists, biologists, and cardiologists.
Through insightful presentations, they addressed key health issues such as prostate cancer and
cardiovascular diseases, covering symptoms, treatment options, and preventive measures. A
mobile laboratory was also set up to provide on-site PSA tests, encouraging early detection. This
initiative reflects our commitment to supporting the health of our employees. We also extend our
heartfelt appreciation to all the men in our organization for their invaluable daily contributions to
both our workplace and society.
Special Gathering : JMSE Champions 2024
On November 12th, a special gathering of the JMSE champions was held to celebrate and
reflect on the significant achievements of our collaborators. The event was graced by the
presence of the Director of Olive Agency, who organizes this important corporate sports event,
and who took the opportunity to speak about the inspiring journey of our champions. This
gathering underscored the importance of promoting sports within the workplace, a core value at
DXC CDG. Our commitment to fostering physical activity and overall well-being aligns with the
company’s broader vision of enhancing employee health, encouraging team spirit, and
supporting the personal development of our workforce.
115 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_115.png', 'ONETEAM Newsletter - November 2024'),
('6ed946cc-fc3e-408b-81cf-7e01ab2adeb8', 116, 'Gen AI Summit 2024 - Insights on AI & Digital Transformation', 'Gen AI Summit 2024 - Insights on AI & Digital Transformation
DXC CDG recently participated in the Gen AI Summit on December 9th and 10th, where
Gianluca Bernacchia, Senior Partner Consulting, Data & AI APJ-MEA at DXC Technology,
served as a distinguished speaker across two pivotal panels. The event, held in Rabat, focused
on discussing the latest trends in AI, sharing insights, and exploring how AI can revolutionize
organizations. DXC CDG played a key role in facilitating Gianluca''s presence, enabling him to
deliver an exclusive 20-minute presentation on cutting-edge ideas regarding the challenges of
developing an AI strategy for the finance sector. Additionally, Gianluca participated in a dynamic
roundtable discussion titled "Reimagining Success: Driving Digital Transformation with Data and
AI", further showcasing DXC CDG’s commitment to advancing AI expertise in today’s rapidly
evolving digital landscape.
AmCham Networking Gala - Thanksgiving Dinner
DXC CDG recently participated in the prestigious AmCham Networking Gala Ball Thanksgiving
Dinner, a significant event for fostering business connections. As a subsidiary of DXC
Technology, a renowned U.S.-based company, we recognize the valuable business development
opportunities within this region. Being a member of AmCham enables us to leverage integration
advantages, further enhancing our strategic growth and expanding our network of influential
partnerships. This participation underscores our commitment to strengthening ties and exploring
new avenues for collaboration and expansion within the global business landscape.
116 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_116.png', 'ONETEAM Newsletter - November 2024'),
('626189ea-e438-428a-bd5e-5817e052ddbe', 117, 'FY25 S1 Review: Strengthened Partnership and Shared Trust', 'FY25 S1 Review: Strengthened Partnership and Shared Trust
During the first half of FY25, we have continued to invest in cultivating strong and lasting
relationships with our local clients. Thanks to their trust, we have achieved remarkable results by
delivering innovative solutions tailored precisely to their needs. This enduring partnership lies at
the heart of our success, and we take pride in witnessing their growth alongside us. We remain
fully committed to supporting their digital transformation journeys and tackling their challenges
with the same energy and determination.
Client Success Community: Driving Operational Excellence & Customer
Satisfaction
We are pleased to announce the launch of our "Client Success Community," a strategic initiative
bringing together all Delivery team members managing client relationships to strengthen our
commitment to operational excellence and customer satisfaction. Launched in November, this
dynamic community will meet monthly in dedicated Town Halls, offering a platform for knowledge
sharing and continuous improvement. Its key objectives include enhancing client satisfaction,
optimizing operations, fostering a culture of sharing, developing client accounts, and increasing
visibility on delivery quality.
By aligning efforts and sharing experiences, we aim to harmonize methods, improve account
management, and innovate to tackle future challenges, ultimately contributing to the company''s
growth and success.
See more
117 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_117.png', 'ONETEAM Newsletter - November 2024'),
('3d6caf7d-7310-44c4-8c7e-904f67c454d3', 118, 'Well-being Launch of DXC Talks', 'Well-being Launch of DXC Talks
Awareness Oneteam Podcast
Rewards
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER -NOVEMBER 2024
DDDDaaaatttteeee:::: Friday, 20 December 2024 at 17:11:48 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
PPPPrrrriiiioooorrrriiiittttyyyy::::High
118 of 212', 'November 2024', '2024-11-01', 'Newsletter Content', 'page_118.png', 'ONETEAM Newsletter - November 2024'),
('b54d61f1-5ebd-4449-a9bd-7cc34b8ea8cc', 119, 'Discover the part 1 of the answers to the', 'Discover the part 1 of the answers to the
questions we have received so far, more
answers will be shared in the next editions!
ASK THE CEO
119 of 212', 'November 2024', '2024-11-01', 'Newsletter Content', 'page_119.png', 'ONETEAM Newsletter - November 2024'),
('4da79cb8-8b9c-4569-b900-bb52c1b97b53', 120, 'Environmental Awareness : Waste Management', 'Environmental Awareness : Waste Management
On November 27th, our colleague Achouri Lamiae led an insightful environmental awareness
session at our Casanearshore offices, focusing on waste management within the company and
the partnerships that enable us to implement our recycling initiatives. This session underscored
DXC CDG''s unwavering commitment to Environmental, Social, and Governance (ESG)
principles. As part of our continuous efforts to foster a sustainable corporate culture, the session
aimed to educate employees on effective waste management strategies and the importance of
reducing our environmental footprint. At DXC CDG, we firmly believe that integrating ESG
considerations into our daily operations is not only a corporate responsibility but a key driver for
long-term value creation. Through our strategic partnerships, we are able to successfully
execute recycling initiatives, ensuring that waste is properly managed and recycled. By
promoting awareness and encouraging actionable steps, we aim to inspire our workforce to
contribute actively to a greener future, aligning with both our ethical values and global
sustainability goals.
Kick-Off : 2nd edition of the National Program “Digital Explorers”
Following the success of its inaugural edition, the kick-off for the second year of Digital Explorers has
officially begun. The first edition was a resounding success, thanks to the dedication of our volunteer
employees, who generously gave their time to support this noble cause. Digital Explorers aims to
promote digital inclusion for children from disadvantaged backgrounds and/or with disabilities,
providing them with the tools and skills to thrive in an increasingly digital world. This initiative is a
testament to our commitment to creating meaningful value and making a positive impact in our
communities. By empowering the next generation through education and technology, we are not only
fostering equal opportunities but also contributing to building a more inclusive society where every
child has the chance to succeed.
120 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_120.png', 'ONETEAM Newsletter - November 2024'),
('b85da437-f45e-4022-94b2-c2293784388a', 121, 'Rabat Business School: 5th edition Careers Expo. Forum', 'Rabat Business School: 5th edition Careers Expo. Forum
DXC CDG was honored to participate in the 5th edition of the Careers Expo Forum, organized
by Rabat Business School in collaboration with CDG, which took place on November 13th. This
major event, a key highlight of the year, proved to be a resounding success, offering a valuable
platform for connecting students with professionals. It provided an exceptional opportunity for
young, ambitious talents to engage with our Teams gaining insights into professional
opportunities and the skills necessary for success in the workforce. Our participation was a
testament to our commitment to supporting the development of future professionals, reinforcing
our role in the broader employment ecosystem and contributing to the continued success of this
impactful initiative.
EMSI Enterprise 10th edition Forum
On November 21st, DXC CDG proudly participated in the 10th edition of the EMSI
Enterprises Forum. As every year, this event provided us with an excellent opportunity to
network and engage with young, talented engineers eager to explore career prospects. It
was an enriching experience that allowed us to share insights about our industry, discuss
emerging trends, and showcase the diverse opportunities available at DXC CDG. Our
participation in the forum reflects our ongoing commitment to fostering relationships with
future leaders, exchanging knowledge, and contributing to the development of the next
generation of professionals in the engineering field.
Movember : Raising Awareness about Men’s Health : Prostate Cancer &
Cardiovascular issues
In celebration of Movember, a month dedicated to raising awareness about men’s health, DXC
CDG proudly marked this important event for the first time, recognizing the significant
contributions of men in our society.
To promote health and well-being, we organized an awareness day at our Casanearshore and
Technopolis offices, in collaboration with renowned urologists, biologists, and cardiologists.
Through insightful presentations, they addressed key health issues such as prostate cancer and
cardiovascular diseases, covering symptoms, treatment options, and preventive measures. A
mobile laboratory was also set up to provide on-site PSA tests, encouraging early detection. This
initiative reflects our commitment to supporting the health of our employees. We also extend our
heartfelt appreciation to all the men in our organization for their invaluable daily contributions to
both our workplace and society.
121 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_121.png', 'ONETEAM Newsletter - November 2024'),
('59bbe705-cbcc-491e-8dd9-fd37b9c80db1', 122, 'Special Gathering : JMSE Champions 2024', 'Special Gathering : JMSE Champions 2024
On November 12th, a special gathering of the JMSE champions was held to celebrate and
reflect on the significant achievements of our collaborators. The event was graced by the
presence of the Director of Olive Agency, who organizes this important corporate sports event,
and who took the opportunity to speak about the inspiring journey of our champions. This
gathering underscored the importance of promoting sports within the workplace, a core value at
DXC CDG. Our commitment to fostering physical activity and overall well-being aligns with the
company’s broader vision of enhancing employee health, encouraging team spirit, and
supporting the personal development of our workforce.
Gen AI Summit 2024 - Insights on AI & Digital Transformation
DXC CDG recently participated in the Gen AI Summit on December 9th and 10th, where
Gianluca Bernacchia, Senior Partner Consulting, Data & AI APJ-MEA at DXC Technology,
served as a distinguished speaker across two pivotal panels. The event, held in Rabat, focused
on discussing the latest trends in AI, sharing insights, and exploring how AI can revolutionize
organizations. DXC CDG played a key role in facilitating Gianluca''s presence, enabling him to
deliver an exclusive 20-minute presentation on cutting-edge ideas regarding the challenges of
developing an AI strategy for the finance sector. Additionally, Gianluca participated in a dynamic
roundtable discussion titled "Reimagining Success: Driving Digital Transformation with Data and
AI", further showcasing DXC CDG’s commitment to advancing AI expertise in today’s rapidly
evolving digital landscape.
122 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_122.png', 'ONETEAM Newsletter - November 2024'),
('441d5618-1ee6-4ca0-966e-b9b274f4a743', 123, 'AmCham Networking Gala - Thanksgiving Dinner', 'AmCham Networking Gala - Thanksgiving Dinner
DXC CDG recently participated in the prestigious AmCham Networking Gala Ball Thanksgiving
Dinner, a significant event for fostering business connections. As a subsidiary of DXC
Technology, a renowned U.S.-based company, we recognize the valuable business development
opportunities within this region. Being a member of AmCham enables us to leverage integration
advantages, further enhancing our strategic growth and expanding our network of influential
partnerships. This participation underscores our commitment to strengthening ties and exploring
new avenues for collaboration and expansion within the global business landscape.
FY25 S1 Review: Strengthened Partnership and Shared Trust
During the first half of FY25, we have continued to invest in cultivating strong and lasting
relationships with our local clients. Thanks to their trust, we have achieved remarkable results by
delivering innovative solutions tailored precisely to their needs. This enduring partnership lies at
the heart of our success, and we take pride in witnessing their growth alongside us. We remain
fully committed to supporting their digital transformation journeys and tackling their challenges
with the same energy and determination.
123 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_123.png', 'ONETEAM Newsletter - November 2024'),
('d8ea8f98-43a0-46bc-a374-4ad3d9ef0786', 124, 'Client Success Community: Driving Operational Excellence & Customer', 'Client Success Community: Driving Operational Excellence & Customer
Satisfaction
We are pleased to announce the launch of our "Client Success Community," a strategic initiative
bringing together all Delivery team members managing client relationships to strengthen our
commitment to operational excellence and customer satisfaction. Launched in November, this
dynamic community will meet monthly in dedicated Town Halls, offering a platform for knowledge
sharing and continuous improvement. Its key objectives include enhancing client satisfaction,
optimizing operations, fostering a culture of sharing, developing client accounts, and increasing
visibility on delivery quality.
By aligning efforts and sharing experiences, we aim to harmonize methods, improve account
management, and innovate to tackle future challenges, ultimately contributing to the company''s
growth and success.
See more
124 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_124.png', 'ONETEAM Newsletter - November 2024'),
('59faacf7-b11f-43fe-9710-51d215837f92', 125, 'Well-being Launch of DXC Talks', 'Well-being Launch of DXC Talks
Awareness Oneteam Podcast
Rewards
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt:::: Introducing #AskTheCEO : Your Questions, Answered in Our Newsletter!
DDDDaaaatttteeee:::: Tuesday, 8 October 2024 at 10:13:20 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
AAAAttttttttaaaacccchhhhmmmmeeeennnnttttssss::::image001.png
Dear AAAAllllllll,
We are excited to announce the launch of a bbbbrrrraaaannnndddd----nnnneeeewwww sssseeeecccc0000oooonnnn iiiinnnn oooouuuurrrr ccccoooommmmppppaaaannnnyyyy nnnneeeewwwwsssslllleeeeppppeeeerrrr: ####AAAAsssskkkkTTTThhhheeeeCCCCEEEEOOOO. This is
your opportunity to ask direct ques0ons and get insights from our CEO on topics that maper most to you.
Whether you''re curious about ccccoooommmmppppaaaannnnyyyy ssssttttrrrraaaatttteeeeggggyyyy, iiiinnnndddduuuussssttttrrrryyyy ttttrrrreeeennnnddddssss, or just want to know more about leadership
perspec0ves, ####AAAAsssskkkkTTTThhhheeeeCCCCEEEEOOOO is your plaÅorm for open dialogue and transparent communica0on.
How it works:
Submit your ques0ons using the designated form : click here.
A selec0on of these ques0ons will be featured in the next edi0on of our newsleper, along with thoughÅul
responses from oooouuuurrrr CCCCEEEEOOOO.
We value your input and look forward to hearing from you. Don’t miss this chance to have your voice heard !
Embracing our values
Commitment Respect Sharing Innovation
Corporate Culture & ESG Team
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt:::: Exciting News! Surf Session Launch at Plage Mehdia - Limited Spots Available!
DDDDaaaatttteeee:::: Tuesday, 30 January 2024 at 16:28:29 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
AAAAttttttttaaaacccchhhhmmmmeeeennnnttttssss::::image001.png
125 of 212', 'November 2024', '2024-11-01', 'CSR & Community', 'page_125.png', 'ONETEAM Newsletter - November 2024'),
('b7a6a73f-c105-4994-84ef-dcd1dfecb49b', 134, 'Business Focus', 'Business Focus
Edition
Offshore Strength: Continuity and
New Horizons!
In September, DXC.CDG continued to
strengthen its commitment to service
continuity for its long-standing clients,
including BPOST, London Market, and
Stellantis, by ensuring the highest standards
of quality and reliability.
At the same time, DXC.CDG expanded its
portfolio with the addition of Baloise Holding
and Pratt & Whitney. These new
collaborations not only enhance our market
presence but also reaffirm the strategic value
of our solutions in addressing our clients’
evolving challenges.
ISB Leadership Visit: Strengthening
Strategic Ties!
134 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_134.png', 'ONETEAM Newsletter - November 2024'),
('b6ecca22-f9a3-41a3-b19a-43971bc035d8', 135, 'In September, DXC.CDG had the privilege of', 'In September, DXC.CDG had the privilege of
hosting an ISB leadership visit, marking an
important milestone in strengthening our
strategic relationships.
This meeting highlighted the dedication of
our Morocco teams around the key pillars of
our strategy: innovation, customer value
creation, and operational excellence. The
discussions were rich and constructive,
showcasing local initiatives in digital
transformation; particularly investments in AI
capabilities, which are helping us reimagine
processes, generate meaningful insights,
and enhance overall performance.
Five Prestigious Offshore Visits
Mark a Strong First Semester
The first semester of this financial year was
marked by the visit of five prestigious
offshore accounts; in addition to ISB
Leadership, we welcomed Airbus,
Soletanche Bachy, Vinci, and Engie,
reflecting the trust and confidence our clients
place in DXC.CDG. These visits provided a
unique opportunity to deepen strategic
relationships, showcase the expertise of our
Morocco teams, and highlight our
commitment to innovation, customer value
creation, and operational excellence.
Exciting Growth: Extending Our
Teams for ASSURE CLAIMS and
London Market
We are thrilled to share that, in response to
growing needs and ongoing collaboration,
the teams dedicated to our clients ASSURE
CLAIMS and London Market have been
extended. This expansion underscores our
commitment to delivering exceptional
service, strengthening partnerships, and
providing the right resources to meet our
clients’ evolving requirements.
135 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_135.png', 'ONETEAM Newsletter - November 2024'),
('b0ffd059-e6c5-4344-9e8b-92d65f0d2891', 136, 'Excellence in Action: Our Local', 'Excellence in Action: Our Local
Client Successes
DXC.CDG has accomplished several key
milestones with its local clients, highlighted
by a strategic addition to its portfolio with the
Ministry of the Interior. Over the past period,
we have also signed framework agreements,
consolidated existing projects, renewed
strategic licenses, and deployed major
solutions.
These successes reflect our commitment to
operational excellence and our ongoing
close collaboration with local clients,
ensuring we deliver tailored solutions that
address their evolving needs while
maintaining the highest standards of quality
and reliability.
Some of the recent key projects include:
Ministry of the Interior – SOC
Managed Services
CDG Prévoyance – New Framework
Agreement
Ministry of Education – Security
Roadmap
MNTRA – Hosting Renewal
MAP – SOC-as-a-Service Contract
(24/07)
UM6P – Provision of On-Site
Resources
CMIM – Acquisition and
Implementation of FORTINAC
Solution
SCR – Managed Hosting
These projects reinforce our position as a
trusted technology partner for our local
clients.
DXC.CDG at the Heart of Africa’s
Cybersecurity Dialogue
DXC.CDG participated in the African
Cybersecurity Forum, organized by DGSSI and
Smart Africa alongside our valued partner.
The event, themed "The Future of Cybersecurity:
Digital Sovereignty for Sustainable Economic
Development," brought together over 700
decision-makers, including ministers and
136 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_136.png', 'ONETEAM Newsletter - November 2024'),
('201b1c59-2fca-4b1b-9114-f450c7855443', 137, 'international experts.', 'international experts.
DXC.CDG reinforced its position as a market
leader, showcasing its ability to innovate, secure
applications, and protect sensitive data while
supporting Africa’s digital sovereignty.
OneTeam Rewards: Celebrating
Our Top Employees!
The latest edition of OneTeam Rewards has come
to an exciting close! We recently revealed the
long-awaited Top 10 ranking and winners,
recognizing the employees who have been most
engaged in the day-to-day life of the company.
Congratulations to all our winners, who took home
prize money ranging from 1,500 to 8,000 MAD for
their outstanding engagement and involvement.
If you weren’t in the top 10 this time, don’t worry,
the next edition of OneTeam Rewards is just
around the corner. Get involved, stay engaged,
and you could be our next winner!
1st Younes Haji - Technopolis
2nd Omar Bennis - Casanearshore
3rd Sara El Harchouni – Technopolis
4th Ismail Ait Salah – Kouribga Client-Site
5th Ilyas Kouifi – Khouribga Client-Site
6th Samir Haouchi – Casablanca Client-
Site
7th Taher Bachir – Technopolis
8th Chaimaa Fares - Technopolis
9th Youssef Oubala - Technopolis
10th Assaad El Aamni – Khouribga Client-
Site
Building Stronger Teams Through
Our Managerial Charter
As part of our Managerial Charter, we
recently wrapped up September by revisiting
the value of the month: Team Spirit and
Constructive Communication.
It was a great opportunity to highlight the
importance of collaboration, active listening,
and open dialogue within our teams. In
October, we’ll be focusing on a new core
value: Managerial and Relational
Effectiveness; a key pillar to strengthen
both our collective performance and the
quality of our daily interactions.
137 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_137.png', 'ONETEAM Newsletter - November 2024'),
('988a22a6-21d8-4e28-ba14-4c1e2d56252a', 138, 'Let’s keep cultivating a collaborative and', 'Let’s keep cultivating a collaborative and
impactful managerial culture at DXC.CDG.
DXC.CDG Shines with 4 Brandon
Hall Group Excellence Awards!
We are proud to announce that DXC.CDG
has won four prestigious Brandon Hall Group
Excellence Awards, recognizing our
corporate culture, social impact, benefits and
well-being programs as well as our
recognition program “Oneteam Rewards”.
These awards celebrate the employee-
focused initiatives, highlighting our
leadership’s commitment to fostering a
healthy work environment that provides
employees with everything they need to
thrive.
Brandon Hall Group Excellence Gold
Award 2025 – Best Corporate Culture
Transformation
Brandon Hall Group Excellence Gold
Award 2025 – Best Benefits, Wellness
and Well-Being Program
Brandon Hall Group Excellence Gold
Award 2025 – Best Social Impact
Brandon Hall Group Excellence Silver
Award 2025 – Best Employee
Recognition Program
Game On: Casablanca Office Gets
a PS5 Zone!
Following growing interest, we’re excited to
launch a gaming zone in our Casablanca
office, featuring a PS5 and the most voted
popular games. This space allows
colleagues to enjoy breaks together,
strengthen bonds, and make office days
more fun.
Adding to our beloved rituals, “Wednesday
Brunch” and “Couscous Friday,” the gaming
zone offers even more ways to connect,
relax, and share moments of fun at work.
Get ready to play, connect, and level up your
breaks!
138 of 212', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_138.png', 'ONETEAM Newsletter - November 2024'),
('8f85f0bb-f35c-4683-999f-c3d827e8f89f', 140, 'Business Focus', 'Business Focus
Edition
Offshore Strength: Continuity and
New Horizons!
In September, DXC.CDG continued to
strengthen its commitment to service
continuity for its long-standing clients,
including BPOST, London Market, and
Stellantis, by ensuring the highest standards
of quality and reliability.
At the same time, DXC.CDG expanded its
portfolio with the addition of Baloise Holding
and Pratt & Whitney. These new
collaborations not only enhance our market
presence but also reaffirm the strategic value
of our solutions in addressing our clients’
evolving challenges.
ISB Leadership Visit: Strengthening
Strategic Ties!
In September, DXC.CDG had the privilege of
hosting an ISB leadership visit, marking an
important milestone in strengthening our
strategic relationships.
This meeting highlighted the dedication of
our Morocco teams around the key pillars of
our strategy: innovation, customer value
140 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_140.png', 'ONETEAM Newsletter - November 2024'),
('d069624c-8a69-487d-b88e-02f0f0f1b4be', 141, 'creation, and operational excellence. The', 'creation, and operational excellence. The
discussions were rich and constructive,
showcasing local initiatives in digital
transformation; particularly investments in AI
capabilities, which are helping us reimagine
processes, generate meaningful insights,
and enhance overall performance.
Five Prestigious Offshore Visits
Mark a Strong First Semester
The first semester of this financial year was
marked by the visit of five prestigious
offshore accounts; in addition to ISB
Leadership, we welcomed Airbus,
Soletanche Bachy, Vinci, and Engie,
reflecting the trust and confidence our clients
place in DXC.CDG. These visits provided a
unique opportunity to deepen strategic
relationships, showcase the expertise of our
Morocco teams, and highlight our
commitment to innovation, customer value
creation, and operational excellence.
Exciting Growth: Extending Our
Teams for ASSURE CLAIMS and
London Market
For the second year in a row, DXC CDG has
proudly defended its title as Morocco’s best
sports company by winning the JMSE
Championship. Over three intense days, 63
athletes competed in 20 sports, showing
incredible skill and team spirit.
To all our athletes : your dedication and
passion inspire us.
Excellence is in our DNA, and together, we’ll
keep reaching new heights!
141 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_141.png', 'ONETEAM Newsletter - November 2024'),
('a91aee4d-b1ee-487d-8c40-e2f6a2dda842', 142, 'Excellence in Action: Our Local', 'Excellence in Action: Our Local
Client Successes
DXC.CDG has accomplished several key
milestones with its local clients, highlighted
by a strategic addition to its portfolio with the
Ministry of the Interior. Over the past period,
we have also signed framework agreements,
consolidated existing projects, renewed
strategic licenses, and deployed major
solutions.
These successes reflect our commitment to
operational excellence and our ongoing
close collaboration with local clients,
ensuring we deliver tailored solutions that
address their evolving needs while
maintaining the highest standards of quality
and reliability.
Some of the recent key projects include:
Ministry of the Interior – SOC
Managed Services
CDG Prévoyance – New Framework
Agreement
Ministry of Education – Security
Roadmap
MNTRA – Hosting Renewal
MAP – SOC-as-a-Service Contract
(24/07)
UM6P – Provision of On-Site
Resources
CMIM – Acquisition and
Implementation of FORTINAC
Solution
SCR – Managed Hosting
These projects reinforce our position as a
trusted technology partner for our local
clients.
DXC.CDG at the Heart of Africa’s
Cybersecurity Dialogue
DXC.CDG participated in the African
Cybersecurity Forum, organized by DGSSI and
Smart Africa alongside our valued partner.
The event, themed "The Future of Cybersecurity:
Digital Sovereignty for Sustainable Economic
Development," brought together over 700
142 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_142.png', 'ONETEAM Newsletter - November 2024'),
('4fbcad31-2f15-487e-a632-38e7b1baee46', 143, 'decision-makers, including ministers and', 'decision-makers, including ministers and
international experts.
DXC.CDG reinforced its position as a market
leader, showcasing its ability to innovate, secure
applications, and protect sensitive data while
supporting Africa’s digital sovereignty.
OneTeam Rewards: Celebrating
Our Top Employees!
The latest edition of OneTeam Rewards has come
to an exciting close! We recently revealed the
long-awaited Top 10 ranking and winners,
recognizing the employees who have been most
engaged in the day-to-day life of the company.
Congratulations to all our winners, who took home
prize money ranging from 1,500 to 8,000 MAD for
their outstanding engagement and involvement.
If you weren’t in the top 10 this time, don’t worry,
the next edition of OneTeam Rewards is just
around the corner. Get involved, stay engaged,
and you could be our next winner!
1st Younes Haji - Technopolis
2nd Omar Bennis - Casanearshore
3rd Sara El Harchouni – Technopolis
4th Ismail Ait Salah – Kouribga Client-Site
5th Ilyas Kouifi – Khouribga Client-Site
6th Samir Haouchi – Casablanca Client-
Site
7th Taher Bachir – Technopolis
8th Chaimaa Fares - Technopolis
9th Youssef Oubala - Technopolis
10th Assaad El Aamni – Khouribga Client-
Site
DXC.CDG Shines with 4 Brandon
Hall Group Excellence Awards!
We are proud to announce that DXC.CDG
has won four prestigious Brandon Hall Group
Excellence Awards, recognizing our
corporate culture, social impact, benefits and
well-being programs as well as our
recognition program “Oneteam Rewards”.
These awards celebrate the employee-
focused initiatives, highlighting our
leadership’s commitment to fostering a
healthy work environment that provides
employees with everything they need to
thrive.
143 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_143.png', 'ONETEAM Newsletter - November 2024'),
('0e268de0-43ce-441f-bd77-2458fedca107', 144, 'Brandon Hall Group Excellence Gold', 'Brandon Hall Group Excellence Gold
Award 2025 – Best Corporate Culture
Transformation
Brandon Hall Group Excellence Gold
Award 2025 – Best Benefits, Wellness
and Well-Being Program
Brandon Hall Group Excellence Gold
Award 2025 – Best Social Impact
Brandon Hall Group Excellence Silver
Award 2025 – Best Employee
Recognition Program
Game On: Casablanca Office Gets
a PS5 Zone!
Following growing interest, we’re excited to
launch a gaming zone in our Casablanca
office, featuring a PS5 and the most voted
popular games. This space allows
colleagues to enjoy breaks together,
strengthen bonds, and make office days
more fun.
Adding to our beloved rituals, “Wednesday
Brunch” and “Couscous Friday,” the gaming
zone offers even more ways to connect,
relax, and share moments of fun at work.
Get ready to play, connect, and level up your
breaks!
144 of 212', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_144.png', 'ONETEAM Newsletter - November 2024'),
('1484c4f3-07f4-44a6-8f85-02892a384a2f', 146, 'ISB Leadership Visit: Strengthening', 'ISB Leadership Visit: Strengthening
Strategic Ties!
In September, DXC.CDG had the privilege of
hosting an ISB leadership visit, marking an
important milestone in strengthening our
strategic relationships.
This meeting highlighted the dedication of
our Morocco teams around the key pillars of
our strategy: innovation, customer value
creation, and operational excellence. The
discussions were rich and constructive,
showcasing local initiatives in digital
transformation; particularly investments in AI
capabilities, which are helping us reimagine
processes, generate meaningful insights,
and enhance overall performance.
Five Prestigious Offshore Visits
Mark a Strong First Semester
The first semester of this financial year was
marked by the visit of five prestigious
offshore accounts; in addition to ISB
Leadership, we welcomed Airbus,
Soletanche Bachy, Vinci, and Engie,
reflecting the trust and confidence our clients
place in DXC.CDG. These visits provided a
unique opportunity to deepen strategic
relationships, showcase the expertise of our
Morocco teams, and highlight our
commitment to innovation, customer value
creation, and operational excellence.
Exciting Growth: Extending Our
Teams for ASSURE CLAIMS and
London Market
146 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_146.png', 'ONETEAM Newsletter - November 2024'),
('94d57b3b-47ba-46dc-a6a0-7aa146e8f893', 147, 'For the second year in a row, DXC CDG has', 'For the second year in a row, DXC CDG has
proudly defended its title as Morocco’s best
sports company by winning the JMSE
Championship. Over three intense days, 63
athletes competed in 20 sports, showing
incredible skill and team spirit.
To all our athletes : your dedication and
passion inspire us.
Excellence is in our DNA, and together, we’ll
keep reaching new heights!
Excellence in Action: Our Local
Client Successes
DXC.CDG has accomplished several key
milestones with its local clients, highlighted
by a strategic addition to its portfolio with the
Ministry of the Interior. Over the past period,
we have also signed framework agreements,
consolidated existing projects, renewed
strategic licenses, and deployed major
solutions.
These successes reflect our commitment to
operational excellence and our ongoing
close collaboration with local clients,
ensuring we deliver tailored solutions that
address their evolving needs while
maintaining the highest standards of quality
and reliability.
Some of the recent key projects include:
Ministry of the Interior – SOC
Managed Services
CDG Prévoyance – New Framework
Agreement
Ministry of Education – Security
Roadmap
MNTRA – Hosting Renewal
MAP – SOC-as-a-Service Contract
(24/07)
UM6P – Provision of On-Site
Resources
CMIM – Acquisition and
Implementation of FORTINAC
Solution
SCR – Managed Hosting
These projects reinforce our position as a
trusted technology partner for our local
clients.
147 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_147.png', 'ONETEAM Newsletter - November 2024'),
('2ffebef8-c661-4896-a3ee-e4a7a6e78669', 148, 'DXC.CDG at the Heart of Africa’s', 'DXC.CDG at the Heart of Africa’s
Cybersecurity Dialogue
DXC.CDG participated in the African
Cybersecurity Forum, organized by DGSSI and
Smart Africa alongside our valued partner.
The event, themed "The Future of Cybersecurity:
Digital Sovereignty for Sustainable Economic
Development," brought together over 700
decision-makers, including ministers and
international experts.
DXC.CDG reinforced its position as a market
leader, showcasing its ability to innovate, secure
applications, and protect sensitive data while
supporting Africa’s digital sovereignty.
OneTeam Rewards: Celebrating
Our Top Employees!
The latest edition of OneTeam Rewards has come
to an exciting close! We recently revealed the
long-awaited Top 10 ranking and winners,
recognizing the employees who have been most
engaged in the day-to-day life of the company.
Congratulations to all our winners, who took home
prize money ranging from 1,500 to 8,000 MAD for
their outstanding engagement and involvement.
If you weren’t in the top 10 this time, don’t worry,
the next edition of OneTeam Rewards is just
around the corner. Get involved, stay engaged,
and you could be our next winner!
1st Younes Haji - Technopolis
2nd Omar Bennis - Casanearshore
3rd Sara El Harchouni – Technopolis
4th Ismail Ait Salah – Kouribga Client-Site
5th Ilyas Kouifi – Khouribga Client-Site
6th Samir Haouchi – Casablanca Client-
Site
7th Taher Bachir – Technopolis
8th Chaimaa Fares - Technopolis
9th Youssef Oubala - Technopolis
10th Assaad El Aamni – Khouribga Client-
Site
148 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_148.png', 'ONETEAM Newsletter - November 2024'),
('657c2894-a559-4c18-9f17-7d7f1f389802', 149, 'DXC.CDG Shines with 4 Brandon', 'DXC.CDG Shines with 4 Brandon
Hall Group Excellence Awards!
We are proud to announce that DXC.CDG
has won four prestigious Brandon Hall Group
Excellence Awards, recognizing our
corporate culture, social impact, benefits and
well-being programs as well as our
recognition program “Oneteam Rewards”.
These awards celebrate the employee-
focused initiatives, highlighting our
leadership’s commitment to fostering a
healthy work environment that provides
employees with everything they need to
thrive.
Brandon Hall Group Excellence Gold
Award 2025 – Best Corporate Culture
Transformation
Brandon Hall Group Excellence Gold
Award 2025 – Best Benefits, Wellness
and Well-Being Program
Brandon Hall Group Excellence Gold
Award 2025 – Best Social Impact
Brandon Hall Group Excellence Silver
Award 2025 – Best Employee
Recognition Program
Game On: Casablanca Office Gets
a PS5 Zone!
Following growing interest, we’re excited to
launch a gaming zone in our Casablanca
office, featuring a PS5 and the most voted
popular games. This space allows
colleagues to enjoy breaks together,
strengthen bonds, and make office days
more fun.
Adding to our beloved rituals, “Wednesday
Brunch” and “Couscous Friday,” the gaming
zone offers even more ways to connect,
relax, and share moments of fun at work.
Get ready to play, connect, and level up your
breaks!
149 of 212', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_149.png', 'ONETEAM Newsletter - November 2024'),
('20ea9836-5fda-424e-adfa-fe329c7b0c36', 151, 'Offshore Strength: Continuity and', 'Offshore Strength: Continuity and
New Horizons!
In September, DXC.CDG continued to
strengthen its commitment to service
continuity for its long-standing clients,
including BPOST, London Market, and
Stellantis, by ensuring the highest standards
of quality and reliability.
At the same time, DXC.CDG expanded its
portfolio with the addition of Baloise Holding
and Pratt & Whitney. These new
collaborations not only enhance our market
presence but also reaffirm the strategic value
of our solutions in addressing our clients’
evolving challenges.
ISB Leadership Visit: Strengthening
Strategic Ties!
In September, DXC.CDG had the privilege of
hosting an ISB leadership visit, marking an
important milestone in strengthening our
strategic relationships.
This meeting highlighted the dedication of
our Morocco teams around the key pillars of
our strategy: innovation, customer value
creation, and operational excellence. The
discussions were rich and constructive,
showcasing local initiatives in digital
transformation; particularly investments in AI
capabilities, which are helping us reimagine
processes, generate meaningful insights,
and enhance overall performance.
151 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_151.png', 'ONETEAM Newsletter - November 2024'),
('96b0a968-67fc-40bf-8474-300280877532', 152, 'Five Prestigious Offshore Visits', 'Five Prestigious Offshore Visits
Mark a Strong First Semester
The first semester of this financial year was
marked by the visit of five prestigious
offshore accounts; in addition to ISB
Leadership, we welcomed Airbus,
Soletanche Bachy, Vinci, and Engie,
reflecting the trust and confidence our clients
place in DXC.CDG. These visits provided a
unique opportunity to deepen strategic
relationships, showcase the expertise of our
Morocco teams, and highlight our
commitment to innovation, customer value
creation, and operational excellence.
Exciting Growth: Extending Our
Teams for ASSURE CLAIMS and
London Market
We are thrilled to share that, in response to
growing needs and ongoing collaboration,
the teams dedicated to our clients ASSURE
CLAIMS and London Market have been
extended. This expansion underscores our
commitment to delivering exceptional
service, strengthening partnerships, and
providing the right resources to meet our
clients’ evolving requirements.
Excellence in Action: Our Local
Client Successes
DXC.CDG has accomplished several key
milestones with its local clients, highlighted
by a strategic addition to its portfolio with the
Ministry of the Interior. Over the past period,
we have also signed framework agreements,
consolidated existing projects, renewed
strategic licenses, and deployed major
solutions.
These successes reflect our commitment to
operational excellence and our ongoing
close collaboration with local clients,
ensuring we deliver tailored solutions that
address their evolving needs while
maintaining the highest standards of quality
and reliability.
152 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_152.png', 'ONETEAM Newsletter - November 2024'),
('f2a3641d-409c-4f47-b06d-5ebb93ddf0c3', 153, 'Some of the recent key projects include:', 'Some of the recent key projects include:
Ministry of the Interior – SOC
Managed Services
CDG Prévoyance – New Framework
Agreement
Ministry of Education – Security
Roadmap
MNTRA – Hosting Renewal
MAP – SOC-as-a-Service Contract
(24/07)
UM6P – Provision of On-Site
Resources
CMIM – Acquisition and
Implementation of FORTINAC
Solution
SCR – Managed Hosting
These projects reinforce our position as a
trusted technology partner for our local
clients.
DXC.CDG at the Heart of Africa’s
Cybersecurity Dialogue
DXC.CDG participated in the African
Cybersecurity Forum, organized by DGSSI and
Smart Africa alongside our valued partner.
The event, themed "The Future of Cybersecurity:
Digital Sovereignty for Sustainable Economic
Development," brought together over 700
decision-makers, including ministers and
international experts.
DXC.CDG reinforced its position as a market
leader, showcasing its ability to innovate, secure
applications, and protect sensitive data while
supporting Africa’s digital sovereignty.
OneTeam Rewards: Celebrating
Our Top Employees!
The latest edition of OneTeam Rewards has come
to an exciting close! We recently revealed the
long-awaited Top 10 ranking and winners,
recognizing the employees who have been most
engaged in the day-to-day life of the company.
Congratulations to all our winners, who took home
prize money ranging from 1,500 to 8,000 MAD for
their outstanding engagement and involvement.
153 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_153.png', 'ONETEAM Newsletter - November 2024'),
('3c6fe41a-8426-46c2-b90a-72c504b25481', 154, 'If you weren’t in the top 10 this time, don’t worry,', 'If you weren’t in the top 10 this time, don’t worry,
the next edition of OneTeam Rewards is just
around the corner. Get involved, stay engaged,
and you could be our next winner!
1st Younes Haji - Technopolis
2nd Omar Bennis - Casanearshore
3rd Sara El Harchouni – Technopolis
4th Ismail Ait Salah – Kouribga Client-Site
5th Ilyas Kouifi – Khouribga Client-Site
6th Samir Haouchi – Casablanca Client-
Site
7th Taher Bachir – Technopolis
8th Chaimaa Fares - Technopolis
9th Youssef Oubala - Technopolis
10th Assaad El Aamni – Khouribga Client-
Site
Building Stronger Teams Through
Our Managerial Charter
As part of our Managerial Charter, we
recently wrapped up September by revisiting
the value of the month: Team Spirit and
Constructive Communication.
It was a great opportunity to highlight the
importance of collaboration, active listening,
and open dialogue within our teams. In
October, we’ll be focusing on a new core
value: Managerial and Relational
Effectiveness; a key pillar to strengthen
both our collective performance and the
quality of our daily interactions.
Let’s keep cultivating a collaborative and
impactful managerial culture at DXC.CDG.
DXC.CDG Shines with 4 Brandon
Hall Group Excellence Awards!
We are proud to announce that DXC.CDG
has won four prestigious Brandon Hall Group
Excellence Awards, recognizing our
corporate culture, social impact, benefits and
well-being programs as well as our
recognition program “Oneteam Rewards”.
These awards celebrate the employee-
focused initiatives, highlighting our
leadership’s commitment to fostering a
healthy work environment that provides
154 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_154.png', 'ONETEAM Newsletter - November 2024'),
('7b7e1863-e6cf-4b2c-b6cd-57bb649bbbed', 155, 'employees with everything they need to', 'employees with everything they need to
thrive.
Brandon Hall Group Excellence Gold
Award 2025 – Best Corporate Culture
Transformation
Brandon Hall Group Excellence Gold
Award 2025 – Best Benefits, Wellness
and Well-Being Program
Brandon Hall Group Excellence Gold
Award 2025 – Best Social Impact
Brandon Hall Group Excellence Silver
Award 2025 – Best Employee
Recognition Program
Game On: Casablanca Office Gets
a PS5 Zone!
Following growing interest, we’re excited to
launch a gaming zone in our Casablanca
office, featuring a PS5 and the most voted
popular games. This space allows
colleagues to enjoy breaks together,
strengthen bonds, and make office days
more fun.
Adding to our beloved rituals, “Wednesday
Brunch” and “Couscous Friday,” the gaming
zone offers even more ways to connect,
relax, and share moments of fun at work.
Get ready to play, connect, and level up your
breaks!
Pink October Solidarity Walk –
Casablanca Sunday 12th
Pink October Awareness – From
Sunday 12th to Friday 24th,
155 of 212', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_155.png', 'ONETEAM Newsletter - November 2024'),
('56976a1a-fc17-463f-bace-756f92a04bda', 157, 'New Horizons!', 'New Horizons!
In September, DXC.CDG continued to
strengthen its commitment to service
continuity for its long-standing clients,
including BPOST, London Market, and
Stellantis, by ensuring the highest standards
of quality and reliability.
At the same time, DXC.CDG expanded its
portfolio with the addition of Baloise Holding
and Pratt & Whitney. These new
collaborations not only enhance our market
presence but also reaffirm the strategic value
of our solutions in addressing our clients’
evolving challenges.
ISB Leadership Visit: Strengthening
Strategic Ties!
In September, DXC.CDG had the privilege of
hosting an ISB leadership visit, marking an
important milestone in strengthening our
strategic relationships.
This meeting highlighted the dedication of
our Morocco teams around the key pillars of
our strategy: innovation, customer value
creation, and operational excellence. The
discussions were rich and constructive,
showcasing local initiatives in digital
transformation; particularly investments in AI
capabilities, which are helping us reimagine
processes, generate meaningful insights,
and enhance overall performance.
Five Prestigious Offshore Visits
Mark a Strong First Semester
The first semester of this financial year was
marked by the visit of five prestigious
offshore accounts; in addition to ISB
Leadership, we welcomed Airbus,
Soletanche Bachy, Vinci, and Engie,
reflecting the trust and confidence our clients
place in DXC.CDG. These visits provided a
unique opportunity to deepen strategic
relationships, showcase the expertise of our
Morocco teams, and highlight our
commitment to innovation, customer value
creation, and operational excellence.
157 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_157.png', 'ONETEAM Newsletter - November 2024'),
('58624691-d9dc-41c7-b0d0-5d1951b0b7c7', 158, 'Exciting Growth: Extending Our', 'Exciting Growth: Extending Our
Teams for ASSURE CLAIMS and
London Market
For the second year in a row, DXC CDG has
proudly defended its title as Morocco’s best
sports company by winning the JMSE
Championship. Over three intense days, 63
athletes competed in 20 sports, showing
incredible skill and team spirit.
To all our athletes : your dedication and
passion inspire us.
Excellence is in our DNA, and together, we’ll
keep reaching new heights!
Excellence in Action: Our Local
Client Successes
DXC.CDG has accomplished several key
milestones with its local clients, highlighted
by a strategic addition to its portfolio with the
Ministry of the Interior. Over the past period,
we have also signed framework agreements,
consolidated existing projects, renewed
strategic licenses, and deployed major
solutions.
These successes reflect our commitment to
operational excellence and our ongoing
close collaboration with local clients,
ensuring we deliver tailored solutions that
address their evolving needs while
maintaining the highest standards of quality
and reliability.
Some of the recent key projects include:
Ministry of the Interior – SOC
Managed Services
CDG Prévoyance – New Framework
Agreement
Ministry of Education – Security
Roadmap
MNTRA – Hosting Renewal
MAP – SOC-as-a-Service Contract
(24/07)
158 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_158.png', 'ONETEAM Newsletter - November 2024'),
('032981c4-33cb-4d07-9369-83de0c4ba5cc', 159, 'UM6P – Provision of On-Site', 'UM6P – Provision of On-Site
Resources
CMIM – Acquisition and
Implementation of FORTINAC
Solution
SCR – Managed Hosting
These projects reinforce our position as a
trusted technology partner for our local
clients.
DXC.CDG at the Heart of Africa’s
Cybersecurity Dialogue
DXC.CDG participated in the African
Cybersecurity Forum, organized by DGSSI and
Smart Africa alongside our valued partner.
The event, themed "The Future of Cybersecurity:
Digital Sovereignty for Sustainable Economic
Development," brought together over 700
decision-makers, including ministers and
international experts.
DXC.CDG reinforced its position as a market
leader, showcasing its ability to innovate, secure
applications, and protect sensitive data while
supporting Africa’s digital sovereignty.
OneTeam Rewards: Celebrating
Our Top Employees!
The latest edition of OneTeam Rewards has come
to an exciting close! We recently revealed the
long-awaited Top 10 ranking and winners,
recognizing the employees who have been most
engaged in the day-to-day life of the company.
Congratulations to all our winners, who took home
prize money ranging from 1,500 to 8,000 MAD for
their outstanding engagement and involvement.
If you weren’t in the top 10 this time, don’t worry,
the next edition of OneTeam Rewards is just
around the corner. Get involved, stay engaged,
and you could be our next winner!
1st Younes Haji - Technopolis
2nd Omar Bennis - Casanearshore
3rd Sara El Harchouni – Technopolis
4th Ismail Ait Salah – Kouribga Client-Site
5th Ilyas Kouifi – Khouribga Client-Site
159 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_159.png', 'ONETEAM Newsletter - November 2024'),
('e676e5d7-a418-4f71-b586-6748806df421', 160, '6th Samir Haouchi – Casablanca Client-', '6th Samir Haouchi – Casablanca Client-
Site
7th Taher Bachir – Technopolis
8th Chaimaa Fares - Technopolis
9th Youssef Oubala - Technopolis
10th Assaad El Aamni – Khouribga Client-
Site
DXC.CDG Shines with 4 Brandon
Hall Group Excellence Awards!
We are proud to announce that DXC.CDG
has won four prestigious Brandon Hall Group
Excellence Awards, recognizing our
corporate culture, social impact, benefits and
well-being programs as well as our
recognition program “Oneteam Rewards”.
These awards celebrate the employee-
focused initiatives, highlighting our
leadership’s commitment to fostering a
healthy work environment that provides
employees with everything they need to
thrive.
Brandon Hall Group Excellence Gold
Award 2025 – Best Corporate Culture
Transformation
Brandon Hall Group Excellence Gold
Award 2025 – Best Benefits, Wellness
and Well-Being Program
Brandon Hall Group Excellence Gold
Award 2025 – Best Social Impact
Brandon Hall Group Excellence Silver
Award 2025 – Best Employee
Recognition Program
Game On: Casablanca Office Gets
a PS5 Zone!
Following growing interest, we’re excited to
launch a gaming zone in our Casablanca
office, featuring a PS5 and the most voted
popular games. This space allows
colleagues to enjoy breaks together,
strengthen bonds, and make office days
more fun.
Adding to our beloved rituals, “Wednesday
Brunch” and “Couscous Friday,” the gaming
zone offers even more ways to connect,
relax, and share moments of fun at work.
Get ready to play, connect, and level up your
160 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_160.png', 'ONETEAM Newsletter - November 2024'),
('0d2601f7-ef33-4bad-a856-0d242180a7c4', 162, 'Offshore Strength: Continuity and', 'Offshore Strength: Continuity and
New Horizons!
In September, DXC.CDG continued to
strengthen its commitment to service
continuity for its long-standing clients,
including BPOST, London Market, and
Stellantis, by ensuring the highest standards
of quality and reliability.
At the same time, DXC.CDG expanded its
portfolio with the addition of Baloise Holding
and Pratt & Whitney. These new
collaborations not only enhance our market
presence but also reaffirm the strategic value
of our solutions in addressing our clients’
evolving challenges.
ISB Leadership Visit: Strengthening
Strategic Ties!
In September, DXC.CDG had the privilege of
hosting an ISB leadership visit, marking an
important milestone in strengthening our
strategic relationships.
This meeting highlighted the dedication of
our Morocco teams around the key pillars of
our strategy: innovation, customer value
creation, and operational excellence. The
discussions were rich and constructive,
showcasing local initiatives in digital
transformation; particularly investments in AI
capabilities, which are helping us reimagine
processes, generate meaningful insights,
and enhance overall performance.
162 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_162.png', 'ONETEAM Newsletter - November 2024'),
('a5b1736c-9ed1-43c0-946a-9fe25cf38732', 163, 'Five Prestigious Offshore Visits', 'Five Prestigious Offshore Visits
Mark a Strong First Semester
The first semester of this financial year was
marked by the visit of five prestigious
offshore accounts; in addition to ISB
Leadership, we welcomed Airbus,
Soletanche Bachy, Vinci, and Engie,
reflecting the trust and confidence our clients
place in DXC.CDG. These visits provided a
unique opportunity to deepen strategic
relationships, showcase the expertise of our
Morocco teams, and highlight our
commitment to innovation, customer value
creation, and operational excellence.
Exciting Growth: Extending Our
Teams for ASSURE CLAIMS and
London Market
We are thrilled to share that, in response to
growing needs and ongoing collaboration,
the teams dedicated to our clients ASSURE
CLAIMS and London Market have been
extended. This expansion underscores our
commitment to delivering exceptional
service, strengthening partnerships, and
providing the right resources to meet our
clients’ evolving requirements.
Excellence in Action: Our Local
Client Successes
DXC.CDG has accomplished several key
milestones with its local clients, highlighted
by a strategic addition to its portfolio with the
Ministry of the Interior. Over the past period,
we have also signed framework agreements,
163 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_163.png', 'ONETEAM Newsletter - November 2024'),
('a7c280a5-8ec1-4d0a-82e6-13afa5a6e993', 164, 'consolidated existing projects, renewed', 'consolidated existing projects, renewed
strategic licenses, and deployed major
solutions.
These successes reflect our commitment to
operational excellence and our ongoing
close collaboration with local clients,
ensuring we deliver tailored solutions that
address their evolving needs while
maintaining the highest standards of quality
and reliability.
Some of the recent key projects include:
Ministry of the Interior – SOC
Managed Services
CDG Prévoyance – New Framework
Agreement
Ministry of Education – Security
Roadmap
MNTRA – Hosting Renewal
MAP – SOC-as-a-Service Contract
(24/07)
UM6P – Provision of On-Site
Resources
CMIM – Acquisition and
Implementation of FORTINAC
Solution
SCR – Managed Hosting
These projects reinforce our position as a
trusted technology partner for our local
clients.
DXC.CDG at the Heart of Africa’s
Cybersecurity Dialogue
DXC.CDG participated in the African
Cybersecurity Forum, organized by DGSSI and
Smart Africa alongside our valued partner.
The event, themed "The Future of Cybersecurity:
Digital Sovereignty for Sustainable Economic
Development," brought together over 700
decision-makers, including ministers and
international experts.
DXC.CDG reinforced its position as a market
leader, showcasing its ability to innovate, secure
applications, and protect sensitive data while
supporting Africa’s digital sovereignty.
OneTeam Rewards: Celebrating
164 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_164.png', 'ONETEAM Newsletter - November 2024'),
('46ffc690-4824-4f6a-8595-7669decf4de6', 165, 'Our Top Employees!', 'Our Top Employees!
The latest edition of OneTeam Rewards has come
to an exciting close! We recently revealed the
long-awaited Top 10 ranking and winners,
recognizing the employees who have been most
engaged in the day-to-day life of the company.
Congratulations to all our winners, who took home
prize money ranging from 1,500 to 8,000 MAD for
their outstanding engagement and involvement.
If you weren’t in the top 10 this time, don’t worry,
the next edition of OneTeam Rewards is just
around the corner. Get involved, stay engaged,
and you could be our next winner!
1st Younes Haji - Technopolis
2nd Omar Bennis - Casanearshore
3rd Sara El Harchouni – Technopolis
4th Ismail Ait Salah – Kouribga Client-Site
5th Ilyas Kouifi – Khouribga Client-Site
6th Samir Haouchi – Casablanca Client-
Site
7th Taher Bachir – Technopolis
8th Chaimaa Fares - Technopolis
9th Youssef Oubala - Technopolis
10th Assaad El Aamni – Khouribga Client-
Site
DXC.CDG Shines with 4 Brandon
Hall Group Excellence Awards!
We are proud to announce that DXC.CDG
has won four prestigious Brandon Hall Group
Excellence Awards, recognizing our
corporate culture, social impact, benefits and
well-being programs as well as our
recognition program “Oneteam Rewards”.
These awards celebrate the employee-
focused initiatives, highlighting our
leadership’s commitment to fostering a
healthy work environment that provides
employees with everything they need to
thrive.
Brandon Hall Group Excellence Gold
Award 2025 – Best Corporate Culture
Transformation
Brandon Hall Group Excellence Gold
Award 2025 – Best Benefits, Wellness
and Well-Being Program
Brandon Hall Group Excellence Gold
Award 2025 – Best Social Impact
Brandon Hall Group Excellence Silver
Award 2025 – Best Employee
Recognition Program
165 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_165.png', 'ONETEAM Newsletter - November 2024'),
('aa8eb5f6-67fb-48fa-bcc9-f50b36e53845', 166, 'Game On: Casablanca Office Gets', 'Game On: Casablanca Office Gets
a PS5 Zone!
Following growing interest, we’re excited to
launch a gaming zone in our Casablanca
office, featuring a PS5 and the most voted
popular games. This space allows
colleagues to enjoy breaks together,
strengthen bonds, and make office days
more fun.
Adding to our beloved rituals, “Wednesday
Brunch” and “Couscous Friday,” the gaming
zone offers even more ways to connect,
relax, and share moments of fun at work.
Get ready to play, connect, and level up your
breaks!
Pink October Solidarity Walk –
Casablanca Sunday 12th
Pink October Awareness Week –
From Sunday 12th to Friday 17th
Online, at Technopolis and at
Casanearshore
Kick Off League de la Relation
Client Season 10 – Monday 13th
Geni Forum October 15th & 16th –
Rabat
166 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_166.png', 'ONETEAM Newsletter - November 2024'),
('b35b55d3-fdd0-4eab-ae74-9b9577fb346a', 168, 'of our solutions in addressing our clients’', 'of our solutions in addressing our clients’
evolving challenges.
ISB Leadership Visit: Strengthening
Strategic Ties!
In September, DXC.CDG had the privilege of
hosting an ISB leadership visit, marking an
important milestone in strengthening our
strategic relationships.
This meeting highlighted the dedication of
our Morocco teams around the key pillars of
our strategy: innovation, customer value
creation, and operational excellence. The
discussions were rich and constructive,
showcasing local initiatives in digital
transformation; particularly investments in AI
capabilities, which are helping us reimagine
processes, generate meaningful insights,
and enhance overall performance.
Five Prestigious Offshore Visits
Mark a Strong First Semester
The first semester of this financial year was
marked by the visit of five prestigious
offshore accounts; in addition to ISB
Leadership, we welcomed Airbus,
Soletanche Bachy, Vinci, and Engie,
reflecting the trust and confidence our clients
place in DXC.CDG. These visits provided a
unique opportunity to deepen strategic
relationships, showcase the expertise of our
Morocco teams, and highlight our
commitment to innovation, customer value
creation, and operational excellence.
Exciting Growth: Extending Our
168 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_168.png', 'ONETEAM Newsletter - November 2024'),
('b567a318-243a-48e8-9e36-63ab635fcad0', 169, 'Teams for ASSURE CLAIMS and', 'Teams for ASSURE CLAIMS and
London Market
We are thrilled to share that, in response to
growing needs and ongoing collaboration,
the teams dedicated to our clients ASSURE
CLAIMS and London Market have been
extended. This expansion underscores our
commitment to delivering exceptional
service, strengthening partnerships, and
providing the right resources to meet our
clients’ evolving requirements.
Excellence in Action: Our Local
Client Successes
DXC.CDG has accomplished several key
milestones with its local clients, highlighted
by a strategic addition to its portfolio with the
Ministry of the Interior. Over the past period,
we have also signed framework agreements,
consolidated existing projects, renewed
strategic licenses, and deployed major
solutions.
These successes reflect our commitment to
operational excellence and our ongoing
close collaboration with local clients,
ensuring we deliver tailored solutions that
address their evolving needs while
maintaining the highest standards of quality
and reliability.
Some of the recent key projects include:
Ministry of the Interior – SOC
Managed Services
CDG Prévoyance – New Framework
Agreement
Ministry of Education – Security
Roadmap
MNTRA – Hosting Renewal
MAP – SOC-as-a-Service Contract
(24/07)
UM6P – Provision of On-Site
Resources
CMIM – Acquisition and
Implementation of FORTINAC
Solution
SCR – Managed Hosting
These projects reinforce our position as a
trusted technology partner for our local
clients.
169 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_169.png', 'ONETEAM Newsletter - November 2024'),
('0623c3b2-100e-41b4-ad00-1f2b22efa1c5', 170, 'DXC.CDG at the Heart of Africa’s', 'DXC.CDG at the Heart of Africa’s
Cybersecurity Dialogue
DXC.CDG participated in the African
Cybersecurity Forum, organized by DGSSI and
Smart Africa alongside our valued partner.
The event, themed "The Future of Cybersecurity:
Digital Sovereignty for Sustainable Economic
Development," brought together over 700
decision-makers, including ministers and
international experts.
DXC.CDG reinforced its position as a market
leader, showcasing its ability to innovate, secure
applications, and protect sensitive data while
supporting Africa’s digital sovereignty.
OneTeam Rewards: Celebrating
Our Top Employees!
The latest edition of OneTeam Rewards has come
to an exciting close! We recently revealed the
long-awaited Top 10 ranking and winners,
recognizing the employees who have been most
engaged in the day-to-day life of the company.
Congratulations to all our winners, who took home
prize money ranging from 1,500 to 8,000 MAD for
their outstanding engagement and involvement.
If you weren’t in the top 10 this time, don’t worry,
the next edition of OneTeam Rewards is just
around the corner. Get involved, stay engaged,
and you could be our next winner!
1st Younes Haji - Technopolis
2nd Omar Bennis - Casanearshore
3rd Sara El Harchouni – Technopolis
4th Ismail Ait Salah – Kouribga Client-Site
5th Ilyas Kouifi – Khouribga Client-Site
6th Samir Haouchi – Casablanca Client-
Site
7th Taher Bachir – Technopolis
8th Chaimaa Fares - Technopolis
9th Youssef Oubala - Technopolis
10th Assaad El Aamni – Khouribga Client-
Site
170 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_170.png', 'ONETEAM Newsletter - November 2024'),
('7041922e-6209-46c7-889d-0dcd561d5130', 171, 'DXC.CDG Shines with 4 Brandon', 'DXC.CDG Shines with 4 Brandon
Hall Group Excellence Awards!
We are proud to announce that DXC.CDG
has won four prestigious Brandon Hall Group
Excellence Awards, recognizing our
corporate culture, social impact, benefits and
well-being programs as well as our
recognition program “Oneteam Rewards”.
These awards celebrate the employee-
focused initiatives, highlighting our
leadership’s commitment to fostering a
healthy work environment that provides
employees with everything they need to
thrive.
Brandon Hall Group Excellence Gold
Award 2025 – Best Corporate Culture
Transformation
Brandon Hall Group Excellence Gold
Award 2025 – Best Benefits, Wellness
and Well-Being Program
Brandon Hall Group Excellence Gold
Award 2025 – Best Social Impact
Brandon Hall Group Excellence Silver
Award 2025 – Best Employee
Recognition Program
Game On: Casablanca Office Gets
a PS5 Zone!
Following growing interest, we’re excited to
launch a gaming zone in our Casablanca
office, featuring a PS5 and the most voted
popular games. This space allows
colleagues to enjoy breaks together,
strengthen bonds, and make office days
more fun.
Adding to our beloved rituals, “Wednesday
Brunch” and “Couscous Friday,” the gaming
zone offers even more ways to connect,
relax, and share moments of fun at work.
Get ready to play, connect, and level up your
breaks!
171 of 212', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_171.png', 'ONETEAM Newsletter - November 2024'),
('ea564672-ee02-4e2c-86ec-6b584add8ccd', 174, 'and Partnerships', 'and Partnerships
For the third consecutive year, DXC CDG proudly
participated in GITEX AFRICA, the continent’s
largest tech and startup event, held in vibrant
Marrakech from April 14–16, 2025. Our presence
at this landmark event was packed with
unforgettable moments:
Official Visits: We had the honor of
hosting Mr. Khalid Safir, General Director
of CDG, and Mr. Khalid Aït Taleb, Minister
of Health, engaging in high-level
discussions about digital transformation in
healthcare.
Strategic Partnerships: We solidified our
commitment to innovation by signing key
agreements with UIR, 212Founders, and
Faculté Ben M’Sick, strengthening our
collaboration with academia and the wider
innovation ecosystem.
Talkspots & TechTalks: We spotlighted
the impactful JobInTech program and co-
hosted an insightful TechTalk with Nutanix
on crucial topics like data sovereignty and
hybrid cloud.
This year, we took our values of engagement and
sharing to new heights ; offering over 30 exclusive
visitor passes to colleagues who were eager to
experience GITEX first-hand. This initiative turned
the event into a shared experience that amplified
our collective drive for innovation.
Our participation at GITEX AFRICA underscores
DXC CDG’s commitment to driving digital
transformation and shaping the future of tech
across Africa.
Another Win Worth Celebrating!
We’re thrilled to announce the signing of a
new strategic contract with MAP, a key
player we’re proud to support in
strengthening their security policy.
This partnership is a clear reflection of our
continued commitment to delivering reliable,
high-impact solutions and building long-term,
trust-based relationships with our clients.
It also marks a valuable addition to our client
portfolio, reinforcing the confidence that the
market places in our expertise and execution
capabilities.
Kudos to all the teams involved in making
this happen, yet another milestone in our
journey of growth and excellence!
174 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_174.png', 'ONETEAM Newsletter - November 2024'),
('7aa5d925-c55f-46f9-8827-1086d6cc6345', 175, 'Proud to Be Part of the 17th Edition', 'Proud to Be Part of the 17th Edition
of SIAM!
We’re excited to participate in the 17th edition of
the International Agricultural Show in Morocco
(SIAM), a flagship event that brings together key
players from across the agricultural ecosystem.
This is a unique opportunity to showcase our
expertise, exchange with industry leaders, and
deepen our commitment to supporting the
agricultural sector through innovation and
partnership.
DXC CDG Management Seminar : A
Strong Start to FY26!
DXC CDG leaders and managers gathered
at the Conrad Rabat Arzana for the FY26
Kick-Off Seminar, a day dedicated to
collaboration, open dialogue, and team
alignment.
Set in a spirit of exchange and conviviality,
the seminar brought together managers from
across the organization to reflect on strategic
priorities, share perspectives, and build
momentum for the year ahead.
This seminar marked not only the start of a
new fiscal year but also a renewed
commitment to working together with
purpose, clarity, and shared ambition.
Here’s to a successful and impactful FY26,
together as OneTeam!
175 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_175.png', 'ONETEAM Newsletter - November 2024'),
('31e4948c-86fc-4f15-8623-e2f192497576', 176, 'Wrapping Up the 1st Edition of', 'Wrapping Up the 1st Edition of
OneTeam Rewards : A Celebration
of Engagement!
We’re proud to wrap up the 1st edition of
OneTeam Rewards, our recognition program
celebrating engagement across DXC CDG.
Nearly 900 colleagues took part of it, and the
Top 10 most engaged won exciting prize
money.
Winners came from Safi, Khouribga,
Casablanca, Rabat, and Kenitra, proving
that this program reaches everyone,
everywhere. From town halls to volunteering,
quizzes, surveys, internal content creation,
and participation in our 14 clubs : every
action counted!
The 2nd edition is already live, and each of
you has a chance to win by staying active
and engaged in Life at DXC. Let’s keep the
spirit alive, because when one wins, we all
win!
A Transparent Look at Our Voice of
Workforce Results : A Step Forward
Together!
During our recent Town Hall, held with our Mazars
partners, we shared the detailed results of the
latest Voice of Workforce (VOW) survey.
92% of colleagues participated, with an overall
satisfaction rate of 91%. The session also covered
the evolution of our scores over the past six years,
highlighting key trends. Next steps include the
creation of detailed action plans by each service
line and department, to ensure we stay in a
dynamic, continuous improvement approach.
DXC CDG Launches Its Quality
Workbook : A New Milestone in Our
Operational Excellence Journey!
176 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_176.png', 'ONETEAM Newsletter - November 2024'),
('da6155a4-0e66-4ccd-aa74-a66b21c858fc', 177, 'The recent Town Hall held with our quality team', 'The recent Town Hall held with our quality team
marked an important step in our collective drive to
embed quality standards at the heart of our
operations, with the official launch of the Quality
Workbook.
This new reference guide is now available and
has been designed to help integrate best
practices into daily activities, supporting a culture
of continuous improvement and operational
excellence.
We encourage all teams to review the workbook
carefully and apply its principles consistently,
making quality a shared priority across all our
functions.
You can find the Quality Workbook attached in our
recent communications.
DXC CDG Hits the Road Again, This
Time in Rabat!
Following our energized participation in the
Marrakech International Marathon earlier this
year, our momentum carried us forward to the
Rabat International Marathon last weekend!
Colleagues from across DXC CDG took on the
challenge with enthusiasm, team spirit, and
determination, choosing from three race formats:
10 km, 21 km, and the full 42 km marathon.
Whether running for personal bests or simply
enjoying the shared experience, every step
reflected our values of well-being, resilience,
and togetherness.
Each race was a new challenge, and each finish
line a shared victory. Congratulations to all
participants for proudly representing DXC CDG ,
both in performance and spirit!
DXC CDG Gears Up for JMSE 2025:
Ready to Defend Our Title!
After winning 1st place last year, DXC CDG is
back for the Jeux Marocains du Sport en
Entreprise this June!
We’re building our all-star teams, if you have an
advanced level in any sport listed (from football to
chess), join us now and be part of the challenge.
Disciplines available: Running, Football,
Basketball, Tennis, Table Tennis, Golf, Darts,
Gaming, Baby-foot, Billiards, Chess & Padel.
177 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_177.png', 'ONETEAM Newsletter - November 2024'),
('b3d1b8d4-14a4-4ded-9172-70e0a3543951', 178, 'Registrations are open, let’s go for gold!', 'Registrations are open, let’s go for gold!
Workplace Health: Official
Implementation of Anti-Smoking Law
15-91
As part of strengthening our internal health and safety
policy, we have officially adopted the provisions of Law
15-91, which strictly prohibits smoking in all shared use
areas; including professional, public, enclosed, and
covered spaces, as well as the immediate surroundings
of the building.
This measure reflects a clear intention: to protect the
health of our colleagues, comply with Moroccan
legislation, and move toward a healthier, safer, and
more respectful work environment for all.
May 11th - INPT Forum The
178 of 212', 'November 2024', '2024-11-01', 'Wellbeing & Health', 'page_178.png', 'ONETEAM Newsletter - November 2024'),
('c326a70b-3f8d-4212-92a0-b88f062bf5c7', 180, 'Inside GITEX AFRICA 2025: DXC', 'APRIL 2025
Inside GITEX AFRICA 2025: DXC
CDG’s Bold Steps in Innovation
and Partnerships
For the third consecutive year, DXC CDG proudly
participated in GITEX AFRICA, the continent’s
largest tech and startup event, held in vibrant
Marrakech from April 14–16, 2025. Our presence
at this landmark event was packed with
unforgettable moments:
Official Visits: We had the honor of
hosting Mr. Khalid Safir, General Director
of CDG, and Mr. Khalid Aït Taleb, Minister
of Health, engaging in high-level
discussions about digital transformation in
healthcare.
Strategic Partnerships: We solidified our
commitment to innovation by signing key
agreements with UIR, 212Founders, and
Faculté Ben M’Sick, strengthening our
collaboration with academia and the wider
innovation ecosystem.
Talkspots & TechTalks: We spotlighted
the impactful JobInTech program and co-
hosted an insightful TechTalk with Nutanix
on crucial topics like data sovereignty and
hybrid cloud.
This year, we took our values of engagement and
sharing to new heights ; offering over 30 exclusive
visitor passes to colleagues who were eager to
experience GITEX first-hand. This initiative turned
the event into a shared experience that amplified
our collective drive for innovation.
Our participation at GITEX AFRICA underscores
DXC CDG’s commitment to driving digital
transformation and shaping the future of tech
across Africa.
180 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_180.png', 'ONETEAM Newsletter - November 2024'),
('4178a409-cf8c-4373-8cf0-af892cbbb694', 181, 'Another Win Worth Celebrating!', 'Another Win Worth Celebrating!
We’re thrilled to announce the signing of a
new strategic contract with MAP, a key
player we’re proud to support in
strengthening their security policy.
This partnership is a clear reflection of our
continued commitment to delivering reliable,
high-impact solutions and building long-term,
trust-based relationships with our clients.
It also marks a valuable addition to our client
portfolio, reinforcing the confidence that the
market places in our expertise and execution
capabilities.
Kudos to all the teams involved in making
this happen, yet another milestone in our
journey of growth and excellence!
Proud to Be Part of the 17th Edition
of SIAM!
We’re excited to participate in the 17th edition of
the International Agricultural Show in Morocco
(SIAM), a flagship event that brings together key
players from across the agricultural ecosystem.
This is a unique opportunity to showcase our
expertise, exchange with industry leaders, and
deepen our commitment to supporting the
agricultural sector through innovation and
partnership.
181 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_181.png', 'ONETEAM Newsletter - November 2024'),
('62a53774-a2d3-473f-9feb-da7b5486315e', 182, 'DXC CDG Management Seminar : A', 'DXC CDG Management Seminar : A
Strong Start to FY26!
DXC CDG leaders and managers gathered
at the Conrad Rabat Arzana for the FY26
Kick-Off Seminar, a day dedicated to
collaboration, open dialogue, and team
alignment.
Set in a spirit of exchange and conviviality,
the seminar brought together managers from
across the organization to reflect on strategic
priorities, share perspectives, and build
momentum for the year ahead.
This seminar marked not only the start of a
new fiscal year but also a renewed
commitment to working together with
purpose, clarity, and shared ambition.
Here’s to a successful and impactful FY26,
together as OneTeam!
Wrapping Up the 1st Edition of
OneTeam Rewards : A Celebration
of Engagement!
We’re proud to wrap up the 1st edition of
OneTeam Rewards, our recognition program
celebrating engagement across DXC CDG.
Nearly 900 colleagues took part of it, and the
Top 10 most engaged won exciting prize
money.
Winners came from Safi, Khouribga,
Casablanca, Rabat, and Kenitra, proving
that this program reaches everyone,
everywhere. From town halls to volunteering,
quizzes, surveys, internal content creation,
and participation in our 14 clubs : every
action counted!
The 2nd edition is already live, and each of
you has a chance to win by staying active
and engaged in Life at DXC. Let’s keep the
spirit alive, because when one wins, we all
win!
182 of 212', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_182.png', 'ONETEAM Newsletter - November 2024'),
('112fd278-771e-4fa5-961e-67a25be44ab6', 183, 'A Transparent Look at Our Voice of', 'A Transparent Look at Our Voice of
Workforce Results : A Step Forward
Together!
During our recent Town Hall, held with our Mazars
partners, we shared the detailed results of the
latest Voice of Workforce (VOW) survey.
92% of colleagues participated, with an overall
satisfaction rate of 91%. The session also covered
the evolution of our scores over the past six years,
highlighting key trends. Next steps include the
creation of detailed action plans by each service
line and department, to ensure we stay in a
dynamic, continuous improvement approach.
DXC CDG Launches Its Quality
Workbook : A New Milestone in Our
Operational Excellence Journey!
The recent Town Hall held with our quality team
marked an important step in our collective drive to
embed quality standards at the heart of our
operations, with the official launch of the Quality
Workbook.
This new reference guide is now available and
has been designed to help integrate best
practices into daily activities, supporting a culture
of continuous improvement and operational
excellence.
We encourage all teams to review the workbook
carefully and apply its principles consistently,
making quality a shared priority across all our
functions.
You can find the Quality Workbook attached in our
recent communications.
DXC CDG Hits the Road Again, This
Time in Rabat!
Following our energized participation in the
Marrakech International Marathon earlier this
year, our momentum carried us forward to the
Rabat International Marathon last weekend!
183 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_183.png', 'ONETEAM Newsletter - November 2024'),
('ef3728be-0185-4261-80fe-08d817115dfb', 184, 'Colleagues from across DXC CDG took on the', 'Colleagues from across DXC CDG took on the
challenge with enthusiasm, team spirit, and
determination, choosing from three race formats:
10 km, 21 km, and the full 42 km marathon.
Whether running for personal bests or simply
enjoying the shared experience, every step
reflected our values of well-being, resilience,
and togetherness.
Each race was a new challenge, and each finish
line a shared victory. Congratulations to all
participants for proudly representing DXC CDG ,
both in performance and spirit!
DXC CDG Gears Up for JMSE 2025:
Ready to Defend Our Title!
After winning 1st place last year, DXC CDG is
back for the Jeux Marocains du Sport en
Entreprise this June!
We’re building our all-star teams, if you have an
advanced level in any sport listed (from football to
chess), join us now and be part of the challenge.
Disciplines available: Running, Football,
Basketball, Tennis, Table Tennis, Golf, Darts,
Gaming, Baby-foot, Billiards, Chess & Padel.
Registrations are open, let’s go for gold!
Workplace Health: Official
Implementation of Anti-Smoking Law
15-91
As part of strengthening our internal health and safety
policy, we have officially adopted the provisions of Law
15-91, which strictly prohibits smoking in all shared use
areas; including professional, public, enclosed, and
covered spaces, as well as the immediate surroundings
of the building.
This measure reflects a clear intention: to protect the
health of our colleagues, comply with Moroccan
legislation, and move toward a healthier, safer, and
more respectful work environment for all.
184 of 212', 'November 2024', '2024-11-01', 'Wellbeing & Health', 'page_184.png', 'ONETEAM Newsletter - November 2024'),
('a19d3f24-e43c-4835-97bc-0d194409103b', 185, 'May 11th - INPT Forum The', 'May 11th - INPT Forum The
Intelligence Edge
Smoking Cessation Workshop
(TBD)
185 of 212', 'November 2024', '2024-11-01', 'Events & Upcoming', 'page_185.png', 'ONETEAM Newsletter - November 2024'),
('93f58f7b-9be3-44b1-a9a4-8bc4e855a934', 187, 'Inside GITEX AFRICA 2025: DXC', 'Inside GITEX AFRICA 2025: DXC
CDG’s Bold Steps in Innovation
and Partnerships
For the third consecutive year, DXC CDG proudly
participated in GITEX AFRICA, the continent’s
largest tech and startup event, held in vibrant
Marrakech from April 14–16, 2025. Our presence
at this landmark event was packed with
unforgettable moments:
Official Visits: We had the honor of
hosting Mr. Khalid Safir, General Director
of CDG, and Mr. Khalid Aït Taleb, Minister
of Health, engaging in high-level
discussions about digital transformation in
healthcare.
Strategic Partnerships: We solidified our
commitment to innovation by signing key
agreements with UIR, 212Founders, and
Faculté Ben M’Sick, strengthening our
collaboration with academia and the wider
innovation ecosystem.
Talkspots & TechTalks: We spotlighted
the impactful JobInTech program and co-
hosted an insightful TechTalk with Nutanix
on crucial topics like data sovereignty and
hybrid cloud.
This year, we took our values of engagement and
sharing to new heights ; offering over 30 exclusive
visitor passes to colleagues who were eager to
experience GITEX first-hand. This initiative turned
the event into a shared experience that amplified
our collective drive for innovation.
Our participation at GITEX AFRICA underscores
DXC CDG’s commitment to driving digital
transformation and shaping the future of tech
across Africa.
Another Win Worth Celebrating!
We’re thrilled to announce the signing of a new
strategic contract with MAP, a key player we’re
proud to support in strengthening their security
policy.
187 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_187.png', 'ONETEAM Newsletter - November 2024'),
('8f872d9d-8728-4e9f-8d68-2f6dd3f09401', 188, 'This partnership is a clear reflection of our', 'This partnership is a clear reflection of our
continued commitment to delivering reliable, high-
impact solutions and building long-term, trust-
based relationships with our clients.
It also marks a valuable addition to our client
portfolio, reinforcing the confidence that the
market places in our expertise and execution
capabilities.
Kudos to all the teams involved in making this
happen, yet another milestone in our journey of
growth and excellence!
Proud to Be Part of the 17th Edition
of SIAM!
We’re excited to participate in the 17th edition of
the International Agricultural Show in Morocco
(SIAM), a flagship event that brings together key
players from across the agricultural ecosystem.
This is a unique opportunity to showcase our
expertise, exchange with industry leaders, and
deepen our commitment to supporting the
agricultural sector through innovation and
partnership.
DXC CDG Management Seminar : A
Strong Start to FY26!
DXC CDG leaders and managers gathered
at the Conrad Rabat Arzana for the FY26
Kick-Off Seminar, a day dedicated to
collaboration, open dialogue, and team
alignment.
Set in a spirit of exchange and conviviality,
the seminar brought together managers from
across the organization to reflect on strategic
priorities, share perspectives, and build
momentum for the year ahead.
188 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_188.png', 'ONETEAM Newsletter - November 2024'),
('4c23ec89-0fe8-4a66-bc6e-a53b332a1214', 189, 'This seminar marked not only the start of a', 'This seminar marked not only the start of a
new fiscal year but also a renewed
commitment to working together with
purpose, clarity, and shared ambition.
Here’s to a successful and impactful FY26,
together as OneTeam!
Wrapping Up the 1st Edition of
OneTeam Rewards : A Celebration
of Engagement!
We’re proud to wrap up the 1st edition of
OneTeam Rewards, our recognition program
celebrating engagement across DXC CDG.
Nearly 900 colleagues took part of it, and the
Top 10 most engaged won exciting prize
money.
Winners came from Safi, Khouribga,
Casablanca, Rabat, and Kenitra, proving
that this program reaches everyone,
everywhere. From town halls to volunteering,
quizzes, surveys, internal content creation,
and participation in our 14 clubs : every
action counted!
The 2nd edition is already live, and each of
you has a chance to win by staying active
and engaged in Life at DXC. Let’s keep the
spirit alive, because when one wins, we all
win!
A Transparent Look at Our Voice of
Workforce Results : A Step Forward
Together!
During our recent Town Hall, held with our Mazars
partners, we shared the detailed results of the
latest Voice of Workforce (VOW) survey.
92% of colleagues participated, with an overall
satisfaction rate of 91%. The session also covered
the evolution of our scores over the past six years,
highlighting key trends. Next steps include the
creation of detailed action plans by each service
line and department, to ensure we stay in a
dynamic, continuous improvement approach.
189 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_189.png', 'ONETEAM Newsletter - November 2024'),
('27a852f4-9722-4812-b6eb-e3475283e130', 190, 'DXC CDG Launches Its Quality', 'DXC CDG Launches Its Quality
Workbook : A New Milestone in Our
Operational Excellence Journey!
The recent Town Hall held with our quality team
marked an important step in our collective drive to
embed quality standards at the heart of our
operations, with the official launch of the Quality
Workbook.
This new reference guide is now available and
has been designed to help integrate best
practices into daily activities, supporting a culture
of continuous improvement and operational
excellence.
We encourage all teams to review the workbook
carefully and apply its principles consistently,
making quality a shared priority across all our
functions.
You can find the Quality Workbook attached in our
recent communications.
DXC CDG Hits the Road Again, This
Time in Rabat!
Following our energized participation in the
Marrakech International Marathon earlier this
year, our momentum carried us forward to the
Rabat International Marathon last weekend!
Colleagues from across DXC CDG took on the
challenge with enthusiasm, team spirit, and
determination, choosing from three race formats:
10 km, 21 km, and the full 42 km marathon.
Whether running for personal bests or simply
enjoying the shared experience, every step
reflected our values of well-being, resilience,
and togetherness.
Each race was a new challenge, and each finish
line a shared victory. Congratulations to all
participants for proudly representing DXC CDG ,
both in performance and spirit!
DXC CDG Gears Up for JMSE 2025:
Ready to Defend Our Title!
After winning 1st place last year, DXC CDG is
back for the Jeux Marocains du Sport en
190 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_190.png', 'ONETEAM Newsletter - November 2024'),
('b1ef8b8a-da80-439a-ada2-5b2de53b0cef', 191, 'Entreprise this June!', 'Entreprise this June!
We’re building our all-star teams, if you have an
advanced level in any sport listed (from football to
chess), join us now and be part of the challenge.
Disciplines available: Running, Football,
Basketball, Tennis, Table Tennis, Golf, Darts,
Gaming, Baby-foot, Billiards, Chess & Padel.
Registrations are open, let’s go for gold!
Workplace Health: Official
Implementation of Anti-Smoking Law
15-91
As part of strengthening our internal health and safety
policy, we have officially adopted the provisions of Law
15-91, which strictly prohibits smoking in all shared use
areas; including professional, public, enclosed, and
covered spaces, as well as the immediate surroundings
of the building.
This measure reflects a clear intention: to protect the
health of our colleagues, comply with Moroccan
legislation, and move toward a healthier, safer, and
more respectful work environment for all.
Join the Movement – Become a
Digital Explorers Volunteer
Launched two years ago, Digital Explorers is a
program dedicated to promoting digital inclusion
for youth in vulnerable situations and/or living with
disabilities. Active in 7 cities across the Kingdom
with 8 partner NGOs, the initiative offers real
impact through access to digital tools and
learning.
Join our volunteer network and help shape a more
inclusive future through tech and human
connection.
Curious to know more?
Watch the video and hear directly from our
volunteers about their inspiring journey.
191 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_191.png', 'ONETEAM Newsletter - November 2024'),
('0294cfb6-9792-4872-81c3-52bc241ace58', 193, 'Inside GITEX AFRICA 2025: DXC', 'APRIL 2025
Inside GITEX AFRICA 2025: DXC
CDG’s Bold Steps in Innovation
and Partnerships
For the third consecutive year, DXC CDG proudly
participated in GITEX AFRICA, the continent’s
largest tech and startup event, held in vibrant
Marrakech from April 14–16, 2025. Our presence
at this landmark event was packed with
unforgettable moments:
Official Visits: We had the honor of hosting
Mr. Khalid Safir, General Director of CDG,
and Mr. Khalid Aït Taleb, Minister of Health,
engaging in high-level discussions about
digital transformation in healthcare.
Strategic Partnerships: We solidified our
commitment to innovation by signing key
agreements with UIR, 212Founders, and
Faculté Ben M’Sick, strengthening our
collaboration with academia and the wider
innovation ecosystem.
Talkspots & TechTalks: We spotlighted the
impactful JobInTech program and co-
hosted an insightful TechTalk with Nutanix
on crucial topics like data sovereignty and
hybrid cloud.
This year, we took our values of engagement and
sharing to new heights ; offering over 30 exclusive
visitor passes to colleagues who were eager to
experience GITEX first-hand. This initiative turned
the event into a shared experience that amplified
our collective drive for innovation.
Our participation at GITEX AFRICA underscores
DXC CDG’s commitment to driving digital
transformation and shaping the future of tech
across Africa.
193 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_193.png', 'ONETEAM Newsletter - November 2024'),
('053e1b1e-1068-4232-ab5b-647b5bdcd8f7', 194, 'Another Win Worth Celebrating!', 'Another Win Worth Celebrating!
We’re thrilled to announce the signing of a
new strategic contract with MAP, a key
player we’re proud to support in
strengthening their security policy. This
partnership is a clear reflection of our
continued commitment to delivering reliable,
high-impact solutions and building long-term,
trust-based relationships with our clients.It
also marks a valuable addition to our client
portfolio, reinforcing the confidence that the
market places in our expertise and execution
capabilities. Kudos to all the teams involved
in making this happen, yet another
milestone in our journey of growth and
excellence!
Proud to Be Part of the 17th Edition
of SIAM!
We’re excited to participate in the 17th edition of
the International Agricultural Show in Morocco
(SIAM), a flagship event that brings together key
players from across the agricultural ecosystem.
This is a unique opportunity to showcase our
expertise, exchange with industry leaders, and
deepen our commitment to supporting the
agricultural sector through innovation and
partnership.
194 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_194.png', 'ONETEAM Newsletter - November 2024'),
('eead6fec-c068-4479-adfb-1e93c97cc3fa', 195, 'DXC CDG Management Seminar : A', 'DXC CDG Management Seminar : A
Strong Start to FY26!
DXC CDG leaders and managers gathered
at the Conrad Rabat Arzana for the FY26
Kick-Off Seminar; a day of collaboration,
dialogue, and alignment.
Beyond strategic discussions, a key part of
the seminar focused on leadership.
Together, we co-built a Managerial Charter
to strengthen and harmonize our
management practices. This marks an
important step toward more consistent,
empowering leadership across the
organization, with several follow-up actions
planned. The seminar set a strong tone for
FY26, rooted in shared purpose and unity.
Here’s to a successful year, together as
OneTeam!
Wrapping Up the 1st Edition of
OneTeam Rewards : A Celebration
of Engagement!
We’re proud to wrap up the 1st edition of
OneTeam Rewards, our recognition program
celebrating engagement across DXC CDG.
Nearly 900 colleagues took part of it, and the
Top 10 most engaged won exciting prize
money. Winners came from Safi,
Khouribga, Casablanca, Rabat, and
Kenitra, proving that this program reaches
everyone, everywhere. From town halls to
volunteering, quizzes, surveys, internal
content creation, and participation in our 14
clubs : every action counted! The 2nd edition
is already live, and each of you has a chance
to win by staying active and engaged in Life
at DXC. Let’s keep the spirit alive, because
when one wins, we all win!
A Transparent Look at Our Voice of
Workforce Results : A Step Forward
195 of 212', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_195.png', 'ONETEAM Newsletter - November 2024'),
('90f68348-1835-4197-a80c-91b55712621a', 196, 'During our recent Town Hall, held with our Mazars', 'Together!
During our recent Town Hall, held with our Mazars
partners, we shared the detailed results of the
latest Voice of Workforce (VOW) survey. 92% of
colleagues participated, with an overall
satisfaction rate of 91%. The session also covered
the evolution of our scores over the past six years,
highlighting key trends. Next steps include the
creation of detailed action plans by each service
line and department, to ensure we stay in a
dynamic, continuous improvement approach.
DXC CDG Launches Its Quality
Workbook : A New Milestone in Our
Operational Excellence Journey!
The recent Town Hall held with our quality team
marked an important step in our collective drive to
embed quality standards at the heart of our
operations, with the official launch of the Quality
Workbook. This new reference guide is now
available and has been designed to help integrate
best practices into daily activities, supporting a
culture of continuous improvement and
operational excellence. We encourage all teams
to review the workbook carefully and apply its
principles consistently, making quality a shared
priority across all our functions. You can find the
Quality Workbook attached in our recent
communications.
DXC CDG Hits the Road Again, This
Time in Rabat!
Following our energized participation in the
Marrakech International Marathon earlier this
year, our momentum carried us forward to the
Rabat International Marathon last weekend!
Colleagues from across DXC CDG took on the
challenge with enthusiasm, team spirit, and
determination, choosing from three race formats:
10 km, 21 km, and the full 42 km marathon.
Whether running for personal bests or simply
enjoying the shared experience, every step
reflected our values of well-being, resilience,
and togetherness. Each race was a new
challenge, and each finish line a shared victory.
Congratulations to all participants for proudly
representing DXC CDG , both in performance and
spirit!
196 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_196.png', 'ONETEAM Newsletter - November 2024'),
('201d7078-2b2d-428f-a77b-913bba6790e7', 197, 'DXC CDG Gears Up for JMSE 2025:', 'DXC CDG Gears Up for JMSE 2025:
Ready to Defend Our Title!
After winning 1st place last year, DXC CDG is
back for the Jeux Marocains du Sport en
Entreprise this June! We’re building our all-star
teams, if you have an advanced level in any sport
listed (from football to chess), join us now and be
part of the challenge. Disciplines available:
Running, Football, Basketball, Tennis, Table
Tennis, Golf, Darts, Gaming, Baby-foot, Billiards,
Chess & Padel. Registrations are open, let’s go
for gold!
Workplace Health: Official
Implementation of Anti-Smoking Law
15-91
As part of strengthening our internal health and safety
policy, we have officially adopted the provisions of Law
15-91, which strictly prohibits smoking in all shared use
areas; including professional, public, enclosed, and
covered spaces, as well as the immediate surroundings
of the building. This measure reflects a clear intention:
to protect the health of our colleagues, comply with
Moroccan legislation, and move toward a healthier,
safer, and more respectful work environment for all.
197 of 212', 'November 2024', '2024-11-01', 'Wellbeing & Health', 'page_197.png', 'ONETEAM Newsletter - November 2024'),
('7a04fd99-54e9-435c-b00d-ed262668bfeb', 198, 'May 11th - INPT Forum The', 'May 11th - INPT Forum The
Intelligence Edge
Smoking Cessation Workshop
(TBD)
May 15th & 16th - Future Of Work in
Africa Forum
198 of 212', 'November 2024', '2024-11-01', 'Events & Upcoming', 'page_198.png', 'ONETEAM Newsletter - November 2024'),
('e5784dcc-f439-4c57-8f8b-0485d2037cc2', 200, 'Kickoff of FY26 Managerial Charter', 'Kickoff of FY26 Managerial Charter
Program
To strengthen our managerial culture, we
were excited to launch the FY26 program
around our co-created Managerial Charter.
Each month highlights a key value, and it
started in May with the value of “Client &
Business Orientation / Service Mindset”, a
crucial driver for excellence and customer
satisfaction.
Throughout each month, you’ll find engaging
activities like testimonials, quizzes, and
training designed to help you embody each
value in daily work.
Let’s live our values together!
The Digital Adventure Continues
for Your Kids!
English Club Levels Up with
Advanced Class!
Basketball training Is Back, Let’s
Get Ready for JMSE 2025!
200 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_200.png', 'ONETEAM Newsletter - November 2024'),
('58d3f40c-cf9b-41f6-bd8a-a22f369171ef', 201, 'DXC CDG Shines at the Tamouda', 'DXC CDG Shines at the Tamouda
Bay Eco Triathlon!
DXC CDG Hits the Field at the
Morocco Business Cup!
Three teams from DXC CDG proudly took
part in the Morocco Business Cup, taking
place from May 17th to June 29th ,
competing with determination and great
team spirit during the group stage matches.
They gave it their all on the field, showing off
their skills, resilience, and true OneTeam
energy. A big congrats to all the players for
their performance and for representing our
company with pride!
Thank you to everyone who came out to
cheer them on, your support made all the
difference!
Strong Finish in Bouskoura!
Our team of runners proudly represented
DXC.CDG on Sunday, May 11th, at the 15
km race in Bouskoura, led by our energetic
Running Club.
With determination and team spirit, our
runners conquered a tough course
surrounded by nature, all while sharing
smiles and impressive performances!
This event perfectly reflects our ongoing
commitment to well-being and team
cohesion as part of our ESG initiatives.
From Digital Explorers to the USA –
201 of 212', 'November 2024', '2024-11-01', 'Wellbeing & Health', 'page_201.png', 'ONETEAM Newsletter - November 2024'),
('f0431fe5-c7e3-4565-8691-d5ebccb1fa55', 202, 'A Journey of', 'A Journey of
Innovation and Impact
Chess Club Shines with
Remarkable Performances
DXC.CDG at the Future of Work
Forum Africa
DXC.CDG Showcased at Horizons
Maroc Forum in Paris
202 of 212', 'November 2024', '2024-11-01', 'Events & Upcoming', 'page_202.png', 'ONETEAM Newsletter - November 2024'),
('611815d4-72f7-486c-bfba-cd9999b2f4ad', 203, 'DXC CDG Earns CGEM CSR Label!', 'DXC CDG Earns CGEM CSR Label!
Join the Movement & Become a Digital
Explorers Volunteer!
JMSE national tournament – June
20th
203 of 212', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_203.png', 'ONETEAM Newsletter - November 2024'),
('bf36f46f-4431-4fd2-8b9e-d9995ed5bcc9', 205, 'Inside GITEX AFRICA 2025: DXC', 'Inside GITEX AFRICA 2025: DXC
CDG’s Bold Steps in Innovation
and Partnerships
For the third consecutive year, DXC CDG proudly
participated in GITEX AFRICA, the continent’s
largest tech and startup event, held in vibrant
Marrakech from April 14–16, 2025. Our presence
at this landmark event was packed with
unforgettable moments:
Official Visits: We had the honor of
hosting Mr. Khalid Safir, General Director
of CDG, and Mr. Khalid Aït Taleb, Minister
of Health, engaging in high-level
discussions about digital transformation in
healthcare.
Strategic Partnerships: We solidified our
commitment to innovation by signing key
agreements with UIR, 212Founders, and
Faculté Ben M’Sick, strengthening our
collaboration with academia and the wider
innovation ecosystem.
Talkspots & TechTalks: We spotlighted
the impactful JobInTech program and co-
hosted an insightful TechTalk with Nutanix
on crucial topics like data sovereignty and
hybrid cloud.
This year, we took our values of engagement and
sharing to new heights ; offering over 30 exclusive
visitor passes to colleagues who were eager to
experience GITEX first-hand. This initiative turned
the event into a shared experience that amplified
our collective drive for innovation.
Our participation at GITEX AFRICA underscores
DXC CDG’s commitment to driving digital
transformation and shaping the future of tech
across Africa.
Another Win Worth Celebrating!
We’re thrilled to announce the signing of a new
strategic contract with MAP, a key player we’re
proud to support in strengthening their security
policy.
This partnership is a clear reflection of our
continued commitment to delivering reliable, high-
205 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_205.png', 'ONETEAM Newsletter - November 2024'),
('147a33f0-0123-4a23-8df1-cf0f10b0143a', 206, 'impact solutions and building long-term, trust-', 'impact solutions and building long-term, trust-
based relationships with our clients.
It also marks a valuable addition to our client
portfolio, reinforcing the confidence that the
market places in our expertise and execution
capabilities.
Kudos to all the teams involved in making this
happen, yet another milestone in our journey of
growth and excellence!
Proud to Be Part of the 17th Edition
of SIAM!
We’re excited to participate in the 17th edition of
the International Agricultural Show in Morocco
(SIAM), a flagship event that brings together key
players from across the agricultural ecosystem.
This is a unique opportunity to showcase our
expertise, exchange with industry leaders, and
deepen our commitment to supporting the
agricultural sector through innovation and
partnership.
DXC CDG Management Seminar : A
Strong Start to FY26!
DXC CDG leaders and managers gathered
at the Conrad Rabat Arzana for the FY26
Kick-Off Seminar, a day dedicated to
collaboration, open dialogue, and team
alignment.
Set in a spirit of exchange and conviviality,
the seminar brought together managers from
across the organization to reflect on strategic
priorities, share perspectives, and build
momentum for the year ahead.
This seminar marked not only the start of a
206 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_206.png', 'ONETEAM Newsletter - November 2024'),
('6390bf21-d9ca-4320-a49b-a629e2bd7928', 207, 'new fiscal year but also a renewed', 'new fiscal year but also a renewed
commitment to working together with
purpose, clarity, and shared ambition.
Here’s to a successful and impactful FY26,
together as OneTeam!
Wrapping Up the 1st Edition of
OneTeam Rewards : A Celebration
of Engagement!
We’re proud to wrap up the 1st edition of
OneTeam Rewards, our recognition program
celebrating engagement across DXC CDG.
Nearly 900 colleagues took part of it, and the
Top 10 most engaged won exciting prize
money.
Winners came from Safi, Khouribga,
Casablanca, Rabat, and Kenitra, proving
that this program reaches everyone,
everywhere. From town halls to volunteering,
quizzes, surveys, internal content creation,
and participation in our 14 clubs : every
action counted!
The 2nd edition is already live, and each of
you has a chance to win by staying active
and engaged in Life at DXC. Let’s keep the
spirit alive, because when one wins, we all
win!
A Transparent Look at Our Voice of
Workforce Results : A Step Forward
Together!
During our recent Town Hall, held with our Mazars
partners, we shared the detailed results of the
latest Voice of Workforce (VOW) survey.
92% of colleagues participated, with an overall
satisfaction rate of 91%. The session also covered
the evolution of our scores over the past six years,
highlighting key trends. Next steps include the
creation of detailed action plans by each service
line and department, to ensure we stay in a
dynamic, continuous improvement approach.
207 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_207.png', 'ONETEAM Newsletter - November 2024'),
('38e2ab2f-f93d-462c-a310-ce37bf3d025c', 208, 'DXC CDG Launches Its Quality', 'DXC CDG Launches Its Quality
Workbook : A New Milestone in Our
Operational Excellence Journey!
The recent Town Hall held with our quality team
marked an important step in our collective drive to
embed quality standards at the heart of our
operations, with the official launch of the Quality
Workbook.
This new reference guide is now available and
has been designed to help integrate best
practices into daily activities, supporting a culture
of continuous improvement and operational
excellence.
We encourage all teams to review the workbook
carefully and apply its principles consistently,
making quality a shared priority across all our
functions.
You can find the Quality Workbook attached in our
recent communications.
DXC CDG Hits the Road Again, This
Time in Rabat!
Following our energized participation in the
Marrakech International Marathon earlier this
year, our momentum carried us forward to the
Rabat International Marathon last weekend!
Colleagues from across DXC CDG took on the
challenge with enthusiasm, team spirit, and
determination, choosing from three race formats:
10 km, 21 km, and the full 42 km marathon.
Whether running for personal bests or simply
enjoying the shared experience, every step
reflected our values of well-being, resilience,
and togetherness.
Each race was a new challenge, and each finish
line a shared victory. Congratulations to all
participants for proudly representing DXC CDG ,
both in performance and spirit!
208 of 212', 'November 2024', '2024-11-01', 'Quality', 'page_208.png', 'ONETEAM Newsletter - November 2024'),
('735c2475-4d9f-4d82-9e4d-6f98e90b97ac', 209, 'DXC CDG Gears Up for JMSE 2025:', 'DXC CDG Gears Up for JMSE 2025:
Ready to Defend Our Title!
After winning 1st place last year, DXC CDG is
back for the Jeux Marocains du Sport en
Entreprise this June!
We’re building our all-star teams, if you have an
advanced level in any sport listed (from football to
chess), join us now and be part of the challenge.
Disciplines available: Running, Football,
Basketball, Tennis, Table Tennis, Golf, Darts,
Gaming, Baby-foot, Billiards, Chess & Padel.
Registrations are open, let’s go for gold!
Workplace Health: Official
Implementation of Anti-Smoking Law
15-91
As part of strengthening our internal health and safety
policy, we have officially adopted the provisions of Law
15-91, which strictly prohibits smoking in all shared use
areas; including professional, public, enclosed, and
covered spaces, as well as the immediate surroundings
of the building.
This measure reflects a clear intention: to protect the
health of our colleagues, comply with Moroccan
legislation, and move toward a healthier, safer, and
more respectful work environment for all.
Join the Movement – Become a Digital
Explorers Volunteer
Launched two years ago, Digital Explorers is a program
dedicated to promoting digital inclusion for youth in
vulnerable situations and/or living with disabilities.
Active in 7 cities across the Kingdom with 8 partner
NGOs, the initiative offers real impact through access
to digital tools and learning.
Join our volunteer network and help shape a more
inclusive future through tech and human connection.
Curious to know more?
Watch the video and hear directly from our volunteers
about their inspiring journey.
209 of 212', 'November 2024', '2024-11-01', 'Business & Clients', 'page_209.png', 'ONETEAM Newsletter - November 2024'),
('5453f1c3-f50e-4ec9-8628-48ab9aab8b38', 210, 'May 11th - INPT Forum The', 'May 11th - INPT Forum The
Intelligence Edge
May 15th & 16th - Future Of Work in
Africa Forum
Smoking Cessation Workshop
(TBD)
210 of 212', 'November 2024', '2024-11-01', 'Events & Upcoming', 'page_210.png', 'ONETEAM Newsletter - November 2024');

-- ============================================================
-- USEFUL QUERIES FOR YOUR APP
-- ============================================================

-- Get all months (for month filter dropdown):
-- SELECT DISTINCT month, month_date FROM dxc_newsletter_articles ORDER BY month_date DESC;

-- Get all categories (for category filter dropdown):
-- SELECT DISTINCT category FROM dxc_newsletter_articles ORDER BY category;

-- Filter by month:
-- SELECT * FROM dxc_newsletter_articles WHERE month = 'March 2026' ORDER BY page_number;

-- Filter by category:
-- SELECT * FROM dxc_newsletter_articles WHERE category = 'Business & Clients' ORDER BY month_date DESC;

-- Filter by both:
-- SELECT * FROM dxc_newsletter_articles WHERE month = 'March 2026' AND category = 'Quality';

-- Full text search:
-- SELECT * FROM dxc_newsletter_articles WHERE content ILIKE '%GITEX%' ORDER BY month_date DESC;
