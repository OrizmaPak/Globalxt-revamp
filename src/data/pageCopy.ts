export interface HomeCopy {
  exportExcellence: {
    badge: string;
    title: string;
    description: string;
    bullets: string[];
    primaryCta: string;
    secondaryCta: string;
  };
  coreCategories: {
    badge: string;
    apiLabel: string;
  };
  highlightMetrics: Array<{ value: string; label: string; description: string }>;
  productUniverse: {
    badge: string;
    title: string;
    description: string;
    browseCta: string;
  };
  industries: {
    badge: string;
    title: string;
    description: string;
  };
  whyGlobal: {
    badge: string;
    title: string;
    description: string;
  };
  insights: {
    badge: string;
    title: string;
    browseCta: string;
  };
  bottomCta: {
    title: string;
    description: string;
    primaryCta: string;
    secondaryCtaPrefix: string;
  };
}

export interface AboutCopy {
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  company: {
    title: string;
    description: string[];
  };
  corporateFactsTitle: string;
  visionMission: {
    title: string;
    visionTitle: string;
    visionDescription: string;
    missionTitle: string;
    missionDescription: string;
    valuesTitle: string;
    values: string[];
  };
  leadership: {
    title: string;
    description: string;
    ctaDescription: string;
    ctaLabel: string;
  };
  advisory: {
    title: string;
    description: string;
  };
}

export interface ProductsCopy {
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
}

export interface GenericHeroCopy {
  badge: string;
  title: string;
  description: string;
}

export interface ContactCopy {
  hero: GenericHeroCopy;
  form: {
    title: string;
    acknowledgement: string;
    placeholder: string;
    submitLabel: string;
    successMessage: string;
  };
  directContactTitle: string;
  mapTitle: string;
}

export interface ConsultingCopy {
  hero: GenericHeroCopy;
  programsTitle: string;
  training: {
    title: string;
    description: string;
    bookTitle: string;
    bookDescription: string;
    scheduleCta: string;
    whatsappCta: string;
  };
}

export interface ConsultingDetailCopy {
  heroBadge: string;
  valueSectionTitle: string;
  deliverablesTitle: string;
  whyTitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface IndustriesCopy {
  hero: GenericHeroCopy;
  cardCta: string;
}

export interface IndustryDetailCopy {
  heroBadge: string;
  narrative: string[];
  valueTitle: string;
  extraBullets: string[];
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface ResourcesCopy {
  hero: GenericHeroCopy;
  categoriesTitle: string;
  faqsTitle: string;
}

export interface LegalPageCopy {
  hero: GenericHeroCopy;
}

export interface SitemapCopy {
  hero: GenericHeroCopy;
}

export interface NotFoundCopy {
  hero: GenericHeroCopy;
  ctaLabel: string;
}

export interface PageCopy {
  home: HomeCopy;
  about: AboutCopy;
  products: ProductsCopy;
  contact: ContactCopy;
  consulting: ConsultingCopy;
  consultingDetail: ConsultingDetailCopy;
  industries: IndustriesCopy;
  industryDetail: IndustryDetailCopy;
  resources: ResourcesCopy;
  privacy: LegalPageCopy;
  terms: LegalPageCopy;
  sitemap: SitemapCopy;
  notFound: NotFoundCopy;
}

export const pageCopy: PageCopy = {
  home: {
    exportExcellence: {
      badge: 'Export Excellence',
      title:
        'Precision sourcing, intelligence-led trading, and compliant logistics for ambitious agro brands.',
      description:
        'We orchestrate farmer aggregation, processing oversight, inspection, and global fulfilment so that partners can focus on market growth. Each programme is built on transparent data, predictable lead times, and audit-ready documentation.',
      bullets: [
        'Field-to-port visibility with digitally signed quality checkpoints.',
        'Dedicated compliance desk managing export permits, SGS, and phytosanitary certificates.',
        'Structured finance and hedging advisory for high-volume transactions.',
        'Arrival support with buyer onboarding playbooks in 18 destinations.',
      ],
      primaryCta: 'Request a discovery call',
      secondaryCta: 'Chat on WhatsApp',
    },
    coreCategories: {
      badge: 'Core categories',
      apiLabel: 'API ready',
    },
    highlightMetrics: [
      {
        value: '45+',
        label: 'Agro SKUs',
        description: 'Seasonally curated commodities from spices, grains, nuts, oils, and botanicals.',
      },
      {
        value: '18',
        label: 'Export Destinations',
        description: 'Active shipments supported across Europe, Asia, and the Middle East.',
      },
      {
        value: '72h',
        label: 'Quote Turnaround',
        description: 'Average response time for compliant pricing and documentation packs.',
      },
    ],
    productUniverse: {
      badge: 'Product Universe',
      title: 'Trusted agro commodities',
      description:
        'Our structured data layer enables quick integration with your ERP or marketplace. Each product profile includes specifications, origin traceability, and logistics notes for a frictionless onboarding when you switch to live API feeds.',
      browseCta: 'Browse catalog',
    },
    industries: {
      badge: 'Industries',
      title: 'Who we serve',
      description:
        'From FMCG brands to commodity brokers, we plug into your operations as an extension of your sourcing, QA, and logistics teams.',
    },
    whyGlobal: {
      badge: 'Why Global XT',
      title: 'Designed for compliance, speed, and trust',
      description:
        'Every engagement is anchored on measurable quality benchmarks and transparent communication so you can trade with confidence.',
    },
    insights: {
      badge: 'Insights',
      title: 'Latest resources',
      browseCta: 'Visit the knowledge hub',
    },
    bottomCta: {
      title: 'Ready to co-create your supply strategy?',
      description:
        'Book a consultation to align on product specifications, shipment schedules, and documentation workflows tailored to your business.',
      primaryCta: 'Explore our consulting suite',
      secondaryCtaPrefix: 'Call',
    },
  },
  about: {
    hero: {
      badge: 'About Global XT',
      title: 'From local aggregators to global export partners',
      description:
        'Since inception, Global XT Limited has bridged trusted African producers with global food and manufacturing companies. We combine on-ground sourcing expertise, quality assurance, and export compliance to deliver commodities that meet international standards.',
    },
    company: {
      title: 'Our Company',
      description: [
        'Registered in Nigeria (RC {rcNumber}) with export license {exportLicense}, Global XT Limited manages a portfolio of agro commodities spanning spices, grains, nuts, botanicals, and natural oils. We operate a distributed network of aggregation hubs across Nigeria ensuring farm-level traceability and seasonally aligned supply.',
        'Our export desk coordinates inspection, documentation, and freight across major Nigerian ports including Lagos and Port Harcourt. We work with SGS, Bureau Veritas, and other internationally recognized inspection agencies to certify every shipment.',
      ],
    },
    corporateFactsTitle: 'Corporate Facts',
    visionMission: {
      title: 'Vision & Mission',
      visionTitle: 'Vision',
      visionDescription:
        "To be Africa's most reliable partner for sourcing, processing, and exporting agro commodities that power sustainable value chains worldwide.",
      missionTitle: 'Mission',
      missionDescription:
        'We empower growers, processors, and buyers with transparent data, finance-friendly documentation, and agile logistics so they can scale confidently in global markets.',
      valuesTitle: 'Core Values',
      values: [
        'Integrity and transparency in every trade lane.',
        'Quality obsession backed by data-driven monitoring.',
        'Partnership mindset with growers, processors, and buyers.',
        'Sustainability through responsible sourcing and farmer empowerment.',
      ],
    },
    leadership: {
      title: 'Leadership',
      description:
        'Our leadership team blends export compliance, commodity trading, and logistics operations experience. Detailed profiles and governance structure can be shared upon request as part of due diligence packs.',
      ctaDescription:
        'Interested investors and partners can request our latest corporate profile, organizational chart, and ESG framework.',
      ctaLabel: 'Request profile pack',
    },
    advisory: {
      title: 'Expert advisory for export-ready organizations',
      description:
        'Our consulting practice guides companies through export readiness assessments, trade license registration, and hands-on training.',
    },
  },
  products: {
    hero: {
      badge: 'Our Products',
      title: 'Curated agro commodities portfolio',
      description:
        'Each category is structured to be data-driven. Once connected to our API, your storefront or ERP can instantly consume product metadata, specifications, logistics notes, and imagery.',
      primaryCta: 'View category overview',
      secondaryCta: 'Open sample product',
    },
  },
  contact: {
    hero: {
      badge: 'Contact',
      title: "Let's build your export program",
      description:
        'Reach out via phone, WhatsApp, or the contact form. A member of our commercial team will respond within one business day.',
    },
    form: {
      title: 'Send us a message',
      acknowledgement: 'CAPTCHA integration placeholder - production build will connect to reCAPTCHA/Turnstile.',
      placeholder: 'Share product requirements, volumes, and destination market.',
      submitLabel: 'Submit enquiry',
      successMessage:
        'Thank you. Our team will reach out shortly. This is a placeholder acknowledgement until the live backend endpoint is connected.',
    },
    directContactTitle: 'Direct contact',
    mapTitle: 'Global XT Limited map',
  },
  consulting: {
    hero: {
      badge: 'Consulting Suite',
      title: 'Export advisory, training, and brokerage enablement',
      description:
        'Global XT Limited equips businesses with the tools, compliance frameworks, and training required to launch or scale agro commodity exports confidently.',
    },
    programsTitle: 'Custom training programs',
    training: {
      title: 'Custom training programs',
      description:
        'We deliver workshops tailored to your team, covering export finance, documentation, quality systems, and supply-chain risk management. Sessions can be hosted virtually or on site across Nigeria and partner markets.',
      bookTitle: 'Book a strategy call',
      bookDescription:
        'Share your current export goals and challenges. We will prepare a tailored roadmap and next-step recommendations.',
      scheduleCta: 'Schedule consultation',
      whatsappCta: 'Quick WhatsApp chat',
    },
  },
  consultingDetail: {
    heroBadge: 'Consulting',
    valueSectionTitle: 'Where We Add Value',
    deliverablesTitle: 'Programme Deliverables',
    whyTitle: 'Why Global XT',
    ctaPrimary: 'Start a discovery call',
    ctaSecondary: 'View all services',
  },
  industries: {
    hero: {
      badge: 'Industries',
      title: 'Partnerships across the agro value chain',
      description:
        'We collaborate with manufacturers, processors, brokers, and institutional buyers to build predictable supply programs with embedded risk management and documentation support.',
    },
    cardCta: 'Learn more',
  },
  industryDetail: {
    heroBadge: 'Industries',
    narrative: [
      'Global XT integrates seamlessly with {segmentNameLower} by aligning commodity specifications, logistics windows, and compliance obligations to your operating realities. Our programs de-risk supply through field aggregation oversight, QA checkpoints, and third-party inspections, while preserving cost competitiveness.',
      'We deliver transparent documentation and milestone visibility from farm to port - enabling faster onboarding with your internal stakeholders and downstream customers. With a multi-market perspective, we also advise on destination-specific regulatory changes and preferred inspection regimes.',
    ],
    valueTitle: 'Where We Add Value',
    extraBullets: [
      'Export documentation packs tailored per shipment and destination.',
      'Quality frameworks to maintain moisture, FM, and defect thresholds.',
      'Coordinated logistics with forwarders for on-time dispatch.',
    ],
    ctaPrimary: 'Discuss your requirements',
    ctaSecondary: 'View all industries',
  },
  resources: {
    hero: {
      badge: 'Knowledge Hub',
      title: 'Insights, guides, and market intelligence',
      description:
        'Stay ahead with curated briefings, sourcing guides, and regulatory updates across the agro export ecosystem.',
    },
    categoriesTitle: 'Categories',
    faqsTitle: 'Frequently asked questions',
  },
  privacy: {
    hero: {
      badge: 'Privacy',
      title: 'Privacy Policy',
      description:
        "This placeholder outlines where Global XT Limited's privacy policy will reside. Update with details on data collection, usage, retention, and customer rights once the live content is ready.",
    },
  },
  terms: {
    hero: {
      badge: 'Terms of Trade',
      title: 'Terms of Trade',
      description:
        'This placeholder will host terms of trade including payment schedules, quality claims, delivery conditions, indemnities, and arbitration routes.',
    },
  },
  sitemap: {
    hero: {
      badge: 'Sitemap',
      title: 'Sitemap',
      description: 'Navigate Global XT pages quickly using the structured sitemap below.',
    },
  },
  notFound: {
    hero: {
      badge: 'Error',
      title: 'Page not found',
      description: 'The page you are looking for may have been moved or no longer exists.',
    },
    ctaLabel: 'Return home',
  },
};
