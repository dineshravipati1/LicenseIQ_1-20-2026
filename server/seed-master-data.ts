/**
 * Master Data Seeding Module
 * 
 * Seeds all essential master data on server startup:
 * - Admin user
 * - Monrovia Nursery Company hierarchy (Company -> Business Units -> Locations)
 * - Admin role assignment
 * 
 * This runs automatically on every server start and is idempotent.
 */

import { db } from './db';
import { 
  users, 
  companies, 
  businessUnits, 
  locations, 
  userOrganizationRoles,
  contractTypeDefinitions
} from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { DEFAULT_EXTRACTION_PROMPTS } from './prompts/defaultContractTypePrompts';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function seedMasterData() {
  console.log('🌱 Seeding Master Data...');

  try {
    // ==========================================
    // STEP 1: Create System Admin User
    // ==========================================
    let adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    const hashedPassword = await hashPassword('Admin@123!');
    
    if (adminUser.length === 0) {
      const [newAdmin] = await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@licenseiq.com',
        role: 'admin',
        isSystemAdmin: true,
      }).returning();
      adminUser = [newAdmin];
      console.log('✓ System Admin user created (admin / Admin@123!)');
    } else {
      // Ensure admin has correct password and isSystemAdmin = true
      await db.update(users)
        .set({ 
          isSystemAdmin: true,
          password: hashedPassword,
          role: 'admin'
        })
        .where(eq(users.username, 'admin'));
      console.log('✓ System Admin user updated (admin / Admin@123!)');
    }

    const adminId = adminUser[0].id;

    // ==========================================
    // STEP 2: Create Monrovia Nursery Company
    // ==========================================
    const MONROVIA_ID = 'monrovia-nursery-company';
    
    const existingCompany = await db.select().from(companies).where(eq(companies.id, MONROVIA_ID)).limit(1);
    
    if (existingCompany.length === 0) {
      await db.insert(companies).values({
        id: MONROVIA_ID,
        companyName: 'Monrovia Nursery Company',
        companyDescr: 'Leading wholesale grower of premium container plants in the United States. Agreements signed at company level cover all facilities for global reporting and royalty payments.',
        address1: '18331 Peckham Rd',
        city: 'Dayton',
        stateProvince: 'Oregon',
        country: 'USA',
        contactPerson: 'Licensing Department',
        contactEmail: 'licensing@monrovia.com',
        contactPhone: '503-000-0000',
        contactPreference: 'email',
        status: 'A', // A=Active
        createdBy: adminId,
        lastUpdatedBy: adminId,
      });
      console.log('✓ Monrovia Nursery Company created');
    } else {
      console.log('✓ Monrovia Nursery Company already exists');
    }

    // ==========================================
    // STEP 3: Create Business Units (Divisions)
    // ==========================================
    const businessUnitsData = [
      {
        id: 'monrovia-branded',
        companyId: MONROVIA_ID,
        orgName: 'Monrovia Branded Division',
        orgDescr: 'Premium branded plant varieties requiring higher royalty rates. Covers branded products with enhanced marketing and quality standards.',
        contactPerson: 'Branded Division Manager',
        contactEmail: 'branded@monrovia.com',
        status: 'A',
        createdBy: adminId,
        lastUpdatedBy: adminId,
      },
      {
        id: 'wight-berryhill-nonbranded',
        companyId: MONROVIA_ID,
        orgName: 'Wight/Berryhill Non-Branded Division',
        orgDescr: 'Non-branded varieties with reduced royalty rates or different terms. Covers generic products for wholesale distribution.',
        contactPerson: 'Non-Branded Division Manager',
        contactEmail: 'nonbranded@monrovia.com',
        status: 'A',
        createdBy: adminId,
        lastUpdatedBy: adminId,
      },
    ];

    for (const bu of businessUnitsData) {
      const existing = await db.select().from(businessUnits).where(eq(businessUnits.id, bu.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(businessUnits).values(bu);
        console.log(`✓ Business Unit created: ${bu.orgName}`);
      }
    }

    // ==========================================
    // STEP 4: Create Locations (Nurseries)
    // ==========================================
    const locationsData = [
      {
        id: 'dayton-oregon-hq',
        companyId: MONROVIA_ID,
        orgId: 'monrovia-branded', // Headquarters - Branded Division
        locName: 'Dayton, Oregon (HQ)',
        locDescr: 'Corporate headquarters and primary production facility. Largest growing operation with full production capacity.',
        address1: '18331 Peckham Rd, Dayton, OR 97114',
        contactPerson: 'Oregon Facility Manager',
        contactEmail: 'dayton@monrovia.com',
        status: 'A',
        createdBy: adminId,
        lastUpdatedBy: adminId,
      },
      {
        id: 'visalia-california',
        companyId: MONROVIA_ID,
        orgId: 'monrovia-branded', // Branded Division
        locName: 'Visalia, California',
        locDescr: 'California production facility serving West Coast markets. Specializes in warm-climate varieties.',
        address1: 'Visalia, CA',
        contactPerson: 'California Facility Manager',
        contactEmail: 'visalia@monrovia.com',
        status: 'A',
        createdBy: adminId,
        lastUpdatedBy: adminId,
      },
      {
        id: 'cairo-georgia',
        companyId: MONROVIA_ID,
        orgId: 'monrovia-branded', // Branded Division
        locName: 'Cairo, Georgia',
        locDescr: 'Southeast production facility. Serves Eastern and Southern markets with region-appropriate varieties.',
        address1: 'Cairo, GA',
        contactPerson: 'Georgia Facility Manager',
        contactEmail: 'cairo@monrovia.com',
        status: 'A',
        createdBy: adminId,
        lastUpdatedBy: adminId,
      },
      {
        id: 'north-carolina',
        companyId: MONROVIA_ID,
        orgId: 'wight-berryhill-nonbranded', // Non-Branded Division
        locName: 'North Carolina',
        locDescr: 'East Coast non-branded production facility. Focuses on wholesale distribution to regional garden centers.',
        address1: 'North Carolina',
        contactPerson: 'NC Facility Manager',
        contactEmail: 'nc@monrovia.com',
        status: 'A',
        createdBy: adminId,
        lastUpdatedBy: adminId,
      },
      {
        id: 'ohio',
        companyId: MONROVIA_ID,
        orgId: 'wight-berryhill-nonbranded', // Non-Branded Division
        locName: 'Ohio',
        locDescr: 'Midwest non-branded production facility. Serves Midwest market with cold-hardy varieties.',
        address1: 'Ohio',
        contactPerson: 'Ohio Facility Manager',
        contactEmail: 'ohio@monrovia.com',
        status: 'A',
        createdBy: adminId,
        lastUpdatedBy: adminId,
      },
    ];

    for (const loc of locationsData) {
      const existing = await db.select().from(locations).where(eq(locations.id, loc.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(locations).values(loc);
        console.log(`✓ Location created: ${loc.locName}`);
      }
    }

    // ==========================================
    // STEP 5: Assign Admin to Monrovia Company
    // ==========================================
    const existingRole = await db.select()
      .from(userOrganizationRoles)
      .where(
        and(
          eq(userOrganizationRoles.userId, adminId),
          eq(userOrganizationRoles.companyId, MONROVIA_ID)
        )
      )
      .limit(1);
    
    if (existingRole.length === 0) {
      await db.insert(userOrganizationRoles).values({
        userId: adminId,
        companyId: MONROVIA_ID,
        businessUnitId: null, // Company-level access (all BUs)
        locationId: null, // All locations
        role: 'owner',
        status: 'A',
        createdBy: adminId,
        lastUpdatedBy: adminId,
      });
      console.log('✓ Admin assigned as Owner to Monrovia Nursery Company');
    }

    // ==========================================
    // STEP 6: Seed Contract Type Definitions
    // ==========================================
    const contractTypes = [
      { code: 'direct_sales', name: 'Direct Sales', description: 'Contracts for direct sales arrangements between manufacturer and customer', sortOrder: 1 },
      { code: 'distributor_reseller', name: 'Distributor/Reseller', description: 'Contracts for distribution and reseller partnerships', sortOrder: 2 },
      { code: 'referral', name: 'Referral', description: 'Referral fee and commission agreements', sortOrder: 3 },
      { code: 'royalty_license', name: 'Royalty / License', description: 'Royalty and licensing agreements for intellectual property', sortOrder: 4 },
      { code: 'rebate_mdf', name: 'Rebate / MDF', description: 'Rebate programs and Market Development Fund agreements', sortOrder: 5 },
      { code: 'chargebacks_claims', name: 'Chargebacks / Claims', description: 'Contracts involving chargebacks, claims processing, and dispute resolution', sortOrder: 6 },
      { code: 'marketplace_platforms', name: 'Market Place/Platforms', description: 'Contracts for marketplace or platform-based sales and partnerships', sortOrder: 7 },
      { code: 'usage_service_based', name: 'Usage / Service Based', description: 'Contracts based on usage metrics or service consumption', sortOrder: 8 },
    ];

    let newContractTypes = 0;
    let updatedPrompts = 0;
    for (const ct of contractTypes) {
      const existing = await db.select().from(contractTypeDefinitions).where(eq(contractTypeDefinitions.code, ct.code)).limit(1);
      const defaultPrompts = DEFAULT_EXTRACTION_PROMPTS[ct.code];
      
      if (existing.length === 0) {
        await db.insert(contractTypeDefinitions).values({
          code: ct.code,
          name: ct.name,
          description: ct.description,
          isSystemType: true,
          isActive: true,
          sortOrder: ct.sortOrder,
          extractionPrompt: defaultPrompts?.extractionPrompt || null,
          ruleExtractionPrompt: defaultPrompts?.ruleExtractionPrompt || null,
          erpMappingPrompt: defaultPrompts?.erpMappingPrompt || null,
          sampleExtractionOutput: defaultPrompts?.sampleExtractionOutput || null,
        });
        newContractTypes++;
      } else if (defaultPrompts && !existing[0].extractionPrompt) {
        // Update existing contract types with default prompts if they don't have prompts yet
        await db.update(contractTypeDefinitions)
          .set({
            extractionPrompt: defaultPrompts.extractionPrompt,
            ruleExtractionPrompt: defaultPrompts.ruleExtractionPrompt,
            erpMappingPrompt: defaultPrompts.erpMappingPrompt,
            sampleExtractionOutput: defaultPrompts.sampleExtractionOutput,
            updatedAt: new Date(),
          })
          .where(eq(contractTypeDefinitions.code, ct.code));
        updatedPrompts++;
      }
    }
    if (newContractTypes > 0) {
      console.log(`✓ Created ${newContractTypes} contract type definitions`);
    }
    if (updatedPrompts > 0) {
      console.log(`✓ Updated ${updatedPrompts} contract types with default prompts`);
    }

    console.log('✅ Master Data seeding complete');
    console.log('   - Monrovia Nursery Company (1 company)');
    console.log('   - 2 Business Units: Monrovia Branded, Wight/Berryhill Non-Branded');
    console.log('   - 5 Locations: Dayton OR (HQ), Visalia CA, Cairo GA, NC, OH');
    console.log(`   - ${contractTypes.length} Contract Type Definitions`);

  } catch (error: any) {
    console.error('⚠ Master Data seeding warning:', error.message);
  }
}
