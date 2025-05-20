'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';

// 高级淡入动画 - 支持自定义初始透明度
export const AdvancedFadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  initialOpacity = 0,
  className = "",  threshold = 0.1  // 触发动画的可见阈值
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  initialOpacity?: number;
  className?: string;
  threshold?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true /* threshold参数在当前版本不支持 */ });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: initialOpacity }} 
      animate={controls}
      variants={{
        visible: { 
          opacity: 1,
          transition: { 
            duration: duration, 
            delay: delay,
            ease: "easeOut" 
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 文字打字机效果动画
export const TypewriterText = ({ 
  text, 
  speed = 0.05, 
  cursor = true,
  className = ""
}: { 
  text: string; 
  speed?: number;
  cursor?: boolean;
  className?: string; 
}) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[index]);
        setIndex(index + 1);
      }, speed * 1000); // 转换为毫秒
      
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);
  
  useEffect(() => {
    // 重置动画
    setDisplayText("");
    setIndex(0);
  }, [text]);
  
  return (
    <span className={className}>
      {displayText}
      {cursor && index < text.length && <span className="cursor">|</span>}
    </span>
  );
};

// 弹性动画
export const SpringAnimation = ({ 
  children, 
  delay = 0, 
  stiffness = 100, 
  damping = 10,
  from = { scale: 0, opacity: 0 },
  to = { scale: 1, opacity: 1 },
  className = ""
}: { 
  children: ReactNode; 
  delay?: number; 
  stiffness?: number;
  damping?: number;
  from?: any;
  to?: any;
  className?: string;
}) => {
  return (
    <motion.div
      initial={from}
      animate={to}
      transition={{ 
        type: "spring", 
        stiffness: stiffness, 
        damping: damping,
        delay: delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 交错子元素动画
export const StaggeredChildren = ({ 
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
  // 容器变体
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };
  
  // 子元素变体
  const itemVariants = {
    hidden: { 
      y: 20, 
      opacity: 0 
    },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  // 把子元素包装在motion.div中
  const wrappedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return (
        <motion.div variants={itemVariants}>
          {child}
        </motion.div>
      );
    }
    return child;
  });
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {wrappedChildren}
    </motion.div>
  );
};

// 悬停效果组件
export const HoverEffect = ({ 
  children, 
  scale = 1.05, 
  shadow = false,
  rotate = 0,
  className = "" 
}: { 
  children: ReactNode; 
  scale?: number;
  shadow?: boolean;
  rotate?: number;
  className?: string;
}) => {
  const shadowEffect = shadow ? {
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
  } : {};
  
  return (
    <motion.div
      whileHover={{ 
        scale: scale, 
        rotate: rotate, 
        ...shadowEffect,
        transition: { duration: 0.3 } 
      }}
      whileTap={{ 
        scale: scale * 0.95,
        transition: { duration: 0.2 } 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 滚动显示组件
export const RevealOnScroll = ({ 
  children, 
  threshold = 0.2, 
  direction = 'up',
  distance = 50,
  delay = 0,
  duration = 0.6,
  className = "" 
}: { 
  children: ReactNode;
  threshold?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true /* threshold参数在当前版本不支持 */ });
  
  // 根据方向设置初始位置
  const getInitialPosition = () => {
    switch(direction) {
      case 'up':
        return { y: distance, opacity: 0 };
      case 'down':
        return { y: -distance, opacity: 0 };
      case 'left':
        return { x: distance, opacity: 0 };
      case 'right':
        return { x: -distance, opacity: 0 };
      default:
        return { y: distance, opacity: 0 };
    }
  };
  
  // 结束位置
  const finalPosition = {
    y: 0,
    x: 0,
    opacity: 1,
    transition: {
      duration: duration,
      delay: delay,
      ease: [0.22, 1, 0.36, 1]
    }
  };
  
  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition()}
      animate={isInView ? finalPosition : getInitialPosition()}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 渐变背景组件
export const GradientBackground = ({ 
  children, 
  colors = ['#5A67D8', '#B794F4'],
  duration = 10,
  className = "" 
}: { 
  children: ReactNode; 
  colors?: string[];
  duration?: number;
  className?: string;
}) => {
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(-45deg, ${colors.join(', ')})`,
        backgroundSize: '400% 400%',
        animation: `gradientAnimation ${duration}s ease infinite`
      }}
    >
      <style jsx>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      {children}
    </div>
  );
};

// CSS样式扩展
export const extendedAnimationStyles = `
  .cursor {
    animation: blink 1s step-end infinite;
  }
  
  @keyframes blink {
    from, to {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
  
  .loading-dots {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }
  
  .loading-dots .dot {
    width: 8px;
    height: 8px;
    margin: 0 4px;
    border-radius: 50%;
    background-color: var(--primary);
    animation: dotFade 1.4s infinite ease-in-out both;
  }
  
  .loading-dots .dot:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  .loading-dots .dot:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  @keyframes dotFade {
    0%, 80%, 100% { 
      opacity: 0.2;
      transform: scale(0.8);
    }
    40% { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .infinite-scroll-gradient {
    background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
    background-size: 200% 100%;
    animation: gradient-scroll 2s linear infinite;
  }
  
  @keyframes gradient-scroll {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;
