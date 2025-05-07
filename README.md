# 🖼️ Infinite Image Scroller

> A smooth, scroll-driven infinite image carousel with GLSL shaders for interactive transitions. Built using Three.js and custom WebGL shaders for visual continuity and distortion.

---

## 🖼 Preview

![Infinite Scroller Demo](media/infinite-scroller-preview.gif)

*(Replace this with your recorded GIF showing the scroll effect.)*

---

## ⚙️ Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/suzubu/infinite-image-scroller.git

# 2. Open index.html directly in your browser
open index.html
```

> No build tools required — plain HTML, JS, and GLSL.

---

## ✨ Features

- 📜 Smooth scroll-driven image switching
- 🎮 Custom GLSL vertex and fragment shaders for z-distortion and vertical swiping
- 🖼 Dynamic texture loading from an array of slide objects
- ⚡ Eased transitions and scroll snapping to next image
- 🧠 GPU-powered image blending based on scroll velocity

---

## 🧠 Dev Notes

### Shaders
- **Vertex Shader**: Applies sinusoidal distortion to the mesh based on scroll intensity
- **Fragment Shader**: Blends `uCurrentTexture` and `uNextTexture` vertically using a scroll progress uniform (`uScrollPosition`)
- **Uniforms**: `uScrollIntensity`, `uScrollPosition`, `uCurrentTexture`, `uNextTexture`

### Logic
- Uses a `slides.js` array of image objects with URLs and titles
- Mouse wheel input updates the scroll position
- Automatically snaps to the nearest image with easing
- Scroll position wraps seamlessly for infinite looping
- Scene scales based on velocity for extra depth feel

---

## 📚 Inspiration / Credits
- [CodeGrid](https://www.youtube.com/watch?v=FEX7xKrBRjI)
- Inspired by smooth infinite carousels found on portfolio sites like [Obys](https://obys.agency/)
- WebGL image transition styles inspired by [Patricio Gonzalez Vivo](https://patriciogonzalezvivo.com/)
- Scrolling interpolation and easing structure influenced by [Framer Motion](https://www.framer.com/motion/) behavior

  

## 📂 Folder Structure

```bash
infinite-image-scroller/
├── index.html
├── script.js
├── shaders.js
├── slides.js
├── style.css
├── media/
│   └── infinite-scroller-preview.gif
└── README.md
```

---

## 📜 License

MIT — free to remix and experiment with.

---

## 🙋‍♀️ Author

Created by [suzubu](https://github.com/suzubu)
