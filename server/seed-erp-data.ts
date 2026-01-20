/**
 * ERP Systems, Entities, Fields, and LicenseIQ Schema Seed Data
 * This seeds all ERP configurations needed for production
 * Uses upsert logic based on unique fields, not IDs
 */

import { db } from "./db";
import { users, erpSystems, erpEntities, erpFields, licenseiqEntities, licenseiqFields, erpLicenseiqFieldMappings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function seedErpData() {
  console.log("🌱 Seeding ERP Systems and Schema Data...");
  
  try {
    // Get admin user ID first (required for createdBy fields)
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    if (adminUser.length === 0) {
      console.log("  ⚠ Admin user not found, skipping ERP seeding");
      return;
    }
    const adminId = adminUser[0].id;

    // ==========================================
    // STEP 1: Seed ERP Systems (check by name)
    // ==========================================
    const erpSystemsData = [
      { name: "Oracle EBS", vendor: "oracle", description: "Oracle E-Business Suite - Enterprise Resource Planning system", createdBy: adminId },
      { name: "SAP S/4HANA", vendor: "sap", description: "SAP S/4HANA - Next-generation ERP suite", createdBy: adminId },
      { name: "NetSuite", vendor: "oracle", description: "NetSuite Cloud ERP - Unified business management suite", createdBy: adminId },
      { name: "Microsoft Dynamics 365", vendor: "microsoft", description: "Dynamics 365 ERP platform", createdBy: adminId },
      { name: "Workday", vendor: "workday", description: "Workday Financial Management", createdBy: adminId },
      { name: "Oracle Fusion Cloud ERP", vendor: "oracle", description: "Oracle Fusion Cloud ERP - Complete cloud-based enterprise resource planning solution", createdBy: adminId },
    ];

    let systemsCount = 0;
    for (const system of erpSystemsData) {
      const existing = await db.select().from(erpSystems).where(eq(erpSystems.name, system.name)).limit(1);
      if (existing.length === 0) {
        await db.insert(erpSystems).values(system);
        systemsCount++;
      }
    }
    console.log(`  ✓ ERP Systems: ${systemsCount} new, ${erpSystemsData.length - systemsCount} existing`);

    // Get system IDs by name for entity references
    const oracleEbsResult = await db.select().from(erpSystems).where(eq(erpSystems.name, "Oracle EBS")).limit(1);
    const oracleFusionResult = await db.select().from(erpSystems).where(eq(erpSystems.name, "Oracle Fusion Cloud ERP")).limit(1);
    
    if (oracleEbsResult.length === 0 || oracleFusionResult.length === 0) {
      console.log("  ⚠ ERP Systems not found, skipping entity seeding");
      return;
    }
    
    const oracleEbsId = oracleEbsResult[0].id;
    const oracleFusionId = oracleFusionResult[0].id;

    // ==========================================
    // STEP 2: Seed Oracle EBS Entities (check by name + systemId)
    // ==========================================
    const oracleEbsEntities = [
      { systemId: oracleEbsId, name: "Customers", technicalName: "HZ_PARTIES", entityType: "master_data", description: "Customer master data", status: "active", createdBy: adminId },
      { systemId: oracleEbsId, name: "Customer Accounts", technicalName: "HZ_CUST_ACCOUNTS", entityType: "master_data", description: "Customer account information", status: "active", createdBy: adminId },
      { systemId: oracleEbsId, name: "Items", technicalName: "MTL_SYSTEM_ITEMS_B", entityType: "master_data", description: "Inventory items master data", status: "active", createdBy: adminId },
      { systemId: oracleEbsId, name: "Suppliers", technicalName: "PO_VENDORS", entityType: "master_data", description: "Supplier/vendor master data", status: "active", createdBy: adminId },
      { systemId: oracleEbsId, name: "Sales Orders", technicalName: "OE_ORDER_HEADERS_ALL", entityType: "transactional", description: "Sales order headers", status: "active", createdBy: adminId },
      { systemId: oracleEbsId, name: "Invoices", technicalName: "RA_CUSTOMER_TRX_ALL", entityType: "transactional", description: "AR invoices", status: "active", createdBy: adminId },
      { systemId: oracleEbsId, name: "Item Categories", technicalName: "MTL_CATEGORIES_B", entityType: "master_data", description: "Item category definitions", status: "active", createdBy: adminId },
      { systemId: oracleEbsId, name: "Sales Order Lines", technicalName: "OE_ORDER_LINES_ALL", entityType: "transactional", description: "Sales order line details", status: "active", createdBy: adminId },
    ];

    let entitiesCount = 0;
    for (const entity of oracleEbsEntities) {
      const existing = await db.select().from(erpEntities).where(
        and(eq(erpEntities.systemId, entity.systemId), eq(erpEntities.name, entity.name))
      ).limit(1);
      if (existing.length === 0) {
        await db.insert(erpEntities).values(entity);
        entitiesCount++;
      }
    }
    console.log(`  ✓ Oracle EBS Entities: ${entitiesCount} new`);

    // ==========================================
    // STEP 3: Seed Oracle Fusion Cloud ERP Entities
    // ==========================================
    const oracleFusionEntities = [
      { systemId: oracleFusionId, name: "Items", technicalName: "INV_ITEMS", entityType: "master_data", description: "Inventory items in Oracle Fusion", status: "active", createdBy: adminId },
      { systemId: oracleFusionId, name: "Sales Transactions", technicalName: "AR_TRANSACTIONS", entityType: "transactional", description: "Sales/AR transactions", status: "active", createdBy: adminId },
      { systemId: oracleFusionId, name: "Customers", technicalName: "HZ_PARTIES", entityType: "master_data", description: "Customer master data", status: "active", createdBy: adminId },
      { systemId: oracleFusionId, name: "Invoices", technicalName: "RA_CUSTOMER_TRX", entityType: "transactional", description: "Invoice transactions", status: "active", createdBy: adminId },
      { systemId: oracleFusionId, name: "Suppliers", technicalName: "AP_SUPPLIERS", entityType: "master_data", description: "Supplier/vendor master data", status: "active", createdBy: adminId },
    ];

    let fusionCount = 0;
    for (const entity of oracleFusionEntities) {
      const existing = await db.select().from(erpEntities).where(
        and(eq(erpEntities.systemId, entity.systemId), eq(erpEntities.name, entity.name))
      ).limit(1);
      if (existing.length === 0) {
        await db.insert(erpEntities).values(entity);
        fusionCount++;
      }
    }
    console.log(`  ✓ Oracle Fusion Entities: ${fusionCount} new`);

    // Get Items entity ID for field references
    const itemsEntityResult = await db.select().from(erpEntities).where(
      and(eq(erpEntities.systemId, oracleEbsId), eq(erpEntities.name, "Items"))
    ).limit(1);

    // ==========================================
    // STEP 4: Seed ERP Fields for Oracle EBS Items
    // ==========================================
    if (itemsEntityResult.length > 0) {
      const itemsEntityId = itemsEntityResult[0].id;
      const oracleEbsItemFields = [
        { entityId: itemsEntityId, fieldName: "INVENTORY_ITEM_ID", displayName: "Item ID", dataType: "NUMBER", isPrimaryKey: true, isRequired: true },
        { entityId: itemsEntityId, fieldName: "SEGMENT1", displayName: "Item Number", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: true },
        { entityId: itemsEntityId, fieldName: "DESCRIPTION", displayName: "Description", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: itemsEntityId, fieldName: "PRIMARY_UOM_CODE", displayName: "UOM", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: itemsEntityId, fieldName: "ITEM_TYPE", displayName: "Item Type", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: itemsEntityId, fieldName: "LIST_PRICE_PER_UNIT", displayName: "List Price", dataType: "NUMBER", isPrimaryKey: false, isRequired: false },
      ];

      let fieldsCount = 0;
      for (const field of oracleEbsItemFields) {
        const existing = await db.select().from(erpFields).where(
          and(eq(erpFields.entityId, field.entityId), eq(erpFields.fieldName, field.fieldName))
        ).limit(1);
        if (existing.length === 0) {
          await db.insert(erpFields).values(field);
          fieldsCount++;
        }
      }
      console.log(`  ✓ Oracle EBS Fields: ${fieldsCount} new`);
    }

    // ==========================================
    // STEP 5: Seed LicenseIQ Schema Entities (check by technicalName)
    // ==========================================
    const licenseiqEntitiesData = [
      { name: "Item Master", technicalName: "item_master" },
      { name: "Sales Transactions", technicalName: "sales_transactions" },
      { name: "Customers", technicalName: "customers" },
      { name: "Invoices", technicalName: "invoices" },
      { name: "Items", technicalName: "items" },
      { name: "Vendors", technicalName: "vendors" },
    ];

    let liqEntCount = 0;
    for (const entity of licenseiqEntitiesData) {
      const existing = await db.select().from(licenseiqEntities).where(eq(licenseiqEntities.technicalName, entity.technicalName)).limit(1);
      if (existing.length === 0) {
        await db.insert(licenseiqEntities).values(entity);
        liqEntCount++;
      }
    }
    console.log(`  ✓ LicenseIQ Entities: ${liqEntCount} new`);

    // Get LicenseIQ entity IDs by technicalName
    const itemMasterResult = await db.select().from(licenseiqEntities).where(eq(licenseiqEntities.technicalName, "item_master")).limit(1);
    const salesTxnResult = await db.select().from(licenseiqEntities).where(eq(licenseiqEntities.technicalName, "sales_transactions")).limit(1);

    // ==========================================
    // STEP 6: Seed LicenseIQ Schema Fields - Item Master
    // ==========================================
    if (itemMasterResult.length > 0) {
      const itemMasterId = itemMasterResult[0].id;
      const itemMasterFields = [
        { entityId: itemMasterId, fieldName: "ITEM_ID", displayName: "Item ID", dataType: "VARCHAR", isPrimaryKey: true, isRequired: true },
        { entityId: itemMasterId, fieldName: "ITEM_NAME", displayName: "Item Name", dataType: "VARCHAR", isPrimaryKey: false, isRequired: true },
        { entityId: itemMasterId, fieldName: "DESCRIPTION", displayName: "Description", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: itemMasterId, fieldName: "UNIT_PRICE", displayName: "Unit Price", dataType: "DECIMAL", isPrimaryKey: false, isRequired: false },
        { entityId: itemMasterId, fieldName: "CATEGORY", displayName: "Category", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: itemMasterId, fieldName: "UOM", displayName: "Unit of Measure", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: itemMasterId, fieldName: "STATUS", displayName: "Status", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: itemMasterId, fieldName: "ITEM_CLASS", displayName: "Item Class", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
      ];

      let itemFieldsCount = 0;
      for (const field of itemMasterFields) {
        const existing = await db.select().from(licenseiqFields).where(
          and(eq(licenseiqFields.entityId, field.entityId), eq(licenseiqFields.fieldName, field.fieldName))
        ).limit(1);
        if (existing.length === 0) {
          await db.insert(licenseiqFields).values(field);
          itemFieldsCount++;
        }
      }
      console.log(`  ✓ LicenseIQ Item Master Fields: ${itemFieldsCount} new`);
    }

    // ==========================================
    // STEP 7: Seed LicenseIQ Schema Fields - Sales Transactions
    // ==========================================
    if (salesTxnResult.length > 0) {
      const salesTxnId = salesTxnResult[0].id;
      const salesTxnFields = [
        { entityId: salesTxnId, fieldName: "TXN_ID", displayName: "Transaction ID", dataType: "VARCHAR", isPrimaryKey: true, isRequired: true },
        { entityId: salesTxnId, fieldName: "TXN_DATE", displayName: "Transaction Date", dataType: "DATE", isPrimaryKey: false, isRequired: true },
        { entityId: salesTxnId, fieldName: "CUSTOMER_ID", displayName: "Customer ID", dataType: "VARCHAR", isPrimaryKey: false, isRequired: true },
        { entityId: salesTxnId, fieldName: "ITEM_ID", displayName: "Item ID", dataType: "VARCHAR", isPrimaryKey: false, isRequired: true },
        { entityId: salesTxnId, fieldName: "QUANTITY", displayName: "Quantity", dataType: "DECIMAL", isPrimaryKey: false, isRequired: true },
        { entityId: salesTxnId, fieldName: "UNIT_PRICE", displayName: "Unit Price", dataType: "DECIMAL", isPrimaryKey: false, isRequired: false },
        { entityId: salesTxnId, fieldName: "AMOUNT", displayName: "Amount", dataType: "DECIMAL", isPrimaryKey: false, isRequired: false },
        { entityId: salesTxnId, fieldName: "TERRITORY", displayName: "Territory", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: salesTxnId, fieldName: "CONTAINER_SIZE", displayName: "Container Size", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: salesTxnId, fieldName: "ITEM_CLASS", displayName: "Item Class", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
      ];

      let salesFieldsCount = 0;
      for (const field of salesTxnFields) {
        const existing = await db.select().from(licenseiqFields).where(
          and(eq(licenseiqFields.entityId, field.entityId), eq(licenseiqFields.fieldName, field.fieldName))
        ).limit(1);
        if (existing.length === 0) {
          await db.insert(licenseiqFields).values(field);
          salesFieldsCount++;
        }
      }
      console.log(`  ✓ LicenseIQ Sales Transaction Fields: ${salesFieldsCount} new`);
    }

    // ==========================================
    // STEP 8: Seed Oracle Fusion Items Fields
    // ==========================================
    const fusionItemsEntity = await db.select().from(erpEntities).where(
      and(eq(erpEntities.systemId, oracleFusionId), eq(erpEntities.name, "Items"))
    ).limit(1);
    
    if (fusionItemsEntity.length > 0) {
      const fusionItemsId = fusionItemsEntity[0].id;
      const fusionItemFields = [
        { entityId: fusionItemsId, fieldName: "ItemNumber", displayName: "Item Number", dataType: "VARCHAR2", isPrimaryKey: true, isRequired: true },
        { entityId: fusionItemsId, fieldName: "ItemDescription", displayName: "Description", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionItemsId, fieldName: "ItemType", displayName: "Item Type", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionItemsId, fieldName: "ItemStatus", displayName: "Status", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionItemsId, fieldName: "ItemClass", displayName: "Item Class", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionItemsId, fieldName: "PrimaryUOMCode", displayName: "UOM", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionItemsId, fieldName: "ListPrice", displayName: "List Price", dataType: "NUMBER", isPrimaryKey: false, isRequired: false },
      ];

      let fusionItemFieldsCount = 0;
      for (const field of fusionItemFields) {
        const existing = await db.select().from(erpFields).where(
          and(eq(erpFields.entityId, field.entityId), eq(erpFields.fieldName, field.fieldName))
        ).limit(1);
        if (existing.length === 0) {
          await db.insert(erpFields).values(field);
          fusionItemFieldsCount++;
        }
      }
      console.log(`  ✓ Oracle Fusion Items Fields: ${fusionItemFieldsCount} new`);
    }

    // ==========================================
    // STEP 9: Seed Oracle Fusion Suppliers Fields
    // ==========================================
    const fusionSuppliersEntity = await db.select().from(erpEntities).where(
      and(eq(erpEntities.systemId, oracleFusionId), eq(erpEntities.name, "Suppliers"))
    ).limit(1);
    
    if (fusionSuppliersEntity.length > 0) {
      const fusionSuppliersId = fusionSuppliersEntity[0].id;
      const fusionSupplierFields = [
        { entityId: fusionSuppliersId, fieldName: "SupplierNumber", displayName: "Supplier Number", dataType: "VARCHAR2", isPrimaryKey: true, isRequired: true },
        { entityId: fusionSuppliersId, fieldName: "SupplierName", displayName: "Supplier Name", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: true },
        { entityId: fusionSuppliersId, fieldName: "SupplierType", displayName: "Supplier Type", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionSuppliersId, fieldName: "Status", displayName: "Status", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionSuppliersId, fieldName: "PaymentTermsName", displayName: "Payment Terms", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionSuppliersId, fieldName: "PaymentMethodCode", displayName: "Payment Method", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionSuppliersId, fieldName: "PaymentCurrencyCode", displayName: "Currency", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
        { entityId: fusionSuppliersId, fieldName: "TaxRegistrationNumber", displayName: "Tax ID", dataType: "VARCHAR2", isPrimaryKey: false, isRequired: false },
      ];

      let fusionSupplierFieldsCount = 0;
      for (const field of fusionSupplierFields) {
        const existing = await db.select().from(erpFields).where(
          and(eq(erpFields.entityId, field.entityId), eq(erpFields.fieldName, field.fieldName))
        ).limit(1);
        if (existing.length === 0) {
          await db.insert(erpFields).values(field);
          fusionSupplierFieldsCount++;
        }
      }
      console.log(`  ✓ Oracle Fusion Suppliers Fields: ${fusionSupplierFieldsCount} new`);
    }

    // ==========================================
    // STEP 10: Seed LicenseIQ Items Fields
    // ==========================================
    const liqItemsResult = await db.select().from(licenseiqEntities).where(eq(licenseiqEntities.technicalName, "items")).limit(1);
    if (liqItemsResult.length > 0) {
      const liqItemsId = liqItemsResult[0].id;
      const liqItemFields = [
        { entityId: liqItemsId, fieldName: "item_number", displayName: "Item Number", dataType: "VARCHAR", isPrimaryKey: true, isRequired: true },
        { entityId: liqItemsId, fieldName: "description", displayName: "Description", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqItemsId, fieldName: "item_type", displayName: "Item Type", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqItemsId, fieldName: "item_status", displayName: "Status", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqItemsId, fieldName: "item_class", displayName: "Item Class", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqItemsId, fieldName: "uom", displayName: "Unit of Measure", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqItemsId, fieldName: "price_tier", displayName: "Price Tier", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
      ];

      let liqItemFieldsCount = 0;
      for (const field of liqItemFields) {
        const existing = await db.select().from(licenseiqFields).where(
          and(eq(licenseiqFields.entityId, field.entityId), eq(licenseiqFields.fieldName, field.fieldName))
        ).limit(1);
        if (existing.length === 0) {
          await db.insert(licenseiqFields).values(field);
          liqItemFieldsCount++;
        }
      }
      console.log(`  ✓ LicenseIQ Items Fields: ${liqItemFieldsCount} new`);
    }

    // ==========================================
    // STEP 11: Seed LicenseIQ Vendors Fields
    // ==========================================
    const liqVendorsResult = await db.select().from(licenseiqEntities).where(eq(licenseiqEntities.technicalName, "vendors")).limit(1);
    if (liqVendorsResult.length > 0) {
      const liqVendorsId = liqVendorsResult[0].id;
      const liqVendorFields = [
        { entityId: liqVendorsId, fieldName: "vendor_number", displayName: "Vendor Number", dataType: "VARCHAR", isPrimaryKey: true, isRequired: true },
        { entityId: liqVendorsId, fieldName: "vendor_name", displayName: "Vendor Name", dataType: "VARCHAR", isPrimaryKey: false, isRequired: true },
        { entityId: liqVendorsId, fieldName: "vendor_type", displayName: "Vendor Type", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqVendorsId, fieldName: "vendor_status", displayName: "Status", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqVendorsId, fieldName: "payment_terms", displayName: "Payment Terms", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqVendorsId, fieldName: "payment_method", displayName: "Payment Method", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqVendorsId, fieldName: "currency", displayName: "Currency", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
        { entityId: liqVendorsId, fieldName: "tax_id_number", displayName: "Tax ID", dataType: "VARCHAR", isPrimaryKey: false, isRequired: false },
      ];

      let liqVendorFieldsCount = 0;
      for (const field of liqVendorFields) {
        const existing = await db.select().from(licenseiqFields).where(
          and(eq(licenseiqFields.entityId, field.entityId), eq(licenseiqFields.fieldName, field.fieldName))
        ).limit(1);
        if (existing.length === 0) {
          await db.insert(licenseiqFields).values(field);
          liqVendorFieldsCount++;
        }
      }
      console.log(`  ✓ LicenseIQ Vendors Fields: ${liqVendorFieldsCount} new`);
    }

    // ==========================================
    // STEP 12: Seed ERP-LicenseIQ Field Mappings
    // ==========================================
    const fusionItems = await db.select().from(erpEntities).where(
      and(eq(erpEntities.systemId, oracleFusionId), eq(erpEntities.name, "Items"))
    ).limit(1);
    const fusionSuppliers = await db.select().from(erpEntities).where(
      and(eq(erpEntities.systemId, oracleFusionId), eq(erpEntities.name, "Suppliers"))
    ).limit(1);
    const liqItems = await db.select().from(licenseiqEntities).where(eq(licenseiqEntities.technicalName, "items")).limit(1);
    const liqVendors = await db.select().from(licenseiqEntities).where(eq(licenseiqEntities.technicalName, "vendors")).limit(1);

    if (fusionItems.length > 0 && liqItems.length > 0) {
      const fusionItemFields = await db.select().from(erpFields).where(eq(erpFields.entityId, fusionItems[0].id));
      const liqItemFieldsAll = await db.select().from(licenseiqFields).where(eq(licenseiqFields.entityId, liqItems[0].id));

      const erpFieldMap = new Map(fusionItemFields.map(f => [f.fieldName, f.id]));
      const liqFieldMap = new Map(liqItemFieldsAll.map(f => [f.fieldName, f.id]));

      const itemMappings = [
        { erpField: "ItemNumber", liqField: "item_number" },
        { erpField: "ItemDescription", liqField: "description" },
        { erpField: "ItemType", liqField: "item_type" },
        { erpField: "ItemStatus", liqField: "item_status" },
        { erpField: "ItemClass", liqField: "item_class" },
        { erpField: "PrimaryUOMCode", liqField: "uom" },
        { erpField: "ListPrice", liqField: "price_tier" },
      ];

      let itemMappingsCount = 0;
      for (const mapping of itemMappings) {
        const erpFieldId = erpFieldMap.get(mapping.erpField);
        const liqFieldId = liqFieldMap.get(mapping.liqField);
        
        if (erpFieldId && liqFieldId) {
          const existing = await db.select().from(erpLicenseiqFieldMappings).where(
            and(
              eq(erpLicenseiqFieldMappings.erpFieldId, erpFieldId),
              eq(erpLicenseiqFieldMappings.licenseiqFieldId, liqFieldId)
            )
          ).limit(1);
          
          if (existing.length === 0) {
            await db.insert(erpLicenseiqFieldMappings).values({
              erpSystemId: oracleFusionId,
              erpEntityId: fusionItems[0].id,
              erpFieldId: erpFieldId,
              licenseiqEntityId: liqItems[0].id,
              licenseiqFieldId: liqFieldId,
              mappingType: "direct",
              isActive: true
            });
            itemMappingsCount++;
          }
        }
      }
      console.log(`  ✓ ERP-LicenseIQ Items Mappings: ${itemMappingsCount} new`);
    }

    if (fusionSuppliers.length > 0 && liqVendors.length > 0) {
      const fusionSupplierFields = await db.select().from(erpFields).where(eq(erpFields.entityId, fusionSuppliers[0].id));
      const liqVendorFieldsAll = await db.select().from(licenseiqFields).where(eq(licenseiqFields.entityId, liqVendors[0].id));

      const erpFieldMap = new Map(fusionSupplierFields.map(f => [f.fieldName, f.id]));
      const liqFieldMap = new Map(liqVendorFieldsAll.map(f => [f.fieldName, f.id]));

      const vendorMappings = [
        { erpField: "SupplierNumber", liqField: "vendor_number" },
        { erpField: "SupplierName", liqField: "vendor_name" },
        { erpField: "SupplierType", liqField: "vendor_type" },
        { erpField: "Status", liqField: "vendor_status" },
        { erpField: "PaymentTermsName", liqField: "payment_terms" },
        { erpField: "PaymentMethodCode", liqField: "payment_method" },
        { erpField: "PaymentCurrencyCode", liqField: "currency" },
        { erpField: "TaxRegistrationNumber", liqField: "tax_id_number" },
      ];

      let vendorMappingsCount = 0;
      for (const mapping of vendorMappings) {
        const erpFieldId = erpFieldMap.get(mapping.erpField);
        const liqFieldId = liqFieldMap.get(mapping.liqField);
        
        if (erpFieldId && liqFieldId) {
          const existing = await db.select().from(erpLicenseiqFieldMappings).where(
            and(
              eq(erpLicenseiqFieldMappings.erpFieldId, erpFieldId),
              eq(erpLicenseiqFieldMappings.licenseiqFieldId, liqFieldId)
            )
          ).limit(1);
          
          if (existing.length === 0) {
            await db.insert(erpLicenseiqFieldMappings).values({
              erpSystemId: oracleFusionId,
              erpEntityId: fusionSuppliers[0].id,
              erpFieldId: erpFieldId,
              licenseiqEntityId: liqVendors[0].id,
              licenseiqFieldId: liqFieldId,
              mappingType: "direct",
              isActive: true
            });
            vendorMappingsCount++;
          }
        }
      }
      console.log(`  ✓ ERP-LicenseIQ Vendors Mappings: ${vendorMappingsCount} new`);
    }

    console.log("✅ ERP and Schema Data seeding complete");
  } catch (error) {
    console.error("Error seeding ERP data:", error);
    throw error;
  }
}
