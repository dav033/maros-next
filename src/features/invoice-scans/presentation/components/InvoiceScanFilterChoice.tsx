"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

export const MotionFilterButton = motion.create(Button);

export function filterChoiceLayoutId(key: string, value: string): string {
  return `maros-invoice-filter-${key}-${value}`;
}
