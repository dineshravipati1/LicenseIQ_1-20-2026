import { db } from '../db';
import { royaltyRules, salesData, erpMappingRuleSets, erpMappingRules, orgCalculationSettings, contracts, calculationBlueprints, blueprintDimensions } from '@shared/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { FormulaInterpreter } from './formulaInterpreter';
import type { FormulaDefinition } from '@shared/formula-types';

interface CalculationBlueprint {
  id: string;
  contractId: string;
  companyId: string;
  royaltyRuleId: string;
  name: string;
  ruleType: string;
  calculationLogic: any;
  erpFieldBindings: any;
  dualTerminologyMap: any;
  matchingCriteria: any;
  isFullyMapped: boolean;
  dimensions?: Array<{
    dimensionType: string;
    contractTerm: string;
    erpFieldName: string | null;
    matchValue: string | null;
    isMapped: boolean;
  }>;
}

interface VolumeTier {
  min: number;
  max: number | null;
  rate: number;
}

interface SeasonalAdjustments {
  [season: string]: number;
}

interface TerritoryPremiums {
  [territory: string]: number;
}

interface SaleItem {
  id: string;
  productName: string;
  category: string;
  territory: string;
  quantity: number;
  transactionDate: Date;
  grossAmount: number;
  containerSize?: string; // For container-size-based pricing (e.g., "1-gallon", "5-gallon")
}

interface ContainerSizeRate {
  size: string;
  baseRate: number;
  volumeThreshold?: number;
  discountedRate?: number;
}

interface CalculationStep {
  step: number;
  description: string;
  formula: string;
  values: string;
  result: string;
}

interface ConditionCheck {
  condition: string;
  expected: string;
  actual: string;
  matched: boolean;
}

interface RuleDefinitionSnapshot {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  baseRate: number;
  volumeTiers?: any[];
  containerSizeRates?: ContainerSizeRate[];
  productCategories?: string[];
  territories?: string[];
  seasonalAdjustments?: any;
  territoryPremiums?: any;
  sourceText?: string;
  confidence?: number;
  isAiExtracted: boolean;
}

interface RoyaltyBreakdownItem {
  saleId: string;
  productName: string;
  category: string;
  territory: string;
  quantity: number;
  grossAmount: number;
  containerSize?: string;
  transactionDate: string;
  ruleApplied: string;
  baseRate: number;
  tierRate: number;
  seasonalMultiplier: number;
  territoryMultiplier: number;
  calculatedRoyalty: number;
  explanation: string;
  // Enhanced audit fields
  calculationSteps: CalculationStep[];
  conditionsChecked: ConditionCheck[];
  ruleSnapshot: RuleDefinitionSnapshot;
  calculationType: 'container_size' | 'volume_tier' | 'percentage' | 'formula' | 'flat_rate';
  volumeDiscountApplied: boolean;
  volumeThresholdMet?: number;
}

interface CalculationResult {
  totalRoyalty: number;
  breakdown: RoyaltyBreakdownItem[];
  minimumGuarantee: number | null;
  finalRoyalty: number;
  rulesApplied: string[];
}

export class DynamicRulesEngine {
  
  /**
   * Build a complete audit breakdown item with all details for auditor verification
   */
  private buildAuditBreakdown(
    sale: SaleItem,
    rule: any,
    calculation: {
      effectiveRate: number;
      baseRate: number;
      seasonalMultiplier: number;
      territoryMultiplier: number;
      calculatedRoyalty: number;
      explanation: string;
      calculationType: 'container_size' | 'volume_tier' | 'percentage' | 'formula' | 'flat_rate';
      volumeDiscountApplied: boolean;
      volumeThresholdMet?: number;
      matchedContainerSize?: string;
      matchedTier?: any;
    },
    conditionsChecked: ConditionCheck[]
  ): RoyaltyBreakdownItem {
    
    // Build calculation steps for audit trail
    const steps: CalculationStep[] = [];
    let stepNum = 1;
    
    if (calculation.calculationType === 'container_size') {
      steps.push({
        step: stepNum++,
        description: 'Identify container size from sale data',
        formula: 'Container Size Match',
        values: `Sale container: "${sale.containerSize || 'inferred from product'}"`,
        result: `Matched: ${calculation.matchedContainerSize || 'default'}`
      });
      
      steps.push({
        step: stepNum++,
        description: 'Look up base rate for container size',
        formula: 'Rate = lookup(containerSize)',
        values: `Container: ${calculation.matchedContainerSize}`,
        result: `Base Rate = $${calculation.baseRate.toFixed(4)}/unit`
      });
      
      if (calculation.volumeDiscountApplied) {
        steps.push({
          step: stepNum++,
          description: 'Apply volume discount (quantity >= threshold)',
          formula: `Quantity (${sale.quantity}) >= Threshold (${calculation.volumeThresholdMet})`,
          values: `${sale.quantity} >= ${calculation.volumeThresholdMet} = TRUE`,
          result: `Discounted Rate = $${calculation.effectiveRate.toFixed(4)}/unit`
        });
      }
      
      steps.push({
        step: stepNum++,
        description: 'Calculate base license fee',
        formula: 'Rate × Quantity',
        values: `$${calculation.effectiveRate.toFixed(4)} × ${sale.quantity}`,
        result: `$${(calculation.effectiveRate * sale.quantity).toFixed(2)}`
      });
      
    } else if (calculation.calculationType === 'volume_tier') {
      steps.push({
        step: stepNum++,
        description: 'Identify quantity for tier matching',
        formula: 'Check quantity against tier thresholds',
        values: `Quantity: ${sale.quantity} units`,
        result: `Looking for matching tier...`
      });
      
      steps.push({
        step: stepNum++,
        description: 'Match quantity to volume tier',
        formula: 'min <= quantity <= max',
        values: calculation.matchedTier 
          ? `${calculation.matchedTier.min} <= ${sale.quantity} <= ${calculation.matchedTier.max || '∞'}`
          : `No tier matched, using base rate`,
        result: `Tier Rate = ${calculation.effectiveRate}%`
      });
      
      steps.push({
        step: stepNum++,
        description: 'Calculate license fee from gross amount',
        formula: 'Gross Amount × Rate',
        values: `$${sale.grossAmount.toFixed(2)} × ${(calculation.effectiveRate / 100).toFixed(4)}`,
        result: `$${(sale.grossAmount * (calculation.effectiveRate / 100)).toFixed(2)}`
      });
      
    } else if (calculation.calculationType === 'percentage') {
      steps.push({
        step: stepNum++,
        description: 'Identify applicable rate',
        formula: 'Rate = baseRate / 100',
        values: `${calculation.baseRate}% → ${(calculation.baseRate / 100).toFixed(4)}`,
        result: `Rate = ${(calculation.baseRate / 100).toFixed(4)}`
      });
      
      steps.push({
        step: stepNum++,
        description: 'Calculate license fee from gross amount',
        formula: 'Gross Amount × Rate',
        values: `$${sale.grossAmount.toFixed(2)} × ${(calculation.baseRate / 100).toFixed(4)}`,
        result: `$${(sale.grossAmount * (calculation.baseRate / 100)).toFixed(2)}`
      });
      
    } else if (calculation.calculationType === 'flat_rate') {
      steps.push({
        step: stepNum++,
        description: 'Identify flat rate per unit',
        formula: 'Rate = baseRate (per unit)',
        values: `Flat Rate = $${calculation.baseRate.toFixed(4)}/unit`,
        result: `Rate = $${calculation.baseRate.toFixed(4)}`
      });
      
      steps.push({
        step: stepNum++,
        description: 'Calculate license fee (rate × quantity)',
        formula: 'Rate × Quantity',
        values: `$${calculation.baseRate.toFixed(4)} × ${sale.quantity}`,
        result: `$${(calculation.baseRate * sale.quantity).toFixed(2)}`
      });
    }
    
    // Add seasonal multiplier step if not 1.0
    if (calculation.seasonalMultiplier !== 1.0) {
      steps.push({
        step: stepNum++,
        description: 'Apply seasonal adjustment',
        formula: 'Subtotal × Seasonal Multiplier',
        values: `× ${calculation.seasonalMultiplier.toFixed(2)}`,
        result: `Seasonal factor applied`
      });
    }
    
    // Add territory multiplier step if not 1.0
    if (calculation.territoryMultiplier !== 1.0) {
      steps.push({
        step: stepNum++,
        description: 'Apply territory adjustment',
        formula: 'Subtotal × Territory Multiplier',
        values: `× ${calculation.territoryMultiplier.toFixed(2)} (${sale.territory})`,
        result: `Territory factor applied`
      });
    }
    
    // Final calculation step
    steps.push({
      step: stepNum++,
      description: 'Final license fee amount',
      formula: calculation.calculationType === 'container_size' 
        ? `$${calculation.effectiveRate}/unit × ${sale.quantity} × ${calculation.seasonalMultiplier} × ${calculation.territoryMultiplier}`
        : `$${sale.grossAmount} × ${calculation.baseRate}% × ${calculation.seasonalMultiplier} × ${calculation.territoryMultiplier}`,
      values: 'All factors applied',
      result: `$${calculation.calculatedRoyalty.toFixed(2)}`
    });
    
    // Build rule snapshot for audit
    const ruleSnapshot: RuleDefinitionSnapshot = {
      ruleId: rule.id || 'unknown',
      ruleName: rule.ruleName,
      ruleType: rule.ruleType,
      baseRate: parseFloat(rule.baseRate || '0'),
      volumeTiers: rule.volumeTiers,
      productCategories: rule.productCategories,
      territories: rule.territories,
      seasonalAdjustments: rule.seasonalAdjustments,
      territoryPremiums: rule.territoryPremiums,
      sourceText: rule.sourceText,
      confidence: rule.confidence,
      isAiExtracted: !!(rule.sourceText || rule.confidence)
    };
    
    return {
      saleId: sale.id,
      productName: sale.productName,
      category: sale.category,
      territory: sale.territory,
      quantity: sale.quantity,
      grossAmount: sale.grossAmount,
      containerSize: sale.containerSize,
      transactionDate: sale.transactionDate.toISOString(),
      ruleApplied: rule.ruleName,
      baseRate: calculation.baseRate,
      tierRate: calculation.effectiveRate,
      seasonalMultiplier: calculation.seasonalMultiplier,
      territoryMultiplier: calculation.territoryMultiplier,
      calculatedRoyalty: calculation.calculatedRoyalty,
      explanation: calculation.explanation,
      calculationSteps: steps,
      conditionsChecked,
      ruleSnapshot,
      calculationType: calculation.calculationType,
      volumeDiscountApplied: calculation.volumeDiscountApplied,
      volumeThresholdMet: calculation.volumeThresholdMet
    };
  }

  /**
   * Get organization's calculation approach setting
   */
  private async getCalculationApproach(companyId: string): Promise<string> {
    const settings = await db
      .select()
      .from(orgCalculationSettings)
      .where(eq(orgCalculationSettings.companyId, companyId))
      .limit(1);
    
    return settings.length > 0 ? settings[0].calculationApproach : 'manual';
  }

  /**
   * Get ERP-generated mapping rules for a company
   */
  private async getErpMappingRulesForContract(contractId: string, companyId: string): Promise<any[]> {
    // Get active rule sets for this company
    const ruleSets = await db
      .select()
      .from(erpMappingRuleSets)
      .where(and(
        eq(erpMappingRuleSets.companyId, companyId),
        eq(erpMappingRuleSets.status, 'active')
      ));

    if (ruleSets.length === 0) return [];

    const ruleSetIds = ruleSets.map(rs => rs.id);
    
    // Get all active rules from these rule sets
    const rules = await db
      .select()
      .from(erpMappingRules)
      .where(and(
        inArray(erpMappingRules.ruleSetId, ruleSetIds),
        eq(erpMappingRules.isActive, true)
      ));

    return rules.map(rule => ({
      ...rule,
      isErpGenerated: true,
      dualTerminology: rule.description || `${rule.sourceField} (ERP: ${rule.targetField})`,
    }));
  }

  /**
   * Load calculation blueprints for a contract (merged manual rules + ERP mappings)
   */
  private async loadBlueprintsForContract(contractId: string): Promise<CalculationBlueprint[]> {
    try {
      // Load blueprints using raw SQL since tables were created manually
      const result = await db.execute(sql`
        SELECT cb.*, 
               json_agg(
                 json_build_object(
                   'dimensionType', bd.dimension_type,
                   'contractTerm', bd.contract_term,
                   'erpFieldName', bd.erp_field_name,
                   'matchValue', bd.match_value,
                   'isMapped', bd.is_mapped
                 )
               ) FILTER (WHERE bd.id IS NOT NULL) as dimensions
        FROM calculation_blueprints cb
        LEFT JOIN blueprint_dimensions bd ON cb.id = bd.blueprint_id
        WHERE cb.contract_id = ${contractId} AND cb.status = 'active'
        GROUP BY cb.id
        ORDER BY cb.priority ASC
      `);
      
      return (result.rows as any[]).map(row => ({
        id: row.id,
        contractId: row.contract_id,
        companyId: row.company_id,
        royaltyRuleId: row.royalty_rule_id,
        name: row.name,
        ruleType: row.rule_type,
        calculationLogic: row.calculation_logic,
        erpFieldBindings: row.erp_field_bindings,
        dualTerminologyMap: row.dual_terminology_map,
        matchingCriteria: row.matching_criteria,
        isFullyMapped: row.is_fully_mapped,
        dimensions: row.dimensions || [],
      }));
    } catch (error) {
      console.log(`⚠️ [BLUEPRINTS] Failed to load blueprints:`, error);
      return [];
    }
  }

  /**
   * Convert a blueprint back to a rule format for calculation
   */
  private blueprintToRule(blueprint: CalculationBlueprint): any {
    const calcLogic = blueprint.calculationLogic || {};
    
    return {
      id: blueprint.royaltyRuleId,
      ruleName: blueprint.name,
      ruleType: blueprint.ruleType,
      baseRate: calcLogic.baseRate || 0,
      volumeTiers: calcLogic.volumeTiers || null,
      productCategories: calcLogic.productCategories || [],
      territories: calcLogic.territories || [],
      seasonalAdjustments: calcLogic.seasonalAdjustments || null,
      territoryPremiums: calcLogic.territoryPremiums || null,
      formula: calcLogic.formula || null,
      isBlueprint: true,
      blueprintId: blueprint.id,
      erpFieldBindings: blueprint.erpFieldBindings,
      dualTerminologyMap: blueprint.dualTerminologyMap,
    };
  }

  /**
   * Match a sale item to a blueprint using ERP field bindings
   */
  private matchSaleToBlueprint(sale: SaleItem, blueprint: CalculationBlueprint): boolean {
    if (!blueprint.dimensions || blueprint.dimensions.length === 0) {
      return false; // No dimensions to match against
    }
    
    for (const dim of blueprint.dimensions) {
      if (!dim.isMapped || !dim.matchValue) continue;
      
      const matchValue = dim.matchValue.toLowerCase();
      
      switch (dim.dimensionType) {
        case 'product':
          const productMatch = 
            sale.productName?.toLowerCase().includes(matchValue) ||
            matchValue.includes(sale.productName?.toLowerCase() || '');
          if (!productMatch) return false;
          break;
          
        case 'territory':
          const territoryMatch = 
            sale.territory?.toLowerCase().includes(matchValue) ||
            matchValue.includes(sale.territory?.toLowerCase() || '');
          if (!territoryMatch) return false;
          break;
          
        case 'category':
          const categoryMatch = 
            sale.category?.toLowerCase().includes(matchValue) ||
            matchValue.includes(sale.category?.toLowerCase() || '');
          if (!categoryMatch) return false;
          break;
      }
    }
    
    return true;
  }

  async calculateRoyalty(contractId: string, salesItems: SaleItem[]): Promise<CalculationResult> {
    console.log(`🧮 Starting dynamic royalty calculation for contract: ${contractId}`);
    console.log(`📊 Processing ${salesItems.length} sales items`);

    // Get contract to find companyId
    const contract = await db
      .select({ companyId: contracts.companyId })
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1);

    const companyId = contract.length > 0 ? contract[0].companyId : null;
    let calculationApproach = 'manual';
    let erpRulesInfo: any[] = [];

    let blueprints: CalculationBlueprint[] = [];
    
    if (companyId) {
      calculationApproach = await this.getCalculationApproach(companyId);
      
      if (calculationApproach === 'erp_rules' || calculationApproach === 'erp_mapping_rules' || calculationApproach === 'hybrid') {
        erpRulesInfo = await this.getErpMappingRulesForContract(contractId, companyId);
        blueprints = await this.loadBlueprintsForContract(contractId);
        console.log(`🔗 Calculation approach: ${calculationApproach}`);
        console.log(`📐 Loaded ${blueprints.length} calculation blueprints`);
        console.log(`📎 ERP field mappings available: ${erpRulesInfo.length}`);
        
        // Log blueprint info
        for (const bp of blueprints) {
          const dimCount = bp.dimensions?.length || 0;
          const mappedDims = bp.dimensions?.filter(d => d.isMapped).length || 0;
          console.log(`  📐 ${bp.name} [${bp.ruleType}] - ${mappedDims}/${dimCount} dimensions mapped`);
        }
      }
    }

    const rules = await db
      .select()
      .from(royaltyRules)
      .where(and(
        eq(royaltyRules.contractId, contractId),
        eq(royaltyRules.isActive, true)
      ))
      .orderBy(royaltyRules.priority);

    console.log(`📋 Loaded ${rules.length} manual rules`);

    const breakdown: RoyaltyBreakdownItem[] = [];
    let totalRoyalty = 0;
    let minimumGuarantee: number | null = null;
    const rulesApplied = new Set<string>();

    // Accept ANY royalty/payment rule type (AI returns various types like 'tiered', 'percentage', etc.)
    const validRuleTypes = ['tiered', 'tiered_pricing', 'formula_based', 'percentage', 'minimum_guarantee', 
                            'cap', 'fixed_fee', 'fixed_price', 'variable_price', 'per_seat', 'per_unit', 
                            'per_time_period', 'volume_discount', 'license_scope', 'usage_based',
                            'container_size_tiered']; // Added for container-size-based pricing
    const tierRules = rules.filter(r => validRuleTypes.includes(r.ruleType) && r.ruleType !== 'minimum_guarantee');
    const minimumRule = rules.find(r => r.ruleType === 'minimum_guarantee');

    if (minimumRule && minimumRule.minimumGuarantee) {
      minimumGuarantee = parseFloat(minimumRule.minimumGuarantee);
    }

    // Process each sale item
    for (const sale of salesItems) {
      let matchedBlueprint: CalculationBlueprint | null = null;
      let matchingRule: any = null;
      
      // STEP 1: For ERP-based approaches, try to match using blueprints first
      if ((calculationApproach === 'erp_rules' || calculationApproach === 'erp_mapping_rules') && blueprints.length > 0) {
        matchedBlueprint = blueprints.find(bp => this.matchSaleToBlueprint(sale, bp)) || null;
        
        if (matchedBlueprint) {
          // Blueprint matched - use its embedded calculation logic
          matchingRule = this.blueprintToRule(matchedBlueprint);
          console.log(`📐 Blueprint matched: ${matchedBlueprint.name} for ${sale.productName}`);
        }
      }
      
      // STEP 2: For hybrid mode or if no blueprint matched, try manual rules
      if (!matchingRule && (calculationApproach === 'manual' || calculationApproach === 'hybrid' || !matchedBlueprint)) {
        matchingRule = this.findMatchingRule(sale, tierRules);
      }
      
      if (matchingRule) {
        const calculation = this.calculateSaleRoyalty(sale, matchingRule);
        
        // Add blueprint/dual terminology info if available
        if (matchedBlueprint && matchedBlueprint.dualTerminologyMap) {
          calculation.explanation += ` [ERP: ${JSON.stringify(matchedBlueprint.erpFieldBindings)}]`;
        }
        
        // 🛡️ SAFETY GUARD: Prevent royalties from exceeding sales amounts
        if (calculation.calculatedRoyalty > sale.grossAmount * 1.01) { // Allow 1% tolerance for rounding
          const errorMsg = `FORMULA ERROR: Royalty ($${calculation.calculatedRoyalty.toFixed(2)}) exceeds sale amount ($${sale.grossAmount.toFixed(2)}) for ${sale.productName}. Rule: ${matchingRule.ruleName}. This indicates incorrect tier rates or formula structure.`;
          console.error(`🚨 ${errorMsg}`);
          throw new Error(errorMsg); // Hard error - forces user to fix formula instead of silently capping
        }
        
        breakdown.push(calculation);
        totalRoyalty += calculation.calculatedRoyalty;
        rulesApplied.add(matchingRule.ruleName + (matchedBlueprint ? ' [via Blueprint]' : ''));
      } else {
        console.warn(`⚠️ No matching rule for sale: ${sale.productName} (${sale.category})`);
      }
    }

    const finalRoyalty = minimumGuarantee 
      ? Math.max(totalRoyalty, minimumGuarantee)
      : totalRoyalty;

    console.log(`💰 Calculated royalty: $${totalRoyalty.toFixed(2)}`);
    if (minimumGuarantee) {
      console.log(`🔒 Minimum guarantee: $${minimumGuarantee.toFixed(2)}`);
      console.log(`✅ Final royalty (with minimum): $${finalRoyalty.toFixed(2)}`);
    }

    return {
      totalRoyalty,
      breakdown,
      minimumGuarantee,
      finalRoyalty,
      rulesApplied: Array.from(rulesApplied)
    };
  }

  /**
   * Find the BEST matching rule for a sale item.
   * 
   * CRITICAL: Prefer SPECIFIC rules over GENERIC rules using a clear precedence order:
   * 1. STRICT exact product name match (case-insensitive equality, not substring)
   * 2. Specificity score (fewer productCategories = more specific)
   * 3. Explicit priority value (lower priority number = checked first)
   * 4. Original database order (stable fallback)
   * 
   * This ensures tier-specific rules (e.g., "Tier 1 - Ornamental Trees") 
   * are applied instead of catch-all rules (e.g., "Plant Royalty Rates").
   */
  private findMatchingRule(sale: SaleItem, rules: any[]): any | null {
    // Find ALL matching rules with their selection metadata
    const matchingRules: { 
      rule: any; 
      specificityScore: number; 
      hasStrictExactMatch: boolean;
      matchQuality: 'strict_exact' | 'contains' | 'category' | 'fallback';
      originalIndex: number;
    }[] = [];
    
    const saleProductLower = (sale.productName?.toLowerCase() || '').trim();
    const saleProductWords = saleProductLower.split(/\s+/).filter(w => w.length > 0);
    
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (this.ruleMatchesSale(sale, rule)) {
        const productCategories = rule.productCategories || [];
        
        // Check for STRICT exact product name match (equality, not substring)
        let hasStrictExactMatch = false;
        let matchQuality: 'strict_exact' | 'contains' | 'category' | 'fallback' = 'fallback';
        
        for (const cat of productCategories) {
          const catLower = (cat as string).toLowerCase().trim();
          
          // STRICT: Both must be equal (case-insensitive)
          if (saleProductLower === catLower) {
            hasStrictExactMatch = true;
            matchQuality = 'strict_exact';
            break;
          }
          
          // CONTAINS: One contains the other (for partial names like "Aurora Flame Maple" vs "Aurora Flame")
          if (!hasStrictExactMatch && (saleProductLower.includes(catLower) || catLower.includes(saleProductLower))) {
            matchQuality = 'contains';
          }
        }
        
        // If no product match, it's a category-level match
        if (matchQuality === 'fallback' && productCategories.length > 0) {
          matchQuality = 'category';
        }
        
        // Specificity score: fewer products = more specific
        // Empty categories = 0 specificity (fallback rules)
        const specificityScore = productCategories.length > 0 
          ? 1000 / productCategories.length 
          : 0; // No categories = lowest specificity (fallback)
        
        matchingRules.push({ 
          rule, 
          specificityScore, 
          hasStrictExactMatch,
          matchQuality,
          originalIndex: i 
        });
      }
    }
    
    if (matchingRules.length === 0) {
      return null;
    }
    
    // Sort by: (1) strict exact match, (2) match quality, (3) specificity, (4) priority, (5) original order
    matchingRules.sort((a, b) => {
      // 1. Strict exact matches always win
      if (a.hasStrictExactMatch && !b.hasStrictExactMatch) return -1;
      if (!a.hasStrictExactMatch && b.hasStrictExactMatch) return 1;
      
      // 2. Match quality ranking: strict_exact > contains > category > fallback
      const qualityOrder = { 'strict_exact': 0, 'contains': 1, 'category': 2, 'fallback': 3 };
      const qualityDiff = qualityOrder[a.matchQuality] - qualityOrder[b.matchQuality];
      if (qualityDiff !== 0) return qualityDiff;
      
      // 3. Higher specificity (fewer categories) wins
      const specificityDiff = b.specificityScore - a.specificityScore;
      if (Math.abs(specificityDiff) > 0.001) return specificityDiff;
      
      // 4. Lower priority number wins (priority is the explicit tiebreaker)
      const priorityA = a.rule.priority ?? 50; // Default priority if not set
      const priorityB = b.rule.priority ?? 50;
      const priorityDiff = priorityA - priorityB;
      if (priorityDiff !== 0) return priorityDiff;
      
      // 5. Original order (stable sort)
      return a.originalIndex - b.originalIndex;
    });
    
    const selected = matchingRules[0];
    const selectedRule = selected.rule;
    
    // Store selection rationale for audit trail (attached to the rule object)
    selectedRule._selectionRationale = {
      matchQuality: selected.matchQuality,
      specificityScore: selected.specificityScore,
      candidatesConsidered: matchingRules.length,
      candidateNames: matchingRules.map(m => m.rule.ruleName).slice(0, 5)
    };
    
    // Log the decision for audit trail
    if (matchingRules.length > 1) {
      console.log(`🎯 Rule selection for "${sale.productName}": Selected "${selectedRule.ruleName}" (${selected.matchQuality}, specificity: ${selected.specificityScore.toFixed(1)}, priority: ${selectedRule.priority ?? 'default'}) over ${matchingRules.length - 1} other matching rule(s): ${matchingRules.slice(1).map(m => m.rule.ruleName).join(', ')}`);
    }
    
    return selectedRule;
  }

  private ruleMatchesSale(sale: SaleItem, rule: any): boolean {
    if (rule.productCategories && rule.productCategories.length > 0) {
      const categoryMatch = rule.productCategories.some((cat: string) => {
        const catLower = cat.toLowerCase().trim();
        const saleCategoryLower = (sale.category?.toLowerCase() || '').trim();
        const saleProductLower = (sale.productName?.toLowerCase() || '').trim();
        
        // Guard: require rule category to be non-empty
        if (!catLower) {
          return false;
        }
        
        // PRIORITY 1: Product name exact matching (AI often stores product names in productCategories)
        if (saleProductLower && (saleProductLower.includes(catLower) || catLower.includes(saleProductLower))) {
          return true;
        }
        
        // PRIORITY 2: Category matching (for generic rules)
        if (saleCategoryLower) {
          return this.categoriesMatch(saleCategoryLower, catLower);
        }
        
        return false;
      });
      if (!categoryMatch) return false;
    }

    if (rule.territories && rule.territories.length > 0 && !rule.territories.includes('All')) {
      const saleTerritory = (sale.territory || '').toLowerCase().trim();
      
      // Skip territory check for abstract/generic territory names commonly used in sales data
      const abstractTerritories = ['primary', 'secondary', 'tertiary', 'domestic', 'international', 'north', 'south', 'east', 'west'];
      const isAbstractTerritory = saleTerritory.length > 0 && abstractTerritories.some(abs => saleTerritory === abs);
      
      if (!isAbstractTerritory) {
        // Only enforce territory matching for specific territory names (guard against empty territory)
        const territoryMatch = saleTerritory.length > 0 && rule.territories.some((terr: string) =>
          saleTerritory.includes(terr.toLowerCase()) || terr.toLowerCase().includes(saleTerritory)
        );
        if (!territoryMatch) return false;
      }
      // If abstract territory, skip strict matching and allow product match to succeed
    }

    return true;
  }

  /**
   * Smart category matching with word-based overlap
   * Requires meaningful category words to match, not just tier/grade labels
   * Example: "Ornamental Shrubs" matches "Ornamental Trees & Shrubs" (shared: ornamental, shrubs)
   * Example: "Tier 1 Shrubs" does NOT match "Tier 1 Trees" (different product category)
   * Example: "Tier 1 Shrubs" does NOT match "Tier 2 Shrubs" (conflicting tier)
   * Example: "Shrubs" does NOT match "Tier 2 Shrubs" (tier-specific rule requires tier match)
   */
  private categoriesMatch(saleCategory: string, ruleCategory: string): boolean {
    // Word-based matching with tier/grade awareness
    const saleWords = this.extractCategoryWords(saleCategory);
    const ruleWords = this.extractCategoryWords(ruleCategory);
    
    // If either has no meaningful words, no match
    if (saleWords.length === 0 || ruleWords.length === 0) {
      return false;
    }
    
    // CHECK TIER/GRADE CONFLICTS FIRST (before any matching logic)
    const saleNumbers = saleWords.filter(word => /^\d+$/.test(word));
    const ruleNumbers = ruleWords.filter(word => /^\d+$/.test(word));
    
    // If only ONE has numbers, it's a tier mismatch (e.g., "Shrubs" vs "Tier 2 Shrubs")
    if ((saleNumbers.length > 0) !== (ruleNumbers.length > 0)) {
      return false; // One is tiered, the other isn't
    }
    
    // If BOTH have numbers, they must all match (e.g., "Tier 1" must match "Tier 1", not "Tier 2")
    if (saleNumbers.length > 0 && ruleNumbers.length > 0) {
      const numbersMatch = saleNumbers.every(num => ruleNumbers.includes(num)) &&
                          ruleNumbers.every(num => saleNumbers.includes(num));
      if (!numbersMatch) {
        return false; // Conflicting tier/grade numbers
      }
    }
    
    // Identify generic tier/grade/level words and numbers
    const genericWords = new Set(['tier', 'grade', 'level', 'class', 'type']);
    const isGenericOrNumber = (word: string) => genericWords.has(word) || /^\d+$/.test(word);
    
    // Find shared words, separating category descriptors from tier/grade labels
    const sharedWords = saleWords.filter(word => ruleWords.includes(word));
    const sharedCategoryWords = sharedWords.filter(word => !isGenericOrNumber(word));
    
    // MUST have at least 1 shared meaningful category word (not just "tier" + number)
    if (sharedCategoryWords.length === 0) {
      return false;
    }
    
    // For single-word categories (after filtering generics), require 100% match
    const saleCategoryWords = saleWords.filter(word => !isGenericOrNumber(word));
    const ruleCategoryWords = ruleWords.filter(word => !isGenericOrNumber(word));
    
    if (saleCategoryWords.length === 1 && ruleCategoryWords.length === 1) {
      return saleCategoryWords[0] === ruleCategoryWords[0];
    }
    
    // For multi-word categories, require at least 2 shared category words OR 100% of smaller
    const minCategoryWords = Math.min(saleCategoryWords.length, ruleCategoryWords.length);
    const requiredShared = Math.min(2, minCategoryWords);
    
    if (sharedCategoryWords.length < requiredShared) {
      return false;
    }
    
    return true;
  }

  /**
   * Extract meaningful words from a category string
   * Filters out ONLY stop words, keeps all other words including numbers/grades
   */
  private extractCategoryWords(category: string): string[] {
    const stopWords = new Set(['and', 'or', 'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for']);
    
    return category
      .toLowerCase()
      .split(/[\s&,/\-()]+/) // Split by space, &, comma, slash, dash, parentheses
      .map(word => word.trim())
      .filter(word => word.length > 0 && !stopWords.has(word)); // Keep all non-stop words
  }

  private calculateSaleRoyalty(sale: SaleItem, rule: any): RoyaltyBreakdownItem {
    // 🚀 NEW: Use FormulaInterpreter if formulaDefinition exists
    if (rule.formulaDefinition) {
      console.log(`🧮 [FORMULA CALC] Using FormulaInterpreter for rule: ${rule.ruleName}`);
      
      const season = this.determineSeason(sale.transactionDate);
      const interpreter = new FormulaInterpreter({ debug: true });
      
      // Build context from sale data
      const context: any = {
        units: sale.quantity,
        quantity: sale.quantity,
        season: season,
        territory: sale.territory,
        product: sale.productName,
        category: sale.category,
        salesVolume: sale.quantity.toString(), // For range-based lookups
        grossAmount: sale.grossAmount,
      };
      
      const formulaDef = rule.formulaDefinition as FormulaDefinition;
      const result = interpreter.evaluateFormula(formulaDef, context);
      
      console.log(`   ✅ Formula result: $${result.value.toFixed(2)}`);
      if (result.debugLog) {
        result.debugLog.forEach(log => console.log(`      ${log}`));
      }
      
      const conditionsChecked: ConditionCheck[] = [
        {
          condition: 'Formula Evaluation',
          expected: formulaDef.description || 'Custom formula',
          actual: 'Formula executed',
          matched: true
        }
      ];
      
      return this.buildAuditBreakdown(sale, rule, {
        effectiveRate: result.value / sale.quantity,
        baseRate: 0,
        seasonalMultiplier: 1,
        territoryMultiplier: 1,
        calculatedRoyalty: result.value,
        explanation: `Formula: ${formulaDef.description || rule.ruleName} = $${result.value.toFixed(2)}`,
        calculationType: 'formula',
        volumeDiscountApplied: false
      }, conditionsChecked);
    }
    
    // 📦 CONTAINER SIZE TIERED: Handle container-size-based pricing with volume discounts
    if (rule.ruleType === 'container_size_tiered') {
      // Parse and validate volumeTiers as containerSizeRates format
      // Note: AI extraction may store rates as strings, so we coerce to numbers
      const rawTiers = rule.volumeTiers || [];
      const containerSizeRates: ContainerSizeRate[] = rawTiers
        .filter((tier: any) => tier && tier.size && (tier.baseRate !== undefined || tier.rate !== undefined))
        .map((tier: any) => ({
          size: String(tier.size),
          baseRate: parseFloat(tier.baseRate || tier.rate || 0),
          volumeThreshold: tier.volumeThreshold ? parseFloat(tier.volumeThreshold) : undefined,
          discountedRate: tier.discountedRate ? parseFloat(tier.discountedRate) : undefined
        }))
        .filter((tier: ContainerSizeRate) => !isNaN(tier.baseRate) && tier.baseRate > 0);
      
      // If no valid container size rates found, skip this rule entirely and log warning
      if (containerSizeRates.length === 0) {
        console.log(`⚠️ [CONTAINER SIZE CALC] Rule ${rule.ruleName} has no valid containerSizeRates - skipping`);
        // Return zero calculation to avoid applying incorrect pricing
        const conditionsChecked: ConditionCheck[] = [
          {
            condition: 'Container Size Rates Configured',
            expected: 'At least one valid rate',
            actual: 'No valid rates found',
            matched: false
          }
        ];
        
        return this.buildAuditBreakdown(sale, rule, {
          effectiveRate: 0,
          baseRate: 0,
          seasonalMultiplier: 1,
          territoryMultiplier: 1,
          calculatedRoyalty: 0,
          explanation: `Rule ${rule.ruleName}: No valid container size rates configured`,
          calculationType: 'container_size',
          volumeDiscountApplied: false
        }, conditionsChecked);
      }
      
      const seasonalAdj: SeasonalAdjustments = rule.seasonalAdjustments || {};
      const territoryPrem: TerritoryPremiums = rule.territoryPremiums || {};
      
      console.log(`📦 [CONTAINER SIZE CALC] Rule: ${rule.ruleName}`);
      console.log(`   - Container Size Rates: ${JSON.stringify(containerSizeRates)}`);
      console.log(`   - Sale Container Size: ${sale.containerSize || 'not specified'}`);
      console.log(`   - Sale Quantity: ${sale.quantity}`);
      
      // Find matching container size rate
      let matchedRate: ContainerSizeRate | undefined;
      
      if (sale.containerSize) {
        // Direct match on container size
        matchedRate = containerSizeRates.find(csr => 
          csr.size.toLowerCase() === sale.containerSize!.toLowerCase() ||
          sale.containerSize!.toLowerCase().includes(csr.size.toLowerCase()) ||
          csr.size.toLowerCase().includes(sale.containerSize!.toLowerCase())
        );
      }
      
      // If no container size specified, try to infer from product name
      if (!matchedRate && sale.productName) {
        matchedRate = containerSizeRates.find(csr =>
          sale.productName.toLowerCase().includes(csr.size.toLowerCase())
        );
      }
      
      if (matchedRate) {
        // Determine if volume discount applies - only if threshold is explicitly defined and > 0
        const volumeThreshold = matchedRate.volumeThreshold;
        const hasVolumeDiscount = volumeThreshold && volumeThreshold > 0 && 
                                   sale.quantity >= volumeThreshold && 
                                   matchedRate.discountedRate !== undefined;
        const effectiveRate = hasVolumeDiscount ? matchedRate.discountedRate! : matchedRate.baseRate;
        
        console.log(`   ✓ Matched container size: ${matchedRate.size}`);
        console.log(`   ✓ Base rate: $${matchedRate.baseRate}/unit`);
        if (volumeThreshold && volumeThreshold > 0) {
          console.log(`   ✓ Volume threshold: ${volumeThreshold} units → discounted rate: $${matchedRate.discountedRate || 'N/A'}/unit`);
        }
        console.log(`   ✓ Applied rate: $${effectiveRate}/unit (${hasVolumeDiscount ? 'volume discount applied' : 'base rate'})`);
        
        const season = this.determineSeason(sale.transactionDate);
        const seasonalMultiplier = seasonalAdj[season] || 1.0;
        
        let territoryMultiplier = 1.0;
        for (const [terr, premium] of Object.entries(territoryPrem)) {
          if (sale.territory?.toLowerCase().includes(terr.toLowerCase())) {
            territoryMultiplier = premium;
            break;
          }
        }
        
        // Per-unit pricing: rate × quantity × multipliers
        const calculatedRoyalty = effectiveRate * sale.quantity * seasonalMultiplier * territoryMultiplier;
        
        console.log(`   💰 Calculation: $${effectiveRate}/unit × ${sale.quantity} units × ${seasonalMultiplier} seasonal × ${territoryMultiplier} territory = $${calculatedRoyalty.toFixed(2)}`);
        
        const explanation = `Container size ${matchedRate.size}: $${effectiveRate}/unit × ${sale.quantity} units${hasVolumeDiscount ? ` (volume discount at ${volumeThreshold}+)` : ''}`;
        
        // Build condition checks for audit trail
        const conditionsChecked: ConditionCheck[] = [
          {
            condition: 'Container Size Match',
            expected: containerSizeRates.map(r => r.size).join(', '),
            actual: sale.containerSize || 'inferred',
            matched: true
          },
          {
            condition: 'Volume Threshold',
            expected: volumeThreshold ? `≥ ${volumeThreshold} units` : 'No threshold',
            actual: `${sale.quantity} units`,
            matched: hasVolumeDiscount || !volumeThreshold
          }
        ];
        
        if (rule.productCategories?.length > 0) {
          conditionsChecked.push({
            condition: 'Product Category',
            expected: rule.productCategories.join(', '),
            actual: sale.category || sale.productName,
            matched: true
          });
        }
        
        if (rule.territories?.length > 0) {
          conditionsChecked.push({
            condition: 'Territory',
            expected: rule.territories.join(', '),
            actual: sale.territory || 'Not specified',
            matched: true
          });
        }
        
        return this.buildAuditBreakdown(sale, rule, {
          effectiveRate,
          baseRate: matchedRate.baseRate,
          seasonalMultiplier,
          territoryMultiplier,
          calculatedRoyalty,
          explanation,
          calculationType: 'container_size',
          volumeDiscountApplied: hasVolumeDiscount,
          volumeThresholdMet: hasVolumeDiscount ? volumeThreshold : undefined,
          matchedContainerSize: matchedRate.size
        }, conditionsChecked);
      } else {
        console.log(`   ⚠️ No matching container size found for: ${sale.containerSize || sale.productName}`);
        // For container_size_tiered rules with no match, use first container size as default rate
        // This prevents falling through to percentage-based calculation which would be incorrect
        if (containerSizeRates.length > 0) {
          const defaultRate = containerSizeRates[0];
          console.log(`   ⚠️ Using default container size rate: ${defaultRate.size} @ $${defaultRate.baseRate}/unit`);
          
          const season = this.determineSeason(sale.transactionDate);
          const seasonalMultiplier = seasonalAdj[season] || 1.0;
          
          let territoryMultiplier = 1.0;
          for (const [terr, premium] of Object.entries(territoryPrem)) {
            if (sale.territory?.toLowerCase().includes(terr.toLowerCase())) {
              territoryMultiplier = premium;
              break;
            }
          }
          
          const calculatedRoyalty = defaultRate.baseRate * sale.quantity * seasonalMultiplier * territoryMultiplier;
          
          const conditionsChecked: ConditionCheck[] = [
            {
              condition: 'Container Size Match',
              expected: containerSizeRates.map(r => r.size).join(', '),
              actual: sale.containerSize || sale.productName,
              matched: false
            }
          ];
          
          return this.buildAuditBreakdown(sale, rule, {
            effectiveRate: defaultRate.baseRate,
            baseRate: defaultRate.baseRate,
            seasonalMultiplier,
            territoryMultiplier,
            calculatedRoyalty,
            explanation: `Default container size ${defaultRate.size}: $${defaultRate.baseRate}/unit × ${sale.quantity} units (no exact match found)`,
            calculationType: 'container_size',
            volumeDiscountApplied: false,
            matchedContainerSize: defaultRate.size + ' (default)'
          }, conditionsChecked);
        }
        // Only fall through to legacy if no container size rates defined at all
      }
    }
    
    // 📊 LEGACY: Fall back to old calculation method
    const volumeTiers: VolumeTier[] = rule.volumeTiers || [];
    const seasonalAdj: SeasonalAdjustments = rule.seasonalAdjustments || {};
    const territoryPrem: TerritoryPremiums = rule.territoryPremiums || {};

    let tierRate = parseFloat(rule.baseRate || '0');
    
    console.log(`🔍 [LEGACY CALC] Rule: ${rule.ruleName}`);
    console.log(`   - Base Rate: ${rule.baseRate} → ${tierRate}`);
    console.log(`   - Volume Tiers: ${JSON.stringify(volumeTiers)}`);
    console.log(`   - Seasonal Adj: ${JSON.stringify(seasonalAdj)}`);
    console.log(`   - Territory Prem: ${JSON.stringify(territoryPrem)}`);
    
    // Skip volume tier matching for container_size_tiered rules that fell through (no container match)
    let matchedVolumeTier: VolumeTier | null = null;
    if (rule.ruleType !== 'container_size_tiered' && volumeTiers.length > 0) {
      matchedVolumeTier = volumeTiers.find((tier: VolumeTier) => {
        if (tier.max === null) {
          return sale.quantity >= tier.min;
        }
        return sale.quantity >= tier.min && sale.quantity <= tier.max;
      }) || null;
      
      if (matchedVolumeTier) {
        tierRate = matchedVolumeTier.rate;
        console.log(`   ✓ Matching tier found: ${matchedVolumeTier.min}-${matchedVolumeTier.max || '∞'} @ rate ${matchedVolumeTier.rate}`);
      }
    }

    const season = this.determineSeason(sale.transactionDate);
    const seasonalMultiplier = seasonalAdj[season] || 1.0;

    let territoryMultiplier = 1.0;
    for (const [terr, premium] of Object.entries(territoryPrem)) {
      if (sale.territory?.toLowerCase().includes(terr.toLowerCase())) {
        territoryMultiplier = premium;
        break;
      }
    }

    // ⚠️ CRITICAL FIX: Legacy rules must use percentage-based calculation to match formula interpreter
    // ALL rates stored as percentages (25 = 25%, NOT $25 per unit) - consistent with FormulaInterpreter
    const rateAsDecimal = tierRate / 100; // Convert percentage to decimal (e.g., 25% → 0.25)
    const calculatedRoyalty = sale.grossAmount * rateAsDecimal * seasonalMultiplier * territoryMultiplier;
    
    console.log(`   💰 Calculation: $${sale.grossAmount} × ${tierRate}% × ${seasonalMultiplier} seasonal × ${territoryMultiplier} territory = $${calculatedRoyalty.toFixed(2)}`);

    const explanation = this.buildExplanation(
      sale.quantity,
      tierRate,
      seasonalMultiplier,
      territoryMultiplier,
      season,
      sale.territory
    );
    
    // Build condition checks for audit trail
    const conditionsChecked: ConditionCheck[] = [];
    
    if (rule.productCategories?.length > 0) {
      conditionsChecked.push({
        condition: 'Product Category',
        expected: rule.productCategories.join(', '),
        actual: sale.category || sale.productName,
        matched: true
      });
    }
    
    if (rule.territories?.length > 0) {
      conditionsChecked.push({
        condition: 'Territory',
        expected: rule.territories.join(', '),
        actual: sale.territory || 'Not specified',
        matched: true
      });
    }
    
    if (volumeTiers.length > 0) {
      const matchingTier = volumeTiers.find((tier: VolumeTier) => {
        if (tier.max === null) return sale.quantity >= tier.min;
        return sale.quantity >= tier.min && sale.quantity <= tier.max;
      });
      conditionsChecked.push({
        condition: 'Volume Tier',
        expected: volumeTiers.map(t => `${t.min}-${t.max || '∞'}: ${t.rate}%`).join(', '),
        actual: `${sale.quantity} units`,
        matched: !!matchingTier
      });
    }

    return this.buildAuditBreakdown(sale, rule, {
      effectiveRate: tierRate,
      baseRate: parseFloat(rule.baseRate || '0'),
      seasonalMultiplier,
      territoryMultiplier,
      calculatedRoyalty,
      explanation,
      calculationType: volumeTiers.length > 0 ? 'volume_tier' : 'percentage',
      volumeDiscountApplied: false,
      matchedTier: matchedVolumeTier
    }, conditionsChecked);
  }

  private determineSeason(date: Date): string {
    const month = date.getMonth();
    
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    if (month === 11 || month === 0) return 'Holiday';
    return 'Winter';
  }

  private buildExplanation(
    quantity: number,
    tierRate: number,
    seasonal: number,
    territory: number,
    season: string,
    territoryName: string
  ): string {
    // Updated to reflect percentage-based calculation (consistent with formula interpreter)
    const parts = [`${tierRate}% of gross sales`];
    
    if (seasonal !== 1.0) {
      parts.push(`× ${seasonal.toFixed(2)} (${season})`);
    }
    
    if (territory !== 1.0) {
      parts.push(`× ${territory.toFixed(2)} (${territoryName})`);
    }
    
    return parts.join(' ');
  }
}

export const dynamicRulesEngine = new DynamicRulesEngine();
