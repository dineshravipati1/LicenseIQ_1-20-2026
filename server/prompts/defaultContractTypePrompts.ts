export const DEFAULT_EXTRACTION_PROMPTS: Record<string, {
  extractionPrompt: string;
  ruleExtractionPrompt: string;
  erpMappingPrompt: string;
  sampleExtractionOutput: string;
}> = {
  'direct_sales': {
    extractionPrompt: `You are a contract analysis AI specializing in Channel Reseller and Commission Agreements. Extract all parties, dates, territories, and key terms.

**CRITICAL - EXTRACT THESE DATES**:
- effectiveDate: The start date when the agreement becomes effective (format: YYYY-MM-DD)
- expirationDate: The end date or expiration date (format: YYYY-MM-DD)
Look for phrases like "Effective Date:", "effective as of", "commencing on", "Term:", "Initial term"

Focus on:
- Company and Channel Partner/Reseller identification (names, addresses, EINs)
- Deal Registration process and approval criteria
- Territory assignments (North America, EMEA, APAC, etc.)
- Partner tiers and certification levels
- Performance metrics and quotas
- Term length (e.g., "two (2) years") and renewal provisions

Return structured JSON with entities and relationships including effectiveDate and expirationDate.`,
    
    ruleExtractionPrompt: `Extract ALL commission and payment rules from this Channel Reseller/Commission Agreement.

**CRITICAL - MULTI-YEAR COMMISSION STRUCTURES**:
When you see commissions that vary by year (Year 1, Year 2, Year 3), extract each year as a separate tier.

Look for:
- REGISTERED DEAL commissions (partner-originated opportunities)
  - Year 1 Subscription Fees: typically 10-15%
  - Year 2 Subscription Fees: typically 6-10%
  - Year 3+ Subscription Fees: typically 3-5%
- INFLUENCED DEAL commissions (partner-assisted but not originated)
  - Lower rates than registered deals
- RENEWAL commissions (ongoing customer renewals)
  - Partner of Record commissions
- PERFORMANCE BONUSES
  - Quarterly ARR thresholds (e.g., $500K New ARR triggers bonus)
  - Bonus commission percentages (additional 1-3%)
- CHARGEBACK provisions
  - Customer non-payment clawbacks
  - Refund handling
- Net Subscription Fee calculations

**EXTRACT EACH COMMISSION TYPE SEPARATELY** - Registered, Influenced, and Renewal should be separate rules.

**RULE PRIORITY**: Assign lower priority numbers (1-3) to specific rules (e.g., "Registered Deal - Year 1") and higher numbers (7-10) to generic/fallback rules.

Return each rule with: ruleType, ruleName, description, conditions, calculation, sourceSpan, confidence, priority.`,
    
    erpMappingPrompt: `Map Channel Reseller/Commission terms to ERP system fields.
Common mappings: 
- Partner → PARTNER_ID
- Deal Type → DEAL_TYPE_CODE (Registered/Influenced/Renewal)
- Subscription ARR → SUBSCRIPTION_ARR
- Commission Rate → COMMISSION_PCT
- Year → CONTRACT_YEAR
- Bonus Threshold → BONUS_THRESHOLD`,
    
    sampleExtractionOutput: `{
  "basicInfo": {
    "documentType": "distribution",
    "contractTitle": "Channel Reseller & Commission Agreement",
    "hasRoyaltyTerms": true,
    "parties": {
      "party1": {"name": "Vontair Mobility Systems, Inc.", "role": "Company"},
      "party2": {"name": "AlphaChannel Solutions Ltd.", "role": "Partner"}
    }
  },
  "rules": [
    {
      "ruleType": "tiered",
      "ruleName": "Registered Deal Commission",
      "calculation": {
        "tiers": [
          {"year": 1, "rate": 12.0},
          {"year": 2, "rate": 8.0},
          {"year": 3, "rate": 4.0}
        ]
      },
      "confidence": 0.95
    },
    {
      "ruleType": "percentage",
      "ruleName": "Performance Bonus",
      "calculation": {"rate": 2.0, "threshold": 500000},
      "conditions": {"quarterlyNewARR": ">=500000"},
      "confidence": 0.92
    }
  ]
}`
  },

  'distributor': {
    extractionPrompt: `You are a contract analysis AI specializing in Distributor Agreements. Extract all parties, dates, territories, and key terms.

**CRITICAL - EXTRACT THESE DATES**:
- effectiveDate: The start date when the agreement becomes effective (format: YYYY-MM-DD)
- expirationDate: The end date or expiration date (format: YYYY-MM-DD)
Look for phrases like "Effective Date:", "entered into as of", "Initial term is X years"

Focus on:
- Manufacturer and Distributor identification (company names, addresses, states)
- Exclusive vs Non-exclusive appointment
- Territory assignments with specific states/regions (e.g., "Northeast Region: MA, CT, RI, NH, VT, ME")
- Product lines and categories covered
- Price protection terms
- Sales reporting requirements (POS data)
- Audit rights and frequency
- Term length (e.g., "three years") and renewal provisions

Return structured JSON with entities and relationships including effectiveDate and expirationDate.`,
    
    ruleExtractionPrompt: `Extract ALL pricing, discount, rebate, and payment rules from this Distributor Agreement.

**CRITICAL - VOLUME REBATE PROGRAMS**:
Extract ALL tiers from rebate tables. When you see annual sales ranges, extract each range as a tier.

Look for:
- STANDARD DISTRIBUTOR DISCOUNT off List Price (e.g., 20% off)
- PRICE FLOOR restrictions (e.g., "cannot resell below 75% of List Price")
- VOLUME REBATE TIERS based on Net Eligible Sales:
  - $0 – $999,999: X%
  - $1,000,000 – $2,499,999: X%
  - $2,500,000 – $4,999,999: X%
  - $5,000,000+: X%
- MARKET DEVELOPMENT FUNDS (MDF)
  - Percentage of annual net eligible sales (e.g., 1.5%)
  - Claim submission deadlines (e.g., 90 days)
- PRICE PROTECTION on inventory (e.g., 60 days prior to price reduction)
- CHARGEBACK formulas: (Old List Price – New List Price) × Eligible Units
- Payment terms (Net 30, Net 45, etc.)
- Territory eligibility restrictions

**EXTRACT ALL REBATE TIERS** - If there are 4 tiers, create 4 tier entries.

Return each rule with: ruleType, ruleName, description, conditions, calculation, sourceSpan, confidence.`,
    
    erpMappingPrompt: `Map Distributor Agreement terms to ERP fields.
Common mappings: 
- Distributor → CUSTOMER_ID
- Territory → REGION_CODE
- List Price → LIST_PRICE
- Discount → DISCOUNT_PCT
- Net Eligible Sales → NET_SALES
- Rebate Tier → REBATE_TIER
- MDF Allocation → MDF_AMOUNT
- Chargeback → CHARGEBACK_AMOUNT`,
    
    sampleExtractionOutput: `{
  "basicInfo": {
    "documentType": "distribution",
    "contractTitle": "Sample Distributor Agreement",
    "hasRoyaltyTerms": true,
    "parties": {
      "party1": {"name": "ABC Manufacturing, Inc.", "role": "Manufacturer"},
      "party2": {"name": "XYZ Distribution LLC", "role": "Distributor"}
    },
    "territory": "United States – Northeast Region (MA, CT, RI, NH, VT, ME)"
  },
  "rules": [
    {
      "ruleType": "percentage",
      "ruleName": "Standard Distributor Discount",
      "calculation": {"rate": 20.0, "basis": "list_price"},
      "confidence": 0.95
    },
    {
      "ruleType": "tiered",
      "ruleName": "Annual Volume Rebate Program",
      "calculation": {
        "tiers": [
          {"min": 0, "max": 999999, "rate": 0.0},
          {"min": 1000000, "max": 2499999, "rate": 2.0},
          {"min": 2500000, "max": 4999999, "rate": 4.0},
          {"min": 5000000, "rate": 6.0}
        ]
      },
      "confidence": 0.92
    },
    {
      "ruleType": "percentage",
      "ruleName": "Market Development Funds",
      "calculation": {"rate": 1.5, "basis": "annual_net_eligible_sales"},
      "confidence": 0.90
    }
  ]
}`
  },

  'referral': {
    extractionPrompt: `You are a contract analysis AI specializing in Revenue Sharing and Partnership Agreements. Extract all parties, dates, and key terms.

**CRITICAL - EXTRACT THESE DATES**:
- effectiveDate: The start date when the agreement becomes effective (format: YYYY-MM-DD)
- expirationDate: The end date or expiration date (format: YYYY-MM-DD)
Look for phrases like "Effective Date:", "made effective as of", "shall commence on", "Initial Term", "continue for X years"

Focus on:
- Primary company and Partner identification (names, addresses, states, EINs)
- Product/service categories covered (e.g., Analytics Module, Platform, etc.)
- Revenue categories: License Fees, Implementation Services, Maintenance & Support, API/Usage Fees
- Term length (e.g., "three (3) years") and auto-renewal provisions
- Minimum annual guarantees
- Reporting and audit requirements

Return structured JSON with entities and relationships including effectiveDate and expirationDate.`,
    
    ruleExtractionPrompt: `Extract ALL revenue sharing and payment rules from this Partnership/Revenue Sharing Agreement.

**CRITICAL - MULTI-CATEGORY REVENUE SHARING**:
These agreements often have DIFFERENT revenue splits for different service categories. Extract EACH category separately.

Look for:
- LICENSE FEE REVENUE SHARING by tier:
  - Standard tier: X% Company / Y% Partner (e.g., 60%/40%)
  - Advanced tier: X% Company / Y% Partner (e.g., 55%/45%)
  - Enterprise tier: X% Company / Y% Partner (e.g., 50%/50%)
- IMPLEMENTATION SERVICES revenue split (e.g., Partner gets 35%)
- MAINTENANCE & SUPPORT revenue split:
  - Annual billing percentage of net license fee (e.g., 18%)
  - Revenue split (e.g., Company 70% / Partner 30%)
- API & USAGE-BASED FEES with tiered pricing:
  - Volume tiers (0-1M calls, 1M-5M calls, 5M+ calls)
  - Unit prices per API call
  - Revenue splits per tier
- MINIMUM ANNUAL GUARANTEE (e.g., Partner guaranteed $250,000/year)
- TRUE-UP provisions at year-end
- Payment terms (e.g., 45 days after quarter-end)

**EXTRACT EACH REVENUE CATEGORY AS A SEPARATE RULE**

Return each rule with: ruleType, ruleName, description, conditions, calculation, sourceSpan, confidence.`,
    
    erpMappingPrompt: `Map Revenue Sharing/Partnership terms to ERP fields.
Common mappings: 
- Partner → PARTNER_ID
- License Tier → LICENSE_TIER
- Revenue Category → REVENUE_TYPE (License/Services/Support/Usage)
- Company Share → COMPANY_SPLIT_PCT
- Partner Share → PARTNER_SPLIT_PCT
- API Volume → API_CALL_COUNT
- Minimum Guarantee → MIN_GUARANTEE_AMT`,
    
    sampleExtractionOutput: `{
  "basicInfo": {
    "documentType": "service",
    "contractTitle": "Revenue Sharing & Analytics Partnership Agreement",
    "hasRoyaltyTerms": true,
    "parties": {
      "party1": {"name": "Vontair Mobility Systems, Inc.", "role": "Platform Provider"},
      "party2": {"name": "PartnerCo Data Solutions LLC", "role": "Analytics Partner"}
    }
  },
  "rules": [
    {
      "ruleType": "tiered",
      "ruleName": "License Fee Revenue Share",
      "calculation": {
        "tiers": [
          {"tier": "Standard", "annualFee": 25000, "companyShare": 60, "partnerShare": 40},
          {"tier": "Advanced", "annualFee": 40000, "companyShare": 55, "partnerShare": 45},
          {"tier": "Enterprise", "annualFee": 65000, "companyShare": 50, "partnerShare": 50}
        ]
      },
      "confidence": 0.95
    },
    {
      "ruleType": "percentage",
      "ruleName": "Implementation Services Revenue",
      "calculation": {"partnerRate": 35.0, "basis": "implementation_services_revenue"},
      "confidence": 0.92
    },
    {
      "ruleType": "usage_based",
      "ruleName": "API Usage Fees",
      "calculation": {
        "tiers": [
          {"min": 0, "max": 1000000, "unitPrice": 0.002, "companyShare": 70, "partnerShare": 30},
          {"min": 1000001, "max": 5000000, "unitPrice": 0.001, "companyShare": 65, "partnerShare": 35},
          {"min": 5000001, "unitPrice": 0.0006, "companyShare": 60, "partnerShare": 40}
        ]
      },
      "confidence": 0.90
    },
    {
      "ruleType": "minimum_guarantee",
      "ruleName": "Minimum Annual Guarantee",
      "calculation": {"amount": 250000, "period": "annual"},
      "confidence": 0.95
    }
  ]
}`
  },

  'royalty_license': {
    extractionPrompt: `You are a contract analysis AI specializing in Royalty, License, and Patent Agreements. Extract all parties, dates, territories, and key terms.

**CRITICAL - EXTRACT THESE DATES**:
- effectiveDate: The start date when the agreement becomes effective (format: YYYY-MM-DD)
- expirationDate: The end date or expiration date (format: YYYY-MM-DD)
Look for phrases like "Effective Date:", "commencing on", "License Agreement No:", header dates, "Initial term of X years"
EXAMPLE: "Effective Date: February 12, 2024" → effectiveDate: "2024-02-12"
EXAMPLE: "Initial term of eight (8) years commencing February 12, 2024" → effectiveDate: "2024-02-12", expirationDate: "2032-02-12"

Focus on:
- Licensor and Licensee identification (company names, addresses, EINs, FDA/DEA registrations if applicable)
- Licensed IP: Patents (US, EU, PCT numbers), Trade Secrets, Drug compounds, Plant varieties, Manufacturing processes
- Territory grants (exclusive/non-exclusive by region)
- Field of use restrictions (Automotive, Aerospace, Pharmaceutical, Agricultural, etc.)
- Term length (e.g., "eight (8) years", "fifteen (15) years") and renewal options
- Quality control and certification requirements
- Regulatory compliance (FDA, cGMP, ISO, etc.)

Return structured JSON with entities and relationships including effectiveDate and expirationDate.`,
    
    ruleExtractionPrompt: `Extract ALL royalty, license fee, and payment rules from this Licensing Agreement.

**CRITICAL - MULTI-COMPONENT ROYALTY FORMULAS**:
Manufacturing and technology licenses often have COMPOUND formulas with multiple components:
1. BASE COMPONENT = Net Sales × Base Rate (by production tier)
2. VOLUME COMPONENT = Units Produced × Per-Unit Rate
3. PERFORMANCE COMPONENT = Cost Savings × Efficiency Rate × Units

**CONTAINER/SIZE-BASED PRICING**:
For agreements with pricing by size (1-gallon, 3-gallon, 5-gallon or component sizes):
- Use ruleType "container_size_tiered"
- Extract ALL rows into containerSizeRates array
- Include: size, baseRate, volumeThreshold, discountedRate

**NET SALES TIERED ROYALTIES**:
For pharmaceutical, electronics, or technology licenses with sales-based tiers:
- $0 - $50M: X%
- $50M - $200M: X%
- $200M - $500M: X%
- Above $500M: X%

Look for:
- PERCENTAGE ROYALTIES on Net Sales/Net Selling Price (NSP)
- PER-UNIT FEES (per component, per drug dose, per plant)
- MINIMUM ANNUAL GUARANTEES by contract year
- PRODUCTION BONUSES for milestone achievements
- QUALITY ADJUSTMENTS (defect rate impact on royalties)
- PREMIUM PRODUCT formulas (higher rates for specialized products)
- GEOGRAPHIC ADJUSTMENTS (Tier 1, Tier 2, Tier 3 markets)
- DEVELOPMENT/PROTOTYPE fees
- TECHNOLOGY TRANSFER fees
- UPFRONT LICENSE FEES
- MILESTONE PAYMENTS (first production, sales thresholds)
- SEASONAL ADJUSTMENTS (spring premium, fall discount)

**EXTRACT ALL PRICING TABLES SEPARATELY** - Each table/tier structure should be a separate rule.

**CRITICAL - RULE NAMING FORMAT**:
Use this exact format: "Tier X - Category Name (Product1, Product2, ...)"
Examples:
- "Tier 1 - Ornamental Trees & Shrubs (Aurora Flame Maple, Golden Spire Juniper)"
- "Tier 2 - Perennials & Roses (Pacific Sunset Rose, Emerald Crown Hosta)"
- "Tier 3 - Flowering Shrubs (Cascade Blue Hydrangea)"

**CRITICAL - ALWAYS POPULATE productCategories**:
The conditions.productCategories array MUST contain the specific product names that match this rule.
Example: If rule applies to "Aurora Flame Maple" and "Golden Spire Juniper":
  conditions: { productCategories: ["Aurora Flame Maple", "Golden Spire Juniper"] }
NEVER leave productCategories empty if products are mentioned in the rule name or table.

**CRITICAL - SOURCE SECTION REFERENCE**:
Include the contract section reference in sourceSpan.section format: "Section X.X - Section Title - Tier Y"
Example: sourceSpan: { section: "3.1 Plant Royalty Rates - Tier 1", text: "..." }

**CRITICAL - RULE PRIORITY ASSIGNMENT**:
Assign priority based on SPECIFICITY (lower number = checked first):
- Priority 1-3: Rules with SPECIFIC product names (e.g., "Tier 1 - Ornamental Trees (Aurora Flame Maple)")
- Priority 4-6: Rules with category-level matching (e.g., "All Ornamental Trees")
- Priority 7-10: Fallback/generic rules that apply to "All Products" or broad categories

Example: If contract has both "Plant Royalty Rates (all products)" and "Tier 1 - Ornamental Trees":
- "Tier 1 - Ornamental Trees" gets priority: 1 (more specific, 2 products)
- "Plant Royalty Rates" gets priority: 8 (fallback for unmatched items)

Return each rule with: ruleType, ruleName, description, conditions (with productCategories populated!), calculation, sourceSpan (with section reference!), confidence, priority.`,
    
    erpMappingPrompt: `Map Royalty/License terms to ERP fields.
Common mappings: 
- Licensed Product → ITEM_CODE
- Container/Component Size → SIZE_CODE
- Royalty Rate → ROYALTY_RATE
- Net Sales → NET_SALES
- Units Produced → QTY_PRODUCED
- Net Selling Price → NSP
- Territory → TERRITORY_CODE
- Contract Year → CONTRACT_YEAR
- Minimum Guarantee → MIN_GUARANTEE`,
    
    sampleExtractionOutput: `{
  "basicInfo": {
    "documentType": "licensing",
    "contractTitle": "Manufacturing Technology License and Royalty Agreement",
    "hasRoyaltyTerms": true,
    "parties": {
      "party1": {"name": "Precision Manufacturing Technologies LLC", "role": "Licensor"},
      "party2": {"name": "VonMech Industries, Inc.", "role": "Licensee"}
    }
  },
  "rules": [
    {
      "ruleType": "tiered",
      "ruleName": "Base Component - Net Sales Royalty",
      "calculation": {
        "tiers": [
          {"min": 0, "max": 50000, "rate": 3.5, "basis": "units"},
          {"min": 50001, "max": 150000, "rate": 3.0, "basis": "units"},
          {"min": 150001, "max": 300000, "rate": 2.5, "basis": "units"},
          {"min": 300001, "max": 500000, "rate": 2.25, "basis": "units"},
          {"min": 500001, "rate": 2.0, "basis": "units"}
        ],
        "tierMethod": "marginal"
      },
      "confidence": 0.95
    },
    {
      "ruleType": "tiered",
      "ruleName": "Volume Component - Per-Unit Rates",
      "calculation": {
        "tiers": [
          {"min": 0, "max": 15000, "perUnit": 2.50},
          {"min": 15001, "max": 40000, "perUnit": 2.25},
          {"min": 40001, "max": 80000, "perUnit": 2.00},
          {"min": 80001, "max": 125000, "perUnit": 1.75},
          {"min": 125001, "perUnit": 1.50}
        ],
        "tierMethod": "blended"
      },
      "confidence": 0.93
    },
    {
      "ruleType": "formula",
      "ruleName": "Performance Component - Cost Savings",
      "calculation": {
        "formula": "(SMC - AMC) × EfficiencyRate × UnitsProduced",
        "efficiencyRate": 0.25
      },
      "confidence": 0.88
    },
    {
      "ruleType": "minimum_guarantee",
      "ruleName": "Minimum Quarterly Royalty - Year 1",
      "calculation": {
        "quarters": [
          {"q": "Q1", "amount": 75000},
          {"q": "Q2", "amount": 75000},
          {"q": "Q3", "amount": 85000},
          {"q": "Q4", "amount": 100000}
        ],
        "annualTotal": 335000
      },
      "confidence": 0.95
    },
    {
      "ruleType": "container_size_tiered",
      "ruleName": "Container Size Royalties",
      "calculation": {
        "containerSizeRates": [
          {"size": "1-gallon", "baseRate": 1.25, "volumeThreshold": 5000, "discountedRate": 1.10},
          {"size": "3-gallon", "baseRate": 2.85, "volumeThreshold": 2000, "discountedRate": 2.50},
          {"size": "5-gallon", "baseRate": 4.50, "volumeThreshold": 1000, "discountedRate": 3.95},
          {"size": "15-gallon+", "baseRate": 12.75, "volumeThreshold": 200, "discountedRate": 11.25}
        ]
      },
      "confidence": 0.95
    }
  ]
}`
  },

  'rebate_mdf': {
    extractionPrompt: `You are a contract analysis AI specializing in Rebate & Incentives Agreements. Extract all parties, dates, and key terms.

**CRITICAL - EXTRACT THESE DATES**:
- effectiveDate: The start date when the agreement becomes effective (format: YYYY-MM-DD)
- expirationDate: The end date or expiration date (format: YYYY-MM-DD)
Look for phrases like "made effective as of", "Effective Date", "Initial term:", "two (2) years"
EXAMPLE: "made effective as of February 1, 2025" → effectiveDate: "2025-02-01"

Focus on:
- Company and Distributor/Partner identification (names, addresses)
- Eligible Products definition
- Rebate program scope and period (quarterly, annual)
- Special program definitions (Launch Incentive, Growth Accelerator)
- Data sharing and POS reporting requirements
- Audit rights
- Term length (e.g., "two (2) years") and renewal provisions

Return structured JSON with entities and relationships including effectiveDate and expirationDate.`,
    
    ruleExtractionPrompt: `Extract ALL rebate, incentive, and payment rules from this Rebate Agreement.

**CRITICAL - QUARTERLY REBATE TIERS**:
These agreements calculate rebates on TOTAL quarterly purchases (not marginal). Extract ALL tiers:

Look for:
- VOLUME REBATE TIERS on Quarterly Net Purchases:
  - $0 – $1,000,000: X%
  - $1,000,001 – $5,000,000: X%
  - $5,000,001+: X%
- CALCULATION METHOD: "Total" vs "Marginal" tier application
- LAUNCH INCENTIVES: Promotional rebates for first X quarters
  - Additional % on specific product lines
- GROWTH ACCELERATOR bonuses:
  - If annual purchases exceed threshold (e.g., $12M)
  - Additional % applied to purchases above lower threshold (e.g., above $10M)
- QUARTERLY TRUE-UP provisions:
  - Rebate statement timing (e.g., 30 days after quarter)
  - Payment method (credit memo vs wire transfer)
  - Payment timing (e.g., 45 days after quarter-end)
- POS DATA REQUIREMENTS:
  - Required fields (end customer, SKU, quantity)
  - Submission deadlines
  - Rebate contingencies on data submission

**EXTRACT EACH REBATE PROGRAM AS A SEPARATE RULE** - Volume rebates, launch incentives, and growth accelerators should be separate rules.

Return each rule with: ruleType, ruleName, description, conditions, calculation, sourceSpan, confidence.`,
    
    erpMappingPrompt: `Map Rebate & Incentives terms to ERP fields.
Common mappings: 
- Distributor → CUSTOMER_ID
- Net Purchases → NET_PURCHASE_AMT
- Rebate Tier → REBATE_TIER
- Rebate % → REBATE_PCT
- Quarter → FISCAL_QUARTER
- Product Family → PRODUCT_FAMILY
- Growth Threshold → GROWTH_THRESHOLD`,
    
    sampleExtractionOutput: `{
  "basicInfo": {
    "documentType": "distribution",
    "contractTitle": "Rebate & Incentives Agreement",
    "hasRoyaltyTerms": true,
    "parties": {
      "party1": {"name": "Vontair Mobility Systems, Inc.", "role": "Company"},
      "party2": {"name": "DistributorOne Fuel Services Inc.", "role": "Distributor"}
    }
  },
  "rules": [
    {
      "ruleType": "tiered",
      "ruleName": "Quarterly Volume Rebate",
      "calculation": {
        "tiers": [
          {"min": 0, "max": 1000000, "rate": 2.0},
          {"min": 1000001, "max": 5000000, "rate": 4.0},
          {"min": 5000001, "rate": 6.0}
        ],
        "tierMethod": "total",
        "period": "quarterly"
      },
      "confidence": 0.95
    },
    {
      "ruleType": "percentage",
      "ruleName": "Launch Incentive - Analytics Module",
      "calculation": {"rate": 1.0, "duration": "first_2_quarters"},
      "conditions": {"productFamily": "Analytics Module"},
      "confidence": 0.90
    },
    {
      "ruleType": "bonus",
      "ruleName": "Growth Accelerator Bonus",
      "calculation": {
        "threshold": 12000000,
        "bonusRate": 2.0,
        "appliesAbove": 10000000
      },
      "conditions": {"period": "annual"},
      "confidence": 0.88
    }
  ]
}`
  },

  'chargebacks': {
    extractionPrompt: `You are a contract analysis AI specializing in Chargebacks/Claims Agreements. Extract all parties, dates, and key terms.

**CRITICAL - EXTRACT THESE DATES**:
- effectiveDate: The start date when the agreement becomes effective (format: YYYY-MM-DD)
- expirationDate: The end date or expiration date (format: YYYY-MM-DD)

Focus on:
- Vendor and Retailer identification
- Chargeback categories and thresholds
- Claims submission process
- Dispute resolution procedures
- Documentation requirements
- Term and renewal provisions

Return structured JSON with entities and relationships including effectiveDate and expirationDate.`,
    
    ruleExtractionPrompt: `Extract ALL chargeback and claims rules from this Agreement.

Look for:
- Chargeback fee schedules (per-incident or percentage)
- Shortage thresholds and tolerances
- Late delivery penalties
- Routing guide compliance fees
- EDI/ASN non-compliance charges
- Deduction appeal timeframes

Return each rule with: ruleType, ruleName, description, conditions, calculation, sourceSpan, confidence.`,
    
    erpMappingPrompt: `Map Chargeback terms to ERP fields.
Common mappings: Vendor → VENDOR_ID, Chargeback Code → CB_CODE, Amount → CB_AMOUNT`,
    
    sampleExtractionOutput: `{
  "basicInfo": {
    "documentType": "service",
    "contractTitle": "Vendor Compliance Agreement",
    "hasRoyaltyTerms": true
  },
  "rules": [
    {
      "ruleType": "fixed_fee",
      "ruleName": "Late Shipment Penalty",
      "calculation": {"amount": 250.00},
      "confidence": 0.90
    }
  ]
}`
  },

  'marketplace': {
    extractionPrompt: `You are a contract analysis AI specializing in Marketplace/Platform Agreements. Extract all parties, dates, and key terms.

**CRITICAL - EXTRACT THESE DATES**:
- effectiveDate: The start date when the agreement becomes effective (format: YYYY-MM-DD)
- expirationDate: The end date or expiration date (format: YYYY-MM-DD)

Focus on:
- Platform operator and Seller identification
- Commission structures
- Fulfillment requirements (FBA, etc.)
- Performance metrics and SLAs
- Category restrictions
- Term and renewal provisions

Return structured JSON with entities and relationships including effectiveDate and expirationDate.`,
    
    ruleExtractionPrompt: `Extract ALL fee and commission rules from this Marketplace Agreement.

Look for:
- Referral fee percentages (by category)
- Subscription fees (monthly/annual)
- Fulfillment fees (by size/weight)
- Advertising fees and minimum spends
- Payment processing fees
- Early termination penalties

Return each rule with: ruleType, ruleName, description, conditions, calculation, sourceSpan, confidence.`,
    
    erpMappingPrompt: `Map Marketplace terms to ERP fields.
Common mappings: SKU → ITEM_CODE, Category → CATEGORY_ID, Commission → COMMISSION_PCT`,
    
    sampleExtractionOutput: `{
  "basicInfo": {
    "documentType": "saas",
    "contractTitle": "Marketplace Seller Agreement",
    "hasRoyaltyTerms": true
  },
  "rules": [
    {
      "ruleType": "percentage",
      "ruleName": "Category Referral Fee",
      "calculation": {"rate": 15.0},
      "conditions": {"productCategories": ["Electronics"]},
      "confidence": 0.93
    }
  ]
}`
  },

  'usage_service': {
    extractionPrompt: `You are a contract analysis AI specializing in Service-Based, Subcontractor, and Time & Materials Agreements. Extract all parties, dates, and key terms.

**CRITICAL - EXTRACT THESE DATES**:
- effectiveDate: The start date when the agreement becomes effective (format: YYYY-MM-DD)
- expirationDate: The end date or expiration date (format: YYYY-MM-DD)
Look for phrases like "made this [date]", "Effective Date", "shall remain in full force and effect for a term of one year"
EXAMPLE: "made this September 2nd, 2025" → effectiveDate: "2025-09-02"

Focus on:
- Company and Subcontractor/Service Provider identification (names, addresses, EINs)
- Work Order structure and approval process
- Hourly rate schedules by role/level
- Expense reimbursement policies
- Time and expense (T&E) reporting requirements
- Term length (e.g., "one year") and automatic renewal provisions
- Termination clauses (notice period, cure period)
- Insurance requirements
- Confidentiality obligations

Return structured JSON with entities and relationships including effectiveDate and expirationDate.`,
    
    ruleExtractionPrompt: `Extract ALL billing, payment, and fee rules from this Service/Subcontractor Agreement.

**CRITICAL - TIME & MATERIALS BILLING**:
These agreements typically bill on hourly rates with expense reimbursement.

Look for:
- HOURLY RATE schedules by role:
  - Senior Consultant: $X/hour
  - Consultant: $X/hour
  - Analyst: $X/hour
- WEEKLY HOUR LIMITS (e.g., not to exceed 40 hours/week without approval)
- OVERTIME APPROVAL requirements
- EXPENSE REIMBURSEMENT policies:
  - Airfare (discounted coach)
  - Hotel (reasonable rates)
  - Car rental (compact/subcompact)
  - Mileage (IRS-approved rate)
  - Per diem limits
- INVOICE TIMING (e.g., monthly at end of month)
- PAYMENT TERMS (e.g., Net 45 from invoice receipt)
- WORK ORDER structure:
  - Firm fixed price vs Time & Materials
  - Dollar limitations/not-to-exceed amounts
- TRAVEL BILLING:
  - Pre-approval requirements
  - Billable travel time policies

**SaaS/USAGE-BASED SERVICES**:
For cloud/API services, also look for:
- API call pricing tiers
- Storage pricing per GB
- Compute hours pricing
- Monthly minimums
- Overage rates

Return each rule with: ruleType, ruleName, description, conditions, calculation, sourceSpan, confidence.`,
    
    erpMappingPrompt: `Map Service/Subcontractor terms to ERP fields.
Common mappings: 
- Subcontractor → VENDOR_ID
- Role/Level → RESOURCE_TYPE
- Hourly Rate → HOURLY_RATE
- Hours Worked → BILLABLE_HOURS
- Expense Category → EXPENSE_CODE
- Work Order → PROJECT_ID
- Invoice Amount → INVOICE_AMT`,
    
    sampleExtractionOutput: `{
  "basicInfo": {
    "documentType": "service",
    "contractTitle": "Master Sub-Contractor Agreement",
    "hasRoyaltyTerms": true,
    "parties": {
      "party1": {"name": "Cimpleit Inc", "role": "Company"},
      "party2": {"name": "Texplorers Inc", "role": "Sub-contractor"}
    }
  },
  "rules": [
    {
      "ruleType": "hourly_rate",
      "ruleName": "Time & Materials Billing",
      "calculation": {
        "hourlyRate": "per_work_order",
        "weeklyLimit": 40,
        "overtimeApproval": "required"
      },
      "confidence": 0.90
    },
    {
      "ruleType": "expense_reimbursement",
      "ruleName": "Travel & Expense Policy",
      "calculation": {
        "airfare": "discounted_coach",
        "hotel": "reasonable_rates",
        "carRental": "compact_subcompact",
        "mileage": "IRS_rate",
        "perDiem": "client_authorized"
      },
      "confidence": 0.88
    },
    {
      "ruleType": "payment_terms",
      "ruleName": "Invoice and Payment",
      "calculation": {
        "invoiceFrequency": "monthly",
        "paymentTerms": "Net 45"
      },
      "confidence": 0.95
    },
    {
      "ruleType": "usage_based",
      "ruleName": "API Call Pricing",
      "calculation": {
        "tiers": [
          {"min": 0, "max": 100000, "rate": 0.001},
          {"min": 100001, "max": 1000000, "rate": 0.0008},
          {"min": 1000001, "rate": 0.0005}
        ]
      },
      "confidence": 0.91
    }
  ]
}`
  }
};

export function getDefaultPromptForType(code: string): typeof DEFAULT_EXTRACTION_PROMPTS[string] | null {
  return DEFAULT_EXTRACTION_PROMPTS[code] || null;
}
