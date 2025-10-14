import { pageCopy } from './pageCopy';
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
// Local image assets
import fallbackPlaceholder from '../assets/images/placeholder.jpg';
import heroLogistics from '../assets/images/hero_logistics.jpg';
import heroQuality from '../assets/images/hero_quality.jpg';
import heroTraining from '../assets/images/hero_training.jpg';
import catSpicesHerbs from '../assets/images/cat_spices_herbs.jpg';
import catSeedsGrains from '../assets/images/cat_seeds_grains.jpg';
import catNutsMore from '../assets/images/cat_nuts_more.jpg';
import prodGinger from '../assets/images/ginger.jpg';
import prodHibiscus from '../assets/images/hibiscus.jpg';
import prodBlackStoneFlower from '../assets/images/black_stone_flower.jpg';
import prodTurmeric from '../assets/images/turmeric.jpg';
import prodRedChilli from '../assets/images/red_chilli.jpg';
import prodPepper from '../assets/images/pepper.jpg';
import prodGarlic from '../assets/images/garlic.jpg';
import prodCloves from '../assets/images/cloves.jpg';
import prodSesame from '../assets/images/sesame.jpg';
import prodPopcorn from '../assets/images/popcorn.jpg';
import prodMaizeDerivatives from '../assets/images/maize_derivatives.jpg';
import prodSheaButter from '../assets/images/shea_butter.jpg';
import prodBlackEyedBeans from '../assets/images/black_eyed_beans.jpg';
import prodPeanuts from '../assets/images/peanuts.jpg';
import prodMoringaSeeds from '../assets/images/moringa_seeds.jpg';
import prodCocoaBeans from '../assets/images/cocoa_beans.jpg';
import prodMillet from '../assets/images/millet.jpg';
import prodSoybeans from '../assets/images/soybeans.jpg';
import prodBreadfruit from '../assets/images/breadfruit.jpg';
import prodTigerNuts from '../assets/images/tiger_nuts.jpg';
import prodBitterKola from '../assets/images/bitter_kola.jpg';
import prodKolaNut from '../assets/images/kola_nut.jpg';
import prodAlmond from '../assets/images/almond.jpg';
import prodDates from '../assets/images/dates.jpg';
import prodGumArabic from '../assets/images/gum_arabic.jpg';
import prodPKO from '../assets/images/palm_kernel_oil.jpg';
import prodPeanutOil from '../assets/images/peanut_oil.jpg';
import prodPalmOil from '../assets/images/palm_oil.jpg';
import prodNaturalRubber from '../assets/images/natural_rubber.jpg';
import articleSesame from '../assets/images/article_sesame.jpg';
import articleCashew from '../assets/images/article_cashew.jpg';
import articleExports from '../assets/images/article_exports.jpg';

export const companyInfo = {
  name: 'Global XT Limited',
  tagline: "Delivering Africa's Finest Agro Products to the World",
  phone: '+2348032310051',
  whatsapp: '+2348032310051',
  email: 'info@globalxtltd.com',
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
    image: heroLogistics,
  },
  {
    id: 'quality',
    title: 'Quality-Controlled Supply Chains',
    subtitle:
      'From traceable harvesting to export documentation, we deliver consistent quality that meets global regulatory standards.',
    ctaLabel: 'Explore Products',
    ctaHref: '/products',
    image: heroQuality,
  },
  {
    id: 'training',
    title: 'Export Training & Consulting',
    subtitle:
      'Empower your team with practical export intelligence, compliance know-how, and market entry strategies for agro commodities.',
    ctaLabel: 'View Services',
    ctaHref: '/consulting',
    image: heroTraining,
  },
];

// Fallback is applied if any product forgets to define an image

const createProduct = (data: Partial<Product> & Pick<Product, 'name' | 'slug'>): Product => ({
  slug: data.slug,
  name: data.name,
  summary:
    data.summary ?? 'Premium export-ready lot with traceable sourcing and rigorous QA checks.',
  description:
    data.description ??
    'Our sourcing network ensures each consignment is carefully cleaned, graded, and prepared for international buyers. We supervise field aggregation, processing, and export documentation to guarantee consistency batch after batch.',
  image: data.image ?? fallbackPlaceholder,
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
    heroImage: catSpicesHerbs,
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
        image: prodGinger,
        specifications: ['Moisture: <= 10%', 'Oil content: >= 2%'],
      }),
      createProduct({
        slug: 'dry-hibiscus-flower',
        name: 'Dry Hibiscus Flower',
        summary: 'Sun-dried petals ideal for teas, nutraceuticals, and natural colorants.',
        origins: ['Nigeria'],
        image: prodHibiscus,
        specifications: ['Moisture: <= 8%', 'Color value: >= 14 ASTA'],
      }),
      createProduct({
        slug: 'black-stone-flower',
        name: 'Black Stone Flower',
        summary: 'Hand-picked kalpasi with rich umami profile for gourmet blends.',
        image: prodBlackStoneFlower,
      }),
      createProduct({
        slug: 'turmeric',
        name: 'Fresh & Dried Turmeric',
        summary: 'High-curcumin turmeric fingers and powder for spice houses worldwide.',
        image: prodTurmeric,
        specifications: ['Curcumin: >= 4%', 'Moisture: <= 8%'],
      }),
      createProduct({
        slug: 'red-chilli-pepper',
        name: 'Red Chilli Pepper',
        summary: 'Sun-dried S17/S4 chillies processed to customer heat specifications.',
        image: prodRedChilli,
        specifications: ['Scoville: 30,000 - 50,000 SHU'],
      }),
      createProduct({
        slug: 'yellow-black-pepper',
        name: 'Yellow & Black Pepper',
        summary: 'Cameroon and Nigerian peppercorns with deep aroma and uniform caliber.',
        origins: ['Nigeria', 'Cameroon'],
        image: prodPepper,
        specifications: ['Density: >= 550 g/L'],
      }),
      createProduct({
        slug: 'garlic',
        name: 'Fresh & Dried Garlic',
        summary: 'Processed cloves, flakes, and powder guaranteed for pungency and shelf life.',
        image: prodGarlic,
      }),
      createProduct({
        slug: 'cloves',
        name: 'Cloves',
        summary: 'Whole Zanzibar cloves with vibrant essential oil profile.',
        origins: ['Nigeria', 'Tanzania'],
        image: prodCloves,
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
    heroImage: catSeedsGrains,
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
        image: prodSesame,
        specifications: ['FFA: <= 2%', 'Moisture: <= 7%'],
      }),
      createProduct({
        slug: 'popcorn-maize',
        name: 'Popcorn Maize',
        summary: 'High-expansion butterfly popcorn maize sorted for premium snack manufacturers.',
        image: prodPopcorn,
        specifications: ['Expansion rate: >= 42:1'],
      }),
      createProduct({
        slug: 'maize-corn-derivatives',
        name: 'Maize, Corn Flour, Corn Grits, Cornmeal, & Corn Bran',
        summary: 'Integrated maize derivatives processed to customer mesh sizes and functional requirements.',
        image: prodMaizeDerivatives,
        specifications: ['Moisture: <= 12%', 'Aflatoxin: <= 10 ppb'],
      }),
      createProduct({
        slug: 'shea-butter-oil',
        name: 'Shea Butter & Shea Oil',
        summary: 'Refined and unrefined shea products with consistent texture and fatty acid profile.',
        image: prodSheaButter,
        specifications: ['FFA: <= 1%', 'Moisture: <= 0.2%'],
        logistics: ['Export drums, flexi-tanks, and retail packaging options'],
      }),
      createProduct({
        slug: 'black-eyed-beans',
        name: 'Black Eyed Beans (Cowpea)',
        summary: 'Machine-cleaned cowpea with uniform grain size and reduced weevil damage.',
        image: prodBlackEyedBeans,
        specifications: ['Moisture: <= 12%', 'Defective grains: <= 1%'],
      }),
      createProduct({
        slug: 'peanuts',
        name: 'Peanuts',
        summary: 'Runner and Spanish groundnuts ready for roasting, oil extraction, or peanut butter.',
        image: prodPeanuts,
        specifications: ['Moisture: <= 8%', 'Aflatoxin: <= 4 ppb'],
      }),
      createProduct({
        slug: 'moringa-seeds',
        name: 'Moringa Seeds',
        summary: 'High oil-yield moringa seeds sourced from certified outgrowers.',
        image: prodMoringaSeeds,
        specifications: ['Oil content: >= 35%'],
      }),
      createProduct({
        slug: 'cocoa-beans',
        name: 'Cocoa Beans',
        summary: 'FERCA-certified cocoa beans for bean-to-bar artisans and grinders.',
        image: prodCocoaBeans,
        specifications: ['Moisture: <= 7.5%', 'Mould: <= 4%'],
        logistics: ['Shipped in jute bags with hermetic liners'],
      }),
      createProduct({
        slug: 'millet',
        name: 'Millet',
        summary: 'Pearl and finger millet cleaned for beverages and flour processors.',
        image: prodMillet,
        specifications: ['Moisture: <= 12%'],
      }),
      createProduct({
        slug: 'soybeans',
        name: 'Soybeans',
        summary: 'Non-GMO soybeans suited for crushing, soy flour, and feed applications.',
        image: prodSoybeans,
        specifications: ['Protein: >= 34%', 'Moisture: <= 12%'],
      }),
      createProduct({
        slug: 'breadfruit',
        name: 'Breadfruit',
        summary: 'Sun-dried breadfruit chips milled to flour or supplied whole on demand.',
        image: prodBreadfruit,
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
    heroImage: catNutsMore,
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
        image: prodTigerNuts,
        specifications: ['Moisture: <= 10%'],
      }),
      createProduct({
        slug: 'bitter-kola',
        name: 'Bitter Kola',
        summary: 'Sorted bitter kola nuts prized for nutraceutical and beverage formulations.',
        image: prodBitterKola,
      }),
      createProduct({
        slug: 'kola-nut',
        name: 'Kola Nut',
        summary: 'Red and white kola nuts harvested from GAP-compliant orchards.',
        image: prodKolaNut,
      }),
      createProduct({
        slug: 'almond',
        name: 'Almond',
        summary: 'Premium almond kernels sourced through trusted global alliances.',
        image: prodAlmond,
        origins: ['Nigeria', 'Partner origins'],
      }),
      createProduct({
        slug: 'dates',
        name: 'Dates',
        summary: 'Semi-dry Deglet Noor and Medjool dates packed for retail and ingredient usage.',
        image: prodDates,
      }),
      createProduct({
        slug: 'gum-arabic',
        name: 'Gum Arabic',
        summary: 'Grade A and Kordofan gum arabic for confectionery, beverage, and pharmaceutical applications.',
        image: prodGumArabic,
        specifications: ['Moisture: <= 12%', 'Purity: >= 99%'],
      }),
      createProduct({
        slug: 'palm-kernel-oil',
        name: 'Palm Kernel Oil (PKO)',
        summary: 'Expeller-pressed PKO with consistent FFA profile for soap and oleochemical industries.',
        image: prodPKO,
        specifications: ['FFA: <= 2%'],
        logistics: ['Flexi-tanks, drums, and IBC totes'],
      }),
      createProduct({
        slug: 'peanut-oil',
        name: 'Peanut (Groundnut) Oil',
        summary: 'Refined groundnut oil with golden clarity for culinary and industrial users.',
        image: prodPeanutOil,
      }),
      createProduct({
        slug: 'palm-oil',
        name: 'Palm Oil',
        summary: 'RBD palm oil meeting RSPO-aligned sustainability benchmarks.',
        image: prodPalmOil,
        specifications: ['FFA: <= 5%'],
      }),
      createProduct({
        slug: 'natural-rubber',
        name: 'Natural Rubber',
        summary: 'TSR and RSS grades delivered with inspection certificates for manufacturing.',
        image: prodNaturalRubber,
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
    image: articleSesame,
    author: 'Sarah Johnson',
    readTime: '8 min read',
    tags: ['Sourcing', 'Quality Control', 'West Africa', 'Sesame'],
    content: `
      <p>When sourcing sesame seeds from West Africa, quality is paramount. This comprehensive guide walks you through the essential steps to ensure you're working with the best suppliers and getting premium products.</p>
      
      <h2>1. Farmer Verification and Certification</h2>
      <p>Start by verifying that your potential suppliers work with certified farmers. Look for:</p>
      <ul>
        <li>GAP (Good Agricultural Practices) certification</li>
        <li>Organic certification where applicable</li>
        <li>Traceability documentation from farm to export</li>
        <li>Regular soil testing and quality assessments</li>
      </ul>
      
      <h2>2. Processing Facility Standards</h2>
      <p>The processing facility should meet international standards:</p>
      <ul>
        <li>HACCP certification for food safety</li>
        <li>ISO 22000 or equivalent quality management</li>
        <li>Proper storage facilities with temperature control</li>
        <li>Regular pest control and hygiene protocols</li>
      </ul>
      
      <h2>3. Quality Testing Protocols</h2>
      <p>Ensure comprehensive testing is conducted:</p>
      <ul>
        <li>Moisture content (should be ≤ 7%)</li>
        <li>Foreign matter analysis (≤ 1%)</li>
        <li>Aflatoxin testing (≤ 10 ppb)</li>
        <li>Pesticide residue analysis</li>
        <li>Oil content and purity tests</li>
      </ul>
      
      <h2>4. Export Documentation and Compliance</h2>
      <p>Verify all necessary documentation is in place:</p>
      <ul>
        <li>Phytosanitary certificates</li>
        <li>Certificate of origin</li>
        <li>Quality certificates from accredited labs</li>
        <li>Export permits and licenses</li>
      </ul>
      
      <h2>5. Supply Chain Transparency</h2>
      <p>Work with partners who provide:</p>
      <ul>
        <li>Real-time tracking from farm to port</li>
        <li>Regular updates on harvest conditions</li>
        <li>Transparent pricing and payment terms</li>
        <li>Long-term partnership agreements</li>
      </ul>
      
      <p>By following this checklist, you'll significantly reduce risks and ensure consistent quality in your sesame seed sourcing from West Africa.</p>
    `,
  },
  {
    slug: 'global-cashew-market-trends',
    title: 'Global Cashew & Nut Market Trends 2025',
    summary:
      'A forward look at demand, pricing, and certification requirements impacting nut exporters.',
    category: 'Market Watch',
    publishedOn: 'August 2025',
    image: articleCashew,
    author: 'Michael Chen',
    readTime: '12 min read',
    tags: ['Market Analysis', 'Cashew', 'Nuts', 'Global Trade', 'Pricing'],
    content: `
      <p>The global nut market continues to evolve rapidly, with cashews leading the charge in premium positioning and sustainable sourcing practices.</p>
      
      <h2>Market Size and Growth Projections</h2>
      <p>The global cashew market is projected to reach $7.2 billion by 2025, driven by:</p>
      <ul>
        <li>Increasing health consciousness among consumers</li>
        <li>Growing demand for plant-based proteins</li>
        <li>Expansion of snack and confectionery industries</li>
        <li>Rising disposable incomes in emerging markets</li>
      </ul>
      
      <h2>Regional Demand Patterns</h2>
      <h3>North America</h3>
      <p>Remains the largest market, with premium positioning driving higher margins. Organic and fair-trade certifications are becoming standard requirements.</p>
      
      <h3>Europe</h3>
      <p>Strict quality standards and sustainability requirements are reshaping supply chains. EU regulations on aflatoxin levels continue to tighten.</p>
      
      <h3>Asia-Pacific</h3>
      <p>Fastest growing region, particularly in China and India. Local processing capabilities are expanding rapidly.</p>
      
      <h2>Pricing Trends and Volatility</h2>
      <p>Cashew prices have shown significant volatility due to:</p>
      <ul>
        <li>Weather-related supply disruptions</li>
        <li>Currency fluctuations in producing countries</li>
        <li>Transportation cost increases</li>
        <li>Processing capacity constraints</li>
      </ul>
      
      <h2>Certification Requirements</h2>
      <p>Key certifications becoming essential:</p>
      <ul>
        <li>Fair Trade certification for ethical sourcing</li>
        <li>Organic certification for premium markets</li>
        <li>Rainforest Alliance for sustainability</li>
        <li>HACCP and ISO 22000 for food safety</li>
      </ul>
      
      <h2>Technology and Innovation</h2>
      <p>Digital transformation is reshaping the industry:</p>
      <ul>
        <li>Blockchain for supply chain transparency</li>
        <li>AI-powered quality assessment</li>
        <li>IoT sensors for storage monitoring</li>
        <li>Mobile apps for farmer engagement</li>
      </ul>
      
      <h2>Future Outlook</h2>
      <p>Exporters should focus on:</p>
      <ul>
        <li>Building long-term supplier relationships</li>
        <li>Investing in quality infrastructure</li>
        <li>Adopting sustainable practices</li>
        <li>Diversifying market reach</li>
      </ul>
    `,
  },
  {
    slug: 'nigeria-export-documentation',
    title: 'Export Documentation Essentials for Nigerian Agro Commodities',
    summary:
      'A handy checklist covering NEPC registration, SONCAP, phytosanitary, and shipping paperwork.',
    category: 'Guides',
    publishedOn: 'September 2025',
    image: articleExports,
    author: 'Adebayo Ogunlesi',
    readTime: '15 min read',
    tags: ['Export Documentation', 'Nigeria', 'Compliance', 'NEPC', 'SONCAP'],
    content: `
      <p>Exporting agro commodities from Nigeria requires meticulous attention to documentation. This comprehensive guide covers all essential paperwork to ensure smooth customs clearance and compliance.</p>
      
      <h2>Pre-Export Requirements</h2>
      
      <h3>1. NEPC Registration</h3>
      <p>All exporters must register with the Nigerian Export Promotion Council (NEPC):</p>
      <ul>
        <li>Complete NEPC registration form</li>
        <li>Provide company registration documents (CAC)</li>
        <li>Submit tax clearance certificate</li>
        <li>Obtain NEPC certificate (valid for 2 years)</li>
      </ul>
      
      <h3>2. Product Registration</h3>
      <p>Register your specific products:</p>
      <ul>
        <li>Product registration with NEPC</li>
        <li>Quality specifications documentation</li>
        <li>Origin verification certificates</li>
      </ul>
      
      <h2>Quality and Safety Certifications</h2>
      
      <h3>SONCAP (Standards Organization of Nigeria Conformity Assessment Program)</h3>
      <p>Required for most agro commodities:</p>
      <ul>
        <li>Apply for SONCAP certificate</li>
        <li>Submit product test reports from accredited labs</li>
        <li>Provide manufacturer's declaration</li>
        <li>Pay applicable fees</li>
      </ul>
      
      <h3>Phytosanitary Certificate</h3>
      <p>Issued by the Nigerian Agricultural Quarantine Service (NAQS):</p>
      <ul>
        <li>Apply at least 7 days before shipment</li>
        <li>Provide product samples for inspection</li>
        <li>Submit origin verification documents</li>
        <li>Pay inspection and certificate fees</li>
      </ul>
      
      <h2>Shipping Documentation</h2>
      
      <h3>Commercial Invoice</h3>
      <p>Must include:</p>
      <ul>
        <li>Exporter and importer details</li>
        <li>Product description and specifications</li>
        <li>Quantity, unit price, and total value</li>
        <li>Incoterms and payment terms</li>
        <li>Country of origin</li>
      </ul>
      
      <h3>Packing List</h3>
      <p>Detailed breakdown of:</p>
      <ul>
        <li>Package contents and quantities</li>
        <li>Package dimensions and weights</li>
        <li>Marking and numbering</li>
      </ul>
      
      <h3>Bill of Lading/Air Waybill</h3>
      <p>Transport document issued by carrier</p>
      
      <h2>Financial Documentation</h2>
      
      <h3>Form M</h3>
      <p>Required for all exports over $5,000:</p>
      <ul>
        <li>Complete Form M application</li>
        <li>Attach proforma invoice</li>
        <li>Submit to authorized dealer bank</li>
        <li>Obtain Form M approval</li>
      </ul>
      
      <h3>Certificate of Origin</h3>
      <p>Issued by NEPC or Chamber of Commerce</p>
      
      <h2>Special Requirements by Destination</h2>
      
      <h3>EU Markets</h3>
      <ul>
        <li>Additional phytosanitary requirements</li>
        <li>Pesticide residue testing</li>
        <li>Traceability documentation</li>
      </ul>
      
      <h3>US Markets</h3>
      <ul>
        <li>FDA registration for food products</li>
        <li>Prior notice requirements</li>
        <li>Biosecurity certificates</li>
      </ul>
      
      <h2>Common Pitfalls to Avoid</h2>
      <ul>
        <li>Incomplete or incorrect documentation</li>
        <li>Missing signatures or stamps</li>
        <li>Expired certificates</li>
        <li>Inconsistent information across documents</li>
        <li>Late submission of required documents</li>
      </ul>
      
      <h2>Timeline Planning</h2>
      <p>Allow sufficient time for:</p>
      <ul>
        <li>NEPC registration: 2-3 weeks</li>
        <li>SONCAP certification: 1-2 weeks</li>
        <li>Phytosanitary certificate: 1 week</li>
        <li>Form M processing: 3-5 days</li>
      </ul>
      
      <p>Proper documentation is crucial for successful agro commodity exports from Nigeria. Start early, double-check all requirements, and maintain good relationships with regulatory agencies.</p>
    `,
  },
];

export const contactChannels: ContactChannel[] = [
  { label: 'Phone', value: '+234 803 231 0051', href: 'tel:+2348032310051' },
  { label: 'Email', value: 'info@globalxtltd.com', href: 'mailto:info@globalxtltd.com' },
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







export { pageCopy };

