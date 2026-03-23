import { CustomersPage } from "@/customers";
import { loadCustomersData } from "@/customers/presentation/data/loadCustomersData";

async function CustomersPageWithData() {
  const initialData = await loadCustomersData();
  return <CustomersPage initialData={initialData} />;
}

export default function CustomersRoutePage() {
  return <CustomersPageWithData />;
}
