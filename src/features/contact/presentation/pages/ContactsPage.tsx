"use client";

import { useContactsPageLogic } from "../hooks";
import { ContactsPageView } from "./ContactsPageView";
import type { ContactsPageData } from "../data/loadContactsData";

export interface ContactsPageProps {
  initialData?: ContactsPageData;
}

export default function ContactsPage({ initialData }: ContactsPageProps = {}) {
  const logic = useContactsPageLogic(initialData);
  
  return <ContactsPageView logic={logic} />;
}
