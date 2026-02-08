// components/AnimatedPage.tsx
import { motion } from "framer-motion";
import type{ ReactNode } from "react";

const animations = {
  initial: { opacity: 0, y: 10 }, // Trạng thái ban đầu: Mờ và nằm thấp hơn 1 chút
  animate: { opacity: 1, y: 0 },  // Trạng thái hiển thị: Rõ và về vị trí chuẩn
  exit: { opacity: 0, y: -10 },   // Trạng thái thoát: Mờ và bay lên 1 chút
};

interface Props {
  children: ReactNode;
}

const AnimatedPage = ({ children }: Props) => {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }} // Thời gian 0.3s (nhanh và mượt)
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;