"use client";

import { useContactsPageLogic } from "../hooks";
import { ContactsPageView } from "./ContactsPageView";


export default function ContactsPage() {
  const logic = useContactsPageLogic();
  
  return <ContactsPageView logic={logic} />;
}
