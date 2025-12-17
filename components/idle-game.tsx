"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Copy, Download, Save, Upload, Zap, Award, Settings, BarChart3 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast" // Fixed toast import - it comes from hooks/use-toast, not components/ui/toast
import { Toaster } from "@/components/ui/toaster"

// Game state interface
interface GameState {
  cells: number
  totalCells: number
  cellsPerClick: number
  cellsPerSecond: number
  lastSaved: number
  lastTick: number
  producers: Record<string, Producer>
  upgrades: Record<string, Upgrade>
  achievements: Record<string, Achievement>
  prestige: {
    level: number
    multiplier: number
    cellsRequired: number
  }
  research: Record<string, Research>
  stats: {
    totalClicks: number
    totalTimePlayed: number
    prestigeCount: number
  }
}

interface Producer {
  id: string
  name: string
  description: string
  count: number
  baseCost: number
  currentCost: number
  baseProduction: number
  currentProduction: number
  unlocked: boolean
  tier: number
}

interface Upgrade {
  id: string
  name: string
  description: string
  cost: number
  purchased: boolean
  unlocked: boolean
  effect: string
  multiplier: number
  target: string
  tier: number
}

interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  requirement: number
  type: string
  reward?: {
    type: string
    value: number
  }
}

interface Research {
  id: string
  name: string
  description: string
  cost: number
  level: number
  maxLevel: number
  unlocked: boolean
  effect: string
  baseMultiplier: number
  currentMultiplier: number
  costMultiplier: number
}

// Initial game state
const initialProducers: Record<string, Producer> = {
  mitochondria: {
    id: "mitochondria",
    name: "Mitochondria",
    description: "The powerhouse of the cell",
    count: 0,
    baseCost: 10,
    currentCost: 10,
    baseProduction: 0.1,
    currentProduction: 0.1,
    unlocked: true,
    tier: 1,
  },
  ribosome: {
    id: "ribosome",
    name: "Ribosome",
    description: "Protein factories",
    count: 0,
    baseCost: 100,
    currentCost: 100,
    baseProduction: 1,
    currentProduction: 1,
    unlocked: false,
    tier: 1,
  },
  nucleus: {
    id: "nucleus",
    name: "Nucleus",
    description: "Control center of the cell",
    count: 0,
    baseCost: 1100,
    currentCost: 1100,
    baseProduction: 8,
    currentProduction: 8,
    unlocked: false,
    tier: 1,
  },
  golgiApparatus: {
    id: "golgiApparatus",
    name: "Golgi Apparatus",
    description: "Processes and packages proteins",
    count: 0,
    baseCost: 12000,
    currentCost: 12000,
    baseProduction: 47,
    currentProduction: 47,
    unlocked: false,
    tier: 1,
  },
  chloroplast: {
    id: "chloroplast",
    name: "Chloroplast",
    description: "Converts light into energy",
    count: 0,
    baseCost: 130000,
    currentCost: 130000,
    baseProduction: 260,
    currentProduction: 260,
    unlocked: false,
    tier: 1,
  },
  cellMembrane: {
    id: "cellMembrane",
    name: "Cell Membrane",
    description: "Protects and regulates cell contents",
    count: 0,
    baseCost: 1400000,
    currentCost: 1400000,
    baseProduction: 1400,
    currentProduction: 1400,
    unlocked: false,
    tier: 1,
  },
  lysosome: {
    id: "lysosome",
    name: "Lysosome",
    description: "Digests waste materials",
    count: 0,
    baseCost: 20000000,
    currentCost: 20000000,
    baseProduction: 7800,
    currentProduction: 7800,
    unlocked: false,
    tier: 1,
  },
  endoplasmicReticulum: {
    id: "endoplasmicReticulum",
    name: "Endoplasmic Reticulum",
    description: "Manufactures and transports proteins",
    count: 0,
    baseCost: 330000000,
    currentCost: 330000000,
    baseProduction: 44000,
    currentProduction: 44000,
    unlocked: false,
    tier: 1,
  },
  // Tier 2 producers
  cytoskeleton: {
    id: "cytoskeleton",
    name: "Cytoskeleton",
    description: "Provides structural support and transport",
    count: 0,
    baseCost: 5000000000,
    currentCost: 5000000000,
    baseProduction: 260000,
    currentProduction: 260000,
    unlocked: false,
    tier: 2,
  },
  peroxisome: {
    id: "peroxisome",
    name: "Peroxisome",
    description: "Breaks down toxic materials",
    count: 0,
    baseCost: 75000000000,
    currentCost: 75000000000,
    baseProduction: 1600000,
    currentProduction: 1600000,
    unlocked: false,
    tier: 2,
  },
  centriole: {
    id: "centriole",
    name: "Centriole",
    description: "Assists in cell division",
    count: 0,
    baseCost: 1000000000000,
    currentCost: 1000000000000,
    baseProduction: 10000000,
    currentProduction: 10000000,
    unlocked: false,
    tier: 2,
  },
  vacuole: {
    id: "vacuole",
    name: "Vacuole",
    description: "Stores water, nutrients, and waste",
    count: 0,
    baseCost: 14000000000000,
    currentCost: 14000000000000,
    baseProduction: 65000000,
    currentProduction: 65000000,
    unlocked: false,
    tier: 2,
  },
  // Tier 3 producers
  cellCluster: {
    id: "cellCluster",
    name: "Cell Cluster",
    description: "A small group of specialized cells",
    count: 0,
    baseCost: 200000000000000,
    currentCost: 200000000000000,
    baseProduction: 430000000,
    currentProduction: 430000000,
    unlocked: false,
    tier: 3,
  },
  tissue: {
    id: "tissue",
    name: "Tissue",
    description: "Organized cells working together",
    count: 0,
    baseCost: 3000000000000000,
    currentCost: 3000000000000000,
    baseProduction: 2900000000,
    currentProduction: 2900000000,
    unlocked: false,
    tier: 3,
  },
  organ: {
    id: "organ",
    name: "Organ",
    description: "Complex structure of multiple tissues",
    count: 0,
    baseCost: 40000000000000000,
    currentCost: 40000000000000000,
    baseProduction: 21000000000,
    currentProduction: 21000000000,
    unlocked: false,
    tier: 3,
  },
  organSystem: {
    id: "organSystem",
    name: "Organ System",
    description: "Multiple organs working together",
    count: 0,
    baseCost: 500000000000000000,
    currentCost: 500000000000000000,
    baseProduction: 150000000000,
    currentProduction: 150000000000,
    unlocked: false,
    tier: 3,
  },
  // Tier 4 producers
  organism: {
    id: "organism",
    name: "Organism",
    description: "A complete living entity",
    count: 0,
    baseCost: 10000000000000000000,
    currentCost: 10000000000000000000,
    baseProduction: 1100000000000,
    currentProduction: 1100000000000,
    unlocked: false,
    tier: 4,
  },
  population: {
    id: "population",
    name: "Population",
    description: "A group of organisms of the same species",
    count: 0,
    baseCost: 150000000000000000000,
    currentCost: 150000000000000000000,
    baseProduction: 8400000000000,
    currentProduction: 8400000000000,
    unlocked: false,
    tier: 4,
  },
  ecosystem: {
    id: "ecosystem",
    name: "Ecosystem",
    description: "A community of living organisms",
    count: 0,
    baseCost: 2000000000000000000000,
    currentCost: 2000000000000000000000,
    baseProduction: 65000000000000,
    currentProduction: 65000000000000,
    unlocked: false,
    tier: 4,
  },
  biosphere: {
    id: "biosphere",
    name: "Biosphere",
    description: "All ecosystems on Earth",
    count: 0,
    baseCost: 30000000000000000000000,
    currentCost: 30000000000000000000000,
    baseProduction: 510000000000000,
    currentProduction: 510000000000000,
    unlocked: false,
    tier: 4,
  },
}

const initialUpgrades: Record<string, Upgrade> = {
  // Tier 1 upgrades
  efficientMitochondria: {
    id: "efficientMitochondria",
    name: "Efficient Mitochondria",
    description: "Mitochondria produce twice as many cells",
    cost: 100,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "mitochondria",
    tier: 1,
  },
  improvedRibosomes: {
    id: "improvedRibosomes",
    name: "Improved Ribosomes",
    description: "Ribosomes produce twice as many cells",
    cost: 1000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "ribosome",
    tier: 1,
  },
  enhancedNucleus: {
    id: "enhancedNucleus",
    name: "Enhanced Nucleus",
    description: "Nucleus produces twice as many cells",
    cost: 11000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "nucleus",
    tier: 1,
  },
  efficientGolgi: {
    id: "efficientGolgi",
    name: "Efficient Golgi",
    description: "Golgi Apparatus produces twice as many cells",
    cost: 120000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "golgiApparatus",
    tier: 1,
  },
  superChloroplasts: {
    id: "superChloroplasts",
    name: "Super Chloroplasts",
    description: "Chloroplasts produce twice as many cells",
    cost: 1300000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "chloroplast",
    tier: 1,
  },
  reinforcedMembrane: {
    id: "reinforcedMembrane",
    name: "Reinforced Membrane",
    description: "Cell Membranes produce twice as many cells",
    cost: 14000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "cellMembrane",
    tier: 1,
  },
  efficientLysosomes: {
    id: "efficientLysosomes",
    name: "Efficient Lysosomes",
    description: "Lysosomes produce twice as many cells",
    cost: 200000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "lysosome",
    tier: 1,
  },
  smoothER: {
    id: "smoothER",
    name: "Smooth ER",
    description: "Endoplasmic Reticulum produces twice as many cells",
    cost: 3300000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "endoplasmicReticulum",
    tier: 1,
  },
  // Tier 2 upgrades
  dynamicCytoskeleton: {
    id: "dynamicCytoskeleton",
    name: "Dynamic Cytoskeleton",
    description: "Cytoskeleton produces twice as many cells",
    cost: 50000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "cytoskeleton",
    tier: 2,
  },
  catalaseBoost: {
    id: "catalaseBoost",
    name: "Catalase Boost",
    description: "Peroxisomes produce twice as many cells",
    cost: 750000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "peroxisome",
    tier: 2,
  },
  rapidDivision: {
    id: "rapidDivision",
    name: "Rapid Division",
    description: "Centrioles produce twice as many cells",
    cost: 10000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "centriole",
    tier: 2,
  },
  expandedVacuole: {
    id: "expandedVacuole",
    name: "Expanded Vacuole",
    description: "Vacuoles produce twice as many cells",
    cost: 140000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "vacuole",
    tier: 2,
  },
  // Tier 3 upgrades
  specializedClusters: {
    id: "specializedClusters",
    name: "Specialized Clusters",
    description: "Cell Clusters produce twice as many cells",
    cost: 2000000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "cellCluster",
    tier: 3,
  },
  organizedTissue: {
    id: "organizedTissue",
    name: "Organized Tissue",
    description: "Tissues produce twice as many cells",
    cost: 30000000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "tissue",
    tier: 3,
  },
  efficientOrgans: {
    id: "efficientOrgans",
    name: "Efficient Organs",
    description: "Organs produce twice as many cells",
    cost: 400000000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "organ",
    tier: 3,
  },
  integratedSystems: {
    id: "integratedSystems",
    name: "Integrated Systems",
    description: "Organ Systems produce twice as many cells",
    cost: 5000000000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "organSystem",
    tier: 3,
  },
  // Tier 4 upgrades
  adaptiveOrganism: {
    id: "adaptiveOrganism",
    name: "Adaptive Organism",
    description: "Organisms produce twice as many cells",
    cost: 100000000000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "organism",
    tier: 4,
  },
  thrivePopulation: {
    id: "thrivePopulation",
    name: "Thriving Population",
    description: "Populations produce twice as many cells",
    cost: 1500000000000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "population",
    tier: 4,
  },
  balancedEcosystem: {
    id: "balancedEcosystem",
    name: "Balanced Ecosystem",
    description: "Ecosystems produce twice as many cells",
    cost: 20000000000000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "ecosystem",
    tier: 4,
  },
  globalBiosphere: {
    id: "globalBiosphere",
    name: "Global Biosphere",
    description: "Biospheres produce twice as many cells",
    cost: 300000000000000000000000,
    purchased: false,
    unlocked: false,
    effect: "producer",
    multiplier: 2,
    target: "biosphere",
    tier: 4,
  },
  // Click upgrades
  betterClicking: {
    id: "betterClicking",
    name: "Better Clicking",
    description: "Double cells per click",
    cost: 50,
    purchased: false,
    unlocked: true,
    effect: "click",
    multiplier: 2,
    target: "click",
    tier: 1,
  },
  evenBetterClicking: {
    id: "evenBetterClicking",
    name: "Even Better Clicking",
    description: "Triple cells per click",
    cost: 500,
    purchased: false,
    unlocked: false,
    effect: "click",
    multiplier: 3,
    target: "click",
    tier: 1,
  },
  superClicking: {
    id: "superClicking",
    name: "Super Clicking",
    description: "Quadruple cells per click",
    cost: 5000,
    purchased: false,
    unlocked: false,
    effect: "click",
    multiplier: 4,
    target: "click",
    tier: 1,
  },
  ultraClicking: {
    id: "ultraClicking",
    name: "Ultra Clicking",
    description: "5x cells per click",
    cost: 50000,
    purchased: false,
    unlocked: false,
    effect: "click",
    multiplier: 5,
    target: "click",
    tier: 2,
  },
  megaClicking: {
    id: "megaClicking",
    name: "Mega Clicking",
    description: "10x cells per click",
    cost: 500000,
    purchased: false,
    unlocked: false,
    effect: "click",
    multiplier: 10,
    target: "click",
    tier: 2,
  },
  gigaClicking: {
    id: "gigaClicking",
    name: "Giga Clicking",
    description: "25x cells per click",
    cost: 5000000,
    purchased: false,
    unlocked: false,
    effect: "click",
    multiplier: 25,
    target: "click",
    tier: 3,
  },
  teraClicking: {
    id: "teraClicking",
    name: "Tera Clicking",
    description: "100x cells per click",
    cost: 50000000,
    purchased: false,
    unlocked: false,
    effect: "click",
    multiplier: 100,
    target: "click",
    tier: 3,
  },
  petaClicking: {
    id: "petaClicking",
    name: "Peta Clicking",
    description: "1000x cells per click",
    cost: 500000000,
    purchased: false,
    unlocked: false,
    effect: "click",
    multiplier: 1000,
    target: "click",
    tier: 4,
  },
  // Global multiplier upgrades
  globalBoost1: {
    id: "globalBoost1",
    name: "Global Efficiency I",
    description: "All producers are 50% more efficient",
    cost: 1000000,
    purchased: false,
    unlocked: false,
    effect: "global",
    multiplier: 1.5,
    target: "all",
    tier: 1,
  },
  globalBoost2: {
    id: "globalBoost2",
    name: "Global Efficiency II",
    description: "All producers are 2x more efficient",
    cost: 100000000,
    purchased: false,
    unlocked: false,
    effect: "global",
    multiplier: 2,
    target: "all",
    tier: 2,
  },
  globalBoost3: {
    id: "globalBoost3",
    name: "Global Efficiency III",
    description: "All producers are 3x more efficient",
    cost: 10000000000,
    purchased: false,
    unlocked: false,
    effect: "global",
    multiplier: 3,
    target: "all",
    tier: 3,
  },
  globalBoost4: {
    id: "globalBoost4",
    name: "Global Efficiency IV",
    description: "All producers are 5x more efficient",
    cost: 1000000000000,
    purchased: false,
    unlocked: false,
    effect: "global",
    multiplier: 5,
    target: "all",
    tier: 4,
  },
  globalBoost5: {
    id: "globalBoost5",
    name: "Global Efficiency V",
    description: "All producers are 10x more efficient",
    cost: 100000000000000,
    purchased: false,
    unlocked: false,
    effect: "global",
    multiplier: 10,
    target: "all",
    tier: 4,
  },
}

const initialAchievements: Record<string, Achievement> = {
  // Cell count achievements
  firstCell: {
    id: "firstCell",
    name: "First Cell",
    description: "Generate your first cell",
    unlocked: false,
    requirement: 1,
    type: "totalCells",
    reward: {
      type: "cellsPerClick",
      value: 1.1,
    },
  },
  hundredCells: {
    id: "hundredCells",
    name: "Cell Colony",
    description: "Generate 100 cells",
    unlocked: false,
    requirement: 100,
    type: "totalCells",
    reward: {
      type: "cellsPerClick",
      value: 1.2,
    },
  },
  thousandCells: {
    id: "thousandCells",
    name: "Cell Community",
    description: "Generate 1,000 cells",
    unlocked: false,
    requirement: 1000,
    type: "totalCells",
    reward: {
      type: "cellsPerClick",
      value: 1.3,
    },
  },
  millionCells: {
    id: "millionCells",
    name: "Cell Empire",
    description: "Generate 1,000,000 cells",
    unlocked: false,
    requirement: 1000000,
    type: "totalCells",
    reward: {
      type: "globalMultiplier",
      value: 1.1,
    },
  },
  billionCells: {
    id: "billionCells",
    name: "Cell Nation",
    description: "Generate 1,000,000,000 cells",
    unlocked: false,
    requirement: 1000000000,
    type: "totalCells",
    reward: {
      type: "globalMultiplier",
      value: 1.2,
    },
  },
  trillionCells: {
    id: "trillionCells",
    name: "Cell Planet",
    description: "Generate 1,000,000,000,000 cells",
    unlocked: false,
    requirement: 1000000000000,
    type: "totalCells",
    reward: {
      type: "globalMultiplier",
      value: 1.3,
    },
  },
  quadrillionCells: {
    id: "quadrillionCells",
    name: "Cell Galaxy",
    description: "Generate 1,000,000,000,000,000 cells",
    unlocked: false,
    requirement: 1000000000000000,
    type: "totalCells",
    reward: {
      type: "globalMultiplier",
      value: 1.4,
    },
  },
  quintillionCells: {
    id: "quintillionCells",
    name: "Cell Universe",
    description: "Generate 1,000,000,000,000,000,000 cells",
    unlocked: false,
    requirement: 1000000000000000000,
    type: "totalCells",
    reward: {
      type: "globalMultiplier",
      value: 1.5,
    },
  },
  // Producer achievements
  firstMitochondria: {
    id: "firstMitochondria",
    name: "Powerhouse",
    description: "Buy your first Mitochondria",
    unlocked: false,
    requirement: 1,
    type: "mitochondria",
    reward: {
      type: "producerMultiplier",
      value: 1.1,
    },
  },
  tenMitochondria: {
    id: "tenMitochondria",
    name: "Energy Factory",
    description: "Own 10 Mitochondria",
    unlocked: false,
    requirement: 10,
    type: "mitochondria",
    reward: {
      type: "producerMultiplier",
      value: 1.2,
    },
  },
  hundredMitochondria: {
    id: "hundredMitochondria",
    name: "Energy Empire",
    description: "Own 100 Mitochondria",
    unlocked: false,
    requirement: 100,
    type: "mitochondria",
    reward: {
      type: "producerMultiplier",
      value: 1.5,
    },
  },
  firstRibosome: {
    id: "firstRibosome",
    name: "Protein Synthesis",
    description: "Buy your first Ribosome",
    unlocked: false,
    requirement: 1,
    type: "ribosome",
    reward: {
      type: "producerMultiplier",
      value: 1.1,
    },
  },
  tenRibosomes: {
    id: "tenRibosomes",
    name: "Protein Factory",
    description: "Own 10 Ribosomes",
    unlocked: false,
    requirement: 10,
    type: "ribosome",
    reward: {
      type: "producerMultiplier",
      value: 1.2,
    },
  },
  hundredRibosomes: {
    id: "hundredRibosomes",
    name: "Protein Empire",
    description: "Own 100 Ribosomes",
    unlocked: false,
    requirement: 100,
    type: "ribosome",
    reward: {
      type: "producerMultiplier",
      value: 1.5,
    },
  },
  // Tier achievements
  tier1Complete: {
    id: "tier1Complete",
    name: "Cellular Mastery",
    description: "Own at least 50 of each Tier 1 producer",
    unlocked: false,
    requirement: 50,
    type: "tier1",
    reward: {
      type: "tierMultiplier",
      value: 1.5,
    },
  },
  tier2Complete: {
    id: "tier2Complete",
    name: "Subcellular Mastery",
    description: "Own at least 50 of each Tier 2 producer",
    unlocked: false,
    requirement: 50,
    type: "tier2",
    reward: {
      type: "tierMultiplier",
      value: 1.5,
    },
  },
  tier3Complete: {
    id: "tier3Complete",
    name: "Multicellular Mastery",
    description: "Own at least 50 of each Tier 3 producer",
    unlocked: false,
    requirement: 50,
    type: "tier3",
    reward: {
      type: "tierMultiplier",
      value: 1.5,
    },
  },
  tier4Complete: {
    id: "tier4Complete",
    name: "Ecological Mastery",
    description: "Own at least 50 of each Tier 4 producer",
    unlocked: false,
    requirement: 50,
    type: "tier4",
    reward: {
      type: "tierMultiplier",
      value: 1.5,
    },
  },
  // Prestige achievements
  firstPrestige: {
    id: "firstPrestige",
    name: "Cellular Rebirth",
    description: "Perform your first prestige",
    unlocked: false,
    requirement: 1,
    type: "prestige",
    reward: {
      type: "prestigeBonus",
      value: 1.1,
    },
  },
  fivePrestige: {
    id: "fivePrestige",
    name: "Cycle of Life",
    description: "Perform 5 prestiges",
    unlocked: false,
    requirement: 5,
    type: "prestige",
    reward: {
      type: "prestigeBonus",
      value: 1.2,
    },
  },
  tenPrestige: {
    id: "tenPrestige",
    name: "Master of Rebirth",
    description: "Perform 10 prestiges",
    unlocked: false,
    requirement: 10,
    type: "prestige",
    reward: {
      type: "prestigeBonus",
      value: 1.5,
    },
  },
}

const initialResearch: Record<string, Research> = {
  clickEfficiency: {
    id: "clickEfficiency",
    name: "Click Efficiency",
    description: "Increase cells per click by 10% per level",
    cost: 1000,
    level: 0,
    maxLevel: 20,
    unlocked: true,
    effect: "clickMultiplier",
    baseMultiplier: 0.1,
    currentMultiplier: 0.1,
    costMultiplier: 1.5,
  },
  autoClicker: {
    id: "autoClicker",
    name: "Auto Clicker",
    description: "Automatically clicks once per second per level",
    cost: 5000,
    level: 0,
    maxLevel: 10,
    unlocked: true,
    effect: "autoClick",
    baseMultiplier: 1,
    currentMultiplier: 1,
    costMultiplier: 2,
  },
  producerEfficiency: {
    id: "producerEfficiency",
    name: "Producer Efficiency",
    description: "Increase all producer output by 5% per level",
    cost: 10000,
    level: 0,
    maxLevel: 20,
    unlocked: true,
    effect: "producerMultiplier",
    baseMultiplier: 0.05,
    currentMultiplier: 0.05,
    costMultiplier: 1.7,
  },
  costReduction: {
    id: "costReduction",
    name: "Cost Reduction",
    description: "Reduce producer costs by 1% per level",
    cost: 25000,
    level: 0,
    maxLevel: 15,
    unlocked: true,
    effect: "costReduction",
    baseMultiplier: 0.01,
    currentMultiplier: 0.01,
    costMultiplier: 1.8,
  },
  offlineProduction: {
    id: "offlineProduction",
    name: "Offline Production",
    description: "Increase offline production by 5% per level",
    cost: 50000,
    level: 0,
    maxLevel: 20,
    unlocked: true,
    effect: "offlineProduction",
    baseMultiplier: 0.05,
    currentMultiplier: 0.05,
    costMultiplier: 1.6,
  },
  prestigeBonus: {
    id: "prestigeBonus",
    name: "Prestige Bonus",
    description: "Increase prestige multiplier by 5% per level",
    cost: 100000,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    effect: "prestigeBonus",
    baseMultiplier: 0.05,
    currentMultiplier: 0.05,
    costMultiplier: 2,
  },
}

const initialState: GameState = {
  cells: 0,
  totalCells: 0,
  cellsPerClick: 1,
  cellsPerSecond: 0,
  lastSaved: Date.now(),
  lastTick: Date.now(),
  producers: initialProducers,
  upgrades: initialUpgrades,
  achievements: initialAchievements,
  prestige: {
    level: 0,
    multiplier: 1,
    cellsRequired: 1e12, // 1 trillion cells
  },
  research: initialResearch,
  stats: {
    totalClicks: 0,
    totalTimePlayed: 0,
    prestigeCount: 0,
  },
}

// Format large numbers
const formatNumber = (num: number) => {
  if (num >= 1e24) return (num / 1e24).toFixed(2) + "Y"
  if (num >= 1e21) return (num / 1e21).toFixed(2) + "Z"
  if (num >= 1e18) return (num / 1e18).toFixed(2) + "E"
  if (num >= 1e15) return (num / 1e15).toFixed(2) + "P"
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
  return Math.floor(num).toLocaleString()
}

export function IdleGame() {
  const [gameState, setGameState] = useState<GameState>(initialState)
  const [saveCode, setSaveCode] = useState<string>("")
  const [isImporting, setIsImporting] = useState(false)
  const [activeTab, setActiveTab] = useState("main")
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoClickTime, setLastAutoClickTime] = useState(0)
  const { toast } = useToast() // Use useToast hook

  // Safe initialization to prevent client-side exceptions
  useEffect(() => {
    try {
      const savedGame = localStorage.getItem("cellEvolutionSave")
      if (savedGame) {
        try {
          const decodedSave = atob(savedGame)
          const parsedSave = JSON.parse(decodedSave)

          // Ensure all required properties exist
          const safeGameState = {
            ...initialState,
            ...parsedSave,
            // Ensure nested objects exist
            producers: { ...initialProducers, ...parsedSave.producers },
            upgrades: { ...initialUpgrades, ...parsedSave.upgrades },
            achievements: { ...initialAchievements, ...parsedSave.achievements },
            prestige: { ...initialState.prestige, ...parsedSave.prestige },
            research: { ...initialResearch, ...parsedSave.research },
            stats: { ...initialState.stats, ...parsedSave.stats },
          }

          // Calculate time offline
          const now = Date.now()
          const timeDiff = (now - safeGameState.lastTick) / 1000 // in seconds

          // Apply offline production if less than 24 hours
          if (timeDiff > 0 && timeDiff < 86400) {
            const offlineMultiplier =
              1 +
              (safeGameState.research.offlineProduction?.level || 0) *
                (safeGameState.research.offlineProduction?.currentMultiplier || 0.05)

            const offlineProduction = safeGameState.cellsPerSecond * timeDiff * offlineMultiplier * 0.8 // 80% efficiency

            safeGameState.cells += offlineProduction
            safeGameState.totalCells += offlineProduction

            // Show offline progress toast
            if (offlineProduction > 0) {
              setTimeout(() => {
                toast({
                  title: "Welcome Back!",
                  description: `You earned ${formatNumber(offlineProduction)} cells while away.`,
                  duration: 5000,
                })
              }, 1000)
            }
          }

          safeGameState.lastTick = now
          setGameState(safeGameState)
        } catch (error) {
          console.error("Failed to load saved game:", error)
          // If there's an error, use the initial state
          setGameState(initialState)
        }
      }

      // Set auto-save preference
      const autoSavePref = localStorage.getItem("cellEvolutionAutoSave")
      if (autoSavePref !== null) {
        setAutoSaveEnabled(autoSavePref === "true")
      }
    } catch (error) {
      console.error("Error during initialization:", error)
      // Fallback to initial state if there's any error
      setGameState(initialState)
    }
  }, [])

  // Game tick (runs every 100ms)
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState((prevState) => {
        try {
          const now = Date.now()
          const deltaTime = (now - prevState.lastTick) / 1000 // Convert to seconds

          // Calculate cells per second
          let newCellsPerSecond = 0
          Object.values(prevState.producers).forEach((producer) => {
            newCellsPerSecond += producer.count * producer.currentProduction
          })

          // Apply prestige multiplier
          newCellsPerSecond *= prevState.prestige.multiplier

          // Calculate new cells
          const newCells = prevState.cells + newCellsPerSecond * deltaTime
          const newTotalCells = prevState.totalCells + newCellsPerSecond * deltaTime

          // Auto-click if research level > 0
          let autoClickCells = 0
          if (prevState.research.autoClicker.level > 0) {
            const clicksPerSecond =
              prevState.research.autoClicker.level * prevState.research.autoClicker.currentMultiplier
            const clicksSinceLastTick = clicksPerSecond * deltaTime
            autoClickCells = clicksSinceLastTick * prevState.cellsPerClick
          }

          // Check for unlocks based on total cells
          const updatedProducers = { ...prevState.producers }
          const updatedUpgrades = { ...prevState.upgrades }
          const updatedResearch = { ...prevState.research }

          // Unlock producers based on cell count
          if (newCells >= 10 && !updatedProducers.ribosome.unlocked) {
            updatedProducers.ribosome.unlocked = true
          }
          if (newCells >= 100 && !updatedProducers.nucleus.unlocked) {
            updatedProducers.nucleus.unlocked = true
          }
          if (newCells >= 1000 && !updatedProducers.golgiApparatus.unlocked) {
            updatedProducers.golgiApparatus.unlocked = true
          }
          if (newCells >= 10000 && !updatedProducers.chloroplast.unlocked) {
            updatedProducers.chloroplast.unlocked = true
          }
          if (newCells >= 100000 && !updatedProducers.cellMembrane.unlocked) {
            updatedProducers.cellMembrane.unlocked = true
          }
          if (newCells >= 1000000 && !updatedProducers.lysosome.unlocked) {
            updatedProducers.lysosome.unlocked = true
          }
          if (newCells >= 10000000 && !updatedProducers.endoplasmicReticulum.unlocked) {
            updatedProducers.endoplasmicReticulum.unlocked = true
          }
          // Tier 2 producers
          if (newCells >= 100000000 && !updatedProducers.cytoskeleton.unlocked) {
            updatedProducers.cytoskeleton.unlocked = true
          }
          if (newCells >= 1000000000 && !updatedProducers.peroxisome.unlocked) {
            updatedProducers.peroxisome.unlocked = true
          }
          if (newCells >= 10000000000 && !updatedProducers.centriole.unlocked) {
            updatedProducers.centriole.unlocked = true
          }
          if (newCells >= 100000000000 && !updatedProducers.vacuole.unlocked) {
            updatedProducers.vacuole.unlocked = true
          }
          // Tier 3 producers
          if (newCells >= 1000000000000 && !updatedProducers.cellCluster.unlocked) {
            updatedProducers.cellCluster.unlocked = true
          }
          if (newCells >= 10000000000000 && !updatedProducers.tissue.unlocked) {
            updatedProducers.tissue.unlocked = true
          }
          if (newCells >= 100000000000000 && !updatedProducers.organ.unlocked) {
            updatedProducers.organ.unlocked = true
          }
          if (newCells >= 1000000000000000 && !updatedProducers.organSystem.unlocked) {
            updatedProducers.organSystem.unlocked = true
          }
          // Tier 4 producers
          if (newCells >= 10000000000000000 && !updatedProducers.organism.unlocked) {
            updatedProducers.organism.unlocked = true
          }
          if (newCells >= 100000000000000000 && !updatedProducers.population.unlocked) {
            updatedProducers.population.unlocked = true
          }
          if (newCells >= 1000000000000000000 && !updatedProducers.ecosystem.unlocked) {
            updatedProducers.ecosystem.unlocked = true
          }
          if (newCells >= 10000000000000000000 && !updatedProducers.biosphere.unlocked) {
            updatedProducers.biosphere.unlocked = true
          }

          // Unlock upgrades based on producer counts
          if (updatedProducers.mitochondria.count >= 10 && !updatedUpgrades.efficientMitochondria.unlocked) {
            updatedUpgrades.efficientMitochondria.unlocked = true
          }
          if (updatedProducers.ribosome.count >= 10 && !updatedUpgrades.improvedRibosomes.unlocked) {
            updatedUpgrades.improvedRibosomes.unlocked = true
          }
          if (updatedProducers.nucleus.count >= 10 && !updatedUpgrades.enhancedNucleus.unlocked) {
            updatedUpgrades.enhancedNucleus.unlocked = true
          }
          if (updatedProducers.golgiApparatus.count >= 10 && !updatedUpgrades.efficientGolgi.unlocked) {
            updatedUpgrades.efficientGolgi.unlocked = true
          }
          if (updatedProducers.chloroplast.count >= 10 && !updatedUpgrades.superChloroplasts.unlocked) {
            updatedUpgrades.superChloroplasts.unlocked = true
          }
          if (updatedProducers.cellMembrane.count >= 10 && !updatedUpgrades.reinforcedMembrane.unlocked) {
            updatedUpgrades.reinforcedMembrane.unlocked = true
          }
          if (updatedProducers.lysosome.count >= 10 && !updatedUpgrades.efficientLysosomes.unlocked) {
            updatedUpgrades.efficientLysosomes.unlocked = true
          }
          if (updatedProducers.endoplasmicReticulum.count >= 10 && !updatedUpgrades.smoothER.unlocked) {
            updatedUpgrades.smoothER.unlocked = true
          }
          // Tier 2 upgrades
          if (updatedProducers.cytoskeleton.count >= 10 && !updatedUpgrades.dynamicCytoskeleton.unlocked) {
            updatedUpgrades.dynamicCytoskeleton.unlocked = true
          }
          if (updatedProducers.peroxisome.count >= 10 && !updatedUpgrades.catalaseBoost.unlocked) {
            updatedUpgrades.catalaseBoost.unlocked = true
          }
          if (updatedProducers.centriole.count >= 10 && !updatedUpgrades.rapidDivision.unlocked) {
            updatedUpgrades.rapidDivision.unlocked = true
          }
          if (updatedProducers.vacuole.count >= 10 && !updatedUpgrades.expandedVacuole.unlocked) {
            updatedUpgrades.expandedVacuole.unlocked = true
          }
          // Tier 3 upgrades
          if (updatedProducers.cellCluster.count >= 10 && !updatedUpgrades.specializedClusters.unlocked) {
            updatedUpgrades.specializedClusters.unlocked = true
          }
          if (updatedProducers.tissue.count >= 10 && !updatedUpgrades.organizedTissue.unlocked) {
            updatedUpgrades.organizedTissue.unlocked = true
          }
          if (updatedProducers.organ.count >= 10 && !updatedUpgrades.efficientOrgans.unlocked) {
            updatedUpgrades.efficientOrgans.unlocked = true
          }
          if (updatedProducers.organSystem.count >= 10 && !updatedUpgrades.integratedSystems.unlocked) {
            updatedUpgrades.integratedSystems.unlocked = true
          }
          // Tier 4 upgrades
          if (updatedProducers.organism.count >= 10 && !updatedUpgrades.adaptiveOrganism.unlocked) {
            updatedUpgrades.adaptiveOrganism.unlocked = true
          }
          if (updatedProducers.population.count >= 10 && !updatedUpgrades.thrivePopulation.unlocked) {
            updatedUpgrades.thrivePopulation.unlocked = true
          }
          if (updatedProducers.ecosystem.count >= 10 && !updatedUpgrades.balancedEcosystem.unlocked) {
            updatedUpgrades.balancedEcosystem.unlocked = true
          }
          if (updatedProducers.biosphere.count >= 10 && !updatedUpgrades.globalBiosphere.unlocked) {
            updatedUpgrades.globalBiosphere.unlocked = true
          }

          // Unlock click upgrades based on total cells
          if (newCells >= 100 && !updatedUpgrades.evenBetterClicking.unlocked) {
            updatedUpgrades.evenBetterClicking.unlocked = true
          }
          if (newCells >= 1000 && !updatedUpgrades.superClicking.unlocked) {
            updatedUpgrades.superClicking.unlocked = true
          }
          if (newCells >= 10000 && !updatedUpgrades.ultraClicking.unlocked) {
            updatedUpgrades.ultraClicking.unlocked = true
          }
          if (newCells >= 100000 && !updatedUpgrades.megaClicking.unlocked) {
            updatedUpgrades.megaClicking.unlocked = true
          }
          if (newCells >= 1000000 && !updatedUpgrades.gigaClicking.unlocked) {
            updatedUpgrades.gigaClicking.unlocked = true
          }
          if (newCells >= 10000000 && !updatedUpgrades.teraClicking.unlocked) {
            updatedUpgrades.teraClicking.unlocked = true
          }
          if (newCells >= 100000000 && !updatedUpgrades.petaClicking.unlocked) {
            updatedUpgrades.petaClicking.unlocked = true
          }

          // Unlock global upgrades
          if (newCells >= 500000 && !updatedUpgrades.globalBoost1.unlocked) {
            updatedUpgrades.globalBoost1.unlocked = true
          }
          if (newCells >= 50000000 && !updatedUpgrades.globalBoost2.unlocked) {
            updatedUpgrades.globalBoost2.unlocked = true
          }
          if (newCells >= 5000000000 && !updatedUpgrades.globalBoost3.unlocked) {
            updatedUpgrades.globalBoost3.unlocked = true
          }
          if (newCells >= 500000000000 && !updatedUpgrades.globalBoost4.unlocked) {
            updatedUpgrades.globalBoost4.unlocked = true
          }
          if (newCells >= 50000000000000 && !updatedUpgrades.globalBoost5.unlocked) {
            updatedUpgrades.globalBoost5.unlocked = true
          }

          // Unlock prestige research
          if (prevState.prestige.level > 0 && !updatedResearch.prestigeBonus.unlocked) {
            updatedResearch.prestigeBonus.unlocked = true
          }

          // Check achievements
          const updatedAchievements = { ...prevState.achievements }

          // Total cells achievements
          Object.values(updatedAchievements).forEach((achievement) => {
            if (!achievement.unlocked) {
              if (achievement.type === "totalCells" && newTotalCells >= achievement.requirement) {
                updatedAchievements[achievement.id].unlocked = true
                toast({
                  title: "Achievement Unlocked!",
                  description: `${achievement.name}: ${achievement.description}`,
                  duration: 5000,
                })

                // Apply achievement rewards
                if (achievement.reward) {
                  if (achievement.reward.type === "cellsPerClick") {
                    // This will be applied in the return statement
                  } else if (achievement.reward.type === "globalMultiplier") {
                    // Apply to all producers
                    Object.keys(updatedProducers).forEach((producerId) => {
                      const producer = updatedProducers[producerId]
                      updatedProducers[producerId] = {
                        ...producer,
                        currentProduction: producer.baseProduction * achievement.reward!.value,
                      }
                    })
                  }
                }
              } else if (
                achievement.type === "mitochondria" &&
                updatedProducers.mitochondria.count >= achievement.requirement
              ) {
                updatedAchievements[achievement.id].unlocked = true
                toast({
                  title: "Achievement Unlocked!",
                  description: `${achievement.name}: ${achievement.description}`,
                  duration: 5000,
                })

                // Apply producer-specific multiplier if reward exists
                if (achievement.reward && achievement.reward.type === "producerMultiplier") {
                  const producer = updatedProducers.mitochondria
                  updatedProducers.mitochondria = {
                    ...producer,
                    currentProduction: producer.currentProduction * achievement.reward.value,
                  }
                }
              } else if (
                achievement.type === "ribosome" &&
                updatedProducers.ribosome.count >= achievement.requirement
              ) {
                updatedAchievements[achievement.id].unlocked = true
                toast({
                  title: "Achievement Unlocked!",
                  description: `${achievement.name}: ${achievement.description}`,
                  duration: 5000,
                })

                // Apply producer-specific multiplier if reward exists
                if (achievement.reward && achievement.reward.type === "producerMultiplier") {
                  const producer = updatedProducers.ribosome
                  updatedProducers.ribosome = {
                    ...producer,
                    currentProduction: producer.currentProduction * achievement.reward.value,
                  }
                }
              } else if (achievement.type === "prestige" && prevState.stats.prestigeCount >= achievement.requirement) {
                updatedAchievements[achievement.id].unlocked = true
                toast({
                  title: "Achievement Unlocked!",
                  description: `${achievement.name}: ${achievement.description}`,
                  duration: 5000,
                })
              }

              // Check tier achievements
              else if (achievement.type === "tier1") {
                const tier1Complete = Object.values(updatedProducers)
                  .filter((p) => p.tier === 1)
                  .every((p) => p.count >= achievement.requirement)

                if (tier1Complete) {
                  updatedAchievements[achievement.id].unlocked = true
                  toast({
                    title: "Achievement Unlocked!",
                    description: `${achievement.name}: ${achievement.description}`,
                    duration: 5000,
                  })

                  // Apply tier multiplier if reward exists
                  if (achievement.reward && achievement.reward.type === "tierMultiplier") {
                    Object.values(updatedProducers)
                      .filter((p) => p.tier === 1)
                      .forEach((producer) => {
                        updatedProducers[producer.id] = {
                          ...producer,
                          currentProduction: producer.currentProduction * achievement.reward!.value,
                        }
                      })
                  }
                }
              } else if (achievement.type === "tier2") {
                const tier2Complete = Object.values(updatedProducers)
                  .filter((p) => p.tier === 2)
                  .every((p) => p.count >= achievement.requirement)

                if (tier2Complete) {
                  updatedAchievements[achievement.id].unlocked = true
                  toast({
                    title: "Achievement Unlocked!",
                    description: `${achievement.name}: ${achievement.description}`,
                    duration: 5000,
                  })

                  // Apply tier multiplier if reward exists
                  if (achievement.reward && achievement.reward.type === "tierMultiplier") {
                    Object.values(updatedProducers)
                      .filter((p) => p.tier === 2)
                      .forEach((producer) => {
                        updatedProducers[producer.id] = {
                          ...producer,
                          currentProduction: producer.currentProduction * achievement.reward!.value,
                        }
                      })
                  }
                }
              } else if (achievement.type === "tier3") {
                const tier3Complete = Object.values(updatedProducers)
                  .filter((p) => p.tier === 3)
                  .every((p) => p.count >= achievement.requirement)

                if (tier3Complete) {
                  updatedAchievements[achievement.id].unlocked = true
                  toast({
                    title: "Achievement Unlocked!",
                    description: `${achievement.name}: ${achievement.description}`,
                    duration: 5000,
                  })

                  // Apply tier multiplier if reward exists
                  if (achievement.reward && achievement.reward.type === "tierMultiplier") {
                    Object.values(updatedProducers)
                      .filter((p) => p.tier === 3)
                      .forEach((producer) => {
                        updatedProducers[producer.id] = {
                          ...producer,
                          currentProduction: producer.currentProduction * achievement.reward!.value,
                        }
                      })
                  }
                }
              } else if (achievement.type === "tier4") {
                const tier4Complete = Object.values(updatedProducers)
                  .filter((p) => p.tier === 4)
                  .every((p) => p.count >= achievement.requirement)

                if (tier4Complete) {
                  updatedAchievements[achievement.id].unlocked = true
                  toast({
                    title: "Achievement Unlocked!",
                    description: `${achievement.name}: ${achievement.description}`,
                    duration: 5000,
                  })

                  // Apply tier multiplier if reward exists
                  if (achievement.reward && achievement.reward.type === "tierMultiplier") {
                    Object.values(updatedProducers)
                      .filter((p) => p.tier === 4)
                      .forEach((producer) => {
                        updatedProducers[producer.id] = {
                          ...producer,
                          currentProduction: producer.currentProduction * achievement.reward!.value,
                        }
                      })
                  }
                }
              }
            }
          })

          // Update stats
          const updatedStats = {
            ...prevState.stats,
            totalTimePlayed: prevState.stats.totalTimePlayed + deltaTime,
          }

          // Auto-save every minute if enabled
          if (autoSaveEnabled && now - prevState.lastSaved > 60000) {
            try {
              const saveData = JSON.stringify({
                ...prevState,
                cells: newCells + autoClickCells,
                totalCells: newTotalCells + autoClickCells,
                cellsPerSecond: newCellsPerSecond,
                lastTick: now,
                lastSaved: now,
                producers: updatedProducers,
                upgrades: updatedUpgrades,
                achievements: updatedAchievements,
                research: updatedResearch,
                stats: updatedStats,
              })

              const encodedSave = btoa(saveData)
              localStorage.setItem("cellEvolutionSave", encodedSave)
            } catch (error) {
              console.error("Auto-save failed:", error)
            }

            return {
              ...prevState,
              cells: newCells + autoClickCells,
              totalCells: newTotalCells + autoClickCells,
              cellsPerSecond: newCellsPerSecond,
              lastTick: now,
              lastSaved: now,
              producers: updatedProducers,
              upgrades: updatedUpgrades,
              achievements: updatedAchievements,
              research: updatedResearch,
              stats: updatedStats,
            }
          }

          return {
            ...prevState,
            cells: newCells + autoClickCells,
            totalCells: newTotalCells + autoClickCells,
            cellsPerSecond: newCellsPerSecond,
            lastTick: now,
            producers: updatedProducers,
            upgrades: updatedUpgrades,
            achievements: updatedAchievements,
            research: updatedResearch,
            stats: updatedStats,
          }
        } catch (error) {
          console.error("Error in game loop:", error)
          return prevState
        }
      })
    }, 100)

    return () => clearInterval(gameLoop)
  }, [autoSaveEnabled])

  // Click handler for the main cell button
  const handleCellClick = () => {
    setGameState((prevState) => {
      try {
        // Apply prestige multiplier to clicks
        const clickAmount = prevState.cellsPerClick * prevState.prestige.multiplier
        const newCells = prevState.cells + clickAmount
        const newTotalCells = prevState.totalCells + clickAmount
        const updatedStats = {
          ...prevState.stats,
          totalClicks: prevState.stats.totalClicks + 1,
        }

        // Check achievements
        const updatedAchievements = { ...prevState.achievements }

        Object.values(updatedAchievements).forEach((achievement) => {
          if (!achievement.unlocked && achievement.type === "totalCells" && newTotalCells >= achievement.requirement) {
            updatedAchievements[achievement.id].unlocked = true
            toast({
              title: "Achievement Unlocked!",
              description: `${achievement.name}: ${achievement.description}`,
              duration: 5000,
            })
          }
        })

        return {
          ...prevState,
          cells: newCells,
          totalCells: newTotalCells,
          achievements: updatedAchievements,
          stats: updatedStats,
        }
      } catch (error) {
        console.error("Error in click handler:", error)
        return prevState
      }
    })
  }

  // Buy producer handler
  const buyProducer = (producerId: string) => {
    setGameState((prevState) => {
      try {
        const producer = prevState.producers[producerId]

        if (prevState.cells < producer.currentCost) {
          return prevState
        }

        const newCount = producer.count + 1

        // Apply cost reduction from research if available
        let costReduction = 0
        if (prevState.research.costReduction && prevState.research.costReduction.level > 0) {
          costReduction = prevState.research.costReduction.level * prevState.research.costReduction.currentMultiplier
        }

        // Calculate new cost with potential reduction (minimum 1% reduction)
        const costMultiplier = Math.max(1.15 * (1 - costReduction), 1.01)
        const newCost = Math.floor(producer.baseCost * Math.pow(costMultiplier, newCount))

        // Calculate new cells per second
        let newCellsPerSecond = prevState.cellsPerSecond
        newCellsPerSecond =
          newCellsPerSecond - producer.count * producer.currentProduction + newCount * producer.currentProduction

        // Check producer-specific achievements
        const updatedAchievements = { ...prevState.achievements }

        Object.values(updatedAchievements).forEach((achievement) => {
          if (!achievement.unlocked && achievement.type === producerId && newCount >= achievement.requirement) {
            updatedAchievements[achievement.id].unlocked = true
            toast({
              title: "Achievement Unlocked!",
              description: `${achievement.name}: ${achievement.description}`,
              duration: 5000,
            })

            // Apply achievement rewards if applicable
            if (achievement.reward && achievement.reward.type === "producerMultiplier") {
              // This will be handled in the next game tick
            }
          }
        })

        // Check if we should unlock upgrades
        const updatedUpgrades = { ...prevState.upgrades }

        // Tier 1 upgrades
        if (producerId === "mitochondria" && newCount >= 10 && !updatedUpgrades.efficientMitochondria.unlocked) {
          updatedUpgrades.efficientMitochondria.unlocked = true
        } else if (producerId === "ribosome" && newCount >= 10 && !updatedUpgrades.improvedRibosomes.unlocked) {
          updatedUpgrades.improvedRibosomes.unlocked = true
        } else if (producerId === "nucleus" && newCount >= 10 && !updatedUpgrades.enhancedNucleus.unlocked) {
          updatedUpgrades.enhancedNucleus.unlocked = true
        } else if (producerId === "golgiApparatus" && newCount >= 10 && !updatedUpgrades.efficientGolgi.unlocked) {
          updatedUpgrades.efficientGolgi.unlocked = true
        } else if (producerId === "chloroplast" && newCount >= 10 && !updatedUpgrades.superChloroplasts.unlocked) {
          updatedUpgrades.superChloroplasts.unlocked = true
        } else if (producerId === "cellMembrane" && newCount >= 10 && !updatedUpgrades.reinforcedMembrane.unlocked) {
          updatedUpgrades.reinforcedMembrane.unlocked = true
        } else if (producerId === "lysosome" && newCount >= 10 && !updatedUpgrades.efficientLysosomes.unlocked) {
          updatedUpgrades.efficientLysosomes.unlocked = true
        } else if (producerId === "endoplasmicReticulum" && newCount >= 10 && !updatedUpgrades.smoothER.unlocked) {
          updatedUpgrades.smoothER.unlocked = true
        }

        // Tier 2 upgrades
        else if (producerId === "cytoskeleton" && newCount >= 10 && !updatedUpgrades.dynamicCytoskeleton.unlocked) {
          updatedUpgrades.dynamicCytoskeleton.unlocked = true
        } else if (producerId === "peroxisome" && newCount >= 10 && !updatedUpgrades.catalaseBoost.unlocked) {
          updatedUpgrades.catalaseBoost.unlocked = true
        } else if (producerId === "centriole" && newCount >= 10 && !updatedUpgrades.rapidDivision.unlocked) {
          updatedUpgrades.rapidDivision.unlocked = true
        } else if (producerId === "vacuole" && newCount >= 10 && !updatedUpgrades.expandedVacuole.unlocked) {
          updatedUpgrades.expandedVacuole.unlocked = true
        }

        // Tier 3 upgrades
        else if (producerId === "cellCluster" && newCount >= 10 && !updatedUpgrades.specializedClusters.unlocked) {
          updatedUpgrades.specializedClusters.unlocked = true
        } else if (producerId === "tissue" && newCount >= 10 && !updatedUpgrades.organizedTissue.unlocked) {
          updatedUpgrades.organizedTissue.unlocked = true
        } else if (producerId === "organ" && newCount >= 10 && !updatedUpgrades.efficientOrgans.unlocked) {
          updatedUpgrades.efficientOrgans.unlocked = true
        } else if (producerId === "organSystem" && newCount >= 10 && !updatedUpgrades.integratedSystems.unlocked) {
          updatedUpgrades.integratedSystems.unlocked = true
        }

        // Tier 4 upgrades
        else if (producerId === "organism" && newCount >= 10 && !updatedUpgrades.adaptiveOrganism.unlocked) {
          updatedUpgrades.adaptiveOrganism.unlocked = true
        } else if (producerId === "population" && newCount >= 10 && !updatedUpgrades.thrivePopulation.unlocked) {
          updatedUpgrades.thrivePopulation.unlocked = true
        } else if (producerId === "ecosystem" && newCount >= 10 && !updatedUpgrades.balancedEcosystem.unlocked) {
          updatedUpgrades.balancedEcosystem.unlocked = true
        } else if (producerId === "biosphere" && newCount >= 10 && !updatedUpgrades.globalBiosphere.unlocked) {
          updatedUpgrades.globalBiosphere.unlocked = true
        }

        // Check tier achievements
        const tier1Producers = Object.values(prevState.producers).filter((p) => p.tier === 1 && p.unlocked)
        const tier2Producers = Object.values(prevState.producers).filter((p) => p.tier === 2 && p.unlocked)
        const tier3Producers = Object.values(prevState.producers).filter((p) => p.tier === 3 && p.unlocked)
        const tier4Producers = Object.values(prevState.producers).filter((p) => p.tier === 4 && p.unlocked)

        if (
          tier1Producers.length > 0 &&
          tier1Producers.every((p) => p.count >= 50) &&
          !updatedAchievements.tier1Complete.unlocked
        ) {
          updatedAchievements.tier1Complete.unlocked = true
          toast({
            title: "Achievement Unlocked!",
            description: `${updatedAchievements.tier1Complete.name}: ${updatedAchievements.tier1Complete.description}`,
            duration: 5000,
          })
        }

        if (
          tier2Producers.length > 0 &&
          tier2Producers.every((p) => p.count >= 50) &&
          !updatedAchievements.tier2Complete.unlocked
        ) {
          updatedAchievements.tier2Complete.unlocked = true
          toast({
            title: "Achievement Unlocked!",
            description: `${updatedAchievements.tier2Complete.name}: ${updatedAchievements.tier2Complete.description}`,
            duration: 5000,
          })
        }

        if (
          tier3Producers.length > 0 &&
          tier3Producers.every((p) => p.count >= 50) &&
          !updatedAchievements.tier3Complete.unlocked
        ) {
          updatedAchievements.tier3Complete.unlocked = true
          toast({
            title: "Achievement Unlocked!",
            description: `${updatedAchievements.tier3Complete.name}: ${updatedAchievements.tier3Complete.description}`,
            duration: 5000,
          })
        }

        if (
          tier4Producers.length > 0 &&
          tier4Producers.every((p) => p.count >= 50) &&
          !updatedAchievements.tier4Complete.unlocked
        ) {
          updatedAchievements.tier4Complete.unlocked = true
          toast({
            title: "Achievement Unlocked!",
            description: `${updatedAchievements.tier4Complete.name}: ${updatedAchievements.tier4Complete.description}`,
            duration: 5000,
          })
        }

        return {
          ...prevState,
          cells: prevState.cells - producer.currentCost,
          cellsPerSecond: newCellsPerSecond,
          producers: {
            ...prevState.producers,
            [producerId]: {
              ...producer,
              count: newCount,
              currentCost: newCost,
            },
          },
          upgrades: updatedUpgrades,
          achievements: updatedAchievements,
        }
      } catch (error) {
        console.error("Error in buy producer:", error)
        return prevState
      }
    })
  }

  // Buy upgrade handler
  const buyUpgrade = (upgradeId: string) => {
    setGameState((prevState) => {
      try {
        const upgrade = prevState.upgrades[upgradeId]

        if (prevState.cells < upgrade.cost || upgrade.purchased) {
          return prevState
        }

        let newCellsPerClick = prevState.cellsPerClick
        let newCellsPerSecond = prevState.cellsPerSecond
        const updatedProducers = { ...prevState.producers }

        // Apply upgrade effects
        if (upgrade.effect === "click") {
          newCellsPerClick = prevState.cellsPerClick * upgrade.multiplier
        } else if (upgrade.effect === "producer") {
          const targetProducer = prevState.producers[upgrade.target]
          const newProduction = targetProducer.baseProduction * upgrade.multiplier

          // Update cells per second
          newCellsPerSecond =
            newCellsPerSecond -
            targetProducer.count * targetProducer.currentProduction +
            targetProducer.count * newProduction

          updatedProducers[upgrade.target] = {
            ...targetProducer,
            currentProduction: newProduction,
          }
        } else if (upgrade.effect === "global") {
          // Apply to all producers
          Object.keys(updatedProducers).forEach((producerId) => {
            const producer = updatedProducers[producerId]
            const newProduction = producer.baseProduction * upgrade.multiplier

            // Update cells per second
            newCellsPerSecond =
              newCellsPerSecond - producer.count * producer.currentProduction + producer.count * newProduction

            updatedProducers[producerId] = {
              ...producer,
              currentProduction: newProduction,
            }
          })
        }

        toast({
          title: "Upgrade Purchased",
          description: `${upgrade.name}: ${upgrade.description}`,
          duration: 3000,
        })

        return {
          ...prevState,
          cells: prevState.cells - upgrade.cost,
          cellsPerClick: upgrade.effect === "click" ? newCellsPerClick : prevState.cellsPerClick,
          cellsPerSecond:
            upgrade.effect === "producer" || upgrade.effect === "global" ? newCellsPerSecond : prevState.cellsPerSecond,
          producers:
            upgrade.effect === "producer" || upgrade.effect === "global" ? updatedProducers : prevState.producers,
          upgrades: {
            ...prevState.upgrades,
            [upgradeId]: {
              ...upgrade,
              purchased: true,
            },
          },
        }
      } catch (error) {
        console.error("Error in buy upgrade:", error)
        return prevState
      }
    })
  }

  // Buy research handler
  const buyResearch = (researchId: string) => {
    setGameState((prevState) => {
      try {
        const research = prevState.research[researchId]

        if (prevState.cells < research.cost || research.level >= research.maxLevel) {
          return prevState
        }

        const newLevel = research.level + 1
        const newCost = Math.floor(research.cost * Math.pow(research.costMultiplier, newLevel))

        const updatedGameState = { ...prevState }

        // Apply research effects
        if (research.effect === "clickMultiplier") {
          const clickMultiplier = 1 + newLevel * research.baseMultiplier
          updatedGameState.cellsPerClick = initialState.cellsPerClick * clickMultiplier
        } else if (research.effect === "producerMultiplier") {
          // This will be applied in the game loop
          const updatedProducers = { ...prevState.producers }

          Object.keys(updatedProducers).forEach((producerId) => {
            const producer = updatedProducers[producerId]
            const multiplier = 1 + newLevel * research.baseMultiplier

            updatedProducers[producerId] = {
              ...producer,
              currentProduction: producer.baseProduction * multiplier,
            }
          })

          updatedGameState.producers = updatedProducers
        } else if (research.effect === "prestigeBonus") {
          // Will be applied when prestige is performed
        }

        toast({
          title: "Research Upgraded",
          description: `${research.name} is now level ${newLevel}`,
          duration: 3000,
        })

        return {
          ...updatedGameState,
          cells: prevState.cells - research.cost,
          research: {
            ...prevState.research,
            [researchId]: {
              ...research,
              level: newLevel,
              cost: newCost,
              currentMultiplier: research.baseMultiplier * newLevel,
            },
          },
        }
      } catch (error) {
        console.error("Error in buy research:", error)
        return prevState
      }
    })
  }

  // Prestige handler
  const performPrestige = () => {
    if (gameState.cells < gameState.prestige.cellsRequired) {
      toast({
        title: "Cannot Prestige Yet",
        description: `You need ${formatNumber(gameState.prestige.cellsRequired)} cells to prestige.`,
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (
      confirm(
        "Are you sure you want to prestige? You will lose all your cells and producers, but gain a permanent production multiplier.",
      )
    ) {
      setGameState((prevState) => {
        try {
          // Calculate new prestige level and multiplier
          const newPrestigeLevel = prevState.prestige.level + 1

          // Base multiplier is 1.1 per prestige level
          let newMultiplier = 1 + newPrestigeLevel * 0.1

          // Apply prestige research bonus if available
          if (prevState.research.prestigeBonus && prevState.research.prestigeBonus.level > 0) {
            newMultiplier *=
              1 + prevState.research.prestigeBonus.level * prevState.research.prestigeBonus.currentMultiplier
          }

          // Apply prestige achievement bonuses
          Object.values(prevState.achievements).forEach((achievement) => {
            if (achievement.unlocked && achievement.reward && achievement.reward.type === "prestigeBonus") {
              newMultiplier *= achievement.reward.value
            }
          })

          // Increase cells required for next prestige
          const newCellsRequired = prevState.prestige.cellsRequired * 10

          // Update stats
          const updatedStats = {
            ...prevState.stats,
            prestigeCount: prevState.stats.prestigeCount + 1,
          }

          // Check prestige achievements
          const updatedAchievements = { ...prevState.achievements }

          if (!updatedAchievements.firstPrestige.unlocked && updatedStats.prestigeCount >= 1) {
            updatedAchievements.firstPrestige.unlocked = true
            // Achievement toast will be shown on next game tick
          }

          if (!updatedAchievements.fivePrestige.unlocked && updatedStats.prestigeCount >= 5) {
            updatedAchievements.fivePrestige.unlocked = true
          }

          if (!updatedAchievements.tenPrestige.unlocked && updatedStats.prestigeCount >= 10) {
            updatedAchievements.tenPrestige.unlocked = true
          }

          // Unlock prestige research if not already unlocked
          const updatedResearch = { ...prevState.research }
          if (!updatedResearch.prestigeBonus.unlocked) {
            updatedResearch.prestigeBonus.unlocked = true
          }

          toast({
            title: "Prestige Complete!",
            description: `You gained a ${newMultiplier.toFixed(2)}x production multiplier.`,
            duration: 5000,
          })

          // Reset game state but keep achievements, prestige info, and research
          return {
            ...initialState,
            achievements: updatedAchievements,
            prestige: {
              level: newPrestigeLevel,
              multiplier: newMultiplier,
              cellsRequired: newCellsRequired,
            },
            research: updatedResearch,
            stats: updatedStats,
            lastSaved: Date.now(),
            lastTick: Date.now(),
          }
        } catch (error) {
          console.error("Error in prestige:", error)
          return prevState
        }
      })
    }
  }

  // Save game handler
  const saveGame = () => {
    try {
      const saveData = JSON.stringify(gameState)
      const encodedSave = btoa(saveData)
      localStorage.setItem("cellEvolutionSave", encodedSave)
      setSaveCode(encodedSave)

      toast({
        title: "Game Saved",
        description: "Your progress has been saved.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving game:", error)
      toast({
        title: "Save Failed",
        description: "There was an error saving your game.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Export save handler
  const exportSave = () => {
    try {
      const saveData = JSON.stringify(gameState)
      const encodedSave = btoa(saveData)
      setSaveCode(encodedSave)

      toast({
        title: "Save Exported",
        description: "Copy the code to save your progress.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error exporting save:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your save.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Import save handler
  const importSave = () => {
    try {
      const decodedSave = atob(saveCode)
      const parsedSave = JSON.JSON.parse(decodedSave)

      // Ensure all required properties exist by merging with initialState
      const safeGameState = {
        ...initialState,
        ...parsedSave,
        // Ensure nested objects exist
        producers: { ...initialProducers, ...parsedSave.producers },
        upgrades: { ...initialUpgrades, ...parsedSave.upgrades },
        achievements: { ...initialAchievements, ...parsedSave.achievements },
        prestige: { ...initialState.prestige, ...parsedSave.prestige },
        research: { ...initialResearch, ...parsedSave.research },
        stats: { ...initialState.stats, ...parsedSave.stats },
      }

      setGameState(safeGameState)
      localStorage.setItem("cellEvolutionSave", saveCode)

      toast({
        title: "Save Imported",
        description: "Your progress has been loaded.",
        duration: 3000,
      })

      setIsImporting(false)
      setSaveCode("")
    } catch (error) {
      console.error("Error importing save:", error)
      navigator.clipboard.writeText(error)
      toast({
        title: "Import Failed",
        description: "Invalid save code. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Copy save code to clipboard
  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(saveCode)

      toast({
        title: "Copied to Clipboard",
        description: "Save code copied to clipboard.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Copy Failed",
        description: "There was an error copying to clipboard.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Toggle auto-save
  const toggleAutoSave = () => {
    const newValue = !autoSaveEnabled
    setAutoSaveEnabled(newValue)
    localStorage.setItem("cellEvolutionAutoSave", newValue.toString())

    toast({
      title: newValue ? "Auto-Save Enabled" : "Auto-Save Disabled",
      description: newValue ? "Your game will be saved automatically." : "Your game will not be saved automatically.",
      duration: 3000,
    })
  }

  // Reset game handler
  const resetGame = () => {
    if (confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
      setGameState(initialState)
      localStorage.removeItem("cellEvolutionSave")

      toast({
        title: "Game Reset",
        description: "Your progress has been reset.",
        duration: 3000,
      })
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  // Group producers by tier
  const getProducersByTier = (tier: number) => {
    return Object.values(gameState.producers).filter((producer) => producer.unlocked && producer.tier === tier)
  }

  // Group upgrades by tier
  const getUpgradesByTier = (tier: number) => {
    return Object.values(gameState.upgrades).filter(
      (upgrade) => upgrade.unlocked && !upgrade.purchased && upgrade.tier === tier,
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
          Cell Evolution
        </h1>
        <p className="text-teal-100">Grow your cell empire!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="main" className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Main</span>
              </TabsTrigger>
              <TabsTrigger value="upgrades" className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Upgrades</span>
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Research</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Cell Generator</span>
                    <Badge variant="outline" className="text-lg bg-gray-700 text-teal-300 border-teal-500">
                      {formatNumber(gameState.cells)} cells
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-teal-200">
                    Generating {formatNumber(gameState.cellsPerSecond)} cells per second
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <button
                    onClick={handleCellClick}
                    className="w-40 h-40 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center mb-4 transition-transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <div className="text-white text-center">
                      <div className="text-4xl font-bold">CELL</div>
                      <div className="text-sm">+{formatNumber(gameState.cellsPerClick)} per click</div>
                    </div>
                  </button>

                  <div className="w-full mt-4">
                    <div className="flex justify-between text-sm mb-1 text-teal-100">
                      <span>Total Cells: {formatNumber(gameState.totalCells)}</span>
                      <span>Cells per Click: {formatNumber(gameState.cellsPerClick)}</span>
                    </div>
                    <Progress
                      value={Math.min(100, (gameState.cells / (gameState.cells + 100)) * 100)}
                      className="h-2 bg-gray-700"
                    />
                  </div>

                  {gameState.prestige.level > 0 && (
                    <div className="mt-4 w-full">
                      <div className="flex justify-between text-sm mb-1 text-purple-300">
                        <span>Prestige Level: {gameState.prestige.level}</span>
                        <span>Multiplier: {gameState.prestige.multiplier.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-purple-200">
                          Next prestige at {formatNumber(gameState.prestige.cellsRequired)} cells
                        </span>
                        <Button
                          onClick={performPrestige}
                          variant="outline"
                          className="text-xs h-7 bg-purple-900 hover:bg-purple-800 text-purple-100 border-purple-700"
                          disabled={gameState.cells < gameState.prestige.cellsRequired}
                        >
                          Prestige
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {[1, 2, 3, 4].map((tier) => {
                  const tierProducers = getProducersByTier(tier)
                  if (tierProducers.length === 0) return null

                  return (
                    <div key={`tier-${tier}`} className="space-y-2">
                      <h2 className="text-xl font-bold text-teal-300">
                        {tier === 1
                          ? "Cellular"
                          : tier === 2
                            ? "Subcellular"
                            : tier === 3
                              ? "Multicellular"
                              : "Ecological"}{" "}
                        Producers
                      </h2>
                      <div className="grid gap-2">
                        {tierProducers.map((producer) => (
                          <Card key={producer.id} className="bg-gray-800 border-gray-700">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex justify-between">
                                <span className="text-teal-200">{producer.name}</span>
                                <span className="text-sm font-normal text-teal-300">
                                  {producer.count} | {formatNumber(producer.count * producer.currentProduction)}/s
                                </span>
                              </CardTitle>
                              <CardDescription className="text-teal-100">{producer.description}</CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-2">
                              <Button
                                onClick={() => buyProducer(producer.id)}
                                disabled={gameState.cells < producer.currentCost}
                                className="w-full bg-teal-700 hover:bg-teal-600 text-white"
                                variant={gameState.cells >= producer.currentCost ? "default" : "outline"}
                              >
                                Buy for {formatNumber(producer.currentCost)} cells
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {gameState.prestige.level === 0 && gameState.cells >= gameState.prestige.cellsRequired && (
                  <Card className="bg-purple-900 border-purple-700 mt-4">
                    <CardHeader>
                      <CardTitle className="text-purple-100">Prestige Available!</CardTitle>
                      <CardDescription className="text-purple-200">
                        Reset your progress to gain permanent production multipliers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-100 mb-4">
                        You've reached {formatNumber(gameState.cells)} cells, which is enough to prestige! Prestige will
                        reset your cells and producers, but give you a permanent production multiplier.
                      </p>
                      <Button onClick={performPrestige} className="w-full bg-purple-700 hover:bg-purple-600 text-white">
                        Prestige Now
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upgrades" className="space-y-4">
              {[1, 2, 3, 4].map((tier) => {
                const tierUpgrades = getUpgradesByTier(tier)
                if (tierUpgrades.length === 0) return null

                return (
                  <Card key={`upgrade-tier-${tier}`} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-teal-300">Tier {tier} Upgrades</CardTitle>
                      <CardDescription className="text-teal-100">
                        Purchase upgrades to boost your production
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {tierUpgrades.map((upgrade) => (
                          <Card key={upgrade.id} className="bg-gray-700 border-gray-600">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg text-teal-200">{upgrade.name}</CardTitle>
                              <CardDescription className="text-teal-100">{upgrade.description}</CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-2">
                              <Button
                                onClick={() => buyUpgrade(upgrade.id)}
                                disabled={gameState.cells < upgrade.cost}
                                className="w-full bg-teal-700 hover:bg-teal-600 text-white"
                                variant={gameState.cells >= upgrade.cost ? "default" : "outline"}
                              >
                                Buy for {formatNumber(upgrade.cost)} cells
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}

                        {tierUpgrades.length === 0 && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No upgrades available</AlertTitle>
                            <AlertDescription>
                              Keep generating cells and buying producers to unlock more upgrades.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-teal-300">Purchased Upgrades</CardTitle>
                  <CardDescription className="text-teal-100">Your collection of upgrades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.values(gameState.upgrades)
                      .filter((upgrade) => upgrade.purchased)
                      .map((upgrade) => (
                        <Badge key={upgrade.id} variant="secondary" className="p-2 bg-teal-900 text-teal-100">
                          {upgrade.name}
                        </Badge>
                      ))}

                    {Object.values(gameState.upgrades).filter((upgrade) => upgrade.purchased).length === 0 && (
                      <p className="text-teal-200">No upgrades purchased yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="research" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-teal-300">Research Lab</CardTitle>
                  <CardDescription className="text-teal-100">
                    Invest in permanent upgrades to boost your production
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {Object.values(gameState.research)
                      .filter((research) => research.unlocked)
                      .map((research) => (
                        <Card key={research.id} className="bg-gray-700 border-gray-600">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between text-teal-200">
                              <span>{research.name}</span>
                              <span className="text-sm font-normal">
                                Level {research.level}/{research.maxLevel}
                              </span>
                            </CardTitle>
                            <CardDescription className="text-teal-100">{research.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-2">
                            <Button
                              onClick={() => buyResearch(research.id)}
                              disabled={gameState.cells < research.cost || research.level >= research.maxLevel}
                              className="w-full bg-purple-700 hover:bg-purple-600 text-white"
                              variant={
                                gameState.cells >= research.cost && research.level < research.maxLevel
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {research.level >= research.maxLevel
                                ? "Maxed Out"
                                : `Upgrade for ${formatNumber(research.cost)} cells`}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-teal-300">Achievements</CardTitle>
                  <CardDescription className="text-teal-100">Track your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {Object.values(gameState.achievements).map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-3 rounded-lg border ${
                          achievement.unlocked
                            ? "bg-gray-700 border-teal-500"
                            : "bg-gray-800 border-gray-700 opacity-70"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-teal-200">{achievement.name}</h3>
                            <p className="text-sm text-teal-100">{achievement.description}</p>
                            {achievement.reward && achievement.unlocked && (
                              <p className="text-xs text-purple-300 mt-1">
                                Reward:{" "}
                                {achievement.reward.type === "cellsPerClick"
                                  ? `${achievement.reward.value}x cells per click`
                                  : achievement.reward.type === "globalMultiplier"
                                    ? `${achievement.reward.value}x global production`
                                    : achievement.reward.type === "producerMultiplier"
                                      ? `${achievement.reward.value}x producer efficiency`
                                      : achievement.reward.type === "tierMultiplier"
                                        ? `${achievement.reward.value}x tier efficiency`
                                        : achievement.reward.type === "prestigeBonus"
                                          ? `${achievement.reward.value}x prestige bonus`
                                          : "Unknown reward"}
                              </p>
                            )}
                          </div>
                          {achievement.unlocked && (
                            <Badge variant="success" className="bg-teal-600 text-white">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-teal-300">Save & Load</CardTitle>
                  <CardDescription className="text-teal-100">Manage your game progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={saveGame}
                      className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white"
                    >
                      <Save className="w-4 h-4" />
                      Save Game
                    </Button>
                    <Button
                      onClick={exportSave}
                      className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white"
                    >
                      <Download className="w-4 h-4" />
                      Export Save
                    </Button>
                    <Button
                      onClick={() => setIsImporting(!isImporting)}
                      className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white"
                    >
                      <Upload className="w-4 h-4" />
                      Import Save
                    </Button>
                    <Button onClick={resetGame} variant="destructive">
                      Reset Game
                    </Button>
                  </div>

                  {(isImporting || saveCode) && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-teal-200">
                        {isImporting ? "Paste your save code below:" : "Copy this code to save your progress:"}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={saveCode}
                          onChange={(e) => setSaveCode(e.target.value)}
                          className="font-mono text-xs bg-gray-700 text-teal-100 border-gray-600"
                        />
                        {isImporting ? (
                          <Button
                            onClick={importSave}
                            disabled={!saveCode}
                            className="bg-teal-700 hover:bg-teal-600 text-white"
                          >
                            Load
                          </Button>
                        ) : (
                          <Button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-teal-200">Auto-Save</span>
                    <Button
                      onClick={toggleAutoSave}
                      variant={autoSaveEnabled ? "default" : "outline"}
                      className={
                        autoSaveEnabled ? "bg-teal-700 hover:bg-teal-600 text-white" : "text-teal-300 border-teal-700"
                      }
                    >
                      {autoSaveEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-teal-300">Statistics</CardTitle>
                  <CardDescription className="text-teal-100">Your game progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <div className="text-sm text-teal-200">Total Cells</div>
                      <div className="text-xl font-bold text-teal-100">{formatNumber(gameState.totalCells)}</div>
                    </div>
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <div className="text-sm text-teal-200">Cells Per Second</div>
                      <div className="text-xl font-bold text-teal-100">{formatNumber(gameState.cellsPerSecond)}</div>
                    </div>
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <div className="text-sm text-teal-200">Cells Per Click</div>
                      <div className="text-xl font-bold text-teal-100">{formatNumber(gameState.cellsPerClick)}</div>
                    </div>
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <div className="text-sm text-teal-200">Achievements</div>
                      <div className="text-xl font-bold text-teal-100">
                        {Object.values(gameState.achievements).filter((a) => a.unlocked).length}/
                        {Object.values(gameState.achievements).length}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <div className="text-sm text-teal-200">Total Clicks</div>
                      <div className="text-xl font-bold text-teal-100">{formatNumber(gameState.stats.totalClicks)}</div>
                    </div>
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <div className="text-sm text-teal-200">Time Played</div>
                      <div className="text-xl font-bold text-teal-100">
                        {formatTime(gameState.stats.totalTimePlayed)}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <div className="text-sm text-teal-200">Prestige Level</div>
                      <div className="text-xl font-bold text-teal-100">{gameState.prestige.level}</div>
                    </div>
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <div className="text-sm text-teal-200">Prestige Count</div>
                      <div className="text-xl font-bold text-teal-100">{gameState.stats.prestigeCount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-teal-300">Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-teal-100">
                  <span>Cells:</span>
                  <span className="font-bold">{formatNumber(gameState.cells)}</span>
                </div>
                <Separator className="bg-gray-600" />
                <div className="flex justify-between text-teal-100">
                  <span>Per second:</span>
                  <span className="font-bold">{formatNumber(gameState.cellsPerSecond)}</span>
                </div>
                <div className="flex justify-between text-teal-100">
                  <span>Per click:</span>
                  <span className="font-bold">{formatNumber(gameState.cellsPerClick)}</span>
                </div>
                {gameState.prestige.level > 0 && (
                  <>
                    <Separator className="bg-gray-600" />
                    <div className="flex justify-between text-purple-300">
                      <span>Prestige level:</span>
                      <span className="font-bold">{gameState.prestige.level}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>Prestige multiplier:</span>
                      <span className="font-bold">{gameState.prestige.multiplier.toFixed(2)}x</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-teal-300">Producers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(gameState.producers)
                  .filter((producer) => producer.count > 0)
                  .map((producer) => (
                    <div key={producer.id} className="flex justify-between text-teal-100">
                      <span>{producer.name}:</span>
                      <span className="font-bold">{producer.count}</span>
                    </div>
                  ))}

                {Object.values(gameState.producers).filter((producer) => producer.count > 0).length === 0 && (
                  <p className="text-teal-200">No producers purchased yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-teal-300">How to Play</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-teal-100">
                <li>Click the cell to generate cells</li>
                <li>Buy producers to generate cells automatically</li>
                <li>Purchase upgrades to increase production</li>
                <li>Research technologies for permanent bonuses</li>
                <li>Prestige when you have enough cells to gain multipliers</li>
                <li>Unlock achievements as you progress</li>
                <li>Export your save code to backup progress</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
