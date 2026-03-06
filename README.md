# Neon Subway Runner

一个基于 **Three.js + ES6 + Web Audio API** 的浏览器 3D 跑酷小游戏（原创美术与程序化音效，不使用任何受版权保护角色/素材）。

## 项目简介

Neon Subway Runner 复刻了经典三车道无尽跑酷的核心手感：

- 自动前进 + 三车道切换
- 跳跃（抛物线）与下滑（缩小碰撞体）
- 随时间递增难度与速度
- 障碍与金币的随机生成、碰撞检测与对象池复用
- 开始界面 / 分数 UI / 结算重开

## 快速开始

1. 在项目根目录启动本地静态服务器：

```bash
python3 -m http.server 5173
```

2. 浏览器访问：

```text
http://localhost:5173/
```

> 说明：项目使用 ES Modules，需通过 HTTP 服务访问，不能直接双击 `index.html`。

## 操作方式

- `←`：向左切换车道
- `→`：向右切换车道
- `↑`：跳跃
- `↓`：下滑（约 0.7 秒）

## 主要特性

- 平滑车道切换（约 200ms）
- 重力驱动跳跃抛物线
- 下滑期间动态碰撞盒
- 指数型速度增长曲线
- 障碍物类型：低障碍 / 高障碍 / 全挡板 / 长列车
- 金币队列：直线 / 弧线 / 之字形
- AABB 包围盒碰撞检测
- 程序化合成音效（跳跃、下滑、吃币、碰撞、背景循环）
- 雾效、灯光、轨道段复用、动态场景元素
- `localStorage` 持久化最高分

## 文件结构

```text
.
├── index.html          # 页面结构与 HUD/弹层
├── style.css           # 视觉样式与速度线特效
├── main.js             # 场景初始化、主循环、输入与状态机
├── player.js           # 玩家移动/跳跃/下滑/碰撞盒
├── obstacles.js        # 障碍生成、复用与碰撞判定
├── coins.js            # 金币生成模式、收集与复用
├── environment.js      # 环境搭建（轨道、列车、建筑、装饰）
├── soundManager.js     # Web Audio 程序化音频管理
└── ui.js               # 分数 UI、开始/结束面板、最高分管理
```

## 开发建议

- 如果想继续提升“类 Subway Runner”体验，可优先迭代：
  1. 角色动作（骨骼动画 / 跳落地缓冲）
  2. 障碍编排规则（更严格避免不可解）
  3. 场景材质与后处理（Bloom、色调映射）
  4. 移动端触控与性能分级

---

If you need, I can also provide a **deployment version** (Vite/webpack packaging + production asset loading + CI workflow).
