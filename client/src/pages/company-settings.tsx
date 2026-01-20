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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  Globe, 
  FileText, 
  Workflow, 
  Palette, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Check,
  X
} from "lucide-react";

type CompanySettings = {
  id: string;
  companyId: string;
  dateFormat: string;
  currencyCode: string;
  currencySymbol: string;
  timezone: string;
  fiscalYearStart: number;
  enabledContractTypes: string[];
  allowedRegions: string[];
  requireApprovalWorkflow: boolean;
  approvalLevels: number;
  defaultExtractionApprover: string | null;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  brandLogoUrl: string | null;
  defaultErpSystemId: string | null;
  defaultCalculationApproach: string;
  createdAt: string;
  updatedAt: string;
};

type ContractType = {
  id: string;
  typeKey: string;
  typeName: string;
  description: string | null;
  isSystemType: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

export default function CompanySettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddingContractType, setIsAddingContractType] = useState(false);
  const [newContractType, setNewContractType] = useState({ typeName: '', typeKey: '', description: '' });
  
  const { data: activeContextData } = useQuery<{ activeContext: any }>({
    queryKey: ['/api/user/active-context'],
    retry: false,
  });
  
  const isCompanyAdmin = user?.isSystemAdmin === true || 
    ['admin', 'owner'].includes(activeContextData?.activeContext?.role || '');
  
  const { data: settings, isLoading } = useQuery<CompanySettings>({
    queryKey: ['/api/settings/company'],
  });

  const { data: contractTypesData, isLoading: typesLoading } = useQuery<ContractType[]>({
    queryKey: ['/api/contract-types'],
  });

  const [formData, setFormData] = useState<Partial<CompanySettings>>({});

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {
      const companyId = settings?.companyId;
      if (!companyId) throw new Error('No company context');
      return await apiRequest('PUT', `/api/settings/company/${companyId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/company'] });
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Company settings have been updated successfully",
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

  const createContractTypeMutation = useMutation({
    mutationFn: async (data: { typeName: string; typeKey: string; description: string }) => {
      return await apiRequest('POST', '/api/contract-types', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contract-types'] });
      setIsAddingContractType(false);
      setNewContractType({ typeName: '', typeKey: '', description: '' });
      toast({
        title: "Contract Type Created",
        description: "New contract type has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contract type",
        variant: "destructive",
      });
    },
  });

  const deleteContractTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/contract-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contract-types'] });
      toast({
        title: "Contract Type Deleted",
        description: "Contract type has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Cannot delete system contract types",
        variant: "destructive",
      });
    },
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const getValue = (key: keyof CompanySettings, defaultValue: any = '') => {
    return formData[key] ?? settings?.[key] ?? defaultValue;
  };

  if (!isCompanyAdmin) {
    return (
      <MainLayout title="Company Settings">
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="w-96">
            <CardContent className="pt-6 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                Company settings are only accessible to Company Administrators.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const contractTypes = contractTypesData || [];

  return (
    <MainLayout title="Company Settings">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-company-settings">
              <Building2 className="w-8 h-8" />
              Company Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure company-specific settings and preferences
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
              data-testid="button-save-company-settings"
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
          <Tabs defaultValue="localization" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="localization" className="flex items-center gap-2" data-testid="tab-localization">
                <Globe className="w-4 h-4" />
                Localization
              </TabsTrigger>
              <TabsTrigger value="contract-types" className="flex items-center gap-2" data-testid="tab-contract-types">
                <FileText className="w-4 h-4" />
                Contract Types
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2" data-testid="tab-workflows">
                <Workflow className="w-4 h-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-2" data-testid="tab-branding">
                <Palette className="w-4 h-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="defaults" className="flex items-center gap-2" data-testid="tab-defaults">
                <Building2 className="w-4 h-4" />
                Defaults
              </TabsTrigger>
            </TabsList>

            <TabsContent value="localization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Localization Settings
                  </CardTitle>
                  <CardDescription>
                    Configure date, currency, and regional preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select 
                        value={getValue('dateFormat', 'MM/DD/YYYY')}
                        onValueChange={(v) => handleChange('dateFormat', v)}
                      >
                        <SelectTrigger id="dateFormat" data-testid="select-date-format">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                          <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={getValue('timezone', 'America/New_York')}
                        onValueChange={(v) => handleChange('timezone', v)}
                      >
                        <SelectTrigger id="timezone" data-testid="select-timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currencyCode">Currency Code</Label>
                      <Select 
                        value={getValue('currencyCode', 'USD')}
                        onValueChange={(v) => handleChange('currencyCode', v)}
                      >
                        <SelectTrigger id="currencyCode" data-testid="select-currency-code">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">Currency Symbol</Label>
                      <Input
                        id="currencySymbol"
                        value={getValue('currencySymbol', '$')}
                        onChange={(e) => handleChange('currencySymbol', e.target.value)}
                        placeholder="$"
                        maxLength={3}
                        data-testid="input-currency-symbol"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fiscalYearStart">Fiscal Year Start Month</Label>
                      <Select 
                        value={String(getValue('fiscalYearStart', 1))}
                        onValueChange={(v) => handleChange('fiscalYearStart', parseInt(v))}
                      >
                        <SelectTrigger id="fiscalYearStart" data-testid="select-fiscal-year">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">January</SelectItem>
                          <SelectItem value="2">February</SelectItem>
                          <SelectItem value="3">March</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">May</SelectItem>
                          <SelectItem value="6">June</SelectItem>
                          <SelectItem value="7">July</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contract-types" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Contract Types
                      </CardTitle>
                      <CardDescription>
                        Manage available contract types for your organization
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => setIsAddingContractType(true)}
                      disabled={isAddingContractType}
                      data-testid="button-add-contract-type"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Type
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Key</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isAddingContractType && (
                          <TableRow>
                            <TableCell>
                              <Input
                                value={newContractType.typeName}
                                onChange={(e) => setNewContractType(prev => ({ ...prev, typeName: e.target.value }))}
                                placeholder="Type Name"
                                data-testid="input-new-type-name"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={newContractType.typeKey}
                                onChange={(e) => setNewContractType(prev => ({ ...prev, typeKey: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                                placeholder="type_key"
                                data-testid="input-new-type-key"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={newContractType.description}
                                onChange={(e) => setNewContractType(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Description"
                                data-testid="input-new-type-description"
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">New</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => createContractTypeMutation.mutate(newContractType)}
                                  disabled={!newContractType.typeName || !newContractType.typeKey}
                                  data-testid="button-save-new-type"
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setIsAddingContractType(false);
                                    setNewContractType({ typeName: '', typeKey: '', description: '' });
                                  }}
                                  data-testid="button-cancel-new-type"
                                >
                                  <X className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {contractTypes.map((type) => (
                          <TableRow key={type.id} data-testid={`row-contract-type-${type.id}`}>
                            <TableCell className="font-medium">{type.typeName}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{type.typeKey}</code>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{type.description || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {type.isSystemType && (
                                  <Badge variant="secondary">System</Badge>
                                )}
                                {type.isActive ? (
                                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                                ) : (
                                  <Badge variant="outline">Inactive</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {!type.isSystemType && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteContractTypeMutation.mutate(type.id)}
                                  data-testid={`button-delete-type-${type.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflows" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="w-5 h-5" />
                    Approval Workflows
                  </CardTitle>
                  <CardDescription>
                    Configure approval requirements for contract processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Label className="text-base">Require Approval Workflow</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable multi-level approval for contract changes
                      </p>
                    </div>
                    <Switch
                      checked={getValue('requireApprovalWorkflow', false)}
                      onCheckedChange={(v) => handleChange('requireApprovalWorkflow', v)}
                      data-testid="switch-require-approval"
                    />
                  </div>

                  {getValue('requireApprovalWorkflow', false) && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="approvalLevels">Number of Approval Levels</Label>
                          <Select 
                            value={String(getValue('approvalLevels', 1))}
                            onValueChange={(v) => handleChange('approvalLevels', parseInt(v))}
                          >
                            <SelectTrigger id="approvalLevels" data-testid="select-approval-levels">
                              <SelectValue placeholder="Select levels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Level</SelectItem>
                              <SelectItem value="2">2 Levels</SelectItem>
                              <SelectItem value="3">3 Levels</SelectItem>
                              <SelectItem value="4">4 Levels</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Number of approval stages required before finalization
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Branding
                  </CardTitle>
                  <CardDescription>
                    Customize the appearance of your company's interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="brandPrimaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="brandPrimaryColor"
                          type="color"
                          value={getValue('brandPrimaryColor', '#3B82F6')}
                          onChange={(e) => handleChange('brandPrimaryColor', e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                          data-testid="input-primary-color"
                        />
                        <Input
                          value={getValue('brandPrimaryColor', '#3B82F6')}
                          onChange={(e) => handleChange('brandPrimaryColor', e.target.value)}
                          placeholder="#3B82F6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brandSecondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="brandSecondaryColor"
                          type="color"
                          value={getValue('brandSecondaryColor', '#10B981')}
                          onChange={(e) => handleChange('brandSecondaryColor', e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                          data-testid="input-secondary-color"
                        />
                        <Input
                          value={getValue('brandSecondaryColor', '#10B981')}
                          onChange={(e) => handleChange('brandSecondaryColor', e.target.value)}
                          placeholder="#10B981"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="brandLogoUrl">Logo URL</Label>
                    <Input
                      id="brandLogoUrl"
                      value={getValue('brandLogoUrl', '') || ''}
                      onChange={(e) => handleChange('brandLogoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      data-testid="input-logo-url"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL to your company logo (recommended size: 200x50px)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="defaults" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Default Settings
                  </CardTitle>
                  <CardDescription>
                    Set default values for new contracts and calculations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCalculationApproach">Default Calculation Approach</Label>
                    <Select 
                      value={getValue('defaultCalculationApproach', 'manual')}
                      onValueChange={(v) => handleChange('defaultCalculationApproach', v)}
                    >
                      <SelectTrigger id="defaultCalculationApproach" data-testid="select-calc-approach">
                        <SelectValue placeholder="Select approach" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Rules Only</SelectItem>
                        <SelectItem value="erp_rules">ERP Mapping Rules Only</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Default approach for new license fee calculations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
