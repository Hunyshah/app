


// Stunning Advanced Motion Variants with Spectacular Effects
export const slideIn = (direction, delay = 0, bounce = true , duration = 2) => ({
  hidden: {
    x: direction === "left" ? "-200%" : direction === "right" ? "200%" : 0,
    y: direction === "up" ? "150%" : direction === "down" ? "-150%" : 0,
    opacity: 0,
    scale: 0.8,
    rotate: direction === "left" ? -15 : direction === "right" ? 15 : 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "tween",
      ease : "easeOut",
      duration,
      type: "spring",
      stiffness: bounce ? 150 : 100,
      damping: bounce ? 15 : 20,
      mass: 0.8,
      delay,
      bounce: bounce ? 0.6 : 0.3,
    },
  },
});


export const delay = 0.1;   








export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren,
      delayChildren,
      when: "beforeChildren",
    },
  },
});

export const fadeIn = (direction, delay = 0, intensity = "medium") => {
  const intensityConfig = {
    subtle: { stiffness: 80, damping: 20, mass: 1 },
    medium: { stiffness: 120, damping: 15, mass: 0.8 },
    bouncy: { stiffness: 150, damping: 12, mass: 0.6 },
  };

  const config = intensityConfig[intensity] || intensityConfig.medium;

  return {
    hidden: {
      opacity: 0,
      x: direction === "left" ? "-150" : direction === "right" ? "150" : 0,
      y: direction === "up" ? "-150" : direction === "down" ? "150" : 0,
      scale: 0.8,
      rotate: direction === "left" ? -10 : direction === "right" ? 10 : 0,
      filter: "blur(8px)",
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass,
        delay: parseFloat(delay),
        bounce: 0.5,
      },
    },
  };
};

export const zoomIn = (delay = 0, intensity = "bouncy") => {
  const intensityConfig = {
    smooth: { stiffness: 100, damping: 20, bounce: 0.2 },
    bouncy: { stiffness: 200, damping: 12, bounce: 0.8 },
    explosive: { stiffness: 300, damping: 10, bounce: 1.2 },
  };

  const config = intensityConfig[intensity] || intensityConfig.bouncy;

  return {
    hidden: {
      scale: 0,
      opacity: 0,
      filter: "blur(10px)",
    },
    show: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: config.stiffness,
        damping: config.damping,
        mass: 0.6,
        delay,
        bounce: config.bounce,
        velocity: 0,
      },
    },
  };
};

export const zoomOut = (delay = 0, intensity = "bouncy") => {
  const intensityConfig = {
    smooth: { stiffness: 100, damping: 20, bounce: 0.2 },
    bouncy: { stiffness: 200, damping: 12, bounce: 0.8 },
    explosive: { stiffness: 300, damping: 10, bounce: 1.2 },
  };

  const config = intensityConfig[intensity] || intensityConfig.bouncy;

  return {
    hidden: {
      scale: 2,
      opacity: 0,
      filter: "blur(10px)",
    },
    show: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: config.stiffness,
        damping: config.damping,
        mass: 0.6,
        delay,
        bounce: config.bounce,
        velocity: 0,
      },
    },
  };
};

export const staggerChildren = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      staggerChildren: 0.08,
      delayChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

// New Advanced Animation Variants

export const morphIn = (delay = 0) => ({
  hidden: {
    opacity: 0,
    scale: 0.3,
    rotateY: 90,
    skewX: 15,
    filter: "blur(15px)",
  },
  show: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    skewX: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 12,
      mass: 0.7,
      delay,
      bounce: 0.6,
    },
  },
});

export const elasticScale = (delay = 0, direction = "up") => ({
  hidden: {
    scale: 0,
    opacity: 0,
    y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
    rotate: direction === "up" ? 15 : direction === "down" ? -15 : 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 8,
      mass: 0.5,
      delay,
      bounce: 1,
    },
  },
});

export const wavyEntrance = (delay = 0) => ({
  hidden: {
    opacity: 0,
    x: -100,
    y: -50,
    rotate: -45,
    scale: 0.5,
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 10,
      mass: 0.8,
      delay,
      bounce: 0.8,
    },
  },
});

export const flipCard = (delay = 0) => ({
  hidden: {
    opacity: 0,
    rotateY: -180,
    scale: 0.8,
    z: -100,
  },
  show: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    z: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1,
      delay,
      bounce: 0.3,
    },
  },
});

export const magneticHover = {
  rest: {
    scale: 1,
    rotate: 0,
    filter: "brightness(1)",
  },
  hover: {
    scale: 1.05,
    rotate: 2,
    filter: "brightness(1.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
      bounce: 0.6,
    },
  },
  tap: {
    scale: 0.95,
    rotate: -2,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 20,
    },
  },
};

export const floatingAnimation = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const pulseGlow = {
  animate: {
    scale: [1, 1.02, 1],
    filter: [
      "drop-shadow(0 0 0px rgba(59, 130, 246, 0.5))",
      "drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))",
      "drop-shadow(0 0 0px rgba(59, 130, 246, 0.5))",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Advanced stagger utilities
export const createStaggerVariant = (staggerDelay = 0.1, childDelay = 0) => ({
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren: staggerDelay,
      delayChildren: childDelay,
      when: "beforeChildren",
    },
  },
});

export const liquidMorph = (delay = 0, intensity = "high") => {
  const configs = {
    low: { stiffness: 80, damping: 25, mass: 1.2 },
    medium: { stiffness: 120, damping: 18, mass: 0.9 },
    high: { stiffness: 180, damping: 12, mass: 0.6 },
  };

  const config = configs[intensity] || configs.high;

  return {
    hidden: {
      opacity: 0,
      scale: 0.2,
      rotateX: 90,
      rotateZ: 180,
      borderRadius: "50%",
      filter: "blur(20px) hue-rotate(180deg)",
      skewY: 30,
    },
    show: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      rotateZ: 0,
      filter: "blur(0px) hue-rotate(0deg)",
      skewY: 0,
      transition: {
        type: "spring",
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass,
        delay,
        bounce: 0.7,
      },
    },
  };
};

export const dimensionalShift = (delay = 0, axis = "x") => ({
  hidden: {
    opacity: 0,
    scale: 0.1,
    rotateX: axis === "x" ? 180 : 0,
    rotateY: axis === "y" ? 180 : 0,
    rotateZ: axis === "z" ? 180 : 0,
    perspective: 1000,
    transformStyle: "preserve-3d",
    filter: "blur(25px) brightness(0.3)",
  },
  show: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    filter: "blur(0px) brightness(1)",
    transition: {
      type: "spring",
      stiffness: 160,
      damping: 10,
      mass: 0.8,
      delay,
      bounce: 0.9,
    },
  },
});

export const quantumEntrance = (delay = 0) => ({
  hidden: {
    opacity: 0,
    scale: [0.1, 1.5, 0.3],
    x: [-200, 100, -50],
    y: [100, -80, 30],
    rotate: [0, 360, 180],
    filter: "blur(30px) saturate(3) hue-rotate(270deg)",
  },
  show: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    rotate: 0,
    filter: "blur(0px) saturate(1) hue-rotate(0deg)",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 8,
      mass: 0.5,
      delay,
      bounce: 1.2,
    },
  },
});

export const prismShatter = (delay = 0, fragments = 3) => ({
  hidden: {
    opacity: 0,
    scale: 0,
    clipPath: "polygon(50% 50%, 50% 50%, 50% 50%)",
    filter: "blur(15px) contrast(2) brightness(0.5)",
    rotateY: 180,
    skewX: 45,
  },
  show: {
    opacity: 1,
    scale: 1,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    filter: "blur(0px) contrast(1) brightness(1)",
    rotateY: 0,
    skewX: 0,
    transition: {
      type: "spring",
      stiffness: 250,
      damping: 15,
      mass: 0.4,
      delay,
      bounce: 0.8,
    },
  },
});

export const vortexSpin = (delay = 0, direction = "clockwise") => {
  const rotation = direction === "clockwise" ? 720 : -720;

  return {
    hidden: {
      opacity: 0,
      scale: 0.1,
      rotate: rotation,
      borderRadius: "50%",
      filter: "blur(40px) sepia(1) hue-rotate(180deg)",
      x: direction === "clockwise" ? 300 : -300,
      y: direction === "clockwise" ? -200 : 200,
    },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      borderRadius: "0%",
      filter: "blur(0px) sepia(0) hue-rotate(0deg)",
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 12,
        mass: 0.7,
        delay,
        bounce: 0.6,
      },
    },
  };
};

export const holographicReveal = (delay = 0) => ({
  hidden: {
    opacity: 0,
    scale: 0.5,
    rotateY: 90,
    background: "linear-gradient(45deg, transparent, transparent)",
    filter: "blur(20px) hue-rotate(180deg) saturate(3)",
    boxShadow: "0 0 0px rgba(0,255,255,0)",
  },
  show: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px) hue-rotate(0deg) saturate(1)",
    boxShadow: "0 20px 40px rgba(0,255,255,0.3)",
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 14,
      mass: 0.8,
      delay,
      bounce: 0.5,
    },
  },
});

export const matrixGlitch = (delay = 0) => ({
  hidden: {
    opacity: 0,
    scaleX: 0.1,
    scaleY: 3,
    skewX: 25,
    filter: "blur(10px) contrast(3) brightness(2)",
    textShadow: "2px 0 #ff0000, -2px 0 #00ff00, 0 2px #0000ff",
  },
  show: {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    filter: "blur(0px) contrast(1) brightness(1)",
    textShadow: "0 0 transparent",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      mass: 0.3,
      delay,
      bounce: 0.4,
    },
  },
});

export const cosmicZoom = (delay = 0, intensity = "supernova") => {
  const configs = {
    nebula: { stiffness: 100, damping: 18, bounce: 0.4 },
    galaxy: { stiffness: 150, damping: 12, bounce: 0.7 },
    supernova: { stiffness: 250, damping: 8, bounce: 1.1 },
  };

  const config = configs[intensity] || configs.supernova;

  return {
    hidden: {
      opacity: 0,
      scale: 0.01,
      rotate: 360,
      filter: "blur(50px) brightness(5) saturate(3)",
    },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      filter: "blur(0px) brightness(1) saturate(1)",
      transition: {
        type: "spring",
        stiffness: config.stiffness,
        damping: config.damping,
        mass: 0.5,
        delay,
        bounce: config.bounce,
      },
    },
  };
};

export const origamiUnfold = (delay = 0) => ({
  hidden: {
    opacity: 0,
    scaleY: 0,
    scaleX: 0.1,
    rotateX: 90,
    rotateZ: 45,
    transformOrigin: "center bottom",
    filter: "blur(15px)",
  },
  show: {
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    rotateX: 0,
    rotateZ: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      mass: 0.9,
      delay,
      bounce: 0.6,
    },
  },
});

export const particleAssembly = (delay = 0) => ({
  hidden: {
    opacity: 0,
    scale: 0.3,
    filter: "blur(25px) brightness(3)",
    background: `
      radial-gradient(circle at 20% 20%, rgba(255,0,100,0.8) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0,255,100,0.8) 0%, transparent 50%),
      radial-gradient(circle at 50% 80%, rgba(100,0,255,0.8) 0%, transparent 50%)
    `,
  },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    transition: {
      type: "spring",
      stiffness: 170,
      damping: 11,
      mass: 0.7,
      delay,
      bounce: 0.8,
    },
  },
});

// Advanced Interactive Hover Effects

export const magneticAttraction = {
  rest: {
    scale: 1,
    rotate: 0,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    filter: "brightness(1)",
  },
  hover: {
    scale: 1.08,
    rotate: [0, 2, -1, 1, 0],
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    filter: "brightness(1.15)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 12,
      bounce: 0.7,
    },
  },
  tap: {
    scale: 0.92,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

export const liquidButton = {
  rest: {
    scale: 1,
    borderRadius: "12px",
    filter: "brightness(1)",
  },
  hover: {
    scale: 1.05,
    borderRadius: ["12px", "20px", "25px", "15px", "12px"],
    filter: "brightness(1.2)",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
      bounce: 0.8,
      duration: 0.6,
    },
  },
  tap: {
    scale: 0.95,
    borderRadius: "8px",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};

export const crystallineHover = {
  rest: {
    scale: 1,
    rotateY: 0,
    filter: "brightness(1) saturate(1)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  hover: {
    scale: 1.06,
    rotateY: 15,
    filter: "brightness(1.3) saturate(1.4)",
    boxShadow: "0 15px 30px rgba(100,200,255,0.3)",
    transition: {
      type: "spring",
      stiffness: 250,
      damping: 15,
      bounce: 0.6,
    },
  },
};

// Continuous Animations

export const breathingGlow = (color = "rgba(59, 130, 246, 0.6)") => ({
  animate: {
    scale: [1, 1.02, 1],
    filter: [
      `drop-shadow(0 0 5px ${color})`,
      `drop-shadow(0 0 25px ${color})`,
      `drop-shadow(0 0 5px ${color})`,
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});

export const orbitalFloat = {
  animate: {
    y: [-8, 8, -8],
    x: [-3, 3, -3],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const energyPulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    filter: [
      "brightness(1) contrast(1)",
      "brightness(1.2) contrast(1.1)",
      "brightness(1) contrast(1)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Complex Stagger Patterns

export const waveStagger = (direction = "right") => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: direction === "right" ? 0.1 : -0.1,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
});

export const spiralStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      staggerDirection: 1,
      when: "beforeChildren",
    },
  },
};

export const explosiveStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
      when: "beforeChildren",
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
};

// ====== Centralized Variants from Components/Pages ======

// From components/home/chooseUs.jsx, app/about-us/Feedback.jsx, app/about-us/page.jsx, app/study-abroad/page.jsx, app/event/page.jsx
export const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      // Some usages add: when: "beforeChildren", staggerChildren: 0.18
    },
  },
};

// From components/home/chooseUs.jsx, app/about-us/Feedback.jsx, app/about-us/page.jsx
export const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// From app/about-us/page.jsx, app/study-abroad/page.jsx, app/event/page.jsx, app/initial-assessment/page.jsx
export const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.1,
      // Some usages add: delayChildren: 0.2
    },
  },
};

// From app/about-us/page.jsx, app/study-abroad/page.jsx, app/event/page.jsx, app/initial-assessment/page.jsx
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// From app/about-us/page.jsx
export const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, x: 50 },
  show: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

// From app/about-us/page.jsx
export const expertSectionVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.18,
    },
  },
};

// From app/about-us/page.jsx
export const expertCardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// From app/about-us/page.jsx
export const newsSectionVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.18,
    },
  },
};

// From app/about-us/page.jsx
export const newsCardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// From app/study-abroad/page.jsx, app/event/page.jsx
export const formVariants = {
  hidden: {
    opacity: 0,
    x: 30,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8,
    },
  },
};

// From components/common/CTASection.jsx, app/study-abroad/page.jsx, app/event/page.jsx
export const ctaVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8,
    },
  },
};

// From app/study-abroad/page.jsx
export const textContainerVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.15,
    },
  },
};
export const textItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// From app/initial-assessment/page.jsx
export const textOverlayVariants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1,
      ease: "easeOut",
      staggerChildren: 0.3,
    },
  },
};

// Slide and fade up animation (professional, matches login speed, unique effect)
export const slideFadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.96,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};
