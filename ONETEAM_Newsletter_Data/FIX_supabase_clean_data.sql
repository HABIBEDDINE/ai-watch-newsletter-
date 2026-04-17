-- ============================================================
-- FIX SCRIPT — Run this in Supabase SQL Editor
-- Replaces all 174 dirty records with 94 clean, deduplicated ones
-- ============================================================

-- Step 1: Delete everything
TRUNCATE TABLE dxc_newsletter_articles;

-- Step 2: Re-insert clean, deduplicated records (94 total)
INSERT INTO dxc_newsletter_articles
  (id, page_number, title, content, month, month_date, category, image_path, newsletter_edition)
VALUES
('f9d4e9ac-8c96-48ae-a1a9-da67a7448190', 2, 'Quality at the Heart of the ADM Seminar', 'Quality at the Heart of the ADM Seminar
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
March 2026: A Month of Strong', 'March 2026', '2026-03-01', 'Quality', 'page_002.png', 'ONETEAM Newsletter - March 2026'),
('4b0d8d38-2ae5-4cbf-b6b5-9a1e30bbf46f', 3, 'Achievements', 'Achievements
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
and the 25th of each month.', 'March 2026', '2026-03-01', 'Quality', 'page_003.png', 'ONETEAM Newsletter - March 2026'),
('e6e83130-fdfa-4860-861b-86ff067bf431', 4, 'A Strategic Partnership with Umnia Bank', 'A Strategic Partnership with Umnia Bank
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
Thank you for your commitment.', 'March 2026', '2026-03-01', 'Learning & Dev', 'page_004.png', 'ONETEAM Newsletter - March 2026'),
('c313c4f4-9fac-4dd7-b0e6-7e0d961ed859', 5, 'Hybrid Work Mode Reminder – Mandatory', 'Hybrid Work Mode Reminder – Mandatory
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
ophthalmological check-ups.', 'March 2026', '2026-03-01', 'Quality', 'page_005.png', 'ONETEAM Newsletter - March 2026'),
('18f5acbb-b307-48f5-ac6b-330a966b4fb9', 6, 'The collaboration also supports the Digital Explorers program, where LNKO', 'The collaboration also supports the Digital Explorers program, where LNKO
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
shared opportunity, bringing meaningful support to those who need it most!', 'March 2026', '2026-03-01', 'Quality', 'page_006.png', 'ONETEAM Newsletter - March 2026'),
('bf908a31-e6cd-42aa-a69b-152c77f6b59d', 7, 'DEI Policy: Toward a Strengthened', 'DEI Policy: Toward a Strengthened
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
Consultant Reporting BI Anglophone H/F', 'March 2026', '2026-03-01', 'Quality', 'page_007.png', 'ONETEAM Newsletter - March 2026'),
('0477fbe4-71f5-40af-8a7f-3d0076bb04dc', 10, 'New Contracts Strengthening Our', 'New Contracts Strengthening Our
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
technological value for its clients in Morocco.', 'February 2026', '2026-02-01', 'Awards & Recognition', 'page_010.png', 'ONETEAM Newsletter - February 2026'),
('f0860894-61c4-4d10-b1fe-252fac65dbc8', 11, 'Delivers Key Strategic Initiatives', 'Delivers Key Strategic Initiatives
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
journeys.', 'February 2026', '2026-02-01', 'Innovation & Tech', 'page_011.png', 'ONETEAM Newsletter - February 2026'),
('3c6c37e2-f133-4e9d-832b-e31da46c6a9d', 12, 'In the Spotlight: Our SVP Lamiaa', 'In the Spotlight: Our SVP Lamiaa
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
Stay tuned, the FY26 VOW launch is coming soon and each one of your voices matter!', 'February 2026', '2026-02-01', 'CSR & Community', 'page_012.png', 'ONETEAM Newsletter - February 2026'),
('9a5f8f9b-8149-4715-bc01-7bcb27fc7078', 13, 'Recharge & Thrive This Ramadan with', 'Recharge & Thrive This Ramadan with
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
innovation to life in your own work.', 'February 2026', '2026-02-01', 'Wellbeing & Health', 'page_013.png', 'ONETEAM Newsletter - February 2026'),
('00f63733-e62b-4057-bc37-0f9ff9f02423', 14, 'Launch of the Partnership with Crédit du', 'Launch of the Partnership with Crédit du
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
sense of purpose are strengthened.', 'February 2026', '2026-02-01', 'Wellbeing & Health', 'page_014.png', 'ONETEAM Newsletter - February 2026'),
('3782cdaf-6dcf-4095-95b2-b987aebd4f0d', 15, 'DXC Cares: Turning Commitment into', 'DXC Cares: Turning Commitment into
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
• Cloud Architect (minimum 15 years experience)', 'February 2026', '2026-02-01', 'CSR & Community', 'page_015.png', 'ONETEAM Newsletter - February 2026'),
('45eb0c44-ecc0-4b61-9aee-203b2043bbff', 19, 'February 2026', 'IIIImmmmppppoooorrrrttttaaaannnncccceeee:::: High
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
excellence.', 'February 2026', '2026-02-01', 'Quality', 'page_019.png', 'ONETEAM Newsletter - February 2026'),
('eb188bcb-bf78-4cdd-afba-c5bfb271000a', 23, 'FY26 VOW Preparations Are Underway!', 'FY26 VOW Preparations Are Underway!
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
this Ramadan.', 'February 2026', '2026-02-01', 'Wellbeing & Health', 'page_023.png', 'ONETEAM Newsletter - February 2026'),
('aed25cb2-d69c-4576-a8df-5430a6274d8c', 24, 'Innovation at Work: Voices That Inspire', 'Innovation at Work: Voices That Inspire
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
collaboration, and mutual support. Taking part in this shared experience offered a different', 'February 2026', '2026-02-01', 'Wellbeing & Health', 'page_024.png', 'ONETEAM Newsletter - February 2026'),
('bd714191-d73f-4e5a-9703-23be0471f349', 25, 'setting to connect, reinforce bonds, and foster collective motivation. Such initiatives contribute', 'setting to connect, reinforce bonds, and foster collective motivation. Such initiatives contribute
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
Capability Manager Intelligence Artificielle H/F.', 'February 2026', '2026-02-01', 'CSR & Community', 'page_025.png', 'ONETEAM Newsletter - February 2026'),
('3d30eb48-7a25-4fb0-9a61-d349a68a705b', 26, 'Product Owner Senior H/F.', 'Product Owner Senior H/F.
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
Umnia Bank Partnership Town Hall – March 10th', 'February 2026', '2026-02-01', 'DEI & Inclusion', 'page_026.png', 'ONETEAM Newsletter - February 2026'),
('f0304257-c992-4b35-963e-f70771843887', 28, 'd’amélioration, garantissant une écoute proactive et continue.', 'd’amélioration, garantissant une écoute proactive et continue.
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
clients et de notre organisation, en garantissant des processus fiables et performants.', 'December 2025', '2025-12-01', 'Quality', 'page_028.png', 'ONETEAM Newsletter - December 2025'),
('9affb55d-cd94-4ef3-9f90-c147e92dff51', 29, 'Un immense merci à toutes les équipes impliquées dans la préparation et le', 'Un immense merci à toutes les équipes impliquées dans la préparation et le
déroulement de cet audit. Votre rigueur, votre collaboration et votre sens du
détail ont été déterminants pour atteindre ce niveau d’excellence. Ensemble,
nous consolidons notre position en tant que référence en matière de qualité et
de conformité
Félicitations à l’équipe Qualité et à l’équipe CISO !
Votre engagement en matière d’éthique et de conformité a été reconnu par
l’attribution du Prix de l’Engagement Éthique & Compliance. Une distinction qui
reflète nos valeurs et notre culture d’intégrité.
Mesure d’efficacité des processus : un levier pour la performance
durable', 'December 2025', '2025-12-01', 'Quality', 'page_029.png', 'ONETEAM Newsletter - December 2025'),
('0f573531-a9d2-4592-a0ed-6005981980b9', 30, 'Pour rester compétitifs et garantir une performance pérenne, il est essentiel de', 'Pour rester compétitifs et garantir une performance pérenne, il est essentiel de
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
impacts et transformer chaque défi en levier de performance', 'December 2025', '2025-12-01', 'Quality', 'page_030.png', 'ONETEAM Newsletter - December 2025'),
('eab3ee57-0a4a-416c-915f-e5af5dde6f14', 31, 'Gestion documentaire', 'Gestion documentaire
✔ Mise à jour de la Labelling Policy
✔ Nouveaux templates disponibles (Tailoring)
✔ Clarification des notions : Politique, Processus, Procédure
✔ Guide pratique : Comment formaliser un processus
Knowledge Base & Bonnes Pratiques', 'December 2025', '2025-12-01', 'Awards & Recognition', 'page_031.png', 'ONETEAM Newsletter - December 2025'),
('71983332-851a-4793-8cbc-e0df537951ad', 32, '✔ Nouvelle version de la Politique Qualité partagée avec tous', '✔ Nouvelle version de la Politique Qualité partagée avec tous
✔ Exemples concrets : Approval Tool pour la validation des documents
✔ Vidéo : Les règles pour réussir vos audits Conseils pratiques pour garantir des
audits efficaces et conformes
Ensemble, faisons de la qualité un moteur d’excellence !
Merci à chacun pour votre implication et votre passion pour la qualité.
Ensemble, nous construisons une organisation performante et durable.
Pour toute question ou suggestion, contactez l’équipe Qualité :
ma-quality@dxc.com
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::TEST - TEST NL
DDDDaaaatttteeee:::: Wednesday, 24 December 2025 at 18:04:00 GMT+01:00
FFFFrrrroooommmm:::: OneTeam Communication
TTTToooo:::: MOUSSALI, Omar
Excellence & Engagement :
Nos réussites Qualité au S1
FY26
Chers collègues,
Ce semestre a été marqué par des
avancées significatives en matière de
qualité et de satisfaction client. Grâce à
l’engagement de chacun, nous avons
atteint des résultats remarquables.
Découvrez sur cette newsletter les faits
marquants et les réussites collectives
qui font notre fierté.
Automatisation du CSAT & Analyse
des retours
Nous avons franchi une étape clé avec
l’automatisation du processus CSAT et
la mise en place d’un reporting
dynamique. Cette évolution nous permet
d’intégrer l’analyse des retours clients
pour identifier les points forts et les
axes d’amélioration, garantissant une
écoute proactive et continue.
Résultat CSAT S1FY26 :', 'December 2025', '2025-12-01', 'Quality', 'page_032.png', 'ONETEAM Newsletter - December 2025'),
('d21371f7-875c-4cef-a907-5100b71d65b0', 33, 'Avec un score CSAT de 4,5, nous avons', 'Avec un score CSAT de 4,5, nous avons
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
préparation et le déroulement de cet', 'December 2025', '2025-12-01', 'Quality', 'page_033.png', 'ONETEAM Newsletter - December 2025'),
('f0a9eca7-d967-4fe4-bdf5-e292aacd50df', 34, 'audit. Votre rigueur, votre', 'audit. Votre rigueur, votre
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
durable', 'December 2025', '2025-12-01', 'Quality', 'page_034.png', 'ONETEAM Newsletter - December 2025'),
('875f1a19-2bea-49d8-9a21-509c6cfaadfc', 35, 'Pour rester compétitifs et garantir une', 'Pour rester compétitifs et garantir une
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
Événements & Sensibilisations', 'December 2025', '2025-12-01', 'Quality', 'page_035.png', 'ONETEAM Newsletter - December 2025'),
('f125068e-d400-4e1e-8f1e-312a738b8f6b', 36, '2 Town Halls réalisés :', '2 Town Halls réalisés :
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
moteur d’excellence !', 'December 2025', '2025-12-01', 'Quality', 'page_036.png', 'ONETEAM Newsletter - December 2025'),
('fa671bba-4d9d-44f1-93f9-9f72ff80f3a6', 43, 'Avec un score CSAT de 4,5, nous', 'Avec un score CSAT de 4,5, nous
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
pppprrrroooommmmoooottttoooorrrr ssssccccoooorrrreeee', 'December 2025', '2025-12-01', 'Quality', 'page_043.png', 'ONETEAM Newsletter - December 2025'),
('242e4995-3d6a-4adc-8ef3-ffb7f31461af', 44, 'Audit Corporate : Une performance', 'Audit Corporate : Une performance
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
notre position en tant que', 'December 2025', '2025-12-01', 'Quality', 'page_044.png', 'ONETEAM Newsletter - December 2025'),
('a9225d89-dbf5-449a-b145-a1714c5fc417', 45, 'référence en matière de qualité et', 'référence en matière de qualité et
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
véritable moteur de performance.', 'December 2025', '2025-12-01', 'Quality', 'page_045.png', 'ONETEAM Newsletter - December 2025'),
('90ba3281-33de-4a7f-a818-2a0ef8568993', 46, 'Ce semestre, nous renforçons nos', 'Ce semestre, nous renforçons nos
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
construisons une organisation', 'December 2025', '2025-12-01', 'Quality', 'page_046.png', 'ONETEAM Newsletter - December 2025'),
('dd4ce0c2-625b-4aab-873a-323a950ff5eb', 47, 'performante et durable.', 'performante et durable.
Pour toute question ou suggestion,
contactez l’équipe Qualité :
ma-quality@dxc.com
If you wish to unsubscribe from our newsletter, click here
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::TEST - TEST NL
DDDDaaaatttteeee:::: Thursday, 18 December 2025 at 13:12:52 GMT+01:00
FFFFrrrroooommmm:::: OneTeam Communication
TTTToooo:::: MOUSSALI, Omar
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
CSAT et la mise en place d’un', 'December 2025', '2025-12-01', 'Quality', 'page_047.png', 'ONETEAM Newsletter - December 2025'),
('c456e378-6b49-49f4-b938-ab00456d7f4c', 48, 'reporting dynamique. Cette', 'reporting dynamique. Cette
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
VVVVooooCCCC VVVVooooiiiicccceeee ooooffff ccccuuuuttttoooommmmeeeerrrr //// NNNNPPPPSSSS NNNNeeeetttt', 'December 2025', '2025-12-01', 'Quality', 'page_048.png', 'ONETEAM Newsletter - December 2025'),
('6361438e-f91e-429e-956a-55b36e28e9f7', 49, 'pppprrrroooommmmoooottttoooorrrr ssssccccoooorrrreeee', 'pppprrrroooommmmoooottttoooorrrr ssssccccoooorrrreeee
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
détail ont été déterminants pour', 'December 2025', '2025-12-01', 'Quality', 'page_049.png', 'ONETEAM Newsletter - December 2025'),
('74c2bc84-b999-4895-b285-d8759d4ba32a', 50, 'atteindre ce niveau d’excellence.', 'atteindre ce niveau d’excellence.
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
véritable moteur de performance.', 'December 2025', '2025-12-01', 'Quality', 'page_050.png', 'ONETEAM Newsletter - December 2025'),
('287c49df-4f51-4226-a3bb-2d10ffc6c3f9', 53, 'Strengthening Global Collaboration: EU Sales Leadership', 'Strengthening Global Collaboration: EU Sales Leadership
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
operational excellence.', 'November 2025', '2025-11-01', 'Innovation & Tech', 'page_053.png', 'ONETEAM Newsletter - November 2025'),
('54cca9a0-ad57-4f02-87e3-f3b332fea0a9', 54, 'Key Achievements: Strengthening Our Role as a Strategic', 'Key Achievements: Strengthening Our Role as a Strategic
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
delivering value, innovation, and operational excellence.', 'November 2025', '2025-11-01', 'Innovation & Tech', 'page_054.png', 'ONETEAM Newsletter - November 2025'),
('73cce070-0799-4b08-97d1-3f24ab19735d', 55, 'Managerial Charter : Leading with Flexibility and Agility', 'Managerial Charter : Leading with Flexibility and Agility
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
Download the app today and stay tuned for more updates!', 'November 2025', '2025-11-01', 'Wellbeing & Health', 'page_055.png', 'ONETEAM Newsletter - November 2025'),
('c012ca46-2830-40d4-afe7-783d49b04e1a', 56, 'Health Insurance Made Clear! Simplifying Benefits for You', 'Health Insurance Made Clear! Simplifying Benefits for You
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
For any follow-up or assistance, colleagues could contact Anas NAJA', 'November 2025', '2025-11-01', 'Wellbeing & Health', 'page_056.png', 'ONETEAM Newsletter - November 2025'),
('b21467c5-fb83-494d-9cf4-5b482cae7dc8', 57, 'Kudos to Our DXC CDG Football Teams for an Outstanding', 'Kudos to Our DXC CDG Football Teams for an Outstanding
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
truly matter.', 'November 2025', '2025-11-01', 'Wellbeing & Health', 'page_057.png', 'ONETEAM Newsletter - November 2025'),
('9e4448da-a349-4ba4-bf2e-77752a290684', 58, 'Ethics & Compliance Week : Key Highlights', 'Ethics & Compliance Week : Key Highlights
The 2025 Ethics & Compliance Week has come to a close, marking a period of
meaningful discussions, shared learning, and collective engagement. Through a
series of enriching activities, this edition offered an opportunity to highlight ethical
practices and reinforce the importance of integrity across our organization.
This week also shone a spotlight on internal best practices and outstanding initiatives.
The Quality and CISO teams were honored with the Ethics & Compliance
Engagement Award, recognizing their strong commitment to integrity and compliance.
Ethics and compliance remain embedded in our daily culture, serving as essential
drivers of trust and performance. You can now revisit the highlights through the recap
video and photo album, available via the thumbnail.', 'November 2025', '2025-11-01', 'Quality', 'page_058.png', 'ONETEAM Newsletter - November 2025'),
('6ba3e6bf-4481-4ca7-8b89-953899df1ad4', 60, 'PPPPrrrriiiioooorrrriiiittttyyyy:::: High', 'FFFFrrrroooommmm:::: Oneteam Communication
PPPPrrrriiiioooorrrriiiittttyyyy:::: High
AAAAttttttttaaaacccchhhhmmmmeeeennnnttttssss::::image001.png, image002.png, image003.png
An Autumn of Engagement, Integrity,
Health & Team Spirit!', 'October 2025', '2025-10-01', 'Wellbeing & Health', 'page_060.png', 'ONETEAM Newsletter - October 2025'),
('729706b2-fffd-42bb-ad50-e5b9dbbd638e', 61, 'Spotlight on Managerial and Relational Effectiveness', 'Spotlight on Managerial and Relational Effectiveness
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
professionals.', 'October 2025', '2025-10-01', 'Wellbeing & Health', 'page_061.png', 'ONETEAM Newsletter - October 2025'),
('6996a2cf-376d-448c-8bbd-902bd42cfd82', 62, 'Team Spirit in Motion: DXC.CDG at the Casablanca Marathon!', 'Team Spirit in Motion: DXC.CDG at the Casablanca Marathon!
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
Go DXC.CDG!', 'October 2025', '2025-10-01', 'Wellbeing & Health', 'page_062.png', 'ONETEAM Newsletter - October 2025'),
('a324bc58-82fc-406c-99fd-55892019f274', 63, 'Ethics & Compliance Week 2025 in Full Swing', 'Ethics & Compliance Week 2025 in Full Swing
Ethics & Compliance Week 2025 is underway, bringing together a series of town halls,
workshops, and interactive activities highlighting our commitment to integrity and compliance.
The first Town Hall focused on the responsible use of AI in our operations and sparked great
discussions among participants. More engaging sessions and initiatives are rolling out
throughout the week, reinforcing our shared values of integrity and collaboration.', 'October 2025', '2025-10-01', 'Events & Upcoming', 'page_063.png', 'ONETEAM Newsletter - October 2025'),
('4a0e13fe-086e-4995-9c6d-d9fa5b89714f', 64, 'Thank You for Making Pink October a Success', 'Thank You for Making Pink October a Success
Heartfelt thank you to everyone for your engagement and exemplary participation
throughout our Pink October awareness campaign.
The initiative began with a charity run in Casablanca, followed by two inspiring
awareness days led in partnership with Dr. Mouncef Belkasmi and the associations
Les Amis du Ruban Rose and Nabd BC2. Together, we explored key topics around
prevention, early detection, and support with empathy and insight.
Your active participation and heartfelt exchanges turned this initiative into a
meaningful moment of sharing and collective awareness, true to our values of care
and solidarity.', 'October 2025', '2025-10-01', 'Business & Clients', 'page_064.png', 'ONETEAM Newsletter - October 2025'),
('0a4dacdf-ae4d-4914-a85f-5c9f84064442', 65, 'Movember – Awareness events for Men’s health – Dates to be announced soon', 'Movember – Awareness events for Men’s health – Dates to be announced soon', 'October 2025', '2025-10-01', 'Wellbeing & Health', 'page_065.png', 'ONETEAM Newsletter - October 2025'),
('911c5d89-1ceb-429d-b751-1a54faeb06a4', 67, 'Offshore Strength: Continuity and New Horizons!', 'Offshore Strength: Continuity and New Horizons!
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
performance.', 'September 2025', '2025-09-01', 'Quality', 'page_067.png', 'ONETEAM Newsletter - September 2025'),
('ddf0d455-fa89-4a64-a9b2-b455767d0355', 68, 'Five Prestigious Offshore Visits Mark a Strong First Semester', 'Five Prestigious Offshore Visits Mark a Strong First Semester
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
requirements.', 'September 2025', '2025-09-01', 'Innovation & Tech', 'page_068.png', 'ONETEAM Newsletter - September 2025'),
('859270c5-b7f4-4ec4-945a-c097d2d2173f', 69, 'Excellence in Action: Our Local Client Successes', 'Excellence in Action: Our Local Client Successes
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
applications, and protect sensitive data while supporting Africa’s digital sovereignty.', 'September 2025', '2025-09-01', 'Quality', 'page_069.png', 'ONETEAM Newsletter - September 2025'),
('9e7c9771-4c27-4ed9-92c0-fac28d901617', 70, 'OneTeam Rewards: Celebrating Our Top Employees!', 'OneTeam Rewards: Celebrating Our Top Employees!
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
Let’s keep cultivating a collaborative and impactful managerial culture at DXC.CDG.', 'September 2025', '2025-09-01', 'Quality', 'page_070.png', 'ONETEAM Newsletter - September 2025'),
('6e1ec847-9d59-4222-9614-d9e6f36a6707', 71, 'DXC.CDG Shines with 4 Brandon Hall Group Excellence Awards!', 'DXC.CDG Shines with 4 Brandon Hall Group Excellence Awards!
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
Get ready to play, connect, and level up your breaks!', 'September 2025', '2025-09-01', 'Awards & Recognition', 'page_071.png', 'ONETEAM Newsletter - September 2025'),
('c8414007-b8ee-4226-bc16-f4bcf83e6187', 75, '« Excellence & Engagement : Nos réussites Qualité S1 FY26 »', '« Excellence & Engagement : Nos réussites Qualité S1 FY26 »
Edito
Chers collègues,
Ce semestre a été marqué par des avancées significatives en matière de qualité et de satisfaction client. Grâce à l’engagement de chacun, nous avons atteint des résultats remarquables. Découvrez sur cette newsletter les faits marquants et les réussites collectives qui font notre fierté.
Automatisation du CSAT & Analyse des retours
Nous avons franchi une étape clé avec l’automatisation du processus CSAT et la mise en place d’un reporting dynamique. Cette évolution nous permet d’intégrer l’analyse des retours clients pour identifier les points forts et les axes d’amélioration, garantissant une écoute proactive et continue.
Résultat CSAT S1FY26 :
Avec un score CSAT de 4,5, nous avons atteint notre objectif de satisfaction client pour le semestre ! Ce résultat reflète la qualité de nos services et l’engagement constant de nos équipes à écouter, comprendre et répondre aux attentes de nos clients. Continuons à capitaliser sur nos points forts et à travailler sur les axes d’amélioration identifiés pour maintenir ce niveau d’excellence. Bravo à tous pour cette performance
Clients et Comptes Très satisfaits 5/5 (S1 FY26)
Nos comptes offshores très satisfaits :
ASAT Account Satisfaction / NPS Net promotor score', 'December 2025', '2025-12-01', 'Quality', 'page_075.png', 'ONETEAM Newsletter - December 2025'),
('37876158-0ed8-40c7-a2da-c812077a8890', 76, 'Nos clients locaux très satisfaits : 5/5', 'Nos clients locaux très satisfaits : 5/5
VoC Voice of cutomer / NPS Net promotor score', 'December 2025', '2025-12-01', 'Business & Clients', 'page_076.png', 'ONETEAM Newsletter - December 2025'),
('9acd0747-2da3-4186-965e-1f3bf129991a', 77, 'Audit Corporate : Une performance exemplaire !', 'Audit Corporate : Une performance exemplaire !', 'December 2025', '2025-12-01', 'Quality', 'page_077.png', 'ONETEAM Newsletter - December 2025'),
('4e513743-3886-4563-a463-1ae63df0e365', 78, '0 Non-conformités majeures', '0 Non-conformités majeures
0 Non-conformités mineures
0 Observations
3 Opportunités d’amélioration
2 Bonnes pratiques identifiées
Ces chiffres témoignent de notre engagement collectif à maintenir des standards élevés et à améliorer continuellement nos méthodes de travail. Les bonnes pratiques mises en avant reflètent notre capacité à répondre efficacement aux attentes de nos clients et de notre organisation, en garantissant des processus fiables et performants.
Un immense merci à toutes les équipes impliquées dans la préparation et le déroulement de cet audit. Votre rigueur, votre collaboration et votre sens du détail ont été déterminants pour atteindre ce niveau d’excellence. Ensemble, nous consolidons notre position en tant que référence en matière de qualité et de conformité
Félicitations à l’équipe Qualité et à l’équipe CISO !
Votre engagement en matière d’éthique et de conformité a été reconnu par l’attribution du Prix de l’Engagement Éthique & Compliance. Une distinction qui reflète nos valeurs et notre culture d’intégrité.', 'December 2025', '2025-12-01', 'Quality', 'page_078.png', 'ONETEAM Newsletter - December 2025'),
('b652bd0d-0933-4f30-936a-66c3f3e82b6c', 79, 'Mesure d’efficacité des processus : un levier pour la performance durable', 'Mesure d’efficacité des processus : un levier pour la performance durable
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
Votre participation est essentielle ! Ensemble, faisons de nos processus un véritable moteur de performance.', 'December 2025', '2025-12-01', 'Quality', 'page_079.png', 'ONETEAM Newsletter - December 2025'),
('1065ad89-3c34-4db9-a009-41a8e3e75a3b', 81, 'Summer 2025 Edition', 'Summer 2025 Edition
Summer Referral Campaign Kicked Off!
The Summer Referral Campaign is now live and runs until mid-August! Throughout
this campaign, job openings were shared regularly by email and on the OneTeam
mobile app. If you know someone who fits one of the needed profiles, send their CV
to dxc-cdg.cooption@dxc.com, your referral could make a real impact!
What’s in it for you?
6,000 rewards points for each referral (instead of 3,000)
A bonus of up to 7,000 MAD if your referral gets hired
It’s the perfect time to help grow our team and earn some great rewards along the
way.', 'August 2025', '2025-08-01', 'Referral & Jobs', 'page_081.png', 'ONETEAM Newsletter - August 2025'),
('5adb8bdf-592a-4eec-9cc7-f81312f22265', 82, 'Update to Travel and Expense Policy – in Morocco & Internationally', 'Update to Travel and Expense Policy – in Morocco & Internationally
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
communication sent to your inbox.', 'August 2025', '2025-08-01', 'Wellbeing & Health', 'page_082.png', 'ONETEAM Newsletter - August 2025'),
('25cebdb2-8922-47b1-bceb-e832bf91dfed', 83, 'DXC CDG Wins JMSE Championship Again!', 'DXC CDG Wins JMSE Championship Again!
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
tasks, it’s about the shared moments together!', 'August 2025', '2025-08-01', 'Wellbeing & Health', 'page_083.png', 'ONETEAM Newsletter - August 2025'),
('b0d3de96-d0e8-43b6-b7d0-32d6b140c2b0', 84, 'Kickoff of FY26 “Managerial Charter” Program', 'Kickoff of FY26 “Managerial Charter” Program
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
showcasing the Chess Club’s excellence and spirit.', 'August 2025', '2025-08-01', 'Learning & Dev', 'page_084.png', 'ONETEAM Newsletter - August 2025'),
('43874474-50f5-421d-ba15-d8e40c23d821', 85, 'OneTeam Rewards: Edition Wrap-Up!', 'OneTeam Rewards: Edition Wrap-Up!
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
MAD, now’s the perfect time to take advantage of the current offer!', 'August 2025', '2025-08-01', 'Wellbeing & Health', 'page_085.png', 'ONETEAM Newsletter - August 2025'),
('e87df4cc-6a94-4fcc-a02b-59efc875725c', 86, 'DXC CDG Earns CGEM CSR Label!', 'DXC CDG Earns CGEM CSR Label!
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
building a more accessible future for all.', 'August 2025', '2025-08-01', 'Awards & Recognition', 'page_086.png', 'ONETEAM Newsletter - August 2025'),
('22a2a9ac-986c-4046-8db5-a3dab2c1b934', 89, 'APRIL 2025', 'APRIL 2025
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
sovereignty and hybrid cloud.', 'April 2025', '2025-04-01', 'Wellbeing & Health', 'page_089.png', 'ONETEAM Newsletter - April 2025'),
('1afb0c1a-371e-4048-99c1-236d48695bf1', 90, 'This year, we took our values of engagement and sharing to new heights ; offering', 'This year, we took our values of engagement and sharing to new heights ; offering
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
innovation and partnership.', 'April 2025', '2025-04-01', 'Innovation & Tech', 'page_090.png', 'ONETEAM Newsletter - April 2025'),
('31c9aa33-091d-4aba-86b8-87ec9c6fdc35', 91, 'DXC CDG Management Seminar : A Strong Start to FY26!', 'DXC CDG Management Seminar : A Strong Start to FY26!
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
alive, because when one wins, we all win!', 'April 2025', '2025-04-01', 'Awards & Recognition', 'page_091.png', 'ONETEAM Newsletter - April 2025'),
('3157c5d9-1930-4c60-ad6c-476a827deed0', 92, 'A Transparent Look at Our Voice of Workforce Results : A Step', 'A Transparent Look at Our Voice of Workforce Results : A Step
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
marathon. Whether running for personal bests or simply enjoying the shared experience,', 'April 2025', '2025-04-01', 'Quality', 'page_092.png', 'ONETEAM Newsletter - April 2025'),
('1b5cdb9f-1edc-44e2-a39e-5a3065610b17', 93, 'every step reflected our values of well-being, resilience, and togetherness. Each race was', 'every step reflected our values of well-being, resilience, and togetherness. Each race was
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
respectful work environment for all.', 'April 2025', '2025-04-01', 'Wellbeing & Health', 'page_093.png', 'ONETEAM Newsletter - April 2025'),
('d6697689-0e9a-443a-aba2-4cb3d694e607', 94, 'May 11th - INPT Forum The May 15th & 16th - Future Of Work', 'May 11th - INPT Forum The May 15th & 16th - Future Of Work
Intelligence Edge in Africa Forum', 'April 2025', '2025-04-01', 'Events & Upcoming', 'page_094.png', 'ONETEAM Newsletter - April 2025'),
('d76204eb-5702-4875-a348-d54a24d1c2ea', 96, 'DXC.CDG launches its AI Center of Excellence', 'DXC.CDG launches its AI Center of Excellence
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
knowledge sharing, and expanding our footprint in the region.', 'February 2025', '2025-02-01', 'Innovation & Tech', 'page_096.png', 'ONETEAM Newsletter - February 2025'),
('671ce05f-b036-4167-90f4-f54b841f68b2', 97, 'A Look Back at Our Recent Town Hall with Leadership', 'A Look Back at Our Recent Town Hall with Leadership
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
everyone! Join a club that inspires you and help us keep this dynamic community thriving!', 'February 2025', '2025-02-01', 'Quality', 'page_097.png', 'ONETEAM Newsletter - February 2025'),
('a30d53f3-07f3-4dbc-b59b-e275dad772f0', 98, 'Join the Cooptation Challenge!', 'Join the Cooptation Challenge!
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
environmental footprint.', 'February 2025', '2025-02-01', 'Wellbeing & Health', 'page_098.png', 'ONETEAM Newsletter - February 2025'),
('ee00506d-df14-413f-9cf3-98f2ce646c98', 99, 'This initiative reflects our commitment to eco-friendly practices and a greener future.', 'This initiative reflects our commitment to eco-friendly practices and a greener future.
Together, we''re fostering a culture of environmental responsibility, one step at a time!
Have you got any other
questions ?
Share them with us below
Click to ASK
Internation Town Hall Voice Of Oneteam
al Women’s Sports Workforce Rewards
Day Company 2025 Final', 'February 2025', '2025-02-01', 'Wellbeing & Health', 'page_099.png', 'ONETEAM Newsletter - February 2025'),
('68b2565a-d168-4a28-a4df-8f57fa1cc258', 101, 'Renewing Our Commitment to Excellence', 'Renewing Our Commitment to Excellence
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
cybersecurity!', 'January 2025', '2025-01-01', 'Quality', 'page_101.png', 'ONETEAM Newsletter - January 2025'),
('e3cc092b-a50a-4afd-a660-27e8f3732493', 102, 'A Strong Start to the Year: Marked by Success', 'A Strong Start to the Year: Marked by Success
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
commitment.', 'January 2025', '2025-01-01', 'Wellbeing & Health', 'page_102.png', 'ONETEAM Newsletter - January 2025'),
('feca004c-5400-42b1-9f69-84b995e83fd4', 103, 'Our colleague Shines at the Seville Marathon 2025', 'Our colleague Shines at the Seville Marathon 2025
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
everyone who attended this important session.', 'January 2025', '2025-01-01', 'Wellbeing & Health', 'page_103.png', 'ONETEAM Newsletter - January 2025'),
('3858d86c-6075-44be-adab-bb129b233f47', 104, 'Our participation to the CESE hearings on Care Economy', 'Our participation to the CESE hearings on Care Economy
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
promote CSR initiatives aligned with our values of inclusion, equality, and sustainability.', 'January 2025', '2025-01-01', 'Quality', 'page_104.png', 'ONETEAM Newsletter - January 2025'),
('4761a0b6-5533-4ca6-9f17-dee985bf6056', 105, 'Have you got any other', 'Have you got any other
questions ?
Share them with us below
Click to ASK
Anti-Tobacco Town Hall with DXC Talks
Awareness CEO Podcast
Mehdi KETTANI', 'January 2025', '2025-01-01', 'Events & Upcoming', 'page_105.png', 'ONETEAM Newsletter - January 2025'),
('3d7da42d-801e-4689-932f-0b3a86936374', 107, 'Total Energy', 'Total Energy
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
exploring new growth opportunities with our clients.', 'December 2024', '2024-12-01', 'Learning & Dev', 'page_107.png', 'ONETEAM Newsletter - December 2024'),
('e9b97135-c826-4c98-8c88-158a8a88808e', 108, 'LondonMarket Team Connects and Embraces', 'LondonMarket Team Connects and Embraces
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
See More', 'December 2024', '2024-12-01', 'Quality', 'page_108.png', 'ONETEAM Newsletter - December 2024'),
('6af97361-d5b1-4cda-9ac0-83aa18d11715', 109, 'December Health and Well-being Awareness at DXC CDG', 'December Health and Well-being Awareness at DXC CDG
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
See More', 'December 2024', '2024-12-01', 'Awards & Recognition', 'page_109.png', 'ONETEAM Newsletter - December 2024'),
('417e970a-91f5-41f4-894a-39ecde87de25', 110, 'Ben M’sik Forum – Casablanca', 'Ben M’sik Forum – Casablanca
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
See More', 'December 2024', '2024-12-01', 'Wellbeing & Health', 'page_110.png', 'ONETEAM Newsletter - December 2024'),
('8dc44d71-3c52-4066-a390-c3fe8a3224c9', 111, 'Have you got any other', 'Have you got any other
questions ?
Share them with us below
Click to ASK
Well-being Launch of DXC Talks
Awareness Oneteam Podcast
Rewards', 'December 2024', '2024-12-01', 'Events & Upcoming', 'page_111.png', 'ONETEAM Newsletter - December 2024'),
('0046517e-058b-42f6-804e-794fa7cfcafb', 113, 'Discover the part 1 of the answers to the', 'Discover the part 1 of the answers to the
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
sustainability goals.', 'November 2024', '2024-11-01', 'CSR & Community', 'page_113.png', 'ONETEAM Newsletter - November 2024'),
('a548aa2a-c577-45a0-9b2f-4efc8a77c55e', 114, 'Kick-Off : 2nd edition of the National Program “Digital Explorers”', 'Kick-Off : 2nd edition of the National Program “Digital Explorers”
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
generation of professionals in the engineering field.', 'November 2024', '2024-11-01', 'DEI & Inclusion', 'page_114.png', 'ONETEAM Newsletter - November 2024'),
('2e922034-6775-46e6-8f19-877a9d1c04cc', 115, 'Movember : Raising Awareness about Men’s Health : Prostate Cancer &', 'Movember : Raising Awareness about Men’s Health : Prostate Cancer &
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
supporting the personal development of our workforce.', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_115.png', 'ONETEAM Newsletter - November 2024'),
('ca3cd546-7863-475d-8350-5e729d977fe5', 116, 'Gen AI Summit 2024 - Insights on AI & Digital Transformation', 'Gen AI Summit 2024 - Insights on AI & Digital Transformation
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
new avenues for collaboration and expansion within the global business landscape.', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_116.png', 'ONETEAM Newsletter - November 2024'),
('7725a5e2-c4d2-4816-a92d-4eb986a5802f', 117, 'FY25 S1 Review: Strengthened Partnership and Shared Trust', 'FY25 S1 Review: Strengthened Partnership and Shared Trust
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
See more', 'November 2024', '2024-11-01', 'Quality', 'page_117.png', 'ONETEAM Newsletter - November 2024'),
('4aef2106-0d37-4160-a1f9-ba03c3032a98', 118, 'Well-being Launch of DXC Talks', 'Well-being Launch of DXC Talks
Awareness Oneteam Podcast
Rewards
TTTThhhhuuuurrrrssssddddaaaayyyy,,,, AAAApppprrrriiiillll 11116666,,,, 2222000022226666 aaaatttt 11110000::::00008888::::33337777 AAAAMMMM GGGGMMMMTTTT++++00001111::::00000000
SSSSuuuubbbbjjjjeeeecccctttt::::ONETEAM NEWSLETTER -NOVEMBER 2024
DDDDaaaatttteeee:::: Friday, 20 December 2024 at 17:11:48 GMT+01:00
FFFFrrrroooommmm:::: Oneteam Communication
PPPPrrrriiiioooorrrriiiittttyyyy::::High', 'November 2024', '2024-11-01', 'Newsletter Content', 'page_118.png', 'ONETEAM Newsletter - November 2024'),
('8cded1d7-babd-4f75-9245-c8cc696ab463', 119, 'Discover the part 1 of the answers to the', 'Discover the part 1 of the answers to the
questions we have received so far, more
answers will be shared in the next editions!
ASK THE CEO', 'November 2024', '2024-11-01', 'Newsletter Content', 'page_119.png', 'ONETEAM Newsletter - November 2024'),
('6cc91be2-4210-4759-8961-ef8acade5c1d', 120, 'Environmental Awareness : Waste Management', 'Environmental Awareness : Waste Management
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
child has the chance to succeed.', 'November 2024', '2024-11-01', 'DEI & Inclusion', 'page_120.png', 'ONETEAM Newsletter - November 2024'),
('460dedb4-3ecd-4422-9a52-e9dea28a5125', 121, 'Rabat Business School: 5th edition Careers Expo. Forum', 'Rabat Business School: 5th edition Careers Expo. Forum
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
both our workplace and society.', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_121.png', 'ONETEAM Newsletter - November 2024'),
('c7d96927-90cd-45ba-a52e-8167c4613c54', 122, 'Special Gathering : JMSE Champions 2024', 'Special Gathering : JMSE Champions 2024
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
evolving digital landscape.', 'November 2024', '2024-11-01', 'Wellbeing & Health', 'page_122.png', 'ONETEAM Newsletter - November 2024'),
('33d67da2-a576-4fbe-87b8-05da4a460cc9', 123, 'AmCham Networking Gala - Thanksgiving Dinner', 'AmCham Networking Gala - Thanksgiving Dinner
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
with the same energy and determination.', 'November 2024', '2024-11-01', 'Awards & Recognition', 'page_123.png', 'ONETEAM Newsletter - November 2024'),
('2fe33693-2d36-4e7c-a0d8-cb5fdb152ed8', 124, 'Client Success Community: Driving Operational Excellence & Customer', 'Client Success Community: Driving Operational Excellence & Customer
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
See more', 'November 2024', '2024-11-01', 'Quality', 'page_124.png', 'ONETEAM Newsletter - November 2024');

-- Step 3: After uploading images to Supabase Storage bucket 'newsletters',
-- run this to set image URLs (replace YOUR_PROJECT_REF):
-- UPDATE dxc_newsletter_articles
-- SET image_url = 'https://owxjvosuwkneuioiiplp.supabase.co/storage/v1/object/public/newsletters/' || image_path;
