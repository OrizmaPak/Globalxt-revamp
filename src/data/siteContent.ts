import type {
  ContactChannel,
  HeroSlide,
  IndustrySegment,
  NavItem,
  Product,
  ProductCategory,
  ResourceArticle,
  ServiceOffering,
} from '../types/content';

export const companyInfo = {
  name: 'Global XT Limited',
  tagline: "Delivering Africa's Finest Agro Products to the World",
  phone: '+2348032310051',
  whatsapp: '+2348032310051',
  email: 'hello@globalxtlimited.com',
  address: 'Lagos & Kano, Nigeria',
  hours: 'Mon - Sat: 8:00am - 6:00pm (WAT)',
  rcNumber: 'RC1745844',
  exportLicense: '0038902',
  mapUrl: 'https://www.google.com/maps/place/Lagos,+Nigeria',
  socialLinks: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com' },
    { label: 'Instagram', href: 'https://www.instagram.com' },
    { label: 'Facebook', href: 'https://www.facebook.com' },
  ],
};

export const heroSlides: HeroSlide[] = [
  {
    id: 'logistics',
    title: 'Global Commodity Sourcing & Export Excellence',
    subtitle:
      'We partner with growers, processors, and global buyers to move premium agro commodities from Africa to the world.',
    ctaLabel: 'Contact Us',
    ctaHref: '/contact',
    image:
      'https://images.unsplash.com/photo-1604335399105-a0c271925355?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'quality',
    title: 'Quality-Controlled Supply Chains',
    subtitle:
      'From traceable harvesting to export documentation, we deliver consistent quality that meets global regulatory standards.',
    ctaLabel: 'Explore Products',
    ctaHref: '/products',
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'training',
    title: 'Export Training & Consulting',
    subtitle:
      'Empower your team with practical export intelligence, compliance know-how, and market entry strategies for agro commodities.',
    ctaLabel: 'View Services',
    ctaHref: '/consulting',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
  },
];

const placeholderImage = (keyword: string) =>
  `https://images.unsplash.com/${keyword}?auto=format&fit=crop&w=1200&q=80`;

const spicesImages = [
  'photo-1601000938259-9c91d3d0d5ce',
  'photo-1461009683693-342af2f2d6ce',
  'photo-1542838132-92c53300491e',
  'photo-1543357480-c60d064b6f90',
];

const grainsImages = [
  'photo-1506806732259-39c2d0268443',
  'photo-1506807803488-8eafc15323c1',
  'photo-1498550744921-75f79806b8a7',
  'photo-1505935428862-770b6f24f629',
];

const nutsImages = [
  'photo-1503481766315-7a586b20f66c',
  'photo-1486887396153-fa416526c108',
  'photo-1518831959414-0b5e37069a86',
  'photo-1459411552884-841db9b3cc2a',
];

const createProduct = (data: Partial<Product> & Pick<Product, 'name' | 'slug'>): Product => ({
  slug: data.slug,
  name: data.name,
  summary:
    data.summary ?? 'Premium export-ready lot with traceable sourcing and rigorous QA checks.',
  description:
    data.description ??
    'Our sourcing network ensures each consignment is carefully cleaned, graded, and prepared for international buyers. We supervise field aggregation, processing, and export documentation to guarantee consistency batch after batch.',
  image: data.image ?? placeholderImage('photo-1501004318641-b39e6451bec6'),
  origins: data.origins ?? ['Nigeria', 'West Africa'],
  specifications:
    data.specifications ?? [
      'Moisture: <= 12%',
      'Foreign matter: <= 1%',
      'Adheres to EU and FDA food safety requirements',
    ],
  packaging:
    data.packaging ?? [
      '25kg - 50kg food-grade bags',
      'Custom private-label packaging on request',
    ],
  logistics: data.logistics,
  applications: data.applications,
});
export const productCategories: ProductCategory[] = [
  {
    slug: 'spices-and-herbs',
    name: 'Spices & Herbs',
    tagline: 'Bold flavors, globally trusted supply',
    summary:
      'From fiery peppers to aromatic botanicals, our spice portfolio is curated for food and nutraceutical brands that demand consistent potency.',
    heroImage: placeholderImage(spicesImages[0]),
    highlights: [
      'Cold-chain and ambient logistics options',
      'Custom grinding and packaging support',
      'Phytosanitary and SGS-certified inspections',
    ],
    products: [
      createProduct({
        slug: 'ginger',
        name: 'Ginger',
        summary: 'Split and whole Nigerian ginger with high oleoresin content.',
        specifications: ['Moisture: <= 10%', 'Oil content: >= 2%'],
      }),
      createProduct({
        slug: 'dry-hibiscus-flower',
        name: 'Dry Hibiscus Flower',
        summary: 'Sun-dried petals ideal for teas, nutraceuticals, and natural colorants.',
        origins: ['Nigeria'],
        specifications: ['Moisture: <= 8%', 'Color value: >= 14 ASTA'],
      }),
      createProduct({
        slug: 'black-stone-flower',
        name: 'Black Stone Flower',
        summary: 'Hand-picked kalpasi with rich umami profile for gourmet blends.',
      }),
      createProduct({
        slug: 'turmeric',
        name: 'Fresh & Dried Turmeric',
        summary: 'High-curcumin turmeric fingers and powder for spice houses worldwide.',
        specifications: ['Curcumin: >= 4%', 'Moisture: <= 8%'],
      }),
      createProduct({
        slug: 'red-chilli-pepper',
        name: 'Red Chilli Pepper',
        summary: 'Sun-dried S17/S4 chillies processed to customer heat specifications.',
        specifications: ['Scoville: 30,000 - 50,000 SHU'],
      }),
      createProduct({
        slug: 'yellow-black-pepper',
        name: 'Yellow & Black Pepper',
        summary: 'Cameroon and Nigerian peppercorns with deep aroma and uniform caliber.',
        origins: ['Nigeria', 'Cameroon'],
        specifications: ['Density: >= 550 g/L'],
      }),
      createProduct({
        slug: 'garlic',
        name: 'Fresh & Dried Garlic',
        summary: 'Processed cloves, flakes, and powder guaranteed for pungency and shelf life.',
      }),
      createProduct({
        slug: 'cloves',
        name: 'Cloves',
        summary: 'Whole Zanzibar cloves with vibrant essential oil profile.',
        origins: ['Nigeria', 'Tanzania'],
        specifications: ['Headless pods: <= 7%'],
      }),
    ],
  },
  {
    slug: 'seeds-and-grains',
    name: 'Seeds & Grains',
    tagline: 'Traceable consignments for millers and processors',
    summary:
      'We aggregate and process cereal grains, oil seeds, and legumes that meet exacting requirements for FMGC and industrial buyers.',
    heroImage: placeholderImage(grainsImages[0]),
    highlights: [
      'Moisture-controlled storage facilities',
      'Dedicated QA laboratories for each shipment',
      'Bulk and bagged cargo-ready documentation',
    ],
    products: [
      createProduct({
        slug: 'sesame-seeds',
        name: 'Sesame Seeds',
        summary: 'Hulled and natural white sesame seeds for tahini, oil presses, and bakery brands.',
        image: placeholderImage(grainsImages[1]),
        specifications: ['FFA: <= 2%', 'Moisture: <= 7%'],
      }),
      createProduct({
        slug: 'popcorn-maize',
        name: 'Popcorn Maize',
        summary: 'High-expansion butterfly popcorn maize sorted for premium snack manufacturers.',
        image: placeholderImage(grainsImages[2]),
        specifications: ['Expansion rate: >= 42:1'],
      }),
      createProduct({
        slug: 'maize-corn-derivatives',
        name: 'Maize, Corn Flour, Corn Grits, Cornmeal, & Corn Bran',
        summary: 'Integrated maize derivatives processed to customer mesh sizes and functional requirements.',
        image: placeholderImage(grainsImages[3]),
        specifications: ['Moisture: <= 12%', 'Aflatoxin: <= 10 ppb'],
      }),
      createProduct({
        slug: 'shea-butter-oil',
        name: 'Shea Butter & Shea Oil',
        summary: 'Refined and unrefined shea products with consistent texture and fatty acid profile.',
        image: placeholderImage('photo-1504674900247-0877df9cc836'),
        specifications: ['FFA: <= 1%', 'Moisture: <= 0.2%'],
        logistics: ['Export drums, flexi-tanks, and retail packaging options'],
      }),
      createProduct({
        slug: 'black-eyed-beans',
        name: 'Black Eyed Beans (Cowpea)',
        summary: 'Machine-cleaned cowpea with uniform grain size and reduced weevil damage.',
        image: placeholderImage('photo-1486887396153-fa416526c108'),
        specifications: ['Moisture: <= 12%', 'Defective grains: <= 1%'],
      }),
      createProduct({
        slug: 'peanuts',
        name: 'Peanuts',
        summary: 'Runner and Spanish groundnuts ready for roasting, oil extraction, or peanut butter.',
        image: placeholderImage('photo-1498837167922-ddd27525d352'),
        specifications: ['Moisture: <= 8%', 'Aflatoxin: <= 4 ppb'],
      }),
      createProduct({
        slug: 'moringa-seeds',
        name: 'Moringa Seeds',
        summary: 'High oil-yield moringa seeds sourced from certified outgrowers.',
        image: placeholderImage('photo-1559261384-7952cf6d30fb'),
        specifications: ['Oil content: >= 35%'],
      }),
      createProduct({
        slug: 'cocoa-beans',
        name: 'Cocoa Beans',
        summary: 'FERCA-certified cocoa beans for bean-to-bar artisans and grinders.',
        image: placeholderImage('photo-1524592094714-0f0654e20314'),
        specifications: ['Moisture: <= 7.5%', 'Mould: <= 4%'],
        logistics: ['Shipped in jute bags with hermetic liners'],
      }),
      createProduct({
        slug: 'millet',
        name: 'Millet',
        summary: 'Pearl and finger millet cleaned for beverages and flour processors.',
        image: placeholderImage('photo-1511690656952-34342bb7c2f2'),
        specifications: ['Moisture: <= 12%'],
      }),
      createProduct({
        slug: 'soybeans',
        name: 'Soybeans',
        summary: 'Non-GMO soybeans suited for crushing, soy flour, and feed applications.',
        image: placeholderImage('photo-1502740479091-635887520276'),
        specifications: ['Protein: >= 34%', 'Moisture: <= 12%'],
      }),
      createProduct({
        slug: 'breadfruit',
        name: 'Breadfruit',
        summary: 'Sun-dried breadfruit chips milled to flour or supplied whole on demand.',
        image: placeholderImage('photo-1504671983453-94c01c0a1ccc'),
        logistics: ['Bulk cartons and frozen logistics available'],
      }),
    ],
  },
  {
    slug: 'nuts-and-more',
    name: 'Nuts & More',
    tagline: 'High-value botanicals and specialty commodities',
    summary:
      'Diversify your sourcing portfolio with traceable nuts, botanicals, resins, and natural oils trusted by global manufacturers.',
    heroImage: placeholderImage(nutsImages[0]),
    highlights: [
      'Ethically sourced from farmer cooperatives',
      'Value-added processing and crush services',
      'Flexible order volumes and financing support',
    ],
    products: [
      createProduct({
        slug: 'tiger-nuts',
        name: 'Tiger Nuts',
        summary: 'Ready-to-process tiger nuts for plant-based milk and healthy snacks.',
        image: placeholderImage(nutsImages[1]),
        specifications: ['Moisture: <= 10%'],
      }),
      createProduct({
        slug: 'bitter-kola',
        name: 'Bitter Kola',
        summary: 'Sorted bitter kola nuts prized for nutraceutical and beverage formulations.',
        image: placeholderImage(nutsImages[2]),
      }),
      createProduct({
        slug: 'kola-nut',
        name: 'Kola Nut',
        summary: 'Red and white kola nuts harvested from GAP-compliant orchards.',
        image: placeholderImage('photo-1444858291040-58f756a3bdd6'),
      }),
      createProduct({
        slug: 'almond',
        name: 'Almond',
        summary: 'Premium almond kernels sourced through trusted global alliances.',
        image: placeholderImage('photo-1511389026070-a14ae610a1be'),
        origins: ['Nigeria', 'Partner origins'],
      }),
      createProduct({
        slug: 'dates',
        name: 'Dates',
        summary: 'Semi-dry Deglet Noor and Medjool dates packed for retail and ingredient usage.',
        image: placeholderImage('photo-1524350876685-274059332603'),
      }),
      createProduct({
        slug: 'gum-arabic',
        name: 'Gum Arabic',
        summary: 'Grade A and Kordofan gum arabic for confectionery, beverage, and pharmaceutical applications.',
        image: placeholderImage('photo-1524592094714-0f0654e20314'),
        specifications: ['Moisture: <= 12%', 'Purity: >= 99%'],
      }),
      createProduct({
        slug: 'palm-kernel-oil',
        name: 'Palm Kernel Oil (PKO)',
        summary: 'Expeller-pressed PKO with consistent FFA profile for soap and oleochemical industries.',
        image: placeholderImage('photo-1441999732824-210c2bb97100'),
        specifications: ['FFA: <= 2%'],
        logistics: ['Flexi-tanks, drums, and IBC totes'],
      }),
      createProduct({
        slug: 'peanut-oil',
        name: 'Peanut (Groundnut) Oil',
        summary: 'Refined groundnut oil with golden clarity for culinary and industrial users.',
        image: placeholderImage('photo-1441999732824-210c2bb97100'),
      }),
      createProduct({
        slug: 'palm-oil',
        name: 'Palm Oil',
        summary: 'RBD palm oil meeting RSPO-aligned sustainability benchmarks.',
        image: placeholderImage('photo-1423483641154-5411ec9c0ddf'),
        specifications: ['FFA: <= 5%'],
      }),
      createProduct({
        slug: 'natural-rubber',
        name: 'Natural Rubber',
        summary: 'TSR and RSS grades delivered with inspection certificates for manufacturing.',
        image: placeholderImage('photo-1422207239328-29f838542f95'),
        specifications: ['Dirt: <= 0.08%', 'Ash: <= 0.5%'],
      }),
    ],
  },
];

export const serviceOfferings: ServiceOffering[] = [
  {
    slug: 'world-class-export-consulting-service',
    name: 'World-Class Export Consulting Service',
    summary:
      'Advisory support that de-risks your agro export operations from sourcing through fulfillment.',
    details: [
      'Market entry strategies tailored to your product portfolio.',
      'Compliance checklists covering documentation, banking, and logistics.',
      'Supplier due diligence and on-ground inspection services.',
    ],
  },
  {
    slug: 'export-training',
    name: 'Export Training',
    summary:
      'Practical workshops and coaching for teams entering or scaling agro exports.',
    details: [
      'Curriculum covering export finance, quality systems, and INCOTERMS.',
      'Hybrid delivery (virtual + onsite field immersion).',
      'Certification of completion for teams and partners.',
    ],
  },
  {
    slug: 'trade-licence-registrations',
    name: 'Trade Licence Registrations',
    summary:
      'Fast-track documentation and regulatory approvals for new exporters.',
    details: [
      'Registrar filings, export permits, and compliance renewals.',
      'Agency liaison with NEPC, Customs, and Standards Organization.',
    ],
  },
  {
    slug: 'brokerage-program',
    name: 'Brokerage Program',
    summary:
      'Leverage our buyer and supplier network to structure profitable commodity deals.',
    details: [
      'Structured brokerage agreements with shared documentation.',
      'Performance monitoring and dispute resolution support.',
    ],
  },
];

export const industrySegments: IndustrySegment[] = [
  {
    slug: 'fmcgs',
    name: 'FMCGs',
    summary:
      'Supporting consumer brands with consistent ingredients that delight end-customers.',
    opportunities: [
      'Seasonally aligned production scheduling.',
      'Private label and white-label formulations.',
      'Integrated QA and traceability reporting.',
    ],
  },
  {
    slug: 'agro-processors',
    name: 'Agro Processors',
    summary: 'Raw materials tailored to your crushing, milling, or refining needs.',
    opportunities: [
      'Technical specifications matched to processing assets.',
      'On-demand lab tests and COA documentation.',
      'Logistics coordination to minimize downtime.',
    ],
  },
  {
    slug: 'export-markets',
    name: 'Export Markets',
    summary: 'Fulfillment of international purchase orders with end-to-end compliance.',
    opportunities: [
      'Flexible INCOTERMS (FOB, CFR, CIF, DAP).',
      'Banking instruments and trade finance advisory.',
      'Destination market intelligence and onboarding support.',
    ],
  },
  {
    slug: 'commodity-brokers',
    name: 'Commodity Brokers',
    summary: 'Partner with Global XT to extend your sourcing capacity across Africa.',
    opportunities: [
      'Access to vetted supplier and buyer pipelines.',
      'Shared due diligence data room.',
      'Co-branded market activation resources.',
    ],
  },
];

export const resourceArticles: ResourceArticle[] = [
  {
    slug: 'sourcing-high-quality-sesame-seeds',
    title: 'How to Source High-Quality Sesame Seeds from West Africa',
    summary:
      'Five-point checklist for evaluating farmers, processors, and export partners before you commit.',
    category: 'Insights',
    publishedOn: 'July 2025',
  },
  {
    slug: 'global-cashew-market-trends',
    title: 'Global Cashew & Nut Market Trends 2025',
    summary:
      'A forward look at demand, pricing, and certification requirements impacting nut exporters.',
    category: 'Market Watch',
    publishedOn: 'August 2025',
  },
  {
    slug: 'nigeria-export-documentation',
    title: 'Export Documentation Essentials for Nigerian Agro Commodities',
    summary:
      'A handy checklist covering NEPC registration, SONCAP, phytosanitary, and shipping paperwork.',
    category: 'Guides',
    publishedOn: 'September 2025',
  },
];

export const contactChannels: ContactChannel[] = [
  { label: 'Phone', value: '+234 803 231 0051', href: 'tel:+2348032310051' },
  { label: 'Email', value: 'hello@globalxtlimited.com', href: 'mailto:hello@globalxtlimited.com' },
  { label: 'WhatsApp', value: '+234 803 231 0051', href: 'https://wa.me/2348032310051' },
];

export const whyChooseUs = [
  {
    title: 'Quality Assurance',
    description:
      'Dedicated QA officers supervise harvest aggregation, cleaning, and documentation for every order.',
    icon: 'ShieldCheckIcon',
  },
  {
    title: 'Competitive Pricing',
    description:
      'Lean supply chains and strategic partnerships help us win on price without compromising standards.',
    icon: 'CurrencyDollarIcon',
  },
  {
    title: 'Global Delivery',
    description:
      'Network of freight forwarders ensuring on-time deliveries to seaports and airports worldwide.',
    icon: 'GlobeAltIcon',
  },
  {
    title: 'Sustainable Practices',
    description:
      'We champion farmer capacity building, regenerative agriculture, and ethical trade principles.',
    icon: 'SparklesIcon',
  },
];

export const quickLinks: NavItem[] = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Trade', path: '/terms' },
  { label: 'Sitemap', path: '/sitemap' },
];

export const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  {
    label: 'About Us',
    path: '/about',
    children: [
      { label: 'Our Company', path: '/about#company' },
      { label: 'Vision & Mission', path: '/about#vision' },
      { label: 'Our Team', path: '/about#team' },
    ],
  },
  {
    label: 'Products',
    path: '/products',
    megaMenu: productCategories.map((category) => ({
      title: category.name,
      items: [
        { label: `Explore ${category.name}`, path: `/products/${category.slug}` },
        ...category.products.map((product) => ({
          label: product.name,
          path: `/products/${category.slug}/${product.slug}`,
          description: product.summary,
        })),
      ],
    })),
  },
  {
    label: 'Consulting',
    path: '/consulting',
    children: serviceOfferings.map((service) => ({
      label: service.name,
      path: `/consulting#${service.slug}`,
      description: service.summary,
    })),
  },
  {
    label: 'Industries',
    path: '/industries',
    children: industrySegments.map((industry) => ({
      label: industry.name,
      path: `/industries#${industry.slug}`,
      description: industry.summary,
    })),
  },
  {
    label: 'Resources',
    path: '/resources',
    children: [
      { label: 'Blog / Newsroom', path: '/resources#blog' },
      { label: 'FAQs', path: '/resources#faqs' },
    ],
  },
  { label: 'Help', path: '/contact' },
];





