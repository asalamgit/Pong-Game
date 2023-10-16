import { useEffect, useRef, useState } from 'react';

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [canvasSettings, setCanvasSettings] = useState({
    width: 500,
    height: 300,
    multiplier: 1,
  });
  const ball = useRef({
    x: canvasSettings.width / 2,
    y: canvasSettings.height / 2,
    radius: 7 * canvasSettings.multiplier,
  });
  const paddle1 = useRef({
    x: 0,
    y: canvasSettings.height / 2 - (50 * canvasSettings.multiplier) / 2,
    width: 6 * canvasSettings.multiplier,
    height: 50 * canvasSettings.multiplier,
  });
  const paddle2 = useRef({
    x: canvasSettings.width - 6 * canvasSettings.multiplier,
    y: canvasSettings.height / 2 - (50 * canvasSettings.multiplier) / 2,
    width: 6 * canvasSettings.multiplier,
    height: 50 * canvasSettings.multiplier,
  });
  const paddle = useRef({ speed: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        contextRef.current = context;
      }
      canvas.width = canvasSettings.width;
      canvas.height = canvasSettings.height;
    }
  }, [canvasSettings]);

  useEffect(() => {
    handleResize();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResize = () => {
    const windowWidth = window.innerWidth;
    if (windowWidth < 550) {
      setCanvasSettings({
        width: 300,
        height: 179,
        multiplier: 0.6,
      });
    } else if (windowWidth > 550 && windowWidth <= 900) {
      setCanvasSettings({
        width: 500,
        height: 300,
        multiplier: 1,
      });
    } else if (windowWidth > 900) {
      setCanvasSettings({
        width: 800,
        height: 479,
        multiplier: 1.6,
      });
    }
  };

  const clearCanvas = () => {
    const context = contextRef.current;
    if (context) {
      context.clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
    }
  };

  const drawElements = () => {
    const context = contextRef.current;
    if (context) {
      clearCanvas();
      context.beginPath();
      context.arc(
        ball.current.x * canvasSettings.multiplier,
        ball.current.y * canvasSettings.multiplier,
        ball.current.radius * canvasSettings.multiplier,
        0,
        Math.PI * 2
      );
      context.fillRect(
        paddle1.current.x * canvasSettings.multiplier,
        paddle1.current.y * canvasSettings.multiplier,
        paddle1.current.width * canvasSettings.multiplier,
        paddle1.current.height
          ? paddle1.current.height * canvasSettings.multiplier
          : 50 * canvasSettings.multiplier
      );
      context.fillRect(
        paddle2.current.x * canvasSettings.multiplier,
        paddle2.current.y * canvasSettings.multiplier,
        paddle2.current.width * canvasSettings.multiplier,
        paddle2.current.height
          ? paddle2.current.height * canvasSettings.multiplier
          : 50 * canvasSettings.multiplier
      );
      context.fillStyle = 'white';
      context.fill();
      context.closePath();
    }
  };

  return {
    canvasRef,
    contextRef,
    canvasSettings,
    clearCanvas,
    drawElements,
    ball,
    paddle1,
    paddle2,
    paddle,
  };
}
