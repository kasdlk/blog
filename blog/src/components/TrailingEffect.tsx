import { useEffect } from 'react';
import './TrailingEffect.css';

const TrailingEffect = () => {
    useEffect(() => {
        const trails: HTMLDivElement[] = [];
        const maxTrails = 60; // ✅ 更长的拖尾
        let lastX = 0;
        let lastY = 0;

        const createTrail = (x: number, y: number) => {
            const trail = document.createElement('div');
            trail.className = 'trail';

            // ✅ 设置位置
            trail.style.left = `${x}px`;
            trail.style.top = `${y}px`;

            // ✅ 随机大小、颜色和透明度
            const size = Math.random() * 20 + 10;
            trail.style.width = `${size}px`;
            trail.style.height = `${size}px`;
            const hue = Math.random() * 360;
            trail.style.backgroundColor = `hsl(${hue}, 70%, 60%)`;
            trail.style.border = `1px solid hsl(${hue}, 70%, 40%)`;

            document.body.appendChild(trail);
            trails.push(trail);

            // ✅ 触发动画：更长的动画路径 + 更大的缩放
            requestAnimationFrame(() => {
                trail.style.transform = `translate(-50%, -50%) scale(0.2) rotate(${Math.random() * 360}deg)`;
                trail.style.opacity = '0';
            });

            // ✅ 控制拖尾数量
            if (trails.length > maxTrails) {
                const oldTrail = trails.shift();
                oldTrail?.remove();
            }
        };

        // ✅ 平滑跟随效果
        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

            // ✅ 鼠标速度快时，增加拖尾频率和大小
            if (distance > 5) {
                createTrail(e.clientX, e.clientY);
                lastX = e.clientX;
                lastY = e.clientY;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            trails.forEach(trail => trail.remove());
        };
    }, []);

    return null;
};

export default TrailingEffect;
