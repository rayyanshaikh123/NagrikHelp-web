import { useRef, useEffect, useCallback } from "react";

function parentIsBody() {
  try {
    return document && document.body && document.body === document.querySelector('body')
  } catch {
    return true
  }
}

const ClickSpark = ({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
  children,
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout;

    const cssSizeRef = { w: 0, h: 0 }
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = Math.max(0, Math.floor(rect.width));
      const cssHeight = Math.max(0, Math.floor(rect.height));
      // Only update if size changed
      if (cssSizeRef.w === cssWidth && cssSizeRef.h === cssHeight) return
      cssSizeRef.w = cssWidth; cssSizeRef.h = cssHeight
      // size the backing store to device pixels for crisp rendering
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      // ensure CSS size matches layout
      canvas.style.width = cssWidth + 'px';
      canvas.style.height = cssHeight + 'px';
      // scale drawing coordinates so 1 unit === 1 CSS pixel
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      // store CSS size for click bounds and clearing
      canvas.__cssWidth = cssWidth;
      canvas.__cssHeight = cssHeight;
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);

    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    (t) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;

    const draw = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      // clear using CSS pixel dimensions because context is scaled
      const cssW = canvas.__cssWidth || canvas.width;
      const cssH = canvas.__cssHeight || canvas.height;
      ctx.clearRect(0, 0, cssW, cssH);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

  const distance = eased * sparkRadius * extraScale;
  const lineLength = sparkSize * (1 - eased);

  // spark.x/y are stored in CSS pixels; drawing context is scaled so use them directly
  const x1 = spark.x + distance * Math.cos(spark.angle);
  const y1 = spark.y + distance * Math.sin(spark.angle);
  const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
  const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    sparkColor,
    sparkSize,
    sparkRadius,
    sparkCount,
    duration,
    easeFunc,
    extraScale,
  ]);

    const createSparks = (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const cssW = canvas.__cssWidth || rect.width;
      const cssH = canvas.__cssHeight || rect.height;
      if (x >= 0 && x <= cssW && y >= 0 && y <= cssH) {
        const now = performance.now();
        const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
          x: Math.round(x),
          y: Math.round(y),
          angle: (2 * Math.PI * i) / sparkCount,
          startTime: now,
        }));
        sparksRef.current.push(...newSparks);
        return true;
      }
      return false;
    }

    useEffect(() => {
      const onPointer = (e) => {
        // Only left button or primary pointer
        if (e instanceof PointerEvent && e.button && e.button !== 0) return
        createSparks(e.clientX, e.clientY)
      }
      window.addEventListener('pointerdown', onPointer, { passive: true })
      return () => window.removeEventListener('pointerdown', onPointer)
    }, [sparkCount])

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100vh",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "100vh",
          display: "block",
          userSelect: "none",
          position: parentIsBody() ? 'fixed' : 'absolute',
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
