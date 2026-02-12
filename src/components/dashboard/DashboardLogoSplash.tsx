"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DashboardLogoSplash() {
  const [visible, setVisible] = useState(true);
  const [targetPos, setTargetPos] = useState({ left: 16, top: 24 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  useEffect(() => {
    const readPosition = () => {
      const el = document.getElementById("header-logo");
      if (el) {
        const r = el.getBoundingClientRect();
        setTargetPos({ left: r.left, top: r.top });
      }
    };
    const t = setTimeout(readPosition, 200);
    window.addEventListener("resize", readPosition);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", readPosition);
    };
  }, []);

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9998]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Overlay backdrop */}
          <div className="absolute inset-0 bg-[var(--navy)]/95" />

          {/* Single logo: large center with 3D brilliance → shrink to top-left */}
          <motion.div
            className="absolute z-10 flex items-center justify-center overflow-visible"
            style={{ perspective: 1000 }}
            initial={{
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
              width: 220,
              height: 220,
            }}
            animate={{
              left: targetPos.left,
              top: targetPos.top,
              x: 0,
              y: 0,
              width: 48,
              height: 48,
            }}
            transition={{
              delay: 1.2,
              duration: 1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <motion.div
              className="relative flex h-full w-full items-center justify-center rounded-2xl border border-amber-300/30 bg-black/30 p-3 shadow-2xl"
              style={{
                boxShadow: "0 0 50px rgba(245, 194, 66, 0.4), inset 0 0 30px rgba(255,255,255,0.06)",
              }}
              initial={{
                opacity: 0,
                scale: 0.6,
                rotateY: -25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateY: 0,
                boxShadow: [
                  "0 0 50px rgba(245, 194, 66, 0.4), inset 0 0 30px rgba(255,255,255,0.06)",
                  "0 0 70px rgba(245, 194, 66, 0.6), inset 0 0 40px rgba(255,255,255,0.08)",
                  "0 0 40px rgba(245, 194, 66, 0.3), inset 0 0 20px rgba(255,255,255,0.04)",
                ],
              }}
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: 0.5 },
                rotateY: { duration: 0.5 },
                boxShadow: { duration: 1.2 },
              }}
            >
              <Image
                src="/logo.PNG"
                alt="ProseIQ"
                width={200}
                height={200}
                priority
                className="h-full w-full rounded-xl object-contain"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
