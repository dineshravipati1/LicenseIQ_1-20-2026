import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ArrowLeft, 
  FileText, 
  Calculator, 
  Download,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Bot,
  User,
  AlertTriangle,
  Info,
  ExternalLink,
  Link2,
  Hash,
  FileSearch,
  ClipboardCheck,
  BarChart3,
  Upload,
  Settings
} from "lucide-react";
import MainLayout from "@/components/layout/main-layout";
import { format } from "date-fns";
import { useState } from "react";

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

interface RuleSnapshot {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  baseRate: number;
  isAiExtracted: boolean;
  sourceText?: string;
  sourceSection?: string;
  confidence?: number;
}

interface AuditLineItem {
  lineNumber: number;
  saleId: string;
  productName: string;
  category: string;
  territory: string;
  containerSize?: string;
  transactionDate?: string;
  quantity: number;
  grossAmount: number;
  ruleApplied: string;
  baseRate: number;
  effectiveRate: number;
  seasonalMultiplier: number;
  territoryMultiplier: number;
  calculatedRoyalty: number;
  explanation: string;
  calculationType: string;
  volumeDiscountApplied: boolean;
  volumeThresholdMet?: number;
  calculationSteps: CalculationStep[];
  conditionsChecked: ConditionCheck[];
  ruleSnapshot: RuleSnapshot;
}

interface RuleDefinition {
  id: string;
  ruleName: string;
  description: string;
  ruleType: string;
  baseRate: number;
  volumeTiers?: any[];
  productCategories?: string[];
  territories?: string[];
  seasonalAdjustments?: any;
  territoryPremiums?: any;
  sourceText?: string;
  sourceSection?: string;
  confidence?: number;
  isAiExtracted: boolean;
  reviewStatus?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface AuditData {
  calculationId: string;
  calculationName: string;
  calculationDate: string;
  periodStart: string;
  periodEnd: string;
  contractId: string;
  contractName: string;
  contractType: string;
  summary: {
    totalLicenseFee: number;
    totalGrossAmount: number;
    totalQuantity: number;
    itemsProcessed: number;
    rulesUsed: number;
    effectiveRate: string;
  };
  lineItems: AuditLineItem[];
  rulesDefinitions: RuleDefinition[];
  auditMetadata: {
    generatedAt: string;
    generatedBy: string;
    version: string;
    format: string;
  };
}

function generateAuditRefId(calcId: string, lineNumber: number): string {
  const shortCalcId = calcId.substring(0, 8).toUpperCase();
  return `LF-${shortCalcId}-${String(lineNumber).padStart(4, '0')}`;
}

function generateRuleRefId(ruleId: string): string {
  const shortRuleId = ruleId.substring(0, 8).toUpperCase();
  return `RULE-${shortRuleId}`;
}

function LicenseFeeCalculatorNav({ currentPage, contractId }: { currentPage: string; contractId?: string }) {
  const [, setLocation] = useLocation();
  
  return (
    <Card className="bg-slate-50 dark:bg-slate-900/50">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          License Fee Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={currentPage === 'calculations' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setLocation('/calculations')}
            data-testid="nav-calculations"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Calculations
          </Button>
          <Button 
            variant={currentPage === 'sales-upload' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setLocation('/sales-upload')}
            data-testid="nav-sales-upload"
          >
            <Upload className="h-4 w-4 mr-1" />
            Sales Upload
          </Button>
          {contractId && (
            <Button 
              variant={currentPage === 'rules' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setLocation(`/contracts/${contractId}/rules`)}
              data-testid="nav-rules"
            >
              <Settings className="h-4 w-4 mr-1" />
              Rules
            </Button>
          )}
          {contractId && (
            <Button 
              variant={currentPage === 'contract' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setLocation(`/contracts/${contractId}`)}
              data-testid="nav-contract"
            >
              <FileText className="h-4 w-4 mr-1" />
              Contract
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ContractSourceReference({ rule, contractId }: { rule: RuleDefinition; contractId: string }) {
  const [, setLocation] = useLocation();
  
  if (!rule.sourceText && !rule.sourceSection) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No contract source linked
      </div>
    );
  }
  
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
          <FileSearch className="h-4 w-4" />
          Contract Source Reference
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation(`/contracts/${contractId}`)}
          className="text-xs h-7"
          data-testid={`btn-view-source-${rule.id}`}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View in Contract
        </Button>
      </div>
      
      {rule.sourceSection && (
        <div className="text-xs">
          <span className="text-muted-foreground">Section: </span>
          <span className="font-medium">{rule.sourceSection}</span>
        </div>
      )}
      
      {rule.sourceText && (
        <div className="bg-white dark:bg-slate-800 p-2 rounded border text-xs italic max-h-24 overflow-y-auto">
          "{rule.sourceText}"
        </div>
      )}
      
      {rule.confidence && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">AI Confidence:</span>
          <Badge 
            variant={rule.confidence >= 0.85 ? "default" : rule.confidence >= 0.6 ? "secondary" : "destructive"}
            className="text-xs"
          >
            {(rule.confidence * 100).toFixed(0)}%
          </Badge>
        </div>
      )}
    </div>
  );
}

function AuditCertificationHeader({ auditData }: { auditData: AuditData }) {
  const auditId = `AUDIT-${auditData.calculationId.substring(0, 12).toUpperCase()}`;
  
  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl">License Fee Calculation Audit Trail</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Hash className="h-3 w-3" />
                <span className="font-mono text-xs">{auditId}</span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            v{auditData.auditMetadata.version}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Calculation Name</p>
            <p className="font-medium">{auditData.calculationName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Contract</p>
            <p className="font-medium">{auditData.contractName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Period</p>
            <p className="font-medium">
              {auditData.periodStart && auditData.periodEnd 
                ? `${format(new Date(auditData.periodStart), 'MM/dd/yyyy')} - ${format(new Date(auditData.periodEnd), 'MM/dd/yyyy')}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Generated</p>
            <p className="font-medium">{format(new Date(auditData.auditMetadata.generatedAt), 'MM/dd/yyyy h:mm a')}</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-2xl font-bold text-green-600">${auditData.summary.totalLicenseFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">Total License Fee</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-2xl font-bold">${auditData.summary.totalGrossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">Gross Sales</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-2xl font-bold">{auditData.summary.totalQuantity.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Units</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-2xl font-bold">{auditData.summary.itemsProcessed}</p>
            <p className="text-xs text-muted-foreground">Line Items</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-2xl font-bold">{auditData.summary.rulesUsed}</p>
            <p className="text-xs text-muted-foreground">Rules Applied</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
            <p className="text-2xl font-bold">{auditData.summary.effectiveRate}</p>
            <p className="text-xs text-muted-foreground">Effective Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FormulaVisualization({ item, auditRefId, contractId, rulesDefinitions }: { 
  item: AuditLineItem; 
  auditRefId: string;
  contractId: string;
  rulesDefinitions: RuleDefinition[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();
  
  const ruleId = item.ruleSnapshot?.ruleId || 'unknown';
  const matchingRule = rulesDefinitions.find(r => r.id === ruleId) || rulesDefinitions.find(r => r.ruleName === item.ruleApplied);
  const ruleRefId = ruleId !== 'unknown' ? generateRuleRefId(ruleId) : 'N/A';
  
  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start p-2 h-auto">
          {expanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
          <span className="font-mono text-xs">
            {item.calculationType === 'container_size' 
              ? `$${item.effectiveRate.toFixed(4)}/unit × ${item.quantity} = $${item.calculatedRoyalty.toFixed(2)}`
              : `$${item.grossAmount.toFixed(2)} × ${item.effectiveRate}% = $${item.calculatedRoyalty.toFixed(2)}`
            }
          </span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mt-2 space-y-4">
          
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
              <Link2 className="h-4 w-4" />
              End-to-End Reference Chain
            </h4>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="font-mono cursor-help">
                    {auditRefId}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Line Item Reference ID</TooltipContent>
              </Tooltip>
              <span className="text-muted-foreground">→</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="secondary" 
                    className="font-mono cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      const ruleElement = document.getElementById(`rule-${ruleId}`);
                      if (ruleElement) {
                        ruleElement.scrollIntoView({ behavior: 'smooth' });
                        ruleElement.classList.add('ring-2', 'ring-blue-500');
                        setTimeout(() => ruleElement.classList.remove('ring-2', 'ring-blue-500'), 2000);
                      }
                    }}
                  >
                    {ruleRefId}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Click to jump to Rule Definition (ID: {ruleId.substring(0, 8)}...)</TooltipContent>
              </Tooltip>
              <span className="text-muted-foreground">→</span>
              {matchingRule?.sourceSection ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="default" 
                      className="font-mono cursor-pointer"
                      onClick={() => setLocation(`/contracts/${contractId}`)}
                    >
                      {matchingRule.sourceSection.substring(0, 30)}...
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Click to view Contract Source</TooltipContent>
                </Tooltip>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Manual Rule
                </Badge>
              )}
            </div>
          </div>
          
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Step-by-Step Calculation
          </h4>
          
          {item.calculationSteps.length > 0 ? (
            <div className="space-y-2">
              {item.calculationSteps.map((step) => (
                <div key={step.step} className="flex items-start gap-3 text-sm border-l-2 border-blue-300 pl-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.description}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {step.formula}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Values: {step.values}
                    </p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      → {step.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-3 rounded border space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="ml-2 font-mono">{item.quantity} units</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gross Amount:</span>
                  <span className="ml-2 font-mono">${item.grossAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Base Rate:</span>
                  <span className="ml-2 font-mono">{item.calculationType === 'container_size' ? `$${item.baseRate.toFixed(4)}/unit` : `${item.baseRate}%`}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Effective Rate:</span>
                  <span className="ml-2 font-mono">{item.calculationType === 'container_size' ? `$${item.effectiveRate.toFixed(4)}/unit` : `${item.effectiveRate}%`}</span>
                  {item.volumeDiscountApplied && (
                    <Badge variant="secondary" className="ml-2 text-xs">Volume Discount</Badge>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Seasonal:</span>
                  <span className="ml-2 font-mono">×{item.seasonalMultiplier.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Territory:</span>
                  <span className="ml-2 font-mono">×{item.territoryMultiplier.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <p className="font-mono text-sm">
                  {item.calculationType === 'container_size' 
                    ? `= $${item.effectiveRate.toFixed(4)} × ${item.quantity} × ${item.seasonalMultiplier} × ${item.territoryMultiplier}`
                    : `= $${item.grossAmount.toFixed(2)} × ${(item.effectiveRate/100).toFixed(4)} × ${item.seasonalMultiplier} × ${item.territoryMultiplier}`
                  }
                </p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                  = ${item.calculatedRoyalty.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          
          <h4 className="font-semibold text-sm flex items-center gap-2 pt-2">
            <Info className="h-4 w-4" />
            Conditions Evaluated
          </h4>
          
          {item.conditionsChecked.length > 0 ? (
            <div className="space-y-1">
              {item.conditionsChecked.map((check, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 p-2 rounded border">
                  {check.matched ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <span className="font-medium">{check.condition}:</span>
                    <span className="ml-2 text-muted-foreground">Expected: {check.expected}</span>
                    <span className="mx-2">|</span>
                    <span className="text-muted-foreground">Actual: {check.actual}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No condition checks recorded</p>
          )}
          
          <h4 className="font-semibold text-sm flex items-center gap-2 pt-2">
            <FileText className="h-4 w-4" />
            Rule Definition Used
          </h4>
          <div className="bg-white dark:bg-slate-800 p-3 rounded border text-sm space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">{ruleRefId}</Badge>
              <span className="font-medium">{item.ruleSnapshot.ruleName}</span>
              <Badge variant={item.ruleSnapshot.isAiExtracted ? "default" : "secondary"}>
                {item.ruleSnapshot.isAiExtracted ? (
                  <><Bot className="h-3 w-3 mr-1" /> AI Extracted</>
                ) : (
                  <><User className="h-3 w-3 mr-1" /> Manual</>
                )}
              </Badge>
              {item.ruleSnapshot.confidence && (
                <Badge variant="outline">{(item.ruleSnapshot.confidence * 100).toFixed(0)}% confidence</Badge>
              )}
            </div>
            <p className="text-muted-foreground">Type: {item.ruleSnapshot.ruleType}</p>
            
            {matchingRule && (
              <ContractSourceReference rule={matchingRule} contractId={contractId} />
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CalculationAuditTrail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const calculationId = params.id;
  
  const { data: auditData, isLoading, error } = useQuery<AuditData>({
    queryKey: [`/api/calculations/${calculationId}/audit-trail`],
    enabled: !!calculationId
  });
  
  const handleExportPdf = () => {
    window.open(`/api/royalty-calculations/${calculationId}/invoice/detailed`, '_blank');
  };
  
  if (isLoading) {
    return (
      <MainLayout title="Loading Audit Trail..." description="">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }
  
  if (error || !auditData) {
    return (
      <MainLayout title="Audit Trail Error" description="">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Could not load audit trail</h3>
            <p className="text-muted-foreground mb-6">
              The calculation audit trail could not be loaded. Please try again.
            </p>
            <Button onClick={() => setLocation("/calculations")}>
              Back to Calculations
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout 
      title="Calculation Audit Trail"
      description="End-to-end calculation verification for auditors"
    >
      <div className="space-y-6">
        <LicenseFeeCalculatorNav currentPage="audit-trail" contractId={auditData.contractId} />
        
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/calculations")}
            data-testid="button-back-calculations"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculations
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setLocation(`/calculations/${calculationId}/report`)}
              data-testid="button-view-report"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Report
            </Button>
            <Button onClick={handleExportPdf} data-testid="button-export-pdf">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
        
        <AuditCertificationHeader auditData={auditData} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Line-by-Line Calculation Breakdown
            </CardTitle>
            <CardDescription>
              Each line item includes a unique reference ID, linked rule reference, and contract source section for end-to-end verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                    <TableHead className="font-semibold w-32">Audit Ref</TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="text-right font-semibold">Qty</TableHead>
                    <TableHead className="text-right font-semibold">Gross Amount</TableHead>
                    <TableHead className="font-semibold">Rule Applied</TableHead>
                    <TableHead className="text-right font-semibold">License Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditData.lineItems.map((item) => {
                    const auditRefId = generateAuditRefId(auditData.calculationId, item.lineNumber);
                    const matchingRule = auditData.rulesDefinitions.find(r => r.ruleName === item.ruleApplied);
                    
                    return (
                      <TableRow key={item.lineNumber} className="group" data-testid={`audit-row-${item.lineNumber}`}>
                        <TableCell className="font-mono text-xs">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="cursor-help">
                                {auditRefId}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Line #{item.lineNumber}</p>
                              <p className="text-xs text-muted-foreground">Sale ID: {item.saleId}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.productName}</div>
                          {item.containerSize && (
                            <Badge variant="secondary" className="mt-1 text-xs">{item.containerSize}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">{item.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">${item.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.ruleApplied}</span>
                            {matchingRule?.isAiExtracted && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Bot className="h-3 w-3 text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>AI-Extracted Rule</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-green-600">${item.calculatedRoyalty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Detailed Calculation Steps (Click to Expand)
              </h3>
              <div className="space-y-2">
                {auditData.lineItems.map((item) => {
                  const auditRefId = generateAuditRefId(auditData.calculationId, item.lineNumber);
                  return (
                    <div key={item.lineNumber} className="border rounded-lg p-2">
                      <div className="flex items-center gap-3 text-sm mb-1">
                        <Badge variant="outline" className="font-mono text-xs">{auditRefId}</Badge>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-muted-foreground">{item.ruleApplied}</span>
                      </div>
                      <FormulaVisualization 
                        item={item} 
                        auditRefId={auditRefId}
                        contractId={auditData.contractId}
                        rulesDefinitions={auditData.rulesDefinitions}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rule Definitions Reference
            </CardTitle>
            <CardDescription>
              Complete rule definitions with links to contract source sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditData.rulesDefinitions.map((rule) => {
                const ruleRefId = generateRuleRefId(rule.id);
                const usageCount = auditData.lineItems.filter(item => item.ruleApplied === rule.ruleName).length;
                
                return (
                  <div 
                    key={rule.id} 
                    id={`rule-${rule.id}`}
                    className="border rounded-lg p-4 space-y-3 transition-all"
                    data-testid={`rule-definition-${rule.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">{ruleRefId}</Badge>
                        <span className="font-semibold">{rule.ruleName}</span>
                        <Badge variant={rule.isAiExtracted ? "default" : "secondary"}>
                          {rule.isAiExtracted ? (
                            <><Bot className="h-3 w-3 mr-1" /> AI Extracted</>
                          ) : (
                            <><User className="h-3 w-3 mr-1" /> Manual</>
                          )}
                        </Badge>
                        {rule.reviewStatus === 'confirmed' && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
                          </Badge>
                        )}
                      </div>
                      <Badge variant="secondary">
                        Used {usageCount}× in this calculation
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{rule.ruleType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Base Rate:</span>
                        <span className="ml-2 font-mono">{rule.baseRate}%</span>
                      </div>
                      {rule.confidence && (
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="ml-2">{(rule.confidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {rule.reviewedAt && (
                        <div>
                          <span className="text-muted-foreground">Reviewed:</span>
                          <span className="ml-2">{format(new Date(rule.reviewedAt), 'MM/dd/yyyy')}</span>
                        </div>
                      )}
                    </div>
                    
                    {rule.description && (
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    )}
                    
                    <ContractSourceReference rule={rule} contractId={auditData.contractId} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-50 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-sm">Audit Trail Certification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Generated By:</span>
                <span className="ml-2 font-medium">{auditData.auditMetadata.generatedBy}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Generated At:</span>
                <span className="ml-2 font-medium">{format(new Date(auditData.auditMetadata.generatedAt), 'MM/dd/yyyy HH:mm:ss')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Format Version:</span>
                <span className="ml-2 font-mono">{auditData.auditMetadata.version}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Format Type:</span>
                <span className="ml-2 font-medium">{auditData.auditMetadata.format}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
