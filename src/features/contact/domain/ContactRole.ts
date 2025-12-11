export enum ContactRole {
 
  PROPERTY_OWNER = "PROPERTY_OWNER",
  BUILDING_OWNER = "BUILDING_OWNER",
  REAL_ESTATE_INVESTOR = "REAL_ESTATE_INVESTOR",
  DEVELOPER = "DEVELOPER",
  MANAGING_PARTNER = "MANAGING_PARTNER",
  
 
  BOARD_MEMBER = "BOARD_MEMBER",
  PRESIDENT_CEO = "PRESIDENT_CEO",
  VICE_PRESIDENT = "VICE_PRESIDENT",
  
 
  PROPERTY_MANAGER = "PROPERTY_MANAGER",
  CAM = "CAM",
  HOA_MANAGER = "HOA_MANAGER",
  BUILDING_MANAGER = "BUILDING_MANAGER",
  FACILITY_MANAGER = "FACILITY_MANAGER",
  MAINTENANCE_SUPERVISOR = "MAINTENANCE_SUPERVISOR",
  
 
  ARCHITECT = "ARCHITECT",
  STRUCTURAL_ENGINEER = "STRUCTURAL_ENGINEER",
  CIVIL_ENGINEER = "CIVIL_ENGINEER",
  MEP_ENGINEER = "MEP_ENGINEER",
  DESIGNER = "DESIGNER",
  INTERIOR_DESIGNER = "INTERIOR_DESIGNER",
  
 
  CONSULTANT = "CONSULTANT",
  WATERPROOFING_CONSULTANT = "WATERPROOFING_CONSULTANT",
  CONCRETE_RESTORATION_CONSULTANT = "CONCRETE_RESTORATION_CONSULTANT",
  
 
  GENERAL_CONTRACTOR = "GENERAL_CONTRACTOR",
  CONSTRUCTION_MANAGER = "CONSTRUCTION_MANAGER",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  ASSISTANT_PROJECT_MANAGER = "ASSISTANT_PROJECT_MANAGER",
  SUPERINTENDENT = "SUPERINTENDENT",
  FOREMAN = "FOREMAN",
  SITE_SUPERVISOR = "SITE_SUPERVISOR",
  ESTIMATOR = "ESTIMATOR",
  SCHEDULER = "SCHEDULER",
  SAFETY_MANAGER = "SAFETY_MANAGER",
  
 
  SUBCONTRACTOR_PLUMBING = "SUBCONTRACTOR_PLUMBING",
  SUBCONTRACTOR_ELECTRICAL = "SUBCONTRACTOR_ELECTRICAL",
  SUBCONTRACTOR_HVAC = "SUBCONTRACTOR_HVAC",
  SUBCONTRACTOR_CONCRETE = "SUBCONTRACTOR_CONCRETE",
  SUBCONTRACTOR_WATERPROOFING = "SUBCONTRACTOR_WATERPROOFING",
  
 
  MATERIAL_SUPPLIER = "MATERIAL_SUPPLIER",
  MANUFACTURER_REPRESENTATIVE = "MANUFACTURER_REPRESENTATIVE",
  EQUIPMENT_RENTAL_PROVIDER = "EQUIPMENT_RENTAL_PROVIDER",
  
 
  LENDER = "LENDER",
  LOAN_OFFICER = "LOAN_OFFICER",
  INSURANCE_AGENT = "INSURANCE_AGENT",
  INSURANCE_ADJUSTER = "INSURANCE_ADJUSTER",
  ACCOUNTANT = "ACCOUNTANT",
  ATTORNEY_CONSTRUCTION = "ATTORNEY_CONSTRUCTION",
  ATTORNEY_REAL_ESTATE = "ATTORNEY_REAL_ESTATE",
  
 
  SALES_REPRESENTATIVE = "SALES_REPRESENTATIVE",
  BUSINESS_DEVELOPMENT_MANAGER = "BUSINESS_DEVELOPMENT_MANAGER",
  ACCOUNT_MANAGER = "ACCOUNT_MANAGER",
  CUSTOMER_SERVICE_REPRESENTATIVE = "CUSTOMER_SERVICE_REPRESENTATIVE",
  
 
  OFFICE_MANAGER = "OFFICE_MANAGER",
  ADMINISTRATOR = "ADMINISTRATOR",
  EXECUTIVE_ASSISTANT = "EXECUTIVE_ASSISTANT",
}

export const ContactRoleLabels: Record<ContactRole, string> = {
 
  [ContactRole.PROPERTY_OWNER]: "Property Owner",
  [ContactRole.BUILDING_OWNER]: "Building Owner",
  [ContactRole.REAL_ESTATE_INVESTOR]: "Real Estate Investor",
  [ContactRole.DEVELOPER]: "Developer",
  [ContactRole.MANAGING_PARTNER]: "Managing Partner",
  
 
  [ContactRole.BOARD_MEMBER]: "Board Member (HOA / Condo Association)",
  [ContactRole.PRESIDENT_CEO]: "President / CEO",
  [ContactRole.VICE_PRESIDENT]: "Vice President",
  
 
  [ContactRole.PROPERTY_MANAGER]: "Property Manager",
  [ContactRole.CAM]: "Community Association Manager (CAM)",
  [ContactRole.HOA_MANAGER]: "HOA / Condo Association Manager",
  [ContactRole.BUILDING_MANAGER]: "Building Manager",
  [ContactRole.FACILITY_MANAGER]: "Facility Manager",
  [ContactRole.MAINTENANCE_SUPERVISOR]: "Maintenance Supervisor",
  
 
  [ContactRole.ARCHITECT]: "Architect",
  [ContactRole.STRUCTURAL_ENGINEER]: "Structural Engineer",
  [ContactRole.CIVIL_ENGINEER]: "Civil Engineer",
  [ContactRole.MEP_ENGINEER]: "MEP Engineer",
  [ContactRole.DESIGNER]: "Designer",
  [ContactRole.INTERIOR_DESIGNER]: "Interior Designer",
  
 
  [ContactRole.CONSULTANT]: "Consultant",
  [ContactRole.WATERPROOFING_CONSULTANT]: "Waterproofing Consultant",
  [ContactRole.CONCRETE_RESTORATION_CONSULTANT]: "Concrete Restoration Consultant",
  
 
  [ContactRole.GENERAL_CONTRACTOR]: "General Contractor",
  [ContactRole.CONSTRUCTION_MANAGER]: "Construction Manager",
  [ContactRole.PROJECT_MANAGER]: "Project Manager",
  [ContactRole.ASSISTANT_PROJECT_MANAGER]: "Assistant Project Manager",
  [ContactRole.SUPERINTENDENT]: "Superintendent",
  [ContactRole.FOREMAN]: "Foreman",
  [ContactRole.SITE_SUPERVISOR]: "Site Supervisor",
  [ContactRole.ESTIMATOR]: "Estimator",
  [ContactRole.SCHEDULER]: "Scheduler",
  [ContactRole.SAFETY_MANAGER]: "Safety Manager",
  
 
  [ContactRole.SUBCONTRACTOR_PLUMBING]: "Subcontractor – Plumbing",
  [ContactRole.SUBCONTRACTOR_ELECTRICAL]: "Subcontractor – Electrical",
  [ContactRole.SUBCONTRACTOR_HVAC]: "Subcontractor – HVAC",
  [ContactRole.SUBCONTRACTOR_CONCRETE]: "Subcontractor – Concrete / Structural",
  [ContactRole.SUBCONTRACTOR_WATERPROOFING]: "Subcontractor – Waterproofing",
  
 
  [ContactRole.MATERIAL_SUPPLIER]: "Material Supplier",
  [ContactRole.MANUFACTURER_REPRESENTATIVE]: "Manufacturer Representative",
  [ContactRole.EQUIPMENT_RENTAL_PROVIDER]: "Equipment Rental Provider",
  
 
  [ContactRole.LENDER]: "Lender / Bank Representative",
  [ContactRole.LOAN_OFFICER]: "Loan Officer",
  [ContactRole.INSURANCE_AGENT]: "Insurance Agent",
  [ContactRole.INSURANCE_ADJUSTER]: "Insurance Adjuster",
  [ContactRole.ACCOUNTANT]: "Accountant / CPA",
  [ContactRole.ATTORNEY_CONSTRUCTION]: "Attorney – Construction",
  [ContactRole.ATTORNEY_REAL_ESTATE]: "Attorney – Real Estate",
  
 
  [ContactRole.SALES_REPRESENTATIVE]: "Sales Representative",
  [ContactRole.BUSINESS_DEVELOPMENT_MANAGER]: "Business Development Manager",
  [ContactRole.ACCOUNT_MANAGER]: "Account Manager",
  [ContactRole.CUSTOMER_SERVICE_REPRESENTATIVE]: "Customer Service Representative",
  
 
  [ContactRole.OFFICE_MANAGER]: "Office Manager",
  [ContactRole.ADMINISTRATOR]: "Administrator",
  [ContactRole.EXECUTIVE_ASSISTANT]: "Executive Assistant",
};

export const contactRoleOptions = Object.entries(ContactRoleLabels).map(([value, label]) => ({
  value,
  label,
}));
