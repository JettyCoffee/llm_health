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
  className = "",
  threshold = 0.1  // 触发动画的可见阈值
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  initialOpacity?: number;
  className?: string;
  threshold?: number;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: initialOpacity }}
      animate={controls}
      variants={{
        visible: { opacity: 1, transition: { duration, delay } },
        hidden: { opacity: initialOpacity }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 弹性动画 - 带有弹跳效果
export const SpringAnimation = ({
  children,
  delay = 0,
  stiffness = 100,
  damping = 10,
  from = { scale: 0.8 },
  to = { scale: 1 },
  className = ""
}: {
  children: ReactNode;
  delay?: number;
  stiffness?: number;
  damping?: number;
  from?: object;
  to?: object;
  className?: string;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: {
          ...to,
          transition: {
            delay,
            type: "spring",
            stiffness,
            damping
          }
        },
        hidden: from
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 交错出现动画 - 适用于列表项
export const StaggeredChildren = ({
  children,
  delay = 0,
  staggerDelay = 0.1,
  duration = 0.5,
  className = ""
}: {
  children: ReactNode;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// 悬停动画 - 鼠标悬停时的效果
export const HoverEffect = ({
  children,
  scale = 1.05,
  rotate = 0,
  className = "",
  shadow = false
}: {
  children: ReactNode;
  scale?: number;
  rotate?: number;
  className?: string;
  shadow?: boolean;
}) => {
  return (
    <motion.div
      whileHover={{
        scale,
        rotate,
        boxShadow: shadow ? "0px 10px 30px rgba(0, 0, 0, 0.2)" : "none",
      }}
      transition={{ type: "tween", duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 注意力动画 - 吸引用户注意力
export const AttentionAnimation = ({
  children,
  className = "",
  repeat = 3,
  repeatType = "loop" as "loop" | "reverse" | "mirror",
  duration = 0.5
}: {
  children: ReactNode;
  className?: string;
  repeat?: number;
  repeatType?: "loop" | "reverse" | "mirror";
  duration?: number;
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        borderRadius: ["0%", "5%", "0%"],
      }}
      transition={{
        duration,
        repeat,
        repeatType
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 3D卡片效果 - 根据鼠标位置产生3D倾斜效果
export const Card3D = ({
  children,
  className = "",
  sensitivity = 25
}: {
  children: ReactNode;
  className?: string;
  sensitivity?: number;
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -sensitivity;
    const rotateYValue = ((x - centerX) / centerX) * sensitivity;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setRotateX(0);
        setRotateY(0);
      }}
      animate={{
        rotateX: isHovering ? rotateX : 0,
        rotateY: isHovering ? rotateY : 0,
        boxShadow: isHovering 
          ? `${rotateY/3}px ${rotateX/3}px 30px rgba(0,0,0,0.3)` 
          : '0px 0px 0px rgba(0,0,0,0)'
      }}
      transition={{
        type: "tween", 
        ease: "easeOut",
        duration: 0.2
      }}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {children}
    </motion.div>
  );
};

// 滚动揭示动画 - 元素滚动到视图中时出现
export const RevealOnScroll = ({
  children,
  direction = "up",
  distance = 50,
  duration = 0.8,
  delay = 0,
  threshold = 0.1,
  className = ""
}: {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true,
    threshold
  });
  
  // 根据方向设置初始位置
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: distance };
      case "down": return { y: -distance };
      case "left": return { x: distance };
      case "right": return { x: -distance };
      default: return { y: distance };
    }
  };

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, ...getInitialPosition() },
        visible: { 
          opacity: 1, 
          x: 0, 
          y: 0, 
          transition: { 
            duration, 
            delay,
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

// 脉冲动画 - 用于强调某个元素
export const PulseAnimation = ({
  children,
  duration = 2,
  repeatCount = Infinity,
  className = ""
}: {
  children: ReactNode;
  duration?: number;
  repeatCount?: number;
  className?: string;
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
        boxShadow: [
          "0px 0px 0px rgba(0,0,0,0)",
          "0px 0px 20px rgba(0,128,255,0.5)",
          "0px 0px 0px rgba(0,0,0,0)"
        ]
      }}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: repeatCount,
        repeatType: "loop"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 渐变背景动画 - 创建流动的渐变背景效果
export const GradientBackground = ({
  children,
  colors = ['#4158D0', '#C850C0', '#FFCC70'],
  duration = 8,
  className = ""
}: {
  children: ReactNode;
  colors?: string[];
  duration?: number;
  className?: string;
}) => {
  const gradientString = `linear-gradient(45deg, ${colors.join(', ')})`;
  
  return (
    <motion.div
      className={className}
      style={{
        backgroundSize: '400% 400%',
        backgroundImage: gradientString,
        position: 'relative',
      }}
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
      }}
      transition={{
        duration,
        ease: "linear",
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
};

// 文字打字机效果 - 逐个字符显示文本
export const TypewriterText = ({
  text,
  speed = 0.05,
  delay = 0,
  className = "",
  cursor = true,
  onComplete = () => {}
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (displayedText.length < text.length) {
      timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, displayedText.length + 1));
      }, speed * 1000);
    } else {
      setIsTyping(false);
      onComplete();
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [displayedText, text, speed, onComplete]);
  
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setDisplayedText(text.substring(0, 1));
    }, delay * 1000);
    
    return () => clearTimeout(initialDelay);
  }, [delay, text]);
  
  return (
    <div className={className}>
      <span>{displayedText}</span>
      {cursor && isTyping && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ marginLeft: 2 }}
        >
          |
        </motion.span>
      )}
    </div>
  );
};

// 变形效果 - 平滑地在两种形状之间转换
export const MorphShape = ({
  children,
  isActive = false,
  activeShape = "50% 50% 50% 50% / 50% 50% 50% 50%",
  inactiveShape = "0% 0% 0% 0% / 0% 0% 0% 0%",
  duration = 0.5,
  className = ""
}: {
  children: ReactNode;
  isActive?: boolean;
  activeShape?: string;
  inactiveShape?: string;
  duration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        borderRadius: isActive ? activeShape : inactiveShape
      }}
      transition={{
        duration,
        ease: [0.34, 1.56, 0.64, 1] // 弹性曲线
      }}
    >
      {children}
    </motion.div>
  );
};

// 视差滚动效果 - 创建深度感
export const ParallaxSection = ({
  children,
  speed = 0.2,
  className = ""
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const y = scrollY * speed;
  
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y: -y,
      }}
    >
      {children}
    </motion.div>
  );
};

// 创建更丰富的动画样式选项
export const extendedAnimationStyles = {
  perspective: 'perspective-1000',
  glassmorphism: 'backdrop-filter backdrop-blur-md bg-opacity-70 border border-opacity-20 shadow-lg',
  floatingCard: 'hover:shadow-2xl transition-all duration-300 ease-in-out',
  shimmer: 'animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:400%_100%]',
  
  // 卡片样式
  modernCard: 'rounded-xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 dark:bg-gray-800 dark:border dark:border-gray-700',
  elevatedCard: 'rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 dark:bg-gray-800',
  glassmorphismStrong: 'backdrop-filter backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl dark:bg-black/10 dark:border-white/10',
  
  // 交互效果
  hoverLift: 'transition-transform duration-300 hover:-translate-y-2',
  hoverScale: 'transition-transform duration-300 hover:scale-105',
  hoverGlow: 'transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  
  // 渐变背景
  gradientBlue: 'bg-gradient-to-r from-blue-500 to-teal-400',
  gradientPurple: 'bg-gradient-to-r from-purple-500 to-pink-500',
  gradientSunset: 'bg-gradient-to-r from-orange-500 to-pink-500',
  gradientNeon: 'bg-gradient-to-r from-green-400 to-blue-500',
  
  // 动画效果
  pulseEffect: 'animate-pulse',
  bounceEffect: 'animate-bounce',
  spinEffect: 'animate-spin',
  pingEffect: 'animate-ping',
    // 文本效果
  gradientText: 'bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400',
  textShadow: 'text-shadow-lg',
};