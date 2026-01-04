# Smart Home Energy Flow Simulation

An interactive 3D visualization demonstrating energy conservation, solar power generation, battery storage, and consumption in a modern smart home. Built with Next.js and Three.js for an educational physics simulation.

![Smart Home Energy Simulation](https://img.shields.io/badge/Status-Active-success) ![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black) ![Three.js](https://img.shields.io/badge/Three.js-0.182.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)

## 🌟 Features

### Core Functionality
- **Real-time 3D Visualization**: Interactive 3D scene showing a house with solar panels, battery storage, and appliances
- **Physics-Based Simulation**: Accurate calculations using real-world physics equations
- **Energy Flow Tracking**: Monitor energy generation, storage, and consumption in real-time
- **Day/Night Cycle**: Dynamic lighting and solar generation based on time of day
- **Interactive Controls**: Adjust time, weather conditions, and appliance states
- **Live Dashboard**: Real-time statistics showing power flow, battery status, and cost savings

### Educational Features
- **Energy Conservation Law**: Demonstrates E_in = E_out + E_stored
- **Power Equations**: Shows P = V × I and P = E / t
- **Battery Physics**: State of charge calculations with efficiency losses
- **Solar Generation**: Time and weather-dependent power generation curves
- **Cost Analysis**: Calculate savings and environmental impact

## 🎓 Physics Principles Demonstrated

### 1. Energy Conservation Law
Total energy in the system remains constant. Energy can be transformed but not created or destroyed.

```
E_in = E_out + E_stored
```

### 2. Solar Power Generation
```
P_solar = P_max × I × cos(θ)

Where:
- P_max = Maximum panel rating (5 kW) - already includes 18% panel efficiency at STC
- I = Sun intensity (0-1, time-dependent)
- θ = Panel angle (30°)
```

### 3. Sun Intensity Calculation
```
I(t) = max(0, sin(π × (t - 6) / 12))

Where t is time in hours (0-24)
Peak at noon, zero from 6 PM to 6 AM
```

### 4. Battery State of Charge
```
SoC(t) = SoC(t-1) + (ΔE / Capacity) × η × 100%

Where:
- ΔE = Energy change (kWh)
- Capacity = Battery capacity (13.5 kWh)
- η = Round-trip efficiency (90%)
```

### 5. Energy Cost Calculations
```
Savings = (E_solar_used × rate_import) + (E_exported × rate_export) - (E_imported × rate_import)

Typical rates:
- Import: $0.13/kWh
- Export: $0.08/kWh
```

## 🛠️ Technology Stack

- **[Next.js 16.1.0](https://nextjs.org/)** - React framework for production
- **[Three.js 0.182.0](https://threejs.org/)** - 3D graphics library
- **[TypeScript 5.9.3](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4.1.18](https://tailwindcss.com/)** - Utility-first CSS framework
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

## 📦 Installation

### Prerequisites
- Node.js 20.x or higher
- pnpm (recommended) or npm

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd solar
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Run the development server**
```bash
pnpm dev
# or
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### Controls

#### Time Controls
- **Time Slider**: Scrub through a 24-hour day cycle
- **Play/Pause**: Start or stop the simulation
- **Speed Controls**: Adjust simulation speed (1x, 5x, 10x, 50x)

#### Weather Controls
- **Sunny**: Maximum solar generation
- **Cloudy**: 30% solar generation
- **Night**: No solar generation (manual override)

#### Appliance Controls
- Toggle individual appliances on/off
- View real-time power consumption
- See which appliances are active

### Understanding the Dashboard

**Solar Generation**
- Current Power: Real-time solar output (kW)
- Total Generated: Cumulative energy produced (kWh)

**Battery Storage**
- State of Charge: Battery level (0-100%)
- Visual indicator with color coding (green/yellow/red)
- Charging/Discharging status and rate

**Consumption**
- Current Power: Total household consumption (kW)
- Total Used: Cumulative energy consumed (kWh)
- Active appliances count

**Grid Connection**
- Status: Importing, Exporting, or No Flow
- Total Imported/Exported energy

**Savings & Impact**
- Cost Savings: Money saved with solar + battery ($)
- CO₂ Saved: Emissions avoided (kg)

### 3D Scene Interaction

- **Orbit**: Left Click + Drag to rotate camera
- **Zoom**: Scroll wheel to zoom in/out
- **Pan**: Right Click + Drag to pan camera

## 📁 Project Structure

```
solar/
├── app/
│   ├── page.tsx              # Main application page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Scene/
│   │   └── Scene.tsx         # Three.js 3D scene
│   └── UI/
│       ├── Dashboard.tsx     # Energy statistics dashboard
│       └── Controls.tsx      # User controls panel
├── hooks/
│   └── useSimulation.ts      # Main simulation logic hook
├── types/
│   └── energy.ts             # TypeScript type definitions
├── utils/
│   ├── physicsConstants.ts   # Physics constants & parameters
│   └── energyCalculations.ts # Energy calculation functions
└── public/                   # Static assets
```

## 🧮 Technical Implementation

### Simulation Loop
The simulation runs at 30 FPS for physics calculations with the following update cycle:

1. **Time Update**: Advance simulation time based on speed multiplier
2. **Solar Calculation**: Compute solar power based on time and weather
3. **Consumption Calculation**: Sum power from active appliances
4. **Battery Management**: Calculate charge/discharge to balance system
5. **Grid Interaction**: Handle import/export when needed
6. **Statistics Update**: Calculate costs, savings, and efficiency

### Key Parameters

**Solar System**
- Maximum Power: 5 kW (16 panels × 312.5W each)
- Panel Efficiency: 18%
- Panel Angle: 30° tilt

**Battery System**
- Capacity: 13.5 kWh (Tesla Powerwall equivalent)
- Efficiency: 90% round-trip
- Max Charge Rate: 5 kW
- Operating Range: 10-100% SoC

**Appliances**
- Light: 60W LED
- Refrigerator: 150W (always on)
- Air Conditioner: 3.5 kW
- TV: 150W
- Computer: 300W
- Washer: 1.2 kW

## 🎯 Educational Goals

This simulation is designed to:

1. **Visualize Energy Conservation**: Show how energy flows through a system
2. **Demonstrate Solar Technology**: Realistic solar panel performance
3. **Explain Battery Storage**: How batteries balance supply and demand
4. **Illustrate Cost Savings**: Financial benefits of renewable energy
5. **Show Environmental Impact**: CO₂ emissions reduction

## 🔧 Build & Deployment

### Production Build

```bash
pnpm build
# or
npm run build
```

### Deploy to Vercel

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com/)
- Import your GitHub repository
- Vercel will auto-detect Next.js and deploy

3. **Environment Variables** (if needed)
No environment variables required for basic deployment.

### Manual Deployment
```bash
vercel deploy
```

## 🎨 Customization

### Modify Physics Constants
Edit `utils/physicsConstants.ts` to adjust:
- Solar panel capacity and efficiency
- Battery capacity and charge rates
- Appliance power ratings
- Energy costs and rates

### Add New Appliances
1. Add appliance type to `types/energy.ts`
2. Add power rating to `APPLIANCE_POWER` in `physicsConstants.ts`
3. Add appliance to `INITIAL_APPLIANCES` in `hooks/useSimulation.ts`
4. Add 3D model in `components/Scene/Scene.tsx`

### Customize 3D Models
Modify the geometry and materials in `Scene.tsx`:
- House structure
- Solar panel layout
- Appliance appearances
- Lighting and colors

## 📊 Performance Optimization

- **Dynamic Import**: Three.js scene loaded client-side only
- **Efficient Rendering**: 60 FPS render loop with 30 FPS physics
- **Geometry Reuse**: Shared materials and geometries
- **Shadow Optimization**: Selective shadow casting
- **React Memoization**: Optimized re-renders with hooks

## 🐛 Troubleshooting

### Black Screen / Scene Not Loading
- Clear browser cache
- Check browser console for errors
- Ensure WebGL is supported in your browser

### Performance Issues
- Reduce simulation speed
- Close other browser tabs
- Update graphics drivers
- Try a different browser (Chrome recommended)

### Physics Seems Incorrect
- Check that energy conservation holds: E_in ≈ E_out + E_stored
- Verify appliance power ratings are realistic
- Ensure battery efficiency is between 0-1

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- [ ] Add particle system for energy flow visualization
- [ ] Implement scenario presets (morning, evening, etc.)
- [ ] Add data export functionality
- [ ] Create historical graphs and analytics
- [ ] Add more appliance types
- [ ] Implement grid connection animations
- [ ] Add sound effects
- [ ] Mobile responsive improvements

## 📝 License

This project is created for educational purposes as part of a physics simulation assignment.

## 🙏 Acknowledgments

- **Three.js** - 3D graphics library
- **Next.js Team** - React framework
- **Vercel** - Hosting platform
- **Physics References**: Solar panel efficiency data, battery specifications, and power consumption standards

## 📚 References

### Physics & Energy
- Solar Panel Efficiency Standards: 15-20% for residential systems
- Battery Technology: Lithium-ion specifications
- Power Consumption Data: Average household appliance ratings

### Documentation
- [Three.js Documentation](https://threejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Energy Conservation Law](https://en.wikipedia.org/wiki/Conservation_of_energy)
- [Solar Power Calculations](https://en.wikipedia.org/wiki/Solar_cell_efficiency)

---

## 📸 Screenshots

### Main Interface
The main application shows the 3D house with solar panels, alongside real-time energy statistics and interactive controls.

### Dashboard
Live monitoring of:
- Solar power generation
- Battery charge status
- Energy consumption
- Grid interaction
- Cost savings and environmental impact

### 3D Visualization
Interactive 3D scene featuring:
- House with roof-mounted solar panels
- Battery storage unit
- Multiple controllable appliances
- Dynamic day/night lighting

---

**Built with ❤️ for Physics Education**

*Demonstrating renewable energy systems through interactive 3D simulation*
