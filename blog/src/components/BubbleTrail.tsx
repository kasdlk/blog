import { useEffect } from 'react';
import './BubbleTrail.css';

const BubbleTrail = () => {
    useEffect(() => {
        const bubbles: HTMLDivElement[] = [];
        const maxBubbles = 40; // ✅ 最多显示的气泡数量
        let lastMouseX = 0;
        let lastMouseY = 0;
        let mouseSpeed = 0;

        // ✅ 计算鼠标速度
        const calculateSpeed = (x: number, y: number) => {
            const dx = x - lastMouseX;
            const dy = y - lastMouseY;
            lastMouseX = x;
            lastMouseY = y;
            mouseSpeed = Math.sqrt(dx * dx + dy * dy);
        };

        // ✅ 鼠标移动监听器
        const handleMouseMove = (e: MouseEvent) => {
            calculateSpeed(e.clientX, e.clientY);

            // ✅ 根据鼠标速度生成气泡数量
            const bubbleCount = Math.min(10, Math.floor(mouseSpeed / 5) + 1);

            for (let i = 0; i < bubbleCount; i++) {
                createBubble(e.clientX, e.clientY);
            }
        };

        // ✅ 创建气泡
        const createBubble = (x: number, y: number) => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';

            // ✅ 随机位置 & 偏移，避免气泡太密集
            const offsetX = (Math.random() - 0.5) * 50;
            const offsetY = (Math.random() - 0.5) * 50;

            bubble.style.left = `${x + offsetX}px`;
            bubble.style.top = `${y + offsetY}px`;

            // ✅ 根据鼠标速度调整气泡大小（更快更大）
            const size = Math.min(30, Math.max(10, mouseSpeed * 0.5));
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;

            // ✅ 随机颜色（HSL）
            bubble.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;

            // ✅ 随机动画持续时间
            bubble.style.animationDuration = `${0.6 + Math.random() * 0.8}s`;

            document.body.appendChild(bubble);
            bubbles.push(bubble);

            // ✅ 删除超出数量的气泡
            if (bubbles.length > maxBubbles) {
                const oldBubble = bubbles.shift();
                oldBubble?.remove();
            }

            // ✅ 动画结束后删除气泡
            bubble.addEventListener('animationend', () => {
                bubble.remove();
                bubbles.splice(bubbles.indexOf(bubble), 1);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            bubbles.forEach(bubble => bubble.remove());
        };
    }, []);

    return null;
};

export default BubbleTrail;
