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
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 从下方滑入的动画
export const SlideUp = ({ 
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
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 从左侧滑入的动画
export const SlideInLeft = ({ 
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
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 从右侧滑入的动画
export const SlideInRight = ({ 
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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 弹性动画容器
export const PopIn = ({ 
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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20, 
        delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 循环脉冲动画
export const Pulse = ({ 
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
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{ 
        duration, 
        repeat: Infinity,
        ease: "easeInOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 卡片翻转动画
export const FlipCard = ({ 
  front, 
  back, 
  isFlipped,
  className = "" 
}: { 
  front: ReactNode; 
  back: ReactNode;
  isFlipped: boolean;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
      <motion.div
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ duration: 0.6 }}
        style={{ 
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%'
        }}
      >
        <div 
          style={{ 
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          {front}
        </div>
        <div 
          style={{ 
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: 'rotateY(180deg)'
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

// 交错动画列表
export const StaggeredList = ({ 
  children,
  className = "" 
}: { 
  children: ReactNode[]; 
  className?: string;
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// 3D悬停效果卡片
export const HoverCard = ({ 
  children,
  className = "",
  strength = 25
}: { 
  children: ReactNode; 
  className?: string;
  strength?: number;
}) => {
  return (
    <motion.div
      className={`${className} relative overflow-hidden transition-all duration-500`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -strength;
        const rotateY = (x - centerX) / centerX * strength;
        
        e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
      }}
    >
      {children}
    </motion.div>
  );
};

// 闪烁动画
export const Shimmer = ({ 
  children,
  width = "100%",
  height = "100%",
  className = "" 
}: { 
  children?: ReactNode; 
  width?: string;
  height?: string;
  className?: string;
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {children}
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['100% 0%', '-100% 0%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
};

// 页面切换动画
export const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// 浮动动画元素
export const FloatingElement = ({ 
  children,
  y = 15,
  duration = 3,
  className = "" 
}: { 
  children: ReactNode; 
  y?: number;
  duration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        y: [`-${y}px`, `${y}px`, `-${y}px`],
      }}
      transition={{ 
        duration, 
        repeat: Infinity,
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  );
};

// 渐变边框动画
export const GradientBorder = ({ 
  children,
  className = "",
  borderWidth = 2,
  duration = 3
}: { 
  children: ReactNode; 
  className?: string;
  borderWidth?: number;
  duration?: number;
}) => {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `conic-gradient(from 0deg, #5f5af6, #a162e8, #f093b0, #edca85, #a162e8, #5f5af6)`,
          backgroundSize: '1000% 1000%',
          zIndex: -1,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'mirror'
        }}
      />
      <div 
        className="relative rounded-lg bg-white dark:bg-gray-900 m-0.5"
        style={{ margin: borderWidth }}
      >
        {children}
      </div>
    </div>
  );
};

// 背景动画
export const AnimatedBackground = ({ 
  children,
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) => {
  return (
    <div className={`relative overflow-hidden min-h-screen ${className}`}>
      {/* 主要渐变背景 */}
      <div className="absolute inset-0 opacity-80">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5f5af6" stopOpacity="0.08"/>
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.03"/>
              <stop offset="100%" stopColor="#a162e8" stopOpacity="0.08"/>
            </linearGradient>
            <pattern id="pattern1" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="100%" height="100%" fill="url(#grad1)"/>
              <path d="M0 20 L40 20" stroke="rgba(95, 90, 246, 0.03)" strokeWidth="1"/>
              <path d="M20 0 L20 40" stroke="rgba(161, 98, 232, 0.03)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern1)" />
        </svg>
      </div>
      
      {/* 动态光晕效果 */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(95, 90, 246, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(161, 98, 232, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 30%)
          `,
          opacity: 0.7
        }}
        animate={{
          backgroundPosition: ['0% 0%, 100% 100%, 50% 50%', '100% 0%, 0% 100%, 60% 40%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'reverse'
        }}
      />
        {/* 浮动装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { top: '13.89%', left: '42.51%', width: '112.94px', height: '147.31px', type: 0 },
          { top: '96.24%', left: '13.68%', width: '149.39px', height: '129.40px', type: 1 },
          { top: '88.55%', left: '73.17%', width: '146.97px', height: '57.40px', type: 0 },
          { top: '11.04%', left: '48.17%', width: '93.56px', height: '87.49px', type: 1 },
          { top: '0.75%', left: '89.32%', width: '93.32px', height: '133.14px', type: 0 },
          { top: '67.62%', left: '44.31%', width: '70.00px', height: '52.47px', type: 1 },
          { top: '62.69%', left: '37.24%', width: '54.98px', height: '136.31px', type: 0 },
          { top: '10.06%', left: '95.28%', width: '83.75px', height: '59.11px', type: 1 }
        ].map((bubble, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              top: bubble.top,
              left: bubble.left,
              width: bubble.width,
              height: bubble.height,
              background: bubble.type === 0 
                ? 'linear-gradient(45deg, rgba(95, 90, 246, 0.2), rgba(95, 90, 246, 0.1))'
                : 'linear-gradient(45deg, rgba(161, 98, 232, 0.2), rgba(161, 98, 232, 0.1))',
              filter: 'blur(8px)'
            }}
            animate={{
              y: [0, (i % 3 + 1) * 10 - 15, 0],
              x: [0, (i % 2 + 1) * 10 - 15, 0],
              scale: [1, 0.95 + (i % 5) * 0.01, 1]
            }}
            transition={{
              duration: 10 + i % 5 * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <div className="relative">{children}</div>
    </div>
  );
};
