import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Bot, 
  Shield, 
  Zap, 
  FileText, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  Info,
  Lock,
  FileCode,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type SystemSettings = {
  id: string;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  aiTimeout: number;
  confidenceThresholdHigh: number;
  confidenceThresholdMedium: number;
  maxRetriesAi: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireMfa: boolean;
  enableAuditLog: boolean;
  featureFlagAiExtraction: boolean;
  featureFlagRagQa: boolean;
  featureFlagErpIntegration: boolean;
  featureFlagMultiLocation: boolean;
  extractionPromptTemplate: string;
  mappingPromptTemplate: string;
  riskAssessmentPromptTemplate: string;
  createdAt: string;
  updatedAt: string;
};

type ContractTypeWithPrompts = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystemType: boolean;
  isActive: boolean;
  extractionPrompt: string | null;
  ruleExtractionPrompt: string | null;
  erpMappingPrompt: string | null;
  sampleExtractionOutput: string | null;
};

export default function SystemSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedContractType, setExpandedContractType] = useState<string | null>(null);
  const [contractTypePrompts, setContractTypePrompts] = useState<Record<string, Partial<ContractTypeWithPrompts>>>({});
  
  const isSystemAdmin = user?.isSystemAdmin === true;
  
  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ['/api/settings/system'],
  });

  const { data: contractTypes, isLoading: typesLoading } = useQuery<ContractTypeWithPrompts[]>({
    queryKey: ['/api/contract-types'],
  });

  const [formData, setFormData] = useState<Partial<SystemSettings>>({});

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SystemSettings>) => {
      return await apiRequest('PUT', '/api/settings/system', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/system'] });
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const updateContractTypeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContractTypeWithPrompts> }) => {
      return await apiRequest('PUT', `/api/contract-types/${id}`, updates);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contract-types'] });
      // Clear local edits for this type after successful save
      setContractTypePrompts(prev => {
        const updated = { ...prev };
        delete updated[variables.id];
        return updated;
      });
      toast({
        title: "Prompts Saved",
        description: "Contract type prompts have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save contract type prompts",
        variant: "destructive",
      });
    },
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleContractTypePromptChange = (typeId: string, field: string, value: string) => {
    setContractTypePrompts(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [field]: value
      }
    }));
  };

  const saveContractTypePrompts = (typeId: string) => {
    const updates = contractTypePrompts[typeId];
    if (updates) {
      updateContractTypeMutation.mutate({ id: typeId, updates });
    }
  };

  const getContractTypePromptValue = (type: ContractTypeWithPrompts, field: keyof ContractTypeWithPrompts) => {
    return contractTypePrompts[type.id]?.[field] ?? type[field] ?? '';
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const getValue = (key: keyof SystemSettings, defaultValue: any = '') => {
    return formData[key] ?? settings?.[key] ?? defaultValue;
  };

  if (!isSystemAdmin) {
    return (
      <MainLayout title="System Settings">
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="w-96">
            <CardContent className="pt-6 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                System settings are only accessible to System Administrators.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="System Settings">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-system-settings">
              <Settings className="w-8 h-8" />
              System Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure platform-wide settings (Super Admin only)
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateSettingsMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="ai" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="ai" className="flex items-center gap-2" data-testid="tab-ai-config">
                <Bot className="w-4 h-4" />
                AI Config
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2" data-testid="tab-security">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2" data-testid="tab-features">
                <Zap className="w-4 h-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2" data-testid="tab-prompts">
                <FileText className="w-4 h-4" />
                AI Prompts
              </TabsTrigger>
              <TabsTrigger value="contract-prompts" className="flex items-center gap-2" data-testid="tab-contract-prompts">
                <FileCode className="w-4 h-4" />
                Contract Types
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Model Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure the AI model settings used for contract analysis and extraction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="aiModel">AI Model</Label>
                      <Select 
                        value={getValue('aiModel', 'llama-3.3-70b-versatile')}
                        onValueChange={(v) => handleChange('aiModel', v)}
                      >
                        <SelectTrigger id="aiModel" data-testid="select-ai-model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llama-3.3-70b-versatile">LLaMA 3.3 70B (Default)</SelectItem>
                          <SelectItem value="llama-3.1-8b-instant">LLaMA 3.1 8B (Fast)</SelectItem>
                          <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                          <SelectItem value="gemma2-9b-it">Gemma 2 9B</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the Groq-hosted model for AI operations
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aiTimeout">API Timeout (seconds)</Label>
                      <Input
                        id="aiTimeout"
                        type="number"
                        value={getValue('aiTimeout', 60)}
                        onChange={(e) => handleChange('aiTimeout', parseInt(e.target.value))}
                        min={10}
                        max={300}
                        data-testid="input-ai-timeout"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum wait time for AI API responses
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Temperature: {getValue('aiTemperature', 0.3)}</Label>
                        <Badge variant="outline">{getValue('aiTemperature', 0.3)}</Badge>
                      </div>
                      <Slider
                        value={[getValue('aiTemperature', 0.3)]}
                        onValueChange={(v) => handleChange('aiTemperature', v[0])}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                        data-testid="slider-temperature"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower values produce more consistent results, higher values are more creative
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aiMaxTokens">Max Tokens</Label>
                      <Input
                        id="aiMaxTokens"
                        type="number"
                        value={getValue('aiMaxTokens', 4096)}
                        onChange={(e) => handleChange('aiMaxTokens', parseInt(e.target.value))}
                        min={256}
                        max={32768}
                        data-testid="input-max-tokens"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum tokens for AI response generation
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxRetriesAi">Max Retries</Label>
                      <Input
                        id="maxRetriesAi"
                        type="number"
                        value={getValue('maxRetriesAi', 3)}
                        onChange={(e) => handleChange('maxRetriesAi', parseInt(e.target.value))}
                        min={1}
                        max={10}
                        data-testid="input-max-retries"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of retry attempts for failed AI calls
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Confidence Thresholds</h3>
                    <p className="text-sm text-muted-foreground">
                      Define confidence levels for human-in-the-loop review decisions
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>High Confidence (Auto-confirm): {(getValue('confidenceThresholdHigh', 0.85) * 100).toFixed(0)}%</Label>
                          <Badge className="bg-green-100 text-green-800">{(getValue('confidenceThresholdHigh', 0.85) * 100).toFixed(0)}%</Badge>
                        </div>
                        <Slider
                          value={[getValue('confidenceThresholdHigh', 0.85)]}
                          onValueChange={(v) => handleChange('confidenceThresholdHigh', v[0])}
                          min={0.5}
                          max={1}
                          step={0.05}
                          className="w-full"
                          data-testid="slider-confidence-high"
                        />
                        <p className="text-xs text-muted-foreground">
                          Extractions above this threshold are auto-confirmed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Medium Confidence (Review): {(getValue('confidenceThresholdMedium', 0.6) * 100).toFixed(0)}%</Label>
                          <Badge className="bg-yellow-100 text-yellow-800">{(getValue('confidenceThresholdMedium', 0.6) * 100).toFixed(0)}%</Badge>
                        </div>
                        <Slider
                          value={[getValue('confidenceThresholdMedium', 0.6)]}
                          onValueChange={(v) => handleChange('confidenceThresholdMedium', v[0])}
                          min={0.3}
                          max={0.9}
                          step={0.05}
                          className="w-full"
                          data-testid="slider-confidence-medium"
                        />
                        <p className="text-xs text-muted-foreground">
                          Extractions below this threshold require human review
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Configure authentication and security policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={getValue('sessionTimeout', 60)}
                        onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                        min={5}
                        max={480}
                        data-testid="input-session-timeout"
                      />
                      <p className="text-xs text-muted-foreground">
                        Automatic logout after inactivity period
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={getValue('maxLoginAttempts', 5)}
                        onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                        min={3}
                        max={10}
                        data-testid="input-max-login-attempts"
                      />
                      <p className="text-xs text-muted-foreground">
                        Account lockout after failed attempts
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={getValue('passwordMinLength', 8)}
                        onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                        min={6}
                        max={32}
                        data-testid="input-password-min-length"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum characters required for passwords
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <Label className="text-base">Require Multi-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Enforce MFA for all users
                        </p>
                      </div>
                      <Switch
                        checked={getValue('requireMfa', false)}
                        onCheckedChange={(v) => handleChange('requireMfa', v)}
                        data-testid="switch-require-mfa"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <Label className="text-base">Enable Audit Logging</Label>
                        <p className="text-sm text-muted-foreground">
                          Track all user actions for compliance
                        </p>
                      </div>
                      <Switch
                        checked={getValue('enableAuditLog', true)}
                        onCheckedChange={(v) => handleChange('enableAuditLog', v)}
                        data-testid="switch-audit-log"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Feature Flags
                  </CardTitle>
                  <CardDescription>
                    Enable or disable platform features globally
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-blue-500" />
                      <div>
                        <Label className="text-base">AI Contract Extraction</Label>
                        <p className="text-sm text-muted-foreground">
                          Automated extraction of contract terms using AI
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={getValue('featureFlagAiExtraction', true)}
                      onCheckedChange={(v) => handleChange('featureFlagAiExtraction', v)}
                      data-testid="switch-feature-extraction"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <div>
                        <Label className="text-base">liQ AI (RAG Q&A)</Label>
                        <p className="text-sm text-muted-foreground">
                          AI-powered document Q&A with source citations
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={getValue('featureFlagRagQa', true)}
                      onCheckedChange={(v) => handleChange('featureFlagRagQa', v)}
                      data-testid="switch-feature-rag"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-green-500" />
                      <div>
                        <Label className="text-base">ERP Integration Hub</Label>
                        <p className="text-sm text-muted-foreground">
                          Connect to external ERP systems for data sync
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={getValue('featureFlagErpIntegration', true)}
                      onCheckedChange={(v) => handleChange('featureFlagErpIntegration', v)}
                      data-testid="switch-feature-erp"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-orange-500" />
                      <div>
                        <Label className="text-base">Multi-Location Context</Label>
                        <p className="text-sm text-muted-foreground">
                          Hierarchical organization access control
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={getValue('featureFlagMultiLocation', true)}
                      onCheckedChange={(v) => handleChange('featureFlagMultiLocation', v)}
                      data-testid="switch-feature-multilocation"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prompts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    AI Prompt Templates
                  </CardTitle>
                  <CardDescription>
                    Customize the prompts used for AI operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="extractionPrompt">Extraction Prompt Template</Label>
                      <Badge variant="outline">
                        <Info className="w-3 h-3 mr-1" />
                        Advanced
                      </Badge>
                    </div>
                    <Textarea
                      id="extractionPrompt"
                      value={getValue('extractionPromptTemplate', '')}
                      onChange={(e) => handleChange('extractionPromptTemplate', e.target.value)}
                      placeholder="Enter the system prompt for contract data extraction..."
                      className="min-h-[150px] font-mono text-sm"
                      data-testid="textarea-extraction-prompt"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{contract_text}'} as a placeholder for the contract content
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="mappingPrompt">ERP Mapping Prompt Template</Label>
                    <Textarea
                      id="mappingPrompt"
                      value={getValue('mappingPromptTemplate', '')}
                      onChange={(e) => handleChange('mappingPromptTemplate', e.target.value)}
                      placeholder="Enter the system prompt for ERP field mapping..."
                      className="min-h-[150px] font-mono text-sm"
                      data-testid="textarea-mapping-prompt"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{source_fields}'} and {'{target_fields}'} as placeholders
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="riskPrompt">Risk Assessment Prompt Template</Label>
                    <Textarea
                      id="riskPrompt"
                      value={getValue('riskAssessmentPromptTemplate', '')}
                      onChange={(e) => handleChange('riskAssessmentPromptTemplate', e.target.value)}
                      placeholder="Enter the system prompt for contract risk assessment..."
                      className="min-h-[150px] font-mono text-sm"
                      data-testid="textarea-risk-prompt"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{contract_summary}'} as a placeholder for the contract summary
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contract-prompts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="w-5 h-5" />
                    Contract Type-Specific Prompts
                  </CardTitle>
                  <CardDescription>
                    Configure AI extraction prompts for each contract type. Different contract formats (Manufacturing, Plant Variety, etc.) require different extraction strategies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {typesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {contractTypes?.map((type) => (
                          <Collapsible
                            key={type.id}
                            open={expandedContractType === type.id}
                            onOpenChange={(open) => setExpandedContractType(open ? type.id : null)}
                          >
                            <Card className="border">
                              <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                          {type.name}
                                          {type.isSystemType && (
                                            <Badge variant="secondary" className="text-xs">System</Badge>
                                          )}
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                          {type.description || `Code: ${type.code}`}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {(type.extractionPrompt || type.ruleExtractionPrompt) ? (
                                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                          Configured
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                                          Not Configured
                                        </Badge>
                                      )}
                                      {expandedContractType === type.id ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="pt-0 space-y-4">
                                  <Separator />
                                  
                                  <div className="space-y-2">
                                    <Label>Entity Extraction Prompt</Label>
                                    <Textarea
                                      value={getContractTypePromptValue(type, 'extractionPrompt') as string}
                                      onChange={(e) => handleContractTypePromptChange(type.id, 'extractionPrompt', e.target.value)}
                                      placeholder={`Enter the prompt for extracting entities from ${type.name} contracts...

Example: You are analyzing a ${type.name} contract. Extract all parties, dates, territories, and key terms. Return as JSON.`}
                                      className="min-h-[120px] font-mono text-sm"
                                      data-testid={`textarea-extraction-${type.code}`}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Main prompt for extracting contract entities and metadata
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Rule Extraction Prompt</Label>
                                    <Textarea
                                      value={getContractTypePromptValue(type, 'ruleExtractionPrompt') as string}
                                      onChange={(e) => handleContractTypePromptChange(type.id, 'ruleExtractionPrompt', e.target.value)}
                                      placeholder={`Enter the prompt for extracting payment/royalty rules from ${type.name} contracts...

Example: Extract all pricing tiers, rates, minimums, and fee structures. For tiered pricing, extract EVERY tier separately.`}
                                      className="min-h-[120px] font-mono text-sm"
                                      data-testid={`textarea-rules-${type.code}`}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Prompt specifically for extracting payment rules, fee structures, and pricing tiers
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>ERP Mapping Prompt</Label>
                                    <Textarea
                                      value={getContractTypePromptValue(type, 'erpMappingPrompt') as string}
                                      onChange={(e) => handleContractTypePromptChange(type.id, 'erpMappingPrompt', e.target.value)}
                                      placeholder={`Enter the prompt for mapping ${type.name} contract terms to ERP fields...`}
                                      className="min-h-[100px] font-mono text-sm"
                                      data-testid={`textarea-erp-${type.code}`}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Prompt for mapping extracted terms to ERP system fields
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Sample Output Format (JSON)</Label>
                                    <Textarea
                                      value={getContractTypePromptValue(type, 'sampleExtractionOutput') as string}
                                      onChange={(e) => handleContractTypePromptChange(type.id, 'sampleExtractionOutput', e.target.value)}
                                      placeholder={`Provide a sample JSON output format for the AI to follow...

{
  "parties": [...],
  "rules": [
    { "tier": 1, "rate": "6.5%", "minimum": 125000 }
  ]
}`}
                                      className="min-h-[120px] font-mono text-sm"
                                      data-testid={`textarea-sample-${type.code}`}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Example output format to guide AI responses for consistency
                                    </p>
                                  </div>

                                  <div className="flex justify-end pt-2">
                                    <Button
                                      onClick={() => saveContractTypePrompts(type.id)}
                                      disabled={!contractTypePrompts[type.id] || updateContractTypeMutation.isPending}
                                      size="sm"
                                      data-testid={`button-save-${type.code}`}
                                    >
                                      {updateContractTypeMutation.isPending ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                      )}
                                      Save Prompts for {type.name}
                                    </Button>
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
