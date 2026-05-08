/**
 * HỆ THỐNG TINH VÂN (NEBULA SYSTEM)
 * Tạo hiệu ứng tinh vân đa màu sắc cho Three.js
 * 
 * Cách sử dụng:
 * import { createNebulaSystem } from './nebula-system.js';
 * const nebulas = createNebulaSystem(scene, options);
 */

import * as THREE from 'three';

/**
 * Tạo material glow cho tinh vân
 * @param {string} color - Màu sắc (rgba, hsla, hex)
 * @param {number} size - Kích thước texture
 * @param {number} opacity - Độ trong suốt
 * @returns {THREE.Sprite} Sprite với hiệu ứng glow
 */
export function createGlowMaterial(color, size = 128, opacity = 0.55) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  
  // Tạo gradient tròn từ tâm ra ngoài
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  return new THREE.Sprite(material);
}

/**
 * Tạo hệ thống tinh vân hoàn chỉnh
 * @param {THREE.Scene} scene - Scene Three.js
 * @param {Object} options - Tùy chọn cấu hình
 * @returns {Array} Mảng các tinh vân đã tạo
 */
export function createNebulaSystem(scene, options = {}) {
  const {
    count = 25,                    // Số lượng tinh vân
    minSize = 150,                  // Kích thước nhỏ nhất
    maxSize = 300,                 // Kích thước lớn nhất
    minOpacity = 0.1,              // Độ trong suốt nhỏ nhất
    maxOpacity = 0.4,              // Độ trong suốt lớn nhất
    spreadRadius = 40000,            // Bán kính phân bố
    colorPalette = null,           // Bảng màu tùy chỉnh (nếu null sẽ random)
    centralGlow = true,            // Có tạo glow trung tâm không
    centralGlowColor = 'rgba(255,255,255,0.8)',
    centralGlowSize = 156,
    centralGlowOpacity = 0.25,
    centralGlowScale = 8,
    minScale = 150,                 // Scale nhỏ nhất
    maxScale = 200                 // Scale lớn nhất
  } = options;

  const nebulas = [];

  // Tạo glow trung tâm nếu được yêu cầu
  if (centralGlow) {
    const central = createGlowMaterial(centralGlowColor, centralGlowSize, centralGlowOpacity);
    central.scale.set(centralGlowScale, centralGlowScale, 1);
    scene.add(central);
    nebulas.push(central);
  }

  // Tạo các tinh vân với phân bố tốt hơn
  const positions = [];
  const minDistance = spreadRadius * 0.5; // Khoảng cách tối thiểu giữa các tinh vân
  
  for (let i = 0; i < count; i++) {
    // Chọn màu
    let color;
    if (colorPalette && colorPalette.length > 0) {
      // Sử dụng bảng màu có sẵn
      color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    } else {
      // Tạo màu ngẫu nhiên
      const hue = Math.random() * 360;
      const saturation = 80 + Math.random() * 20; // 70-90%
      const lightness = 25 + Math.random() * 15;  // 45-60%
      const alpha = minOpacity + Math.random() * (maxOpacity - minOpacity);
      color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    }

    // Tạo kích thước ngẫu nhiên
    const size = minSize + Math.random() * (maxSize - minSize);
    const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity);
    
    // Tạo tinh vân
    const nebula = createGlowMaterial(color, size, opacity);
    
    // Scale ngẫu nhiên
    const scale = minScale + Math.random() * (maxScale - minScale);
    nebula.scale.set(scale, scale, 1);
    
    // Tìm vị trí phù hợp với khoảng cách tối thiểu
    let position;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      position = {
        x: (Math.random() - 0.5) * spreadRadius,
        y: (Math.random() - 0.5) * spreadRadius,
        z: (Math.random() - 0.5) * spreadRadius
      };
      attempts++;
    } while (attempts < maxAttempts && positions.some(pos => {
      const distance = Math.sqrt(
        Math.pow(position.x - pos.x, 2) + 
        Math.pow(position.y - pos.y, 2) + 
        Math.pow(position.z - pos.z, 2)
      );
      return distance < minDistance;
    }));
    
    // Nếu không tìm được vị trí phù hợp sau nhiều lần thử, chấp nhận vị trí cuối cùng
    nebula.position.set(position.x, position.y, position.z);
    positions.push(position);
    
    scene.add(nebula);
    nebulas.push(nebula);
  }

  return nebulas;
}

/**
 * Tạo bảng màu tinh vân mặc định
 * @returns {Array} Mảng các màu đẹp cho tinh vân
 */
export function getDefaultNebulaColors() {
  return [
    '#ff6b6b',  // Đỏ cam
    '#4ecdc4',  // Xanh ngọc
    '#45b7d1',  // Xanh dương
    '#96ceb4',  // Xanh lá
    '#feca57',  // Vàng
    '#ff9ff3',  // Hồng
    '#54a0ff',  // Xanh dương nhạt
    '#5f27cd',  // Tím
    '#00d2d3',  // Xanh ngọc đậm
    '#ff9f43',
    '#4ecdc4',  // Xanh ngọc
    '#45b7d1',  // Xanh dương
    '#5f27cd',  // Tím
    '#00d2d3',  // Xanh ngọc đậm
    '#96ceb4',  // Xanh lá
    '#0abde3'  ,
    '#ff6b6b',  // Đỏ cam
    '#4ecdc4',  // Xanh ngọc
    '#45b7d1',  // Xanh dương   // Cam
  ];
}

/**
 * Tạo bảng màu tinh vân ấm áp
 * @returns {Array} Mảng các màu ấm
 */
export function getWarmNebulaColors() {
  return [
    '#cfb4b1',  // Hồng đậm hơn nữa
    '#cdc5b6',  // Vàng đậm hơn nữa
    '#cac0b6',  // Beige đậm hơn nữa
    '#cfc0c5',  // Hồng Lavender đậm hơn nữa
    '#cfcab0',  // Trắng Floral đậm hơn nữa
    '#cfcfb0',  // Vàng nhạt Ivory đậm hơn nữa
    '#c5c5ac',  // Beige đậm hơn nữa
    '#cfb4b1',  // Hồng đậm hơn nữa
    '#c68691',  // Hồng đậm hơn nữa
    '#c0909b',  // Hồng baby đậm hơn nữa
    '#ab4053',  // Hồng cổ điển đậm hơn nữa
    '#c0c8cf',  // Xanh dương Alice đậm hơn nữa
    '#c0cfc0',  // Xanh lá Honeydew đậm hơn nữa
    '#c8c8cf',  // Xanh dương Ghost đậm hơn nữa
    '#c5c5c5',  // Xám đậm hơn nữa
    '#cac0b6'   // Beige đậm hơn nữa
  ];
}

/**
 * Tạo bảng màu tinh vân lạnh
 * @returns {Array} Mảng các màu lạnh
 */
export function getCoolNebulaColors() {
  return [
    '#4ecdc4',  // Xanh ngọc
    '#45b7d1',  // Xanh dương
    '#5f27cd',  // Tím
    '#00d2d3',  // Xanh ngọc đậm
    '#96ceb4',  // Xanh lá
    '#0abde3'  ,
    '#ff6b6b',  // Đỏ cam
    '#4ecdc4',  // Xanh ngọc
    '#45b7d1',  // Xanh dương
    '#96ceb4',  // Xanh lá
    '#feca57',  // Vàng
    '#ff9ff3',  // Hồng
    '#54a0ff',  // Xanh dương nhạt
    '#5f27cd',  // Tím
    '#00d2d3',  // Xanh ngọc đậm
    '#ff9f43'   // Cam // Xanh dương đậm
  ];
}
