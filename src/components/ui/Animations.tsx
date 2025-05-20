'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// 淡入淡出动画容器
export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = "" 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 从下方滑入动画
export const SlideUp = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  distance = 50,
  className = ""
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: distance }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 从上方滑入动画
export const SlideDown = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  distance = 50,
  className = ""
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -distance }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -distance }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 从左侧滑入动画
export const SlideRight = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  distance = 50,
  className = ""
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -distance }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -distance }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 从右侧滑入动画
export const SlideLeft = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  distance = 50,
  className = ""
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: distance }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: distance }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 缩放动画
export const Scale = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  startScale = 0.95,
  className = ""
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  startScale?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: startScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: startScale }}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 交错出现列表动画
export const StaggerContainer = ({ 
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = ""
}: { 
  children: ReactNode; 
  delay?: number;
  staggerDelay?: number;
  className?: string;
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 交错列表的子项目动画
export const StaggerItem = ({ 
  children,
  duration = 0.5,
  y = 20,
  x = 0,
  className = ""
}: { 
  children: ReactNode; 
  duration?: number;
  y?: number;
  x?: number;
  className?: string;
}) => {
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: y,
      x: x
    },
    show: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: {
        duration: duration,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: y,
      x: x,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 具有自动退出功能的弹窗/消息组件
export const PopMessage = ({ 
  children,
  isVisible,
  onExitComplete,
  duration = 0.3,
  className = ""
}: { 
  children: ReactNode; 
  isVisible: boolean;
  onExitComplete?: () => void;
  duration?: number;
  className?: string;
}) => {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            duration: duration,
            ease: "easeOut"
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 页面过渡容器
export const PageTransition = ({ 
  children,
  duration = 0.5,
  className = ""
}: { 
  children: ReactNode; 
  duration?: number;
  className?: string;
}) => {
  const variants: Variants = {
    hidden: { opacity: 0 },
    enter: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={{ 
        type: 'tween', 
        ease: 'easeInOut',
        duration: duration
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 无限旋转动画
export const Spin = ({ 
  children,
  duration = 2,
  className = ""
}: { 
  children: ReactNode; 
  duration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        repeat: Infinity, 
        duration: duration,
        ease: "linear"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 脉冲动画
export const Pulse = ({ 
  children,
  duration = 1.5,
  scale = 1.05,
  className = ""
}: { 
  children: ReactNode; 
  duration?: number;
  scale?: number;
  className?: string;
}) => {
  return (
    <motion.div
      animate={{ scale: [1, scale, 1] }}
      transition={{ 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 闪烁动画
export const Blink = ({ 
  children,
  duration = 2,
  minOpacity = 0.6,
  className = ""
}: { 
  children: ReactNode; 
  duration?: number;
  minOpacity?: number;
  className?: string;
}) => {
  return (
    <motion.div
      animate={{ opacity: [1, minOpacity, 1] }}
      transition={{ 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 悬浮效果动画
export const Hover = ({ 
  children,
  duration = 2,
  y = 10,
  className = ""
}: { 
  children: ReactNode; 
  duration?: number;
  y?: number;
  className?: string;
}) => {
  return (
    <motion.div
      animate={{ y: [-y/2, y/2, -y/2] }}
      transition={{ 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
