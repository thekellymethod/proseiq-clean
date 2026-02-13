"use client";

import { motion, useReducedMotion } from "framer-motion";

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  /** When true, animate when scrolling into view. When false, animate on mount. */
  triggerOnView?: boolean;
};

export function StaggerContainer({
  children,
  className = "",
  delay = 0,
  once = true,
  triggerOnView = true,
}: StaggerProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(triggerOnView ? { whileInView: "visible", viewport: { once, margin: "-40px" } } : { animate: "visible" })}
      variants={reduceMotion ? undefined : staggerVariants}
      transition={{ delayChildren: delay, staggerChildren: reduceMotion ? 0 : 0.08 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  delay = 0,
}: StaggerProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : itemVariants}
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
};

export function FadeIn({ children, className = "", delay = 0, once = true }: FadeInProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      viewport={{ once, margin: "-30px" }}
    >
      {children}
    </motion.div>
  );
}
